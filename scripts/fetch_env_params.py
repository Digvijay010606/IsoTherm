import json
import os
import time

import requests
from dotenv import load_dotenv

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZONES_PATH = os.path.join(REPO_ROOT, "web", "public", "data", "zones.json")
META_PATH = os.path.join(REPO_ROOT, "web", "public", "data", "meta.json")
OUTPUT_PATH = os.path.join(REPO_ROOT, "data", "zone_env_params.json")

for candidate in (os.path.join(REPO_ROOT, ".env"), os.path.join(REPO_ROOT, "web", ".env")):
    if os.path.exists(candidate):
        load_dotenv(candidate)

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")

BASE_URL = "https://api.fortyguard.com/v1"
ENV_PARAMS_URL = f"{BASE_URL}/env_params"

PARAMETERS = [
    "wet_bulb_temperature_celsius",
    "heat_index_celsius",
    "relative_humidity_percent",
]

SINGLE_DAY = 3
POLL_SECONDS = 5
POLL_ATTEMPTS = 60
PAUSE_BETWEEN_ZONES = 1.0


def load_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def save_json(path, payload):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=1, sort_keys=True)


def submit(zone, sample_date, headers):
    payload = {
        "latitude": zone["lat"],
        "longitude": zone["lon"],
        "temperature": zone["peakMax"],
        "date_time": {"start_date": sample_date, "filter_type": SINGLE_DAY},
        "analysis": PARAMETERS,
    }
    response = requests.post(ENV_PARAMS_URL, headers=headers, json=payload, timeout=120)
    if response.status_code >= 400:
        raise SystemExit(
            f"env_params rejected zone {zone['id']} with {response.status_code}: {response.text[:400]}"
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
        if status == "failed":
            return None
        time.sleep(POLL_SECONDS)
    return None


def numeric(values):
    return [value for value in (values or []) if isinstance(value, (int, float)) and value != -999]


def summarize(result):
    locations = (result or {}).get("locations") or []
    if not locations:
        return None

    parameters = locations[0].get("parameters") or {}
    wet_bulb = numeric(parameters.get("wet_bulb_temperature_celsius"))
    heat_index = numeric(parameters.get("heat_index_celsius"))
    humidity = numeric(parameters.get("relative_humidity_percent"))

    if not wet_bulb:
        return None

    return {
        "wetBulbMax": round(max(wet_bulb), 1),
        "wetBulbMean": round(sum(wet_bulb) / len(wet_bulb), 1),
        "heatIndexMax": round(max(heat_index), 1) if heat_index else None,
        "humidityMean": round(sum(humidity) / len(humidity), 1) if humidity else None,
        "readings": len(wet_bulb),
    }


def main():
    if not FORTYGUARD_API_KEY:
        raise SystemExit(
            "FORTYGUARD_API_KEY not found\n"
            "place the .env file in the repository root or in web/ before running this script"
        )

    zones = load_json(ZONES_PATH)["zones"]
    sample_date = load_json(META_PATH)["period"]["end"]

    collected = {}
    if os.path.exists(OUTPUT_PATH):
        collected = load_json(OUTPUT_PATH).get("zones", {})
        print(f"resuming with {len(collected)} zones already fetched")

    headers = {"api-key": FORTYGUARD_API_KEY, "Content-Type": "application/json"}

    print(f"sample date  {sample_date}")
    print(f"parameters   {', '.join(PARAMETERS)}")
    print(f"zones        {len(zones)}\n")

    for index, zone in enumerate(zones, start=1):
        if zone["id"] in collected:
            continue

        label = f"[{index}/{len(zones)}] {zone['id']}"
        activity_id = submit(zone, sample_date, headers)
        summary = summarize(await_result(activity_id, headers))

        if summary is None:
            print(f"{label} no result")
        else:
            collected[zone["id"]] = summary
            print(
                f"{label} wet-bulb {summary['wetBulbMax']}C max, "
                f"{summary['wetBulbMean']}C mean over {summary['readings']} readings"
            )
            save_json(OUTPUT_PATH, {"sampleDate": sample_date, "zones": collected})

        time.sleep(PAUSE_BETWEEN_ZONES)

    print(f"\nwrote {len(collected)} zones to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
