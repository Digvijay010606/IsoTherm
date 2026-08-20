import json
import math
import os
import sqlite3
from collections import Counter

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(REPO_ROOT, "data", "heat_risk.db")
OUTPUT_DIR = os.path.join(REPO_ROOT, "web", "public", "data")

TILE_METERS = 100
ZONE_TILES = 15
MIN_ZONE_TILES = 100
EARTH_METERS_PER_DEGREE = 111320.0

RELIEF_AMENITIES = {
    "drinking_water": "water",
    "fountain": "water",
    "shelter": "shade",
    "toilets": "facility",
    "community_centre": "cooling",
    "library": "cooling",
    "place_of_worship": "cooling",
    "clinic": "medical",
    "hospital": "medical",
    "social_facility": "cooling",
}

ZONE_COLUMN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def read_latest(cursor, table, columns):
    cursor.execute(
        f"SELECT {', '.join(columns)} FROM {table} ORDER BY id DESC LIMIT 1"
    )
    row = cursor.fetchone()
    if row is None:
        raise RuntimeError(f"no rows found in {table}")
    return dict(zip(columns, row))


def tile_centroid(feature):
    ring = feature["geometry"]["coordinates"][0][:4]
    lon = sum(point[0] for point in ring) / 4.0
    lat = sum(point[1] for point in ring) / 4.0
    return lon, lat


def meters_per_degree_lon(latitude):
    return EARTH_METERS_PER_DEGREE * math.cos(math.radians(latitude))


def build_grid(features):
    centroids = [tile_centroid(feature) for feature in features]
    lons = [point[0] for point in centroids]
    lats = [point[1] for point in centroids]

    min_lon, max_lon = min(lons), max(lons)
    min_lat, max_lat = min(lats), max(lats)
    mid_lat = (min_lat + max_lat) / 2.0

    lon_span_m = (max_lon - min_lon) * meters_per_degree_lon(mid_lat)
    lat_span_m = (max_lat - min_lat) * EARTH_METERS_PER_DEGREE

    cols = int(round(lon_span_m / TILE_METERS)) + 1
    rows = int(round(lat_span_m / TILE_METERS)) + 1

    lon_step = (max_lon - min_lon) / (cols - 1)
    lat_step = (max_lat - min_lat) / (rows - 1)

    peak = [None] * (cols * rows)
    mean = [None] * (cols * rows)
    low = [None] * (cols * rows)

    placed = 0
    collisions = 0

    for feature, (lon, lat) in zip(features, centroids):
        col = int(round((lon - min_lon) / lon_step))
        row = int(round((lat - min_lat) / lat_step))
        col = max(0, min(cols - 1, col))
        row = max(0, min(rows - 1, row))
        index = row * cols + col

        if peak[index] is not None:
            collisions += 1
            continue

        properties = feature["properties"]
        peak[index] = round(properties["max_temperature"], 1)
        mean[index] = round(properties["average_temperature"], 1)
        low[index] = round(properties["min_temperature"], 1)
        placed += 1

    grid = {
        "cols": cols,
        "rows": rows,
        "tileMeters": TILE_METERS,
        "bounds": [
            round(min_lon, 6),
            round(min_lat, 6),
            round(max_lon, 6),
            round(max_lat, 6),
        ],
        "layers": {"peak": peak, "mean": mean, "low": low},
    }

    return grid, placed, collisions


def layer_range(values):
    present = [value for value in values if value is not None]
    return [min(present), max(present)]


def build_zones(grid):
    cols = grid["cols"]
    rows = grid["rows"]
    peak = grid["layers"]["peak"]
    mean = grid["layers"]["mean"]
    min_lon, min_lat, max_lon, max_lat = grid["bounds"]

    lon_step = (max_lon - min_lon) / (cols - 1)
    lat_step = (max_lat - min_lat) / (rows - 1)

    zone_cols = math.ceil(cols / ZONE_TILES)
    zone_rows = math.ceil(rows / ZONE_TILES)

    zones = []

    for zone_row in range(zone_rows):
        for zone_col in range(zone_cols):
            peaks = []
            means = []

            for row in range(zone_row * ZONE_TILES, min((zone_row + 1) * ZONE_TILES, rows)):
                for col in range(zone_col * ZONE_TILES, min((zone_col + 1) * ZONE_TILES, cols)):
                    index = row * cols + col
                    if peak[index] is not None:
                        peaks.append(peak[index])
                        means.append(mean[index])

            if len(peaks) < MIN_ZONE_TILES:
                continue

            centre_col = min(zone_col * ZONE_TILES + ZONE_TILES / 2.0, cols - 1)
            centre_row = min(zone_row * ZONE_TILES + ZONE_TILES / 2.0, rows - 1)

            zones.append(
                {
                    "id": f"{ZONE_COLUMN_LETTERS[zone_col]}-{zone_row + 1}",
                    "lon": round(min_lon + centre_col * lon_step, 6),
                    "lat": round(min_lat + centre_row * lat_step, 6),
                    "tiles": len(peaks),
                    "peakMax": round(max(peaks), 1),
                    "peakMean": round(sum(peaks) / len(peaks), 1),
                    "meanTemp": round(sum(means) / len(means), 1),
                }
            )

    zones.sort(key=lambda zone: (-zone["peakMean"], zone["id"]))
    for position, zone in enumerate(zones):
        zone["rank"] = position + 1

    return zones


def resolve_way_centroids(elements):
    node_positions = {}
    for element in elements:
        if element.get("type") == "node":
            node_positions[element["id"]] = (element["lon"], element["lat"])

    centroids = {}
    for element in elements:
        if element.get("type") != "way":
            continue
        points = [node_positions[ref] for ref in element.get("nodes", []) if ref in node_positions]
        if not points:
            continue
        centroids[element["id"]] = (
            sum(point[0] for point in points) / len(points),
            sum(point[1] for point in points) / len(points),
        )

    return centroids


def build_amenities(elements):
    way_centroids = resolve_way_centroids(elements)

    relief = []
    parks = []

    for element in elements:
        tags = element.get("tags")
        if not tags:
            continue

        if element.get("type") == "node":
            position = (element.get("lon"), element.get("lat"))
        else:
            position = way_centroids.get(element["id"])

        if not position or position[0] is None:
            continue

        amenity = tags.get("amenity")
        if amenity in RELIEF_AMENITIES:
            relief.append(
                {
                    "kind": RELIEF_AMENITIES[amenity],
                    "amenity": amenity,
                    "name": tags.get("name"),
                    "lon": round(position[0], 5),
                    "lat": round(position[1], 5),
                }
            )
        elif tags.get("leisure") == "park" and tags.get("name"):
            parks.append(
                {
                    "name": tags["name"],
                    "lon": round(position[0], 5),
                    "lat": round(position[1], 5),
                }
            )

    relief.sort(key=lambda item: (item["kind"], item["name"] or "", item["lon"], item["lat"]))
    parks.sort(key=lambda item: (item["name"], item["lon"], item["lat"]))

    return relief, parks


def write_json(filename, payload):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        handle.write("\n")
    return os.path.getsize(path)


def main():
    if not os.path.exists(DATABASE_PATH):
        raise SystemExit(
            f"database not found at {DATABASE_PATH}\n"
            "download heat_risk.db and place it in data/ before running this script"
        )

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    fortyguard = read_latest(
        cursor,
        "fortyguard_data",
        ["fetched_at", "start_date", "end_date", "south", "west", "north", "east", "data"],
    )
    osm = read_latest(cursor, "osm_data", ["fetched_at", "data"])
    connection.close()

    payload = json.loads(fortyguard["data"])
    features = payload["map_data"]["features"]

    grid, placed, collisions = build_grid(features)
    zones = build_zones(grid)

    elements = json.loads(osm["data"])["elements"]
    relief, parks = build_amenities(elements)

    ranges = {name: layer_range(values) for name, values in grid["layers"].items()}

    tiles_bytes = write_json("tiles.json", {**grid, "ranges": ranges})
    zones_bytes = write_json("zones.json", {"zoneTiles": ZONE_TILES, "zones": zones})
    amenities_bytes = write_json("amenities.json", {"relief": relief, "parks": parks})
    meta_bytes = write_json(
        "meta.json",
        {
            "area": {
                "name": "Houston, TX",
                "south": fortyguard["south"],
                "west": fortyguard["west"],
                "north": fortyguard["north"],
                "east": fortyguard["east"],
            },
            "period": {"start": fortyguard["start_date"], "end": fortyguard["end_date"]},
            "granularityMeters": TILE_METERS,
            "tileCount": len(features),
            "sources": {
                "temperature": {
                    "provider": "FortyGuard Temperature API",
                    "endpoint": "/v1/heatmap",
                    "analytic": "tcm",
                    "fetchedAt": fortyguard["fetched_at"],
                },
                "context": {
                    "provider": "OpenStreetMap via Overpass",
                    "fetchedAt": osm["fetched_at"],
                },
            },
        },
    )

    total_kb = (tiles_bytes + zones_bytes + amenities_bytes + meta_bytes) / 1024.0

    print(f"grid          {grid['cols']} x {grid['rows']}")
    print(f"tiles placed  {placed} of {len(features)} (collisions {collisions})")
    print(f"zones         {len(zones)}")
    print(f"relief        {len(relief)}")
    print(f"parks         {len(parks)}")
    print(f"peak range    {ranges['peak'][0]} to {ranges['peak'][1]} C")
    print(f"mean range    {ranges['mean'][0]} to {ranges['mean'][1]} C")
    print()
    print(f"tiles.json      {tiles_bytes / 1024:8.1f} KB")
    print(f"zones.json      {zones_bytes / 1024:8.1f} KB")
    print(f"amenities.json  {amenities_bytes / 1024:8.1f} KB")
    print(f"meta.json       {meta_bytes / 1024:8.1f} KB")
    print(f"total           {total_kb:8.1f} KB")


if __name__ == "__main__":
    main()
