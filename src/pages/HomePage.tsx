import { useState, useEffect } from "react";
import { Train, Clock, TrendingUp, AlertTriangle, Play, RefreshCw, AlertCircle, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { mockKPIData, mockOptimizationResult, mockAPIResponses } from "@/services/mockData";

const HomePage = () => {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [algorithmRun, setAlgorithmRun] = useState(false);

  // Load initial empty state
  const fetchKPIs = async () => {
    setLoading(true);
    setTimeout(() => {
      // Show empty state before algorithm runs
      setKpiData([]);
      setLoading(false);
    }, 500);
  };

  // Run optimization - this triggers all data (frontend only)
  const runOptimization = async () => {
    setOptimizing(true);
    setError(null);
    
    // Simulate algorithm running (frontend only)
    setTimeout(() => {
      setOptimizationResult(mockOptimizationResult);
      setKpiData(mockKPIData); // Load data after algorithm
      setAlgorithmRun(true);
      setOptimizing(false);
    }, 2000); // 2 seconds to show algorithm is working
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  // Mock data fallback for when API is not available
  const mockKpiData = [
    {
      title: "Trains Running",
      value: "847",
      change: "+12 today",
      icon: Train,
      status: "success",
      description: "Active trains across Delhi-Mumbai corridor"
    },
    {
      title: "Average Delay",
      value: "8.5 min",
      change: "-2.3 min",
      icon: Clock,
      status: "warning",
      description: "Average delay across all services"
    },
    {
      title: "On-Time Performance",
      value: "89.2%",
      change: "+5.1%",
      icon: TrendingUp,
      status: "success",
      description: "Trains arriving within 5 minutes of schedule"
    },
    {
      title: "Active Alerts",
      value: "7",
      change: "3 critical",
      icon: AlertTriangle,
      status: "destructive",
      description: "System alerts requiring attention"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-success";
      case "warning": return "text-warning";
      case "destructive": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Train className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Railway Traffic Control Center</h1>
              <p className="text-primary-foreground/80">Indian Railways Operations Dashboard</p>
            </div>
          </div>
          
          <p className="text-lg text-primary-foreground/90 mb-6 max-w-2xl">
            Monitor live train movements, analyze delays, and optimize railway operations across the Delhi-Mumbai corridor with AI-powered recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Play className="h-5 w-5 mr-2" />
              Open Live Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/analytics")}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              View Analytics
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={runOptimization}
              disabled={optimizing}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Zap className={`h-5 w-5 mr-2 ${optimizing ? 'animate-pulse' : ''}`} />
              {optimizing ? 'Optimizing...' : 'Run AI Optimization'}
            </Button>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10">
          <div className="h-full w-full bg-gradient-to-l from-primary-foreground/20 to-transparent" />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-destructive font-medium">Connection Error</p>
            <p className="text-destructive/80 text-sm">{error}</p>
            <p className="text-destructive/60 text-xs mt-1">
              Showing mock data. Make sure the backend server is running on port 3000.
            </p>
          </div>
        </div>
      )}

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="h-6 w-6 text-success" />
            <h3 className="text-lg font-semibold text-success">Optimization Complete!</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{optimizationResult.train_count}</div>
              <div className="text-sm text-success/80">Trains Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{optimizationResult.solver_status}</div>
              <div className="text-sm text-success/80">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{optimizationResult.objective_value}</div>
              <div className="text-sm text-success/80">Objective Value</div>
            </div>
          </div>
          {optimizationResult.summary.top5_changes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Top Recommendations:</h4>
              <div className="space-y-2">
                {optimizationResult.summary.top5_changes.map((change, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/50 rounded p-2">
                    <span className="font-medium">Train {change.train_no}</span>
                    <Badge variant="outline" className="text-success border-success">
                      Hold {Math.round(change.hold_seconds / 60)} min
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!algorithmRun ? (
          // Empty state before algorithm runs
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-dashed border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Loading...
                </CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-muted-foreground">
                    --:--
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Run AI optimization to load data
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (kpiData.length > 0 ? kpiData : mockKpiData).map((kpi, index) => (
          <Card key={index} className="kpi-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {kpi.icon ? <kpi.icon className={`h-5 w-5 ${getStatusColor(kpi.status)}`} /> : <Activity className={`h-5 w-5 ${getStatusColor(kpi.status)}`} />}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {kpi.value}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={kpi.status === "success" ? "default" : 
                            kpi.status === "warning" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {kpi.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="live-indicator">Real-time Status</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Express Trains</span>
                <div className="flex items-center space-x-2">
                  <div className="status-indicator status-on-time"></div>
                  <span className="text-sm font-medium">234 on-time</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Passenger Trains</span>
                <div className="flex items-center space-x-2">
                  <div className="status-indicator status-minor-delay"></div>
                  <span className="text-sm font-medium">456 minor delays</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Freight Trains</span>
                <div className="flex items-center space-x-2">
                  <div className="status-indicator status-major-delay"></div>
                  <span className="text-sm font-medium">89 major delays</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Track Sensors</span>
                <Badge variant="default" className="bg-success text-success-foreground">98.5% Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Signal Systems</span>
                <Badge variant="default" className="bg-success text-success-foreground">100% Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Communication</span>
                <Badge variant="secondary" className="bg-warning text-warning-foreground">96.2% Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;