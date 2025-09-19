import { normalizeTrain, buildInputJSON } from '../src/services/preprocessForOptimizer.js';

// Sample train document from Firestore
const sampleTrain = {
  id: '20957',
  train_no: '20957',
  train_name: 'New Delhi - Indore SF Express',
  current_station: 'DDV',
  next_station: 'KOTA',
  position: { lat: 25.135744, lon: 75.86737 },
  delay_minutes: 14,
  priority_score: 70,
  dwell_time_seconds: 150,
  segment_travel_time_seconds: { from: 'DDV', to: 'KOTA', seconds: 120 },
  estimated_arrival_next: '2025-09-19T17:50:39.723Z',
  scheduled_arrival_next: '2025-09-19T17:40:00.000Z',
  updatedAt: '2025-09-19T17:40:00Z'
};

console.log('=== Test normalizeTrain ===');
const normalized = normalizeTrain(sampleTrain);
console.log('Input train:', JSON.stringify(sampleTrain, null, 2));
console.log('Normalized train:', JSON.stringify(normalized, null, 2));

console.log('\n=== Test buildInputJSON ===');
const inputJSON = buildInputJSON([normalized], { time_limit_seconds: 15 });
console.log('Input JSON:', JSON.stringify(inputJSON, null, 2));

console.log('\n=== Validation ===');
console.log('✓ train_no:', typeof normalized.train_no === 'string');
console.log('✓ priority_score:', typeof normalized.priority_score === 'number');
console.log('✓ earliest_entry_seconds:', typeof normalized.earliest_entry_seconds === 'number');
console.log('✓ segment.seconds:', normalized.segment.seconds > 0);
console.log('✓ run_id format:', inputJSON.run_id.startsWith('optim_'));
console.log('✓ solver_params:', inputJSON.solver_params.time_limit_seconds === 15);
