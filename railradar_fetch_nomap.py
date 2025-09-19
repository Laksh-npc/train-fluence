import os
import sys
from datetime import date, timedelta
import json
from pathlib import Path

import requests


API_KEY = os.getenv("RAILRADAR_API_KEY", "") or ""
FROM_STATION = os.getenv("FROM_STATION", "NDLS")
TO_STATION = os.getenv("TO_STATION", "INDB")
JOURNEY_DATE = os.getenv("JOURNEY_DATE", "")  # optional YYYY-MM-DD to force a day
TRAIN_NUMBER = os.getenv("TRAIN_NUMBER", "")   # optional: when set, fetch this train directly

LIVE_URL = "https://railradar.in/api/v1/trains/{train_number}/live"
SCHEDULE_URL = "https://railradar.in/api/v1/trains/{train_number}/schedule?journeyDate={journey_date}"
TRAINS_BETWEEN_URL = "https://railradar.in/api/v1/trains/between?from={from_station}&to={to_station}&date={journey_date}"


def require_api_key() -> str:
    key = API_KEY
    if not key and len(sys.argv) >= 2:
        key = sys.argv[1]
    if not key:
        print("ERROR: Provide API key via env RAILRADAR_API_KEY or as argv[1].")
        sys.exit(2)
    return key


def http_get(url: str, headers: dict) -> dict:
    resp = requests.get(url, headers=headers, timeout=20)
    resp.raise_for_status()
    return resp.json()


def main():
    api_key = require_api_key()
    headers = {"x-api-key": api_key}

    out_dir = Path("out")
    out_dir.mkdir(parents=True, exist_ok=True)

    # Optional local geocoding file for stations
    stations_geo_path = Path("server/config/stations_geo.json")
    stations_by_code: dict[str, dict] = {}
    stations_by_name: dict[str, dict] = {}
    if stations_geo_path.exists():
        try:
            geo = json.loads(stations_geo_path.read_text())
            # Expecting { "CODE": {"lat": ..., "lon": ...}, ... }
            for code, coords in geo.items():
                stations_by_code[code.upper()] = coords
        except Exception:
            pass

    def norm_name(n: str | None) -> str:
        if not n:
            return ""
        return "".join(ch for ch in n.upper() if ch.isalnum() or ch == ' ' ).strip()

    trains_data = []
    journey_date = None

    # Direct single-train mode
    if TRAIN_NUMBER:
        journey_date = JOURNEY_DATE or date.today().isoformat()
        print(f"Single-train mode: TRAIN_NUMBER={TRAIN_NUMBER} journeyDate={journey_date}")
        # fabricate a minimal trains_data list to reuse downstream logic
        trains_data = [{
            "trainNumber": TRAIN_NUMBER,
            "trainName": "(unknown name)",
        }]
    else:
        # Multi-day between-stations mode
        dates_to_check = [JOURNEY_DATE] if JOURNEY_DATE else [(date.today() + timedelta(days=i)).isoformat() for i in range(7)]
        for d in dates_to_check:
            try:
                url = TRAINS_BETWEEN_URL.format(from_station=FROM_STATION, to_station=TO_STATION, journey_date=d)
                payload = http_get(url, headers)
                trains_data = payload.get("data", [])
                print(f"Checked {d} -> {len(trains_data)} trains")
                # Save full payload for inspection
                (out_dir / f"trains_between_{FROM_STATION}_{TO_STATION}_{d}.json").write_text(
                    json.dumps(payload, indent=2)
                )
                if trains_data:
                    journey_date = d
                    print(f"\nFound {len(trains_data)} trains on {journey_date}")
                    break
            except Exception as e:
                print(f"Error fetching trains for {d}: {e}")

        if not trains_data:
            print(f"No trains found across checked dates between {FROM_STATION} → {TO_STATION}.")
            sys.exit(1)

    print("\nTrain Details:\n" + "=" * 50)
    for i, train in enumerate(trains_data, start=1):
        # Fallback across possible field names
        number = train.get('trainNumber') or train.get('number') or train.get('id')
        name = train.get('trainName') or train.get('name')
        ttype = train.get('trainType') or train.get('type')
        src = train.get('from') or train.get('source')
        dst = train.get('to') or train.get('destination')
        days = train.get('days') or train.get('daysOfRun') or train.get('runsOn')
        print(f"Train {i}:")
        print(f"  Number: {number}")
        print(f"  Name:   {name}")
        print(f"  Type:   {ttype}")
        print(f"  Source: {src}")
        print(f"  Destination: {dst}")
        print(f"  Scheduled Days: {days}")
        print("-" * 50)

    # Process each train without mapping
    for train in trains_data:
        train_number = TRAIN_NUMBER or train.get("trainNumber") or train.get("number") or train.get("id")
        train_name = train.get("trainName") or train.get("name")
        if not train_number or not train_name:
            continue
        print(f"Processing {train_number} - {train_name}")

        # Live data
        live_data = None
        try:
            live_url = LIVE_URL.format(train_number=train_number)
            live_resp = http_get(live_url, headers)
            # Save raw
            (out_dir / f"train_{train_number}_live.json").write_text(json.dumps(live_resp, indent=2))
            live_data = (live_resp.get("data") or {}).get("liveData", {})
        except Exception as e:
            print(f"  Live fetch error: {e}")

        # Schedule
        route_data = []
        try:
            sched_url = SCHEDULE_URL.format(train_number=train_number, journey_date=journey_date)
            sched_resp = http_get(sched_url, headers)
            (out_dir / f"train_{train_number}_schedule_{journey_date}.json").write_text(json.dumps(sched_resp, indent=2))
            route_data = (sched_resp.get("data") or {}).get("route", [])
        except Exception as e:
            print(f"  Schedule fetch error: {e}")

        # Print station coordinates if present
        print(f"\nRoute for {train_name}:")
        # Try to enrich with local coordinates if API lacks them
        coords_count = 0
        enriched_rows: list[dict] = []
        for stop in route_data:
            station = stop.get("station", {})
            lat = station.get("latitude")
            lon = station.get("longitude")
            name = station.get("name", "N/A")
            code = station.get("code") or station.get("stationCode")

            # Fallback by code
            if (lat is None or lon is None) and code:
                coords = stations_by_code.get(str(code).upper())
                if coords:
                    lat = coords.get("lat")
                    lon = coords.get("lon")

            # Fallback by name (very weak, best-effort)
            if (lat is None or lon is None):
                coords = stations_by_name.get(norm_name(name))
                if coords:
                    lat = coords.get("lat")
                    lon = coords.get("lon")

            print(f"  {name}: {lat}, {lon}")
            if lat is not None and lon is not None:
                coords_count += 1

            enriched_rows.append({
                "name": name,
                "code": code,
                "lat": lat,
                "lon": lon,
                "arr": stop.get("arrival"),
                "dep": stop.get("departure"),
                "day": stop.get("day"),
                "distance": stop.get("distance"),
            })

        print(f"  Route stops with coordinates: {coords_count}/{len(route_data)}")

        # Save enriched CSV for MILP inputs
        try:
            import csv
            csv_path = out_dir / f"train_{train_number}_schedule_{journey_date}_enriched.csv"
            with csv_path.open("w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=["name","code","lat","lon","arr","dep","day","distance"])
                writer.writeheader()
                for row in enriched_rows:
                    writer.writerow(row)
            print(f"  Saved enriched schedule CSV: {csv_path}")
        except Exception as e:
            print(f"  Could not write enriched CSV: {e}")

        # Print live location summary
        if live_data:
            lat = live_data.get("latitude")
            lon = live_data.get("longitude")
            if lat and lon:
                delay = live_data.get("delayMinutes", 0)
                last_station = (live_data.get("lastStation") or {}).get("name", "N/A")
                next_station = (live_data.get("nextStation") or {}).get("name", "N/A")
                print(f"  Live -> lat={lat}, lon={lon}, delayMin={delay}, last={last_station}, next={next_station}")
            else:
                print("  Live -> No coordinates available")
        else:
            print(f"  {train_name} has no live coordinates yet, but route displayed.")

    print(f"\nSaved raw responses in: {out_dir.resolve()}")


if __name__ == "__main__":
    main()