# Data Ingestion Service

This service ingests RailRadar data (mock) → enriches → stores in Firestore → exposes GET /api/live-trains.

## Files
- server/src/services/dataIngestion.js
- server/src/cron/ingestCron.js
- server/src/routes/liveTrains.js
- server/config/constants.js (tunable weights, dwell, speeds)
- server/config/station_platforms.json
- server/config/stations_geo.json
- server/mock/railradar_mock.json
- server/tests/testIngestion.js

## How it works
1) Reads JSON from `server/mock/railradar_mock.json` (or future API).
2) Extracts real fields: train_no, train_name, current_station, next_station, position, delay_minutes, status, schedule.
3) Enriches per spec: priority/category + score, platform assignment, dwell time, segment travel time (schedule diff or Haversine*speed), ETA next, ingestion_meta.
4) Upserts to Firestore `/trains/{train_no}` with `merge:true` and `updatedAt`.

## API
- GET `/api/live-trains?station=RTM&priority=PREMIUM&limit=100`
Response:
```
{
  "trains": [
    {
      "train_no": "12951",
      "train_name": "Mumbai Rajdhani",
      "current_station": "RTM",
      "next_station": "KOTA",
      "position": { "lat": 25.98, "lon": 75.8 },
      "delay_minutes": 20,
      "priority": "PREMIUM",
      "priority_score": 100,
      "platform_assigned": 3,
      "estimated_arrival_next": "2025-09-19T07:10:00.000Z",
      "dwell_time_seconds": 120
    }
  ]
}
```

## Run locally
```
# In one terminal (backend)
cd server
npm i
npm run dev

# Cron enabled by default; to disable:
# set INGEST_CRON=off (env)

# Manual one-shot ingest
node -e "import('./src/services/dataIngestion.js').then(m=>m.ingestOnce().then(console.log))"

# Test script
node server/tests/testIngestion.js
```

## Firestore
- Collection: `trains`, document id = `train_no` (string).
- Index suggestions: `updatedAt`, `current_station`, `priority_score`, composite (`current_station`, `updatedAt`).

## References
## Live RailRadar API mode

Enable API ingestion instead of mock by setting environment variables before starting the server:

```
$env:RAILRADAR_USE_API="true"
$env:RAILRADAR_API_KEY="rr_live_..."
$env:RAILRADAR_FROM="NDLS"      # optional
$env:RAILRADAR_TO="MMCT"        # optional
$env:RAILRADAR_DATE=(Get-Date).ToString("yyyy-MM-dd")  # optional
npm run dev
```

If the API call fails, the service falls back to the mock file for that run.
- Priority mapping derived from ERAIL blog (premium trains → highest) and the IOP paper objective of minimizing weighted delays; weights are editable in `server/config/constants.js`.

