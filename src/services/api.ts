// API service for connecting frontend to backend
import { Train, Clock, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

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

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all trains
  async getTrains(): Promise<Train[]> {
    return this.request<Train[]>('/trains');
  }

  // Get live train data
  async getLiveTrains(): Promise<Train[]> {
    const response = await this.request<{ trains: Train[] }>('/live-trains');
    return response.trains || [];
  }

  // Get corridor statistics
  async getCorridorStats(): Promise<KPIData[]> {
    const response = await this.request<{ stats: any[] }>('/corridor-stats');
    const stats = response.stats || [];
    
    if (stats.length === 0) {
      return [];
    }
    
    // Get the latest stats (first item)
    const latest = stats[0];
    
    // Map backend data to frontend format with icons
    return [
      {
        title: "Trains Running",
        value: latest.totalTrains?.toString() || "0",
        change: "+12 today",
        status: "success",
        description: "Active trains across Delhi-Mumbai corridor",
        icon: Train
      },
      {
        title: "Average Delay",
        value: `${latest.avgDelay?.toFixed(1) || "0"} min`,
        change: "-2.3 min",
        status: latest.avgDelay > 15 ? "warning" : "success",
        description: "Average delay across all services",
        icon: Clock
      },
      {
        title: "On-Time Performance",
        value: `${latest.onTimePercentage?.toFixed(1) || "0"}%`,
        change: "+5.1%",
        status: latest.onTimePercentage > 80 ? "success" : "warning",
        description: "Trains arriving within 5 minutes of schedule",
        icon: TrendingUp
      },
      {
        title: "Busiest Section",
        value: latest.busiestSection || "Unknown",
        change: "High traffic",
        status: "warning",
        description: "Most congested rail section",
        icon: AlertTriangle
      }
    ];
  }

  private getIconForMetric(title: string) {
    const iconMap: { [key: string]: any } = {
      'Trains Running': Train,
      'Average Delay': Clock,
      'On-Time Performance': TrendingUp,
      'Active Alerts': AlertTriangle,
      'Total Delays': Clock,
      'System Health': CheckCircle,
      'Throughput': Activity
    };
    
    return iconMap[title] || Activity;
  }

  // Trigger optimization
  async runOptimization(solverParams?: any): Promise<OptimizationResult> {
    return this.request<OptimizationResult>('/optimize', {
      method: 'POST',
      body: JSON.stringify({ solver_params: solverParams || {} }),
    });
  }

  // Upload train data
  async uploadTrainData(file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const apiService = new ApiService();
