import json
import os
import time

import requests
from dotenv import load_dotenv

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META_PATH = os.path.join(REPO_ROOT, "web", "public", "data", "meta.json")
OUTPUT_DIR = os.path.join(REPO_ROOT, "data", "analytics")

for candidate in (os.path.join(REPO_ROOT, ".env"), os.path.join(REPO_ROOT, "web", ".env")):
    if os.path.exists(candidate):
        load_dotenv(candidate)

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")

BASE_URL = "https://api.fortyguard.com/v1"
HEATMAP_URL = f"{BASE_URL}/heatmap"

EXCEEDANCE_THRESHOLD_CELSIUS = 35

ANALYTIC_TYPES = {
    "exceedance": {"threshold": EXCEEDANCE_THRESHOLD_CELSIUS, "direction": "above"},
    "persistence": {"threshold": EXCEEDANCE_THRESHOLD_CELSIUS, "direction": "above"},
    "time_of_measure": None,
}

POLL_SECONDS = 5
POLL_ATTEMPTS = 90


def load_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path, payload):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=1, sort_keys=True)


def polygon_from_area(area):
    south, west, north, east = area["south"], area["west"], area["north"], area["east"]
    ring = [[west, south], [east, south], [east, north], [west, north], [west, south]]
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {"type": "Polygon", "coordinates": [ring]},
            }
        ],
    }


def submit(analytic_type, threshold_params, area, period, headers):
    payload = {
        "polygon_aoi": polygon_from_area(area),
        "date_time": {
            "start_date": period["start"],
            "end_date": period["end"],
            "filter_type": 4,
        },
        "granularity": 100,
        "analytic_type": analytic_type,
    }
    if threshold_params is not None:
        payload.update(threshold_params)

    response = requests.post(HEATMAP_URL, headers=headers, json=payload, timeout=120)
    if response.status_code >= 400:
        raise SystemExit(
            f"heatmap rejected analytic_type {analytic_type} with {response.status_code}: "
            f"{response.text[:400]}"
        )
    return response.json()["data"]["activity_id"]


def await_result(activity_id, headers):
    status_url = f"{BASE_URL}/status/{activity_id}"
    for _ in range(POLL_ATTEMPTS):
        response = requests.get(status_url, headers=headers, timeout=120)
        response.raise_for_status()
        data = response.json().get("data", {})
        status = str(data.get("status", "")).lower()
        if status == "completed":
            return data.get("result")
        if status in {"failed", "error"}:
            return None
        time.sleep(POLL_SECONDS)
    return None


def main():
    if not FORTYGUARD_API_KEY:
        raise SystemExit(
            "FORTYGUARD_API_KEY not found\n"
            "place the .env file in the repository root or in web/ before running this script"
        )

    meta = load_json(META_PATH)
    area = meta["area"]
    period = meta["period"]

    headers = {"api-key": FORTYGUARD_API_KEY, "Content-Type": "application/json"}

    print(f"area          {area['south']}, {area['west']} to {area['north']}, {area['east']}")
    print(f"period        {period['start']} to {period['end']}")
    print(f"analytics     {', '.join(ANALYTIC_TYPES)}\n")

    for analytic_type, threshold_params in ANALYTIC_TYPES.items():
        output_path = os.path.join(OUTPUT_DIR, f"{analytic_type}.json")
        if os.path.exists(output_path):
            print(f"{analytic_type} already fetched, skipping")
            continue

        print(f"{analytic_type} submitting...")
        activity_id = submit(analytic_type, threshold_params, area, period, headers)
        result = await_result(activity_id, headers)

        if result is None:
            print(f"{analytic_type} no result")
            continue

        save_json(
            output_path,
            {
                "analyticType": analytic_type,
                "params": threshold_params,
                "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "result": result,
            },
        )
        feature_count = len(result.get("map_data", {}).get("features", []))
        print(f"{analytic_type} wrote {feature_count} features to {output_path}")

    print("\ndone")


if __name__ == "__main__":
    main()
