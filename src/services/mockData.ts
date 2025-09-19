// Mock data service for MVP showcase
export interface Train {
  id: string;
  name: string;
  type: string;
  status: 'on-time' | 'minor-delay' | 'major-delay';
  position: [number, number];
  currentStation: string;
  nextStation: string;
  delay: number;
  priority: string;
  schedule: Array<{
    station: string;
    scheduled: string;
    actual: string;
    status: string;
  }>;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  status: 'success' | 'warning' | 'destructive';
  description: string;
  icon: any;
}

export interface OptimizationResult {
  success: boolean;
  run_id: string;
  solver_status: string;
  objective_value: number;
  train_count: number;
  summary: {
    top5_changes: Array<{
      train_no: string;
      hold_seconds: number;
      action: string;
    }>;
  };
  message: string;
}

export interface AnalyticsData {
  beforeOptimization: {
    totalDelay: number;
    averageDelay: number;
    onTimePercentage: number;
    criticalDelays: number;
  };
  afterOptimization: {
    totalDelay: number;
    averageDelay: number;
    onTimePercentage: number;
    criticalDelays: number;
  };
  improvement: {
    delayReduction: number;
    timeSaved: number;
    efficiencyGain: number;
  };
}

// Mock KPI Data
export const mockKPIData: KPIData[] = [
  {
    title: "Trains Running",
    value: "847",
    change: "+12 today",
    status: "success",
    description: "Active trains across Delhi-Mumbai corridor",
    icon: null
  },
  {
    title: "Average Delay",
    value: "8.5 min",
    change: "-2.3 min",
    status: "warning",
    description: "Average delay across all services",
    icon: null
  },
  {
    title: "On-Time Performance",
    value: "89.2%",
    change: "+5.1%",
    status: "success",
    description: "Trains arriving within 5 minutes of schedule",
    icon: null
  },
  {
    title: "Active Alerts",
    value: "7",
    change: "3 critical",
    status: "destructive",
    description: "System alerts requiring attention",
    icon: null
  }
];

// Mock Train Data
export const mockTrains: Train[] = [
  {
    id: "12951",
    name: "Mumbai Rajdhani Express",
    type: "Rajdhani",
    status: "on-time",
    position: [28.6139, 77.2090],
    currentStation: "New Delhi",
    nextStation: "Gwalior Junction",
    delay: 0,
    priority: "High",
    schedule: [
      { station: "New Delhi", scheduled: "16:55", actual: "16:55", status: "departed" },
      { station: "Gwalior Junction", scheduled: "21:38", actual: "21:38", status: "scheduled" },
      { station: "Bhopal Junction", scheduled: "00:05", actual: "00:05", status: "scheduled" },
    ]
  },
  {
    id: "12009",
    name: "Mumbai Shatabdi Express",
    type: "Shatabdi",
    status: "minor-delay",
    position: [25.3176, 82.9739],
    currentStation: "Allahabad Junction",
    nextStation: "Kanpur Central",
    delay: 15,
    priority: "Medium",
    schedule: [
      { station: "New Delhi", scheduled: "06:00", actual: "06:00", status: "departed" },
      { station: "Allahabad Junction", scheduled: "12:35", actual: "12:50", status: "departed" },
      { station: "Kanpur Central", scheduled: "14:20", actual: "14:35", status: "scheduled" },
    ]
  },
  {
    id: "22691",
    name: "Rajdhani Express",
    type: "Rajdhani",
    status: "major-delay",
    position: [26.9124, 75.7873],
    currentStation: "Jaipur Junction",
    nextStation: "Ajmer Junction",
    delay: 45,
    priority: "High",
    schedule: [
      { station: "Mumbai Central", scheduled: "17:05", actual: "17:05", status: "departed" },
      { station: "Jaipur Junction", scheduled: "06:45", actual: "07:30", status: "departed" },
      { station: "Ajmer Junction", scheduled: "09:15", actual: "10:00", status: "scheduled" },
    ]
  },
  {
    id: "09472",
    name: "Freight Express",
    type: "Freight",
    status: "major-delay",
    position: [25.2048, 75.8648],
    currentStation: "Kota Junction",
    nextStation: "Indore Junction",
    delay: 60,
    priority: "Low",
    schedule: [
      { station: "New Delhi", scheduled: "20:00", actual: "21:00", status: "departed" },
      { station: "Kota Junction", scheduled: "02:30", actual: "03:30", status: "departed" },
      { station: "Indore Junction", scheduled: "08:00", actual: "09:00", status: "scheduled" },
    ]
  },
  {
    id: "12903",
    name: "Mumbai Express",
    type: "Express",
    status: "minor-delay",
    position: [22.7196, 75.8577],
    currentStation: "Indore Junction",
    nextStation: "Mumbai Central",
    delay: 20,
    priority: "Medium",
    schedule: [
      { station: "New Delhi", scheduled: "22:20", actual: "22:40", status: "departed" },
      { station: "Indore Junction", scheduled: "06:00", actual: "06:20", status: "departed" },
      { station: "Mumbai Central", scheduled: "12:00", actual: "12:20", status: "scheduled" },
    ]
  }
];

// Mock Optimization Results
export const mockOptimizationResult: OptimizationResult = {
  success: true,
  run_id: "optim_20250919T202550Z",
  solver_status: "OPTIMAL",
  objective_value: 450,
  train_count: 5,
  summary: {
    top5_changes: [
      {
        train_no: "09472",
        hold_seconds: 300,
        action: "HOLD"
      },
      {
        train_no: "12903",
        hold_seconds: 180,
        action: "HOLD"
      },
      {
        train_no: "12009",
        hold_seconds: 120,
        action: "HOLD"
      },
      {
        train_no: "22691",
        hold_seconds: 60,
        action: "HOLD"
      },
      {
        train_no: "12951",
        hold_seconds: 0,
        action: "PROCEED"
      }
    ]
  },
  message: "Optimization completed successfully with 32% delay reduction"
};

// Mock Analytics Data
export const mockAnalyticsData: AnalyticsData = {
  beforeOptimization: {
    totalDelay: 140,
    averageDelay: 28,
    onTimePercentage: 65,
    criticalDelays: 3
  },
  afterOptimization: {
    totalDelay: 95,
    averageDelay: 19,
    onTimePercentage: 87,
    criticalDelays: 1
  },
  improvement: {
    delayReduction: 45,
    timeSaved: 32,
    efficiencyGain: 22
  }
};

// Mock API Responses
export const mockAPIResponses = {
  health: { status: "ok", timestamp: new Date().toISOString() },
  trains: { trains: mockTrains },
  liveTrains: { trains: mockTrains },
  corridorStats: { stats: mockKPIData },
  optimize: mockOptimizationResult
};
