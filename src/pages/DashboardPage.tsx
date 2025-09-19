import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Train, 
  MapPin, 
  Clock, 
  Filter, 
  Search,
  Lightbulb,
  CheckCircle,
  XCircle,
  Map,
  RefreshCw,
  AlertCircle,
  Zap
} from "lucide-react";
import { mockTrains as mockTrainData } from "@/services/mockData";

const DashboardPage = () => {
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDelay, setFilterDelay] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [algorithmRun, setAlgorithmRun] = useState(false);

  // Load train data only after algorithm runs (frontend only)
  const fetchTrains = () => {
    if (algorithmRun) {
      setTrains(mockTrainData);
      setLastRefresh(new Date());
    } else {
      setTrains([]);
    }
  };

  // Run algorithm to load all data (frontend only)
  const runAlgorithm = async () => {
    setLoading(true);
    setTimeout(() => {
      setTrains(mockTrainData);
      setAiRecommendations([
        {
          id: 1,
          type: "Priority Adjustment",
          message: "Hold freight train 09472 at Kota for 10 min to let Rajdhani pass",
          impact: "Reduces total system delay by 25 min",
          status: "pending"
        },
        {
          id: 2,
          type: "Route Optimization", 
          message: "Reroute express train 12009 via alternate track to avoid congestion",
          impact: "Saves 15 min delay at Allahabad Junction",
          status: "pending"
        }
      ]);
      setAlgorithmRun(true);
      setLastRefresh(new Date());
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    fetchTrains();
  }, [algorithmRun]);

  // Search functionality
  const searchTrains = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSelectedTrain(null);
      return;
    }
    
    const foundTrain = trains.find(train => 
      train.id.toLowerCase().includes(query.toLowerCase()) ||
      train.name.toLowerCase().includes(query.toLowerCase())
    );
    if (foundTrain) {
      setSelectedTrain(foundTrain.id);
    }
  };

  // Get selected train details
  const getSelectedTrainDetails = () => {
    if (!selectedTrain) return null;
    return trains.find(train => train.id === selectedTrain);
  };


  // Mock route data
  const routeLine = [
    [28.6139, 77.2090], // Delhi
    [26.9124, 75.7873], // Jaipur
    [26.2389, 73.0243], // Ajmer
    [25.2048, 75.8648], // Kota
    [22.7196, 75.8577], // Indore
    [19.0760, 72.8777]  // Mumbai
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time": return "bg-success text-success-foreground";
      case "minor-delay": return "bg-warning text-warning-foreground";
      case "major-delay": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on-time": return "On Time";
      case "minor-delay": return "Minor Delay";
      case "major-delay": return "Major Delay";
      default: return "Unknown";
    }
  };

  // Use real data if available, otherwise fallback to empty array
  const displayTrains = trains.length > 0 ? trains : [];

  const filteredTrains = displayTrains.filter(train => {
    if (filterType !== "all" && train.type !== filterType) return false;
    if (filterDelay !== "all") {
      if (filterDelay === "on-time" && train.delay > 0) return false;
      if (filterDelay === "minor" && (train.delay === 0 || train.delay > 30)) return false;
      if (filterDelay === "major" && train.delay <= 30) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Train Dashboard</h1>
          <div className="text-muted-foreground flex items-center space-x-2">
            <div className="live-indicator">Real-time tracking</div>
            <span>Delhi-Mumbai Corridor</span>
            {lastRefresh && (
              <span className="text-xs">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrains}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              error ? 'bg-destructive' : 'bg-success'
            }`}></div>
            <span>{error ? 'Error' : 'Live'}</span>
          </Badge>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Train Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Rajdhani">Rajdhani</SelectItem>
                    <SelectItem value="Shatabdi">Shatabdi</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Passenger">Passenger</SelectItem>
                    <SelectItem value="Freight">Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delay Status</label>
                <Select value={filterDelay} onValueChange={setFilterDelay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Delays</SelectItem>
                    <SelectItem value="on-time">On Time (0 min)</SelectItem>
                    <SelectItem value="minor">Minor (1-30 min)</SelectItem>
                    <SelectItem value="major">Major (30+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search Train</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Train number or name..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => searchTrains(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Train List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Trains ({filteredTrains.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {!algorithmRun ? (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Train className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-muted-foreground">No Train Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Run AI optimization to load live train data
                      </p>
                    </div>
                    <Button onClick={runAlgorithm} disabled={loading} className="mt-4">
                      <Zap className="h-4 w-4 mr-2" />
                      {loading ? 'Running Algorithm...' : 'Run AI Optimization'}
                    </Button>
                  </div>
                </div>
              ) : filteredTrains.map((train) => (
                <div
                  key={train.id}
                  className={`train-card cursor-pointer transition-all ${
                    selectedTrain === train.id ? "ring-2 ring-primary shadow-status" : ""
                  }`}
                  onClick={() => setSelectedTrain(train.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Train className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{train.id}</span>
                    </div>
                    <Badge className={getStatusColor(train.status)}>
                      {getStatusText(train.status)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{train.name}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{train.currentStation}</span>
                    </span>
                    {train.delay > 0 && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>+{train.delay}m</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <div className="h-full rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Map className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Interactive Railway Map</h3>
                    <p className="text-sm text-muted-foreground">
                      Delhi-Mumbai Corridor Live Tracking
                    </p>
                    <div className="mt-4 space-y-2">
                      {filteredTrains.map((train) => (
                        <div key={train.id} className="flex items-center justify-between text-xs bg-background/80 rounded px-3 py-2">
                          <span className="flex items-center space-x-2">
                            <Train className="h-3 w-3" />
                            <span>{train.id}</span>
                          </span>
                          <Badge className={getStatusColor(train.status)}>
                            {train.currentStation}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Train Details & AI Recommendations */}
        <div className="space-y-4">
          {selectedTrain ? (
            <>
              {/* Selected Train Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Train Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const train = trains.find(t => t.id === selectedTrain);
                    if (!train) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{train.name}</h3>
                          <p className="text-sm text-muted-foreground">Train #{train.id} • {train.type}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Priority:</span>
                            <Badge variant="secondary">{train.priority}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Station:</span>
                            <span className="text-sm font-medium">{train.currentStation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Next Station:</span>
                            <span className="text-sm font-medium">{train.nextStation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Delay:</span>
                            <span className={`text-sm font-medium ${train.delay > 0 ? 'text-destructive' : 'text-success'}`}>
                              {train.delay > 0 ? `+${train.delay} min` : 'On time'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Schedule</h4>
                          <div className="space-y-1">
                            {train.schedule.map((stop, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span>{stop.station}</span>
                                <div className="flex space-x-2">
                                  <span className="text-muted-foreground">{stop.scheduled}</span>
                                  <span className={stop.actual !== stop.scheduled ? 'text-destructive' : 'text-success'}>
                                    {stop.actual}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Train className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a train to view details</p>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                <span>AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-warning-muted border border-warning/20">
                  <p className="text-sm font-medium text-warning-foreground mb-2">
                    Priority Adjustment
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Hold freight train 22951 at Kota for 10 min to let Rajdhani pass → reduces total system delay by 25 min.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default" className="bg-success hover:bg-success/90">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-info-muted border border-info/20">
                  <p className="text-sm font-medium text-info-foreground mb-2">
                    Route Optimization
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Reroute express train 12009 via alternate track to avoid congestion at Allahabad Junction.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="default" className="bg-success hover:bg-success/90">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;