export const PRIORITY_WEIGHTS = {
  PREMIUM: 100,
  SPECIAL: 90,
  HIGH: 85,
  MEDIUM: 70,
  LOW: 40,
  FREIGHT: 20,
};

export const CATEGORY_BY_TRAIN_NAME = [
  { match: /vande\s*bharat|rajdhani|shatabdi|rajdhani\s*express/i, category: 'PREMIUM' },
  { match: /tejas|superfast/i, category: 'HIGH' },
  { match: /mail\s*express|mail[- ]express|express/i, category: 'MEDIUM' },
  { match: /passenger|local/i, category: 'LOW' },
  { match: /freight|goods/i, category: 'FREIGHT' },
  { match: /parcel|special/i, category: 'SPECIAL' },
];

export const DEFAULT_DWELL_SECONDS = {
  PREMIUM: 120,
  SPECIAL: 120,
  HIGH: 150,
  MEDIUM: 150,
  LOW: 60,
  FREIGHT: 300,
};

export const ASSUMED_SPEED_KMPH = {
  PREMIUM: 90,
  HIGH: 90,
  MEDIUM: 80,
  LOW: 60,
  FREIGHT: 50,
};

export const RECENT_MINUTES = 5;

export const DEFAULT_PLATFORM_RANGE = { min: 1, max: 5 };

export const SERVICE_NAME = 'dataIngestionService';

// Optimizer constants
export const OPTIMIZER_SNAPSHOT_MINUTES = 10;
export const OPTIMIZER_TIMEOUT_MS = 30000; // 30 seconds

