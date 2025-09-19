import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, Clock, Train, AlertTriangle, Activity, MapPin, Zap, Users } from "lucide-react";

const AnalyticsPage = () => {
  // Mock analytics data
  const kpiMetrics = [
    {
      title: "Daily Throughput",
      value: "1,247",
      change: "+8.2%",
      trend: "up",
      description: "Trains processed today"
    },
    {
      title: "Average Delay",
      value: "12.5 min",
      change: "-3.1%",
      trend: "down",
      description: "System-wide average"
    },
    {
      title: "On-Time Performance",
      value: "87.3%",
      change: "+2.4%",
      trend: "up",
      description: "Within 5-minute window"
    },
    {
      title: "Critical Delays",
      value: "23",
      change: "-15.2%",
      trend: "down",
      description: "Delays over 60 minutes"
    }
  ];

  const hourlyData = [
    { hour: "00:00", trains: 45, avgDelay: 5.2, frequency: 15 },
    { hour: "02:00", trains: 32, avgDelay: 3.8, frequency: 12 },
    { hour: "04:00", trains: 28, avgDelay: 4.1, frequency: 10 },
    { hour: "06:00", trains: 89, avgDelay: 8.7, frequency: 35 },
    { hour: "08:00", trains: 145, avgDelay: 12.4, frequency: 48 },
    { hour: "10:00", trains: 167, avgDelay: 14.2, frequency: 52 },
    { hour: "12:00", trains: 156, avgDelay: 15.3, frequency: 58 },
    { hour: "14:00", trains: 178, avgDelay: 16.8, frequency: 61 },
    { hour: "16:00", trains: 189, avgDelay: 18.1, frequency: 65 },
    { hour: "18:00", trains: 201, avgDelay: 18.9, frequency: 68 },
    { hour: "20:00", trains: 145, avgDelay: 14.7, frequency: 45 },
    { hour: "22:00", trains: 98, avgDelay: 9.3, frequency: 28 },
    { hour: "23:00", trains: 78, avgDelay: 6.1, frequency: 22 }
  ];

  const delayDistribution = [
    { category: "On Time (0 min)", count: 287, percentage: 68 },
    { category: "Minor (1-15 min)", count: 89, percentage: 21 },
    { category: "Major (15+ min)", count: 46, percentage: 11 }
  ];

  const congestionHotspots = [
    { station: "Kota Junction", dwellTime: 18.5, trains: 45, severity: "high" },
    { station: "Vadodara Jn", dwellTime: 14.2, trains: 38, severity: "medium" },
    { station: "Mathura Jn", dwellTime: 12.8, trains: 42, severity: "medium" },
    { station: "Surat", dwellTime: 22.3, trains: 33, severity: "high" },
    { station: "Bharuch Jn", dwellTime: 9.4, trains: 28, severity: "low" }
  ];

  const corridorFlow = [
    { section: "Delhi - Mathura", density: 85, avgSpeed: 95, status: "normal" },
    { section: "Mathura - Kota", density: 92, avgSpeed: 88, status: "congested" },
    { section: "Kota - Vadodara", density: 78, avgSpeed: 102, status: "normal" },
    { section: "Vadodara - Surat", density: 88, avgSpeed: 85, status: "congested" },
    { section: "Surat - Mumbai", density: 94, avgSpeed: 78, status: "critical" }
  ];

  const routePerformance = [
    { route: "Delhi - Jaipur", onTime: 92, delayed: 8, avgDelay: "6.2 min" },
    { route: "Jaipur - Ajmer", onTime: 85, delayed: 15, avgDelay: "11.7 min" },
    { route: "Ajmer - Kota", onTime: 78, delayed: 22, avgDelay: "18.4 min" },
    { route: "Kota - Indore", onTime: 88, delayed: 12, avgDelay: "9.1 min" },
    { route: "Indore - Mumbai", onTime: 91, delayed: 9, avgDelay: "7.3 min" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Performance insights and trend analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="today">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className="kpi-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={metric.trend === "up" ? "default" : "destructive"}
                    className={metric.trend === "up" ? "bg-success text-success-foreground" : ""}
                  >
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Train Frequency Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Train Frequency vs Time of Day</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 flex items-end space-x-1">
                {hourlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full space-y-1">
                      {/* Frequency bar */}
                      <div 
                        className="w-full bg-gradient-primary rounded transition-all hover:opacity-80"
                        style={{ height: `${(data.frequency / 70) * 180}px` }}
                        title={`${data.frequency} trains/hour at ${data.hour}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 -rotate-45">{data.hour}</span>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-muted-foreground">
                Trains per hour across Delhi-Mumbai corridor
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delay Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Delay Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {delayDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        index === 0 ? 'bg-success' : 
                        index === 1 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage}% of total trains
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Delay Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Average Delay Trend - Last 24 Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-48 flex items-end space-x-2">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full">
                    <div 
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        data.avgDelay < 8 ? 'bg-success' :
                        data.avgDelay < 15 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ height: `${(data.avgDelay / 25) * 150}px` }}
                      title={`${data.avgDelay} min avg delay at ${data.hour}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{data.hour}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>&lt;8 min</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>8-15 min</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span>&gt;15 min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Congestion Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congestion Hotspots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Congestion Hotspots</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {congestionHotspots.map((hotspot, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{hotspot.station}</span>
                    <Badge variant={
                      hotspot.severity === 'high' ? 'destructive' :
                      hotspot.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {hotspot.severity}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Dwell: {hotspot.dwellTime} min</div>
                    <div>Trains: {hotspot.trains}</div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${
                        hotspot.severity === 'high' ? 'bg-destructive' :
                        hotspot.severity === 'medium' ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${(hotspot.dwellTime / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Corridor Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Corridor Flow Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {corridorFlow.map((section, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{section.section}</span>
                    <Badge variant={
                      section.status === 'critical' ? 'destructive' :
                      section.status === 'congested' ? 'default' : 'secondary'
                    }>
                      {section.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Density: {section.density}%</div>
                    <div>Speed: {section.avgSpeed} km/h</div>
                  </div>
                  <div className="flex space-x-1 h-2">
                    <div 
                      className={`rounded ${
                        section.status === 'critical' ? 'bg-destructive' :
                        section.status === 'congested' ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${section.density}%` }}
                    />
                    <div 
                      className="bg-muted rounded"
                      style={{ width: `${100 - section.density}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>What-If Simulation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Train</label>
              <Select defaultValue="12951">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12951">Rajdhani Express (12951)</SelectItem>
                  <SelectItem value="12009">Shatabdi Express (12009)</SelectItem>
                  <SelectItem value="22691">Mumbai Rajdhani (22691)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Delay (minutes)</label>
              <Select defaultValue="15">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Run Simulation</Button>
            </div>
          </div>

          {/* Simulation Results */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h4 className="font-medium mb-3">Predicted Impact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Affected Trains:</span>
                <span className="ml-2 font-medium">7 trains</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Delay Added:</span>
                <span className="ml-2 font-medium text-destructive">+42 minutes</span>
              </div>
              <div>
                <span className="text-muted-foreground">OTP Impact:</span>
                <span className="ml-2 font-medium text-destructive">-3.2%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;