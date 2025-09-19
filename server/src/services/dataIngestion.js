import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';
import { PRIORITY_WEIGHTS, CATEGORY_BY_TRAIN_NAME, DEFAULT_DWELL_SECONDS, ASSUMED_SPEED_KMPH, DEFAULT_PLATFORM_RANGE, SERVICE_NAME } from '../config/constants.js';
// Load JSON via fs to avoid import assertion issues
// Note: process.cwd() is the server directory, so configs live under ./config
const stationPlatforms = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'config/station_platforms.json'), 'utf8'));
const stationsGeo = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'config/stations_geo.json'), 'utf8'));

const toNumber = (n, fallback = 0) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
};

const clampLat = (lat) => (lat >= -90 && lat <= 90 ? lat : null);
const clampLon = (lon) => (lon >= -180 && lon <= 180 ? lon : null);

export function assignPriority(train) {
  const name = (train.train_name || '').trim();
  let category = 'MEDIUM';
  for (const rule of CATEGORY_BY_TRAIN_NAME) {
    if (rule.match.test(name)) {
      category = rule.category;
      break;
    }
  }
  const priority_score = PRIORITY_WEIGHTS[category] ?? PRIORITY_WEIGHTS.MEDIUM;
  return { priority: category, priority_score };
}

// simple in-memory occupancy map
const occupancy = new Map(); // key: station, value: Set(platform)

export function assignPlatform(station) {
  if (!station) return { platform_assigned: null, platform_assigned_timestamp: null };
  const maxPlatforms = stationPlatforms[station] || DEFAULT_PLATFORM_RANGE.max;
  const used = occupancy.get(station) || new Set();
  let platform = null;
  for (let p = 1; p <= maxPlatforms; p++) {
    if (!used.has(p)) { platform = p; break; }
  }
  if (!platform) platform = Math.floor(Math.random() * maxPlatforms) + 1;
  used.add(platform);
  occupancy.set(station, used);
  return { platform_assigned: platform, platform_assigned_timestamp: new Date().toISOString() };
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeSegmentTime(train, priorityCategory) {
  const from = train.current_station || null;
  const to = train.next_station || null;
  let seconds = null;

  // If schedule has both times, compute scheduled diff
  if (Array.isArray(train.schedule) && from && to) {
    const cur = train.schedule.find((s) => s.station === from);
    const next = train.schedule.find((s) => s.station === to);
    if (cur && next && next.arr) {
      try {
        const dep = cur.dep ? new Date(cur.dep).getTime() : Date.now();
        const arr = new Date(next.arr).getTime();
        const diff = Math.round((arr - dep) / 1000);
        if (diff > 60 && diff < 24 * 3600) {
          seconds = diff;
        }
      } catch {}
    }
  }

  // Else use geo distance
  if (!seconds && from && to && stationsGeo[from] && stationsGeo[to]) {
    const dKm = haversineKm(stationsGeo[from].lat, stationsGeo[from].lon, stationsGeo[to].lat, stationsGeo[to].lon);
    const speed = ASSUMED_SPEED_KMPH[priorityCategory] || 60;
    seconds = Math.max(60, Math.round((dKm / Math.max(1, speed)) * 3600));
  }

  // Fallback
  if (!seconds) seconds = 1800;

  return { from, to, seconds };
}

export function computeDwellSeconds(priorityCategory) {
  return DEFAULT_DWELL_SECONDS[priorityCategory] ?? 120;
}

export async function ingestOnce({ source = 'railradar_api' } = {}) {
  const useApi = String(process.env.RAILRADAR_USE_API || 'true').toLowerCase() === 'true';
  const apiKey = process.env.RAILRADAR_API_KEY || '';
  const fromStation = process.env.RAILRADAR_FROM || 'NDLS';
  const toStation = process.env.RAILRADAR_TO || 'MMCT';
  const journeyDate = process.env.RAILRADAR_DATE || new Date().toISOString().slice(0, 10);
  const specificTrain = process.env.RAILRADAR_TRAIN_NUMBER || '';

  const api_received_ts = new Date().toISOString();

  let rows = [];
  if (useApi) {
    // Fetch via RailRadar API
    const headers = { 'x-api-key': apiKey };
    const base = 'https://railradar.in/api/v1';
    try {
      if (specificTrain) {
        // Single train mode - fetch specific train directly
        console.log(`[ingestOnce] Single train mode: ${specificTrain}`);
        const trainNumber = specificTrain;
        let trainName = null;
        let current_station = null;
        let next_station = null;
        let position = { lat: null, lon: null };
        let delay_minutes = 0;
        let status = 'running';
        let schedule = null;

        // Try full data (static + live combined) - same approach as your friend's code
        try {
          const fullRes = await fetch(`${base}/trains/${trainNumber}?journeyDate=${journeyDate}&dataType=full&provider=railradar`, { headers });
          if (fullRes.ok) {
            const fullJson = await fullRes.json();
            const fullData = fullJson?.data || {};
            const live = fullData?.liveData || {};
            
            // Extract live position and status from currentLocation
            const currentLocation = live.currentLocation || {};
            position = {
              lat: toNumber(currentLocation.latitude, null),
              lon: toNumber(currentLocation.longitude, null),
            };
            delay_minutes = toNumber(live.overallDelayMinutes, 0);
            current_station = currentLocation.stationCode || null;
            next_station = null; // Will be determined from route analysis
            trainName = (fullData?.train || {}).trainName || (fullData?.train || {}).name || null;
            
            console.log(`[ingestOnce] Full data for ${trainNumber}: lat=${position.lat}, lon=${position.lon}, delay=${delay_minutes}, current=${current_station}, next=${next_station}`);
            
            // Extract schedule with live updates from route array
            const route = Array.isArray(live?.route) ? live.route : [];
            schedule = route.map((r) => {
              const station = r?.station || {};
              return {
                station: station.code || null,
                arr: r?.scheduledArrival ? new Date(r.scheduledArrival * 1000).toISOString() : null,
                dep: r?.scheduledDeparture ? new Date(r.scheduledDeparture * 1000).toISOString() : null,
                actual_arr: r?.actualArrival ? new Date(r.actualArrival * 1000).toISOString() : null,
                actual_dep: r?.actualDeparture ? new Date(r.actualDeparture * 1000).toISOString() : null,
                arr_delay: r?.delayArrivalMinutes || null,
                dep_delay: r?.delayDepartureMinutes || null,
                platform: r?.platform || null,
              };
            });
            
            // Determine next station from route
            if (current_station && route.length > 0) {
              const currentIndex = route.findIndex(r => r?.station?.code === current_station);
              if (currentIndex >= 0 && currentIndex < route.length - 1) {
                next_station = route[currentIndex + 1]?.station?.code || null;
              }
            }
            console.log(`[ingestOnce] Full route for ${trainNumber}: ${route.length} stops with live updates`);
          } else {
            console.log(`[ingestOnce] Full data 404 for ${trainNumber}, trying separate endpoints`);
            
            // Fallback to separate live + schedule calls
            try {
              const liveRes = await fetch(`${base}/trains/${trainNumber}/live`, { headers });
              if (liveRes.ok) {
                const liveJson = await liveRes.json();
                const live = liveJson?.data?.liveData || {};
                position = {
                  lat: toNumber(live.latitude, null),
                  lon: toNumber(live.longitude, null),
                };
                delay_minutes = toNumber(live.delayMinutes, 0);
                current_station = live.lastStation?.code || live.lastStation?.name || null;
                next_station = live.nextStation?.code || live.nextStation?.name || null;
                console.log(`[ingestOnce] Live data for ${trainNumber}: lat=${position.lat}, lon=${position.lon}, delay=${delay_minutes}`);
              }
            } catch (e) {
              console.log(`[ingestOnce] Live error for ${trainNumber}:`, e.message);
            }

            try {
              const schedRes = await fetch(`${base}/trains/${trainNumber}/schedule?journeyDate=${journeyDate}`, { headers });
              if (schedRes.ok) {
                const schedJson = await schedRes.json();
                const route = Array.isArray(schedJson?.data?.route) ? schedJson.data.route : [];
                schedule = route.map((r) => ({
                  station: r?.station?.code || r?.station?.name || null,
                  arr: r?.arrival || null,
                  dep: r?.departure || null,
                }));
                console.log(`[ingestOnce] Schedule for ${trainNumber}: ${route.length} stops`);
              }
            } catch (e) {
              console.log(`[ingestOnce] Schedule error for ${trainNumber}:`, e.message);
            }
          }
        } catch (e) {
          console.log(`[ingestOnce] Full data error for ${trainNumber}:`, e.message);
        }

        rows.push({
          train_no: String(trainNumber),
          train_name: trainName,
          current_station,
          next_station,
          position,
          delay_minutes,
          status,
          schedule,
        });
        source = 'railradar_api';
      } else {
        // Multi-train mode - fetch trains between stations
        const betweenUrl = `${base}/trains/between?from=${fromStation}&to=${toStation}&date=${journeyDate}`;
        const res = await fetch(betweenUrl, { headers });
        if (!res.ok) throw new Error(`between ${res.status}`);
        const payload = await res.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        console.log(`[ingestOnce] Found ${list.length} trains between ${fromStation}-${toStation}`);
        
        // Map minimal fields; enrich per-train below with live/schedule
        for (const t of list.slice(0, 10)) {
          const trainNumber = t.trainNumber || t.number || t.id || t.train_no;
          const trainName = t.trainName || t.name || t.train_name || null;
          let current_station = null;
          let next_station = null;
          let position = { lat: null, lon: null };
          let delay_minutes = 0;
          let status = 'running';

          if (trainNumber) {
            try {
              const liveRes = await fetch(`${base}/trains/${trainNumber}/live`, { headers });
              if (liveRes.ok) {
                const liveJson = await liveRes.json();
                const live = liveJson?.data?.liveData || {};
                position = {
                  lat: toNumber(live.latitude, null),
                  lon: toNumber(live.longitude, null),
                };
                delay_minutes = toNumber(live.delayMinutes, 0);
                current_station = live.lastStation?.code || live.lastStation?.name || null;
                next_station = live.nextStation?.code || live.nextStation?.name || null;
              }
            } catch {}

            let schedule = null;
            try {
              const schedRes = await fetch(`${base}/trains/${trainNumber}/schedule?journeyDate=${journeyDate}`, { headers });
              if (schedRes.ok) {
                const schedJson = await schedRes.json();
                const route = Array.isArray(schedJson?.data?.route) ? schedJson.data.route : [];
                schedule = route.map((r) => ({
                  station: r?.station?.code || r?.station?.name || null,
                  arr: r?.arrival || null,
                  dep: r?.departure || null,
                }));
              }
            } catch {}

            rows.push({
              train_no: String(trainNumber),
              train_name: trainName,
              current_station,
              next_station,
              position,
              delay_minutes,
              status,
              schedule,
            });
          }
        }
        source = 'railradar_api';
      }
    } catch (e) {
      console.error('[ingestOnce] API fetch failed, falling back to mock', e);
      const mockPath = path.resolve(process.cwd(), 'mock/railradar_mock.json');
      const text = fs.readFileSync(mockPath, 'utf8');
      rows = JSON.parse(text);
      source = 'railradar_mock';
    }
  } else {
    const mockPath = path.resolve(process.cwd(), 'mock/railradar_mock.json');
    const text = fs.readFileSync(mockPath, 'utf8');
    rows = JSON.parse(text);
    source = 'railradar_mock';
  }

  let processed = 0;
  for (const raw of rows) {
    const train_no = String(raw.train_no || '').trim();
    if (!train_no) continue;

    const delay_minutes = toNumber(raw.delay_minutes, 0);
    const position = {
      lat: clampLat(raw.position?.lat ?? null),
      lon: clampLon(raw.position?.lon ?? null),
    };

    const { priority, priority_score } = assignPriority(raw);
    const { platform_assigned, platform_assigned_timestamp } = assignPlatform(raw.current_station);
    const dwell_time_seconds = computeDwellSeconds(priority);
    const segment_travel_time_seconds = computeSegmentTime(raw, priority);

    const etaMs = Date.now() + segment_travel_time_seconds.seconds * 1000 + delay_minutes * 60 * 1000;
    const estimated_arrival_next = new Date(etaMs).toISOString();

    const doc = {
      train_no,
      train_name: raw.train_name || null,
      current_station: raw.current_station || null,
      next_station: raw.next_station || null,
      position,
      delay_minutes,
      status: raw.status || null,
      schedule: Array.isArray(raw.schedule) ? raw.schedule : null,
      priority,
      priority_score,
      platform_assigned,
      platform_assigned_timestamp,
      dwell_time_seconds,
      segment_travel_time_seconds,
      estimated_arrival_next,
      scheduled_arrival_next: (() => {
        if (!Array.isArray(raw.schedule) || !raw.next_station) return null;
        const next = raw.schedule.find((s) => s.station === raw.next_station);
        return next?.arr || null;
      })(),
      ingestion_meta: { api_received_ts, ingested_by: SERVICE_NAME, source },
      updatedAt: admin.firestore.FieldValue.serverTimestamp?.() || new Date().toISOString(),
    };

    // upsert with doc id = train_no
    const ref = db.collection('trains').doc(train_no);
    await ref.set(doc, { merge: true });
    processed += 1;
  }

  return { processed };
}

