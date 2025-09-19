import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Train,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Target,
  DollarSign,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";
import { mockAnalyticsData, mockOptimizationResult } from "@/services/mockData";

interface OptimizationHistory {
  run_id: string;
  timestamp: string;
  before_delay: number;
  after_delay: number;
  improvement: number;
  trains_optimized: number;
  status: string;
}

const OptimizationAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [currentOptimization, setCurrentOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [algorithmRun, setAlgorithmRun] = useState(false);

  useEffect(() => {
    // Start with empty state
    setAnalyticsData(null);
    setCurrentOptimization(null);
  }, []);

  const runOptimization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate algorithm running (frontend only)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Load data after algorithm completes
      setAnalyticsData(mockAnalyticsData);
      setCurrentOptimization(mockOptimizationResult);
      setAlgorithmRun(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run optimization');
    } finally {
      setLoading(false);
    }
  };

  const getTotalImprovement = () => {
    return analyticsData?.improvement?.delayReduction || 0;
  };

  const getAverageImprovement = () => {
    return analyticsData?.improvement?.efficiencyGain || 0;
  };

  const getTotalTrainsOptimized = () => {
    return currentOptimization?.train_count || 5;
  };

  const getSuccessRate = () => {
    return currentOptimization?.success ? 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Optimization Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track the impact of AI optimization on train delays and system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={runOptimization}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Zap className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Optimizing...' : 'Run New Optimization'}</span>
          </Button>
        </div>
      </div>

      {/* Current Optimization Result */}
      {!algorithmRun ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">No Optimization Data</h3>
                <p className="text-sm text-muted-foreground">
                  Run AI optimization to see results and analytics
                </p>
              </div>
              <Button onClick={runOptimization} disabled={loading} className="mt-4">
                <Zap className="h-4 w-4 mr-2" />
                {loading ? 'Running Algorithm...' : 'Run AI Optimization'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : currentOptimization && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-5 w-5" />
              <span>Latest Optimization Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{currentOptimization?.train_count || 0}</div>
                <div className="text-sm text-success/80">Trains Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{currentOptimization?.solver_status || 'PENDING'}</div>
                <div className="text-sm text-success/80">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{currentOptimization?.objective_value || 0}</div>
                <div className="text-sm text-success/80">Objective Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {analyticsData?.improvement?.delayReduction || 0} min
                </div>
                <div className="text-sm text-success/80">Delay Reduction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="text-destructive font-medium">Optimization Error</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Delay Reduction
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalImprovement().toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground">
              Cumulative improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Improvement
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageImprovement().toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground">
              Per optimization run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trains Optimized
            </CardTitle>
            <Train className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTrainsOptimized()}</div>
            <p className="text-xs text-muted-foreground">
              Total trains processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSuccessRate().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Optimal/Feasible solutions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Delay Reduction Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Interactive Chart Visualization */}
              <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border">
                {/* Chart Title */}
                <div className="absolute top-2 left-4 text-sm font-semibold text-gray-700">Train Delay Comparison</div>
                
                {/* Y-Axis Labels */}
                <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-xs text-gray-600">
                  <span>60 min</span>
                  <span>45 min</span>
                  <span>30 min</span>
                  <span>15 min</span>
                  <span>0 min</span>
                </div>
                
                {/* Chart Area */}
                <div className="ml-12 mr-4 mt-8 mb-8 h-full flex items-end justify-between space-x-1">
                  {/* Train 12951 */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-red-500 rounded-t" style={{ height: '20px' }}></div>
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: '20px' }}></div>
                    <div className="text-xs font-bold">12951</div>
                    <div className="text-xs text-red-600">0→0</div>
                  </div>
                  
                  {/* Train 12009 */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-red-500 rounded-t" style={{ height: '40px' }}></div>
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: '20px' }}></div>
                    <div className="text-xs font-bold">12009</div>
                    <div className="text-xs text-red-600">15→5</div>
                  </div>
                  
                  {/* Train 22691 */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-red-500 rounded-t" style={{ height: '120px' }}></div>
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: '60px' }}></div>
                    <div className="text-xs font-bold">22691</div>
                    <div className="text-xs text-red-600">45→20</div>
                  </div>
                  
                  {/* Train 09472 */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-red-500 rounded-t" style={{ height: '160px' }}></div>
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: '80px' }}></div>
                    <div className="text-xs font-bold">09472</div>
                    <div className="text-xs text-red-600">60→30</div>
                  </div>
                  
                  {/* Train 12903 */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-red-500 rounded-t" style={{ height: '60px' }}></div>
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: '30px' }}></div>
                    <div className="text-xs font-bold">12903</div>
                    <div className="text-xs text-red-600">20→8</div>
                  </div>
                </div>
                
                {/* X-Axis Labels */}
                <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-600">
                  <span>Train 1</span>
                  <span>Train 2</span>
                  <span>Train 3</span>
                  <span>Train 4</span>
                  <span>Train 5</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-destructive rounded"></div>
                  <span className="text-sm">Before Optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-success rounded"></div>
                  <span className="text-sm">After Optimization</span>
                </div>
              </div>
              
              {/* Summary */}
              <div className="text-center pt-4 border-t">
                <div className="text-2xl font-bold text-primary">
                  {analyticsData?.improvement?.delayReduction || 0} min saved
                </div>
                <div className="text-sm text-muted-foreground">
                  {analyticsData?.improvement?.efficiencyGain || 0}% efficiency gain
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animated Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Delay Reduction Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Line Chart Visualization */}
              <div className="relative h-64 bg-muted/20 rounded-lg p-4">
                {/* Grid Lines */}
                <div className="absolute inset-4">
                  <div className="h-full flex flex-col justify-between">
                    {[0, 25, 50, 75, 100].map((value, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-full border-t border-muted-foreground/20"></div>
                        <div className="ml-2 text-xs text-muted-foreground">{value}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Before Optimization Line */}
                <div className="absolute inset-4">
                  <svg className="w-full h-full">
                    <polyline
                      points="20,200 80,180 140,120 200,80 260,160"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                    <circle cx="20" cy="200" r="4" fill="#ef4444" />
                    <circle cx="80" cy="180" r="4" fill="#ef4444" />
                    <circle cx="140" cy="120" r="4" fill="#ef4444" />
                    <circle cx="200" cy="80" r="4" fill="#ef4444" />
                    <circle cx="260" cy="160" r="4" fill="#ef4444" />
                  </svg>
                </div>
                
                {/* After Optimization Line */}
                <div className="absolute inset-4">
                  <svg className="w-full h-full">
                    <polyline
                      points="20,200 80,200 140,180 200,160 260,200"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                    />
                    <circle cx="20" cy="200" r="4" fill="#22c55e" />
                    <circle cx="80" cy="200" r="4" fill="#22c55e" />
                    <circle cx="140" cy="180" r="4" fill="#22c55e" />
                    <circle cx="200" cy="160" r="4" fill="#22c55e" />
                    <circle cx="260" cy="200" r="4" fill="#22c55e" />
                  </svg>
                </div>
                
                {/* Time Labels */}
                <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-muted-foreground">
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-destructive border-dashed border-t-2"></div>
                  <span className="text-sm">Before Optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-success"></div>
                  <span className="text-sm">After Optimization</span>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-xl font-bold text-success">
                    {analyticsData?.afterOptimization?.onTimePercentage || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">On-Time Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {analyticsData?.improvement?.timeSaved || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Train Optimization Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>Train Optimization Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline Visualization */}
            <div className="space-y-4">
              <h4 className="font-semibold">Before vs After Optimization</h4>
              
              {/* Train 1 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">Train 12951</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-32 h-6 bg-destructive rounded flex items-center justify-center text-xs text-white">
                    Delay: 0 min
                  </div>
                  <div className="text-xs text-muted-foreground">→</div>
                  <div className="w-32 h-6 bg-success rounded flex items-center justify-center text-xs text-white">
                    On Time: 0 min
                  </div>
                </div>
              </div>
              
              {/* Train 2 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">Train 12009</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-32 h-6 bg-warning rounded flex items-center justify-center text-xs text-white">
                    Delay: 15 min
                  </div>
                  <div className="text-xs text-muted-foreground">→</div>
                  <div className="w-32 h-6 bg-success rounded flex items-center justify-center text-xs text-white">
                    Reduced: 5 min
                  </div>
                </div>
              </div>
              
              {/* Train 3 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">Train 22691</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-32 h-6 bg-destructive rounded flex items-center justify-center text-xs text-white">
                    Delay: 45 min
                  </div>
                  <div className="text-xs text-muted-foreground">→</div>
                  <div className="w-32 h-6 bg-warning rounded flex items-center justify-center text-xs text-white">
                    Reduced: 20 min
                  </div>
                </div>
              </div>
              
              {/* Train 4 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">Train 09472</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-32 h-6 bg-destructive rounded flex items-center justify-center text-xs text-white">
                    Delay: 60 min
                  </div>
                  <div className="text-xs text-muted-foreground">→</div>
                  <div className="w-32 h-6 bg-warning rounded flex items-center justify-center text-xs text-white">
                    Reduced: 30 min
                  </div>
                </div>
              </div>
              
              {/* Train 5 */}
              <div className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">Train 12903</div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="w-32 h-6 bg-warning rounded flex items-center justify-center text-xs text-white">
                    Delay: 20 min
                  </div>
                  <div className="text-xs text-muted-foreground">→</div>
                  <div className="w-32 h-6 bg-success rounded flex items-center justify-center text-xs text-white">
                    Reduced: 8 min
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Trains Optimized</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-success">32%</div>
                <div className="text-sm text-muted-foreground">Delay Reduction</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-warning">450</div>
                <div className="text-sm text-muted-foreground">Objective Value</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Optimization History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[currentOptimization].map((entry, index) => (
              <div key={entry.run_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={entry.solver_status === 'OPTIMAL' ? 'default' : 'secondary'}>
                      {entry.solver_status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Before</div>
                    <div className="font-semibold text-destructive">{analyticsData?.beforeOptimization?.averageDelay || 0} min</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">After</div>
                    <div className="font-semibold text-success">{analyticsData?.afterOptimization?.averageDelay || 0} min</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Improvement</div>
                    <div className="font-semibold text-primary flex items-center space-x-1">
                      <TrendingDown className="h-4 w-4" />
                      <span>{analyticsData?.improvement?.delayReduction || 0} min</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trains</div>
                    <div className="font-semibold">{entry.train_count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Before vs After Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Delay Reduction Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-sm text-muted-foreground">
                Shows before/after delay comparison over time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationAnalytics;
