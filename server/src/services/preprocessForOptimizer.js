import admin from 'firebase-admin';
import { db } from '../config/firebase.js';
import { OPTIMIZER_SNAPSHOT_MINUTES, OPTIMIZER_TIMEOUT_MS } from '../config/constants.js';

/**
 * Fetch recent train snapshot from Firestore
 * @param {number} minutesBack - How many minutes back to look for trains
 * @returns {Promise<Array>} Array of train documents
 */
export async function fetchSnapshot(minutesBack = OPTIMIZER_SNAPSHOT_MINUTES) {
  const since = new Date(Date.now() - (minutesBack * 60 * 1000));
  
  try {
    const snapshot = await db.collection('trains')
      .where('updatedAt', '>=', since)
      .get();
    
    const trains = [];
    snapshot.forEach(doc => {
      trains.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`[fetchSnapshot] Found ${trains.length} trains updated since ${since.toISOString()}`);
    return trains;
  } catch (error) {
    console.error('[fetchSnapshot] Error:', error);
    throw new Error(`Failed to fetch train snapshot: ${error.message}`);
  }
}

/**
 * Normalize a train document to optimizer input format
 * @param {Object} train - Train document from Firestore
 * @returns {Object} Normalized train data
 */
export function normalizeTrain(train) {
  const now = Date.now();
  
  // Extract basic fields
  const train_no = train.train_no || train.id;
  const priority_score = train.priority_score || 70;
  const current_station = train.current_station;
  const next_station = train.next_station;
  const delay_minutes = train.delay_minutes || 0;
  const dwell_time_seconds = train.dwell_time_seconds || 150;
  
  // Extract position
  const position = train.position || { lat: null, lon: null };
  
  // Extract segment travel time
  const segment = train.segment_travel_time_seconds || { from: null, to: null, seconds: 1800 };
  
  // Calculate earliest entry time
  let earliest_entry_seconds = null;
  
  if (train.estimated_arrival_next) {
    // Use estimated arrival if available
    earliest_entry_seconds = Math.floor(new Date(train.estimated_arrival_next).getTime() / 1000);
  } else if (train.scheduled_arrival_next) {
    // Use scheduled arrival if available
    earliest_entry_seconds = Math.floor(new Date(train.scheduled_arrival_next).getTime() / 1000);
  } else if (current_station && next_station && segment.seconds) {
    // Estimate from current time + segment travel time
    earliest_entry_seconds = Math.floor(now / 1000) + segment.seconds;
  } else {
    // Fallback: use current time
    earliest_entry_seconds = Math.floor(now / 1000);
  }
  
  // Sanity checks
  const travel_time_seconds = Math.max(60, segment.seconds || 1800); // Min 1 minute
  const capped_delay_minutes = Math.min(Math.max(0, delay_minutes), 300); // Cap at 5 hours
  
  return {
    train_no: String(train_no),
    priority_score: Number(priority_score),
    current_station: current_station || null,
    next_station: next_station || null,
    estimated_arrival_next: train.estimated_arrival_next || null,
    scheduled_arrival_next: train.scheduled_arrival_next || null,
    delay_minutes: capped_delay_minutes,
    dwell_time_seconds: Number(dwell_time_seconds),
    segment: {
      from: segment.from || current_station,
      to: segment.to || next_station,
      seconds: travel_time_seconds
    },
    position: {
      lat: position.lat,
      lon: position.lon
    },
    earliest_entry_seconds: earliest_entry_seconds,
    updatedAt: train.updatedAt || new Date().toISOString()
  };
}

/**
 * Build input JSON for optimizer
 * @param {Array} trains - Array of normalized train data
 * @param {Object} solverParams - Solver parameters
 * @returns {Object} Input JSON for optimizer
 */
export function buildInputJSON(trains, solverParams = {}) {
  const run_id = `optim_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const snapshot_ts = new Date().toISOString();
  
  const defaultSolverParams = {
    time_limit_seconds: 20,
    headway_seconds: 180,
    max_hold_minutes: 120
  };
  
  const mergedSolverParams = { ...defaultSolverParams, ...solverParams };
  
  // Filter trains with valid data
  const validTrains = trains.filter(t => 
    t.train_no && 
    t.current_station && 
    t.next_station && 
    t.segment.seconds > 0
  );
  
  console.log(`[buildInputJSON] ${validTrains.length}/${trains.length} trains have valid data`);
  
  return {
    run_id,
    snapshot_ts,
    trains: validTrains,
    solver_params: mergedSolverParams
  };
}

/**
 * Call Python optimizer service
 * @param {Object} inputJSON - Input JSON for optimizer
 * @returns {Promise<Object>} Optimizer response
 */
export async function callOptimizer(inputJSON) {
  const optimizerUrl = process.env.OPTIMIZER_URL || 'http://localhost:5000/solve';
  
  try {
    console.log(`[callOptimizer] Calling ${optimizerUrl} with ${inputJSON.trains.length} trains`);
    
    const response = await fetch(optimizerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputJSON),
      signal: AbortSignal.timeout(OPTIMIZER_TIMEOUT_MS)
    });
    
    if (!response.ok) {
      throw new Error(`Optimizer returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`[callOptimizer] Received response: ${result.solver_meta?.status}`);
    return result;
    
  } catch (error) {
    console.error('[callOptimizer] Error:', error);
    throw new Error(`Failed to call optimizer: ${error.message}`);
  }
}

/**
 * Store optimization result in Firestore
 * @param {string} run_id - Optimization run ID
 * @param {Object} inputJSON - Input data
 * @param {Object} solverResponse - Solver response
 * @returns {Promise<void>}
 */
export async function storeOptimizationResult(run_id, inputJSON, solverResponse) {
  try {
    const doc = {
      run_id,
      input_snapshot: {
        timestamp: inputJSON.snapshot_ts,
        train_count: inputJSON.trains.length,
        solver_params: inputJSON.solver_params
      },
      solver_meta: solverResponse.solver_meta || {},
      results: solverResponse.results || [],
      created_at: new Date().toISOString(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp?.() || new Date().toISOString()
    };
    
    await db.collection('optimizations').doc(run_id).set(doc);
    console.log(`[storeOptimizationResult] Stored optimization ${run_id}`);
    
  } catch (error) {
    console.error('[storeOptimizationResult] Error:', error);
    throw new Error(`Failed to store optimization result: ${error.message}`);
  }
}

/**
 * Complete optimization pipeline
 * @param {Object} solverParams - Optional solver parameters
 * @returns {Promise<Object>} Optimization result summary
 */
export async function runOptimization(solverParams = {}) {
  try {
    // 1. Fetch snapshot
    const trains = await fetchSnapshot();
    if (trains.length === 0) {
      throw new Error('No trains found in recent snapshot');
    }
    
    // 2. Normalize trains
    const normalizedTrains = trains.map(normalizeTrain);
    
    // 3. Build input JSON
    const inputJSON = buildInputJSON(normalizedTrains, solverParams);
    
    // 4. Call optimizer
    const solverResponse = await callOptimizer(inputJSON);
    
    // 5. Store result
    await storeOptimizationResult(inputJSON.run_id, inputJSON, solverResponse);
    
    // 6. Return summary
    const topChanges = (solverResponse.results || [])
      .filter(r => r.hold_seconds > 0)
      .sort((a, b) => b.hold_seconds - a.hold_seconds)
      .slice(0, 5)
      .map(r => ({
        train_no: r.train_no,
        hold_seconds: r.hold_seconds,
        action: r.action
      }));
    
    return {
      run_id: inputJSON.run_id,
      solver_status: solverResponse.solver_meta?.status || 'UNKNOWN',
      objective_value: solverResponse.solver_meta?.objective_value || 0,
      train_count: inputJSON.trains.length,
      summary: {
        top5_changes: topChanges
      }
    };
    
  } catch (error) {
    console.error('[runOptimization] Error:', error);
    throw error;
  }
}
