import json
import math
import os
import sqlite3
from collections import Counter

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(REPO_ROOT, "data", "heat_risk.db")
RISK_SCORES_PATH = os.path.join(REPO_ROOT, "data", "tile_risk_scores.json")
OUTPUT_DIR = os.path.join(REPO_ROOT, "web", "public", "data")

TILE_METERS = 100
ZONE_TILES = 15
MIN_ZONE_TILES = 100
MIN_NEIGHBOURS_TO_FILL = 5
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

LANDMARK_MAX_KM = 1.5

LANDMARK_CATEGORIES = [
    (lambda tags: tags.get("leisure") == "park", "park", 250, 0.55),
    (
        lambda tags: tags.get("amenity") == "university" or tags.get("building") == "university",
        "university",
        200,
        0.60,
    ),
    (lambda tags: tags.get("amenity") == "hospital", "hospital", 150, 0.70),
    (lambda tags: tags.get("amenity") == "school", "school", 150, 0.90),
    (lambda tags: tags.get("amenity") in {"library", "community_centre"}, "civic", 100, 0.90),
    (lambda tags: tags.get("highway") in {"motorway", "primary", "secondary"}, "road", 600, 0.75),
]


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


def build_grid(features, risk_by_tile_id):
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
    risk = [None] * (cols * rows)
    index_to_tile_id = [None] * (cols * rows)

    placed = 0
    collisions = 0
    risk_matched = 0

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
        tile_id = properties["tile_id"]
        peak[index] = round(properties["max_temperature"], 1)
        mean[index] = round(properties["average_temperature"], 1)
        low[index] = round(properties["min_temperature"], 1)
        index_to_tile_id[index] = tile_id
        placed += 1

        risk_record = risk_by_tile_id.get(tile_id)
        if risk_record is not None:
            risk[index] = round(risk_record["risk_score"], 1)
            risk_matched += 1

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
        "layers": {"peak": peak, "mean": mean, "low": low, "risk": risk},
    }

    return grid, placed, collisions, risk_matched, index_to_tile_id


def fill_interior_holes(values, cols, rows):
    source = list(values)
    filled = 0

    for row in range(rows):
        for col in range(cols):
            index = row * cols + col
            if source[index] is not None:
                continue

            neighbours = []
            for row_offset in (-1, 0, 1):
                for col_offset in (-1, 0, 1):
                    if row_offset == 0 and col_offset == 0:
                        continue
                    near_row = row + row_offset
                    near_col = col + col_offset
                    if 0 <= near_row < rows and 0 <= near_col < cols:
                        neighbour = source[near_row * cols + near_col]
                        if neighbour is not None:
                            neighbours.append(neighbour)

            if len(neighbours) >= MIN_NEIGHBOURS_TO_FILL:
                values[index] = round(sum(neighbours) / len(neighbours), 1)
                filled += 1

    return filled


def layer_range(values):
    present = [value for value in values if value is not None]
    return [min(present), max(present)]


def haversine_km(lat1, lon1, lat2, lon2):
    radius = 6371.0
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.sin(delta_lon / 2) ** 2 * math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
    )
    return 2 * radius * math.asin(math.sqrt(a))


def bearing_label(from_lat, from_lon, to_lat, to_lon):
    delta_lat = to_lat - from_lat
    delta_lon = to_lon - from_lon
    angle = math.degrees(math.atan2(delta_lon, delta_lat)) % 360
    directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"]
    return directions[round(angle / 45) % 8]


def build_landmark_candidates(elements):
    node_positions = {}
    for element in elements:
        if element.get("type") == "node":
            node_positions[element["id"]] = (element["lat"], element["lon"])

    candidates = {}

    for element in elements:
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        for matches, kind, min_extent_m, weight in LANDMARK_CATEGORIES:
            if not matches(tags):
                continue

            if element.get("type") == "node":
                lat, lon = element["lat"], element["lon"]
                extent_m = 0.0
            else:
                points = [node_positions[ref] for ref in element.get("nodes", []) if ref in node_positions]
                if not points:
                    break
                lats = [point[0] for point in points]
                lons = [point[1] for point in points]
                lat = sum(lats) / len(lats)
                lon = sum(lons) / len(lons)
                extent_m = haversine_km(min(lats), min(lons), max(lats), max(lons)) * 1000

            if extent_m < min_extent_m:
                break

            key = (name, kind)
            if key not in candidates or extent_m > candidates[key]["extentM"]:
                candidates[key] = {
                    "name": name,
                    "kind": kind,
                    "lat": lat,
                    "lon": lon,
                    "extentM": extent_m,
                    "weight": weight,
                }
            break

    return list(candidates.values())


def name_zones(zones, candidates):
    claimed_names = Counter()

    for zone in zones:
        best = None
        for candidate in candidates:
            distance_km = haversine_km(zone["lat"], zone["lon"], candidate["lat"], candidate["lon"])
            if distance_km > LANDMARK_MAX_KM:
                continue
            score = distance_km * candidate["weight"] - min(candidate["extentM"], 2000) / 6000
            if best is None or score < best["score"]:
                best = {**candidate, "score": score, "distanceKm": distance_km}

        if best is None:
            zone["name"] = f"Zone {zone['id']}"
            continue

        claimed_names[best["name"]] += 1
        label = best["name"]
        if claimed_names[best["name"]] > 1:
            direction = bearing_label(best["lat"], best["lon"], zone["lat"], zone["lon"])
            label = f"{best['name']} ({direction})"

        zone["name"] = f"{label} area"


def majority(values):
    if not values:
        return None
    return Counter(values).most_common(1)[0][0]


def driver_recommendation_map(records):
    mapping = {}
    for record in records:
        drivers = record["top_risk_drivers"].split(" | ")
        recommendations = record["recommendations"].split(" | ")
        for driver_label, recommendation in zip(drivers, recommendations):
            mapping.setdefault(driver_label, recommendation)
    return mapping


def summarize_zone_risk(real_tile_ids, risks, risk_by_tile_id):
    records = [risk_by_tile_id[tile_id] for tile_id in real_tile_ids if tile_id in risk_by_tile_id]
    recommendation_by_driver = driver_recommendation_map(records)

    driver_counts = Counter(record["top_risk_driver"] for record in records)
    top_drivers = [
        {"driver": driver_label, "recommendation": recommendation_by_driver.get(driver_label)}
        for driver_label, _count in driver_counts.most_common(3)
    ]

    return {
        "riskScore": round(sum(risks) / len(risks), 1) if risks else None,
        "riskCategory": majority([record["risk_category"] for record in records]),
        "dataConfidence": majority([record["data_confidence_label"] for record in records]),
        "topDrivers": top_drivers,
    }


def build_zones(grid, index_to_tile_id, risk_by_tile_id):
    cols = grid["cols"]
    rows = grid["rows"]
    peak = grid["layers"]["peak"]
    mean = grid["layers"]["mean"]
    risk = grid["layers"]["risk"]
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
            risks = []
            real_tile_ids = []

            for row in range(zone_row * ZONE_TILES, min((zone_row + 1) * ZONE_TILES, rows)):
                for col in range(zone_col * ZONE_TILES, min((zone_col + 1) * ZONE_TILES, cols)):
                    index = row * cols + col
                    if peak[index] is not None:
                        peaks.append(peak[index])
                        means.append(mean[index])
                    if risk[index] is not None:
                        risks.append(risk[index])
                    if index_to_tile_id[index] is not None:
                        real_tile_ids.append(index_to_tile_id[index])

            if len(peaks) < MIN_ZONE_TILES:
                continue

            centre_col = min(zone_col * ZONE_TILES + ZONE_TILES / 2.0, cols - 1)
            centre_row = min(zone_row * ZONE_TILES + ZONE_TILES / 2.0, rows - 1)

            zone = {
                "id": f"{ZONE_COLUMN_LETTERS[zone_col]}-{zone_row + 1}",
                "lon": round(min_lon + centre_col * lon_step, 6),
                "lat": round(min_lat + centre_row * lat_step, 6),
                "tiles": len(peaks),
                "peakMax": round(max(peaks), 1),
                "peakMean": round(sum(peaks) / len(peaks), 1),
                "meanTemp": round(sum(means) / len(means), 1),
            }

            zone.update(summarize_zone_risk(real_tile_ids, risks, risk_by_tile_id))
            zones.append(zone)

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


PLACE_KIND_TAGS = ["leisure", "amenity", "shop", "tourism", "office", "building"]


def classify_place_kind(tags):
    if tags.get("highway"):
        return "road"
    for key in PLACE_KIND_TAGS:
        value = tags.get(key)
        if value and value not in {"yes", "no"}:
            return value.replace("_", " ")
    for key in PLACE_KIND_TAGS:
        if tags.get(key) in {"yes"}:
            return key
    return "place"


def build_places(elements):
    way_centroids = resolve_way_centroids(elements)

    named_points = {}

    for element in elements:
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        if element.get("type") == "node":
            position = (element.get("lon"), element.get("lat"))
        else:
            position = way_centroids.get(element["id"])

        if not position or position[0] is None:
            continue

        kind = classify_place_kind(tags)
        key = (name, kind)
        named_points.setdefault(key, []).append(position)

    places = []
    for (name, kind), points in named_points.items():
        lon = sum(point[0] for point in points) / len(points)
        lat = sum(point[1] for point in points) / len(points)
        places.append(
            {
                "name": name,
                "kind": kind,
                "lat": round(lat, 5),
                "lon": round(lon, 5),
            }
        )

    places.sort(key=lambda place: (place["name"], place["kind"]))
    return places


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def format_grid_rows(values, cols, rows):
    lines = []
    for row in range(rows):
        cells = values[row * cols : (row + 1) * cols]
        lines.append("    [" + ",".join(compact(cell) for cell in cells) + "]")
    return "[\n" + ",\n".join(lines) + "\n  ]"


def format_object_list(items, indent="    "):
    if not items:
        return "[]"
    lines = [indent + compact(item) for item in items]
    return "[\n" + ",\n".join(lines) + "\n  ]"


def write_text(filename, text):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text.rstrip("\n") + "\n")
    return os.path.getsize(path)


def write_json(filename, payload):
    return write_text(
        filename,
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True),
    )


def main():
    if not os.path.exists(DATABASE_PATH):
        raise SystemExit(
            f"database not found at {DATABASE_PATH}\n"
            "download heat_risk.db and place it in data/ before running this script"
        )

    if not os.path.exists(RISK_SCORES_PATH):
        raise SystemExit(
            f"risk scores not found at {RISK_SCORES_PATH}\n"
            "run notebooks/IsoTherm.ipynb (Digvijay and Kanak's risk engine) to produce "
            "tile_risk_scores.json, then place it in data/ before running this script"
        )

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(RISK_SCORES_PATH, "r", encoding="utf-8") as handle:
        risk_by_tile_id = {record["tile_id"]: record for record in json.load(handle)}

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

    grid, placed, collisions, risk_matched, index_to_tile_id = build_grid(features, risk_by_tile_id)

    holes_filled = 0
    for values in grid["layers"].values():
        holes_filled = fill_interior_holes(values, grid["cols"], grid["rows"])

    zones = build_zones(grid, index_to_tile_id, risk_by_tile_id)

    elements = json.loads(osm["data"])["elements"]
    relief, parks = build_amenities(elements)

    landmark_candidates = build_landmark_candidates(elements)
    name_zones(zones, landmark_candidates)

    places = build_places(elements)

    ranges = {name: layer_range(values) for name, values in grid["layers"].items()}

    layer_blocks = ",\n".join(
        f'    "{name}": {format_grid_rows(grid["layers"][name], grid["cols"], grid["rows"])}'
        for name in sorted(grid["layers"])
    )

    tiles_bytes = write_text(
        "tiles.json",
        "{\n"
        f'  "bounds": {compact(grid["bounds"])},\n'
        f'  "cols": {grid["cols"]},\n'
        f'  "rows": {grid["rows"]},\n'
        f'  "tileMeters": {grid["tileMeters"]},\n'
        f'  "ranges": {compact(ranges)},\n'
        '  "layers": {\n'
        f"{layer_blocks}\n"
        "  }\n"
        "}",
    )

    zones_bytes = write_text(
        "zones.json",
        "{\n"
        f'  "zoneTiles": {ZONE_TILES},\n'
        f'  "zones": {format_object_list(zones)}\n'
        "}",
    )

    amenities_bytes = write_text(
        "amenities.json",
        "{\n"
        f'  "relief": {format_object_list(relief)},\n'
        f'  "parks": {format_object_list(parks)}\n'
        "}",
    )

    places_bytes = write_text(
        "places.json",
        "{\n"
        f'  "places": {format_object_list(places)}\n'
        "}",
    )
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

    total_kb = (tiles_bytes + zones_bytes + amenities_bytes + places_bytes + meta_bytes) / 1024.0

    print(f"grid          {grid['cols']} x {grid['rows']}")
    print(f"tiles placed  {placed} of {len(features)} (collisions {collisions})")
    print(f"risk matched  {risk_matched} of {placed} tiles")
    print(f"holes filled  {holes_filled} interior cells per layer")
    print(f"zones         {len(zones)}")
    print(f"relief        {len(relief)}")
    print(f"parks         {len(parks)}")
    print(f"places        {len(places)}")
    print(f"peak range    {ranges['peak'][0]} to {ranges['peak'][1]} C")
    print(f"mean range    {ranges['mean'][0]} to {ranges['mean'][1]} C")
    print(f"risk range    {ranges['risk'][0]} to {ranges['risk'][1]}")
    print()
    print(f"tiles.json      {tiles_bytes / 1024:8.1f} KB")
    print(f"zones.json      {zones_bytes / 1024:8.1f} KB")
    print(f"amenities.json  {amenities_bytes / 1024:8.1f} KB")
    print(f"places.json     {places_bytes / 1024:8.1f} KB")
    print(f"meta.json       {meta_bytes / 1024:8.1f} KB")
    print(f"total           {total_kb:8.1f} KB")


if __name__ == "__main__":
    main()
