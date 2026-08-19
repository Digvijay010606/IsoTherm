import os
import json
import time
import sqlite3
import requests

from datetime import datetime
from dotenv import load_dotenv



# CONFIGURATION

load_dotenv()

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")

if not FORTYGUARD_API_KEY:
    raise ValueError(
        "FORTYGUARD_API_KEY not found in .env"
    )



# STUDY AREA

SOUTH = 29.694598
WEST = -95.489900

NORTH = 29.779552
EAST = -95.380210


# DATE RANGE

START_DATE = "2026-08-01"
END_DATE = "2026-08-14"



# FORTYGUARD

FORTYGUARD_BASE_URL = "https://api.fortyguard.com/v1"

FORTYGUARD_HEATMAP_URL = (
    f"{FORTYGUARD_BASE_URL}/heatmap"
)



# OPENSTREETMAP


OVERPASS_URL = (
    "https://overpass.kumi.systems/api/interpreter"
)



# LOCAL PATHS


DATABASE_PATH = "data/heat_risk.db"

FORTYGUARD_RAW_DIR = (
    "data/raw/fortyguard"
)

OSM_RAW_DIR = (
    "data/raw/osm"
)


# Create directories

os.makedirs(
    "data",
    exist_ok=True
)

os.makedirs(
    FORTYGUARD_RAW_DIR,
    exist_ok=True
)

os.makedirs(
    OSM_RAW_DIR,
    exist_ok=True
)


# DATABASE


def create_database():

    conn = sqlite3.connect(
        DATABASE_PATH
    )

    cursor = conn.cursor()

    
    # FortyGuard
    

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fortyguard_data (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            fetched_at TEXT NOT NULL,

            start_date TEXT NOT NULL,

            end_date TEXT NOT NULL,

            south REAL NOT NULL,

            west REAL NOT NULL,

            north REAL NOT NULL,

            east REAL NOT NULL,

            data TEXT NOT NULL
        )
    """)

    
    # OpenStreetMap
    

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS osm_data (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            fetched_at TEXT NOT NULL,

            south REAL NOT NULL,

            west REAL NOT NULL,

            north REAL NOT NULL,

            east REAL NOT NULL,

            data TEXT NOT NULL
        )
    """)

    conn.commit()

    return conn



# FORTYGUARD REQUEST


def fetch_fortyguard():

    print("\n")
    print("=" * 60)
    print("FORTYGUARD")
    print("=" * 60)

    headers = {
        "api-key": FORTYGUARD_API_KEY,
        "Content-Type": "application/json"
    }

    
    # GeoJSON polygon
    

    polygon = [
        [WEST, SOUTH],
        [EAST, SOUTH],
        [EAST, NORTH],
        [WEST, NORTH],
        [WEST, SOUTH]
    ]

    
    # Request payload
    

    payload = {

        "polygon_aoi": {

            "type": "FeatureCollection",

            "features": [

                {
                    "type": "Feature",

                    "properties": {},

                    "geometry": {

                        "type": "Polygon",

                        "coordinates": [
                            polygon
                        ]
                    }
                }
            ]
        },

        "date_time": {

            "start_date": START_DATE,

            "end_date": END_DATE,

            "filter_type": 4
        },

        "granularity": 100
    }

    print("\nStudy area:")

    print(
        f"South: {SOUTH}"
    )

    print(
        f"West:  {WEST}"
    )

    print(
        f"North: {NORTH}"
    )

    print(
        f"East:  {EAST}"
    )

    print("\nDate range:")

    print(
        f"{START_DATE} → {END_DATE}"
    )

    print("\nSending ONE FortyGuard request...")

    response = requests.post(

        FORTYGUARD_HEATMAP_URL,

        headers=headers,

        json=payload,

        timeout=120
    )

    response.raise_for_status()

    response_data = response.json()

    
    # Activity ID
    

    activity_id = (
        response_data
        .get("data", {})
        .get("activity_id")
    )

    if not activity_id:

        print("\nUnexpected response:")

        print(
            json.dumps(
                response_data,
                indent=2
            )
        )

        raise RuntimeError(
            "activity_id was not found."
        )

    print(
        f"\nActivity ID: {activity_id}"
    )

    
    # Wait for completion
    

    status_url = (
        f"{FORTYGUARD_BASE_URL}"
        f"/status/{activity_id}"
    )

    while True:

        response = requests.get(

            status_url,

            headers={
                "api-key": FORTYGUARD_API_KEY
            },

            timeout=120
        )

        response.raise_for_status()

        status_response = (
            response.json()
        )

        data = status_response.get(
            "data",
            {}
        )

        status = str(
            data.get(
                "status",
                ""
            )
        ).lower()

        print(
            f"Status: {status}"
        )

        
        # Completed
        

        if status == "completed":

            result = data.get(
                "result"
            )

            if result is None:

                result = data

            print(
                "FortyGuard processing completed."
            )

            return result

        
        # Failed
        

        if status in {
            "failed",
            "error"
        }:

            raise RuntimeError(

                "FortyGuard request failed:\n"

                + json.dumps(
                    status_response,
                    indent=2
                )
            )

        
        # Wait
        
        time.sleep(5)



# SAVE FORTYGUARD


def save_fortyguard(
    conn,
    data
):

    fetched_at = (
        datetime.now().isoformat()
    )

    
    # Save raw JSON
    

    filename = (
        datetime.now().strftime(
            "fortyguard_%Y%m%d_%H%M%S.json"
        )
    )

    filepath = os.path.join(

        FORTYGUARD_RAW_DIR,

        filename
    )

    with open(

        filepath,

        "w",

        encoding="utf-8"

    ) as file:

        json.dump(

            data,

            file,

            indent=2
        )

   
    # Save to SQLite
    

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO fortyguard_data (

            fetched_at,

            start_date,

            end_date,

            south,

            west,

            north,

            east,

            data

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)

    """, (

        fetched_at,

        START_DATE,

        END_DATE,

        SOUTH,

        WEST,

        NORTH,

        EAST,

        json.dumps(data)
    ))

    conn.commit()

    print(
        f"\nFortyGuard JSON saved:"
        f"\n{filepath}"
    )



# OPENSTREETMAP REQUEST


def fetch_osm():

    print("\n")
    print("=" * 60)
    print("OPENSTREETMAP")
    print("=" * 60)

    query = f"""

    [out:json][timeout:180];

    (
        way["highway"]
        ({SOUTH},{WEST},{NORTH},{EAST});

        way["building"]
        ({SOUTH},{WEST},{NORTH},{EAST});

        way["leisure"="park"]
        ({SOUTH},{WEST},{NORTH},{EAST});

        way["natural"="water"]
        ({SOUTH},{WEST},{NORTH},{EAST});

        node["amenity"]
        ({SOUTH},{WEST},{NORTH},{EAST});

        way["amenity"]
        ({SOUTH},{WEST},{NORTH},{EAST});
    );

    out body;

    >;

    out skel qt;

    """

    print(
        "\nSending ONE OpenStreetMap request..."
    )

    headers = {
        "User-Agent": (
            "IsoTherm-HeatRisk/1.0 "
            "(heat-risk-hackathon-project)"
        ),
        "Content-Type": (
            "application/x-www-form-urlencoded"
        )
    }

    response = requests.post(
        OVERPASS_URL,
        headers=headers,
        data={
            "data": query
        },
        timeout=300
    )

    response.raise_for_status()

    data = response.json()

    print(
        "OpenStreetMap request completed."
    )

    print(
        f"Elements received: "
        f"{len(data.get('elements', []))}"
    )

    return data



# SAVE OSM


def save_osm(
    conn,
    data
):

    fetched_at = (
        datetime.now().isoformat()
    )

    
    # Save raw JSON
    

    filename = (
        datetime.now().strftime(
            "osm_%Y%m%d_%H%M%S.json"
        )
    )

    filepath = os.path.join(

        OSM_RAW_DIR,

        filename
    )

    with open(

        filepath,

        "w",

        encoding="utf-8"

    ) as file:

        json.dump(

            data,

            file,

            indent=2
        )

    
    # Save to SQLite
    

    cursor = conn.cursor()

    cursor.execute("""

        INSERT INTO osm_data (

            fetched_at,

            south,

            west,

            north,

            east,

            data

        )

        VALUES (?, ?, ?, ?, ?, ?)

    """, (

        fetched_at,

        SOUTH,

        WEST,

        NORTH,

        EAST,

        json.dumps(data)
    ))

    conn.commit()

    print(
        f"\nOSM JSON saved:"
        f"\n{filepath}"
    )



# MAIN


def main():

    print("\n")
    print("=" * 60)
    print("HEAT-RISK DATA COLLECTION")
    print("=" * 60)

    print(
        "1 FortyGuard request"
    )

    print(
        "1 OpenStreetMap request"
    )


    
    # Database
    

    conn = create_database()

    try:

        
        # FortyGuard
        
        fortyguard_data = (
            fetch_fortyguard()
        )

        save_fortyguard(

            conn,

            fortyguard_data
        )

        
        # OSM
        

        osm_data = (
            fetch_osm()
        )

        save_osm(

            conn,

            osm_data
        )

    finally:

        conn.close()

    print("\n")
    print("=" * 60)
    print("DONE")
    print("=" * 60)

    print(
        f"\nDatabase:"
        f"\n{DATABASE_PATH}"
    )


if __name__ == "__main__":

    main()