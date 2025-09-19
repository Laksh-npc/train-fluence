import os
import sys
import json
from datetime import date, timedelta
from pathlib import Path

import requests


def read_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None or value.strip() == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def safe_get(url: str, headers: dict, timeout: int = 20) -> tuple[int | None, dict | None, str | None]:
    try:
        resp = requests.get(url, headers=headers, timeout=timeout)
        status = resp.status_code
        try:
            payload = resp.json()
        except Exception:
            payload = None
        return status, payload, None
    except Exception as e:
        return None, None, str(e)


def main():
    # Inputs via env vars or defaults
    api_key = os.getenv("RAILRADAR_API_KEY")
    if not api_key and len(sys.argv) >= 2:
        api_key = sys.argv[1]
    if not api_key:
        print("ERROR: Provide API key via env RAILRADAR_API_KEY or as argv[1].")
        sys.exit(2)

    from_station = os.getenv("FROM_STATION", "NDLS")
    to_station = os.getenv("TO_STATION", "CSMT")
    days_ahead = int(os.getenv("DAYS_AHEAD", "3"))

    base_url = "https://railradar.in/api/v1"
    headers = {"x-api-key": api_key}

    out_dir = Path("out")
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Fetching trains between {from_station} -> {to_station} over {days_ahead} day(s)...")

    trains_data: list[dict] = []
    picked_date: str | None = None

    for i in range(days_ahead):
        d = (date.today() + timedelta(days=i)).isoformat()
        url = f"{base_url}/trains/between?from={from_station}&to={to_station}&date={d}"
        status, payload, err = safe_get(url, headers)
        print(f"GET /trains/between {d} -> status={status} err={err}")
        if status == 200 and isinstance(payload, dict):
            arr = payload.get("data", [])
            print(f"  count={len(arr)}")
            (out_dir / f"trains_between_{from_station}_{to_station}_{d}.json").write_text(
                json.dumps(payload, indent=2)
            )
            if arr:
                trains_data = arr
                picked_date = d
                break
        else:
            print(f"  WARN: Non-OK response. Payload keys={list(payload.keys()) if isinstance(payload, dict) else 'N/A'}")

    if not trains_data:
        print("No trains found across tested dates. Verify station codes (e.g., CSMT vs CSTM) and try again.")
        sys.exit(1)

    print(f"Using journeyDate={picked_date}. Taking up to first 5 trains for detail fetch...")
    sample_trains = trains_data[:5]

    for t in sample_trains:
        number = t.get("number")
        name = t.get("name")
        print(f"Train {number} - {name}")

        live_url = f"{base_url}/trains/{number}/live"
        status, payload, err = safe_get(live_url, headers)
        print(f"  live -> status={status} err={err}")
        if status == 200 and isinstance(payload, dict):
            (out_dir / f"train_{number}_live.json").write_text(json.dumps(payload, indent=2))
            live_data = (payload.get("data") or {}).get("liveData")
            if live_data and all(k in live_data for k in ("latitude", "longitude")):
                print(f"  coords=({live_data.get('latitude')}, {live_data.get('longitude')}) delayMin={live_data.get('delayMinutes')}")
            else:
                print("  No live coordinates available right now.")
        else:
            print("  Failed to fetch live data.")

        sched_url = f"{base_url}/trains/{number}/schedule?journeyDate={picked_date}"
        status, payload, err = safe_get(sched_url, headers)
        print(f"  schedule -> status={status} err={err}")
        if status == 200 and isinstance(payload, dict):
            (out_dir / f"train_{number}_schedule_{picked_date}.json").write_text(json.dumps(payload, indent=2))
            route = (payload.get("data") or {}).get("route", [])
            print(f"  routeStops={len(route)}")
        else:
            print("  Failed to fetch schedule data.")

    print(f"\nSaved outputs to: {out_dir.resolve()}\nDone.")


if __name__ == "__main__":
    main()


