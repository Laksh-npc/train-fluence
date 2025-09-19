import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Train, Clock, AlertTriangle, Search, Filter, Zap } from "lucide-react";

// Mock train data for Delhi-Mumbai corridor
const mockTrains = [
  {
    id: "12951",
    name: "Rajdhani Express",
    type: "Express",
    priority: "High",
    currentStation: "New Delhi",
    nextStation: "Gurgaon",
    delay: 0,
    position: { lat: 28.6139, lng: 77.2090 },
    eta: "14:30",
    speed: 95
  },
  {
    id: "12009",
    name: "Shatabdi Express",
    type: "Express",
    priority: "High",
    currentStation: "Mathura Jn",
    nextStation: "Agra Cantt",
    delay: 8,
    position: { lat: 27.4924, lng: 77.6737 },
    eta: "15:45",
    speed: 110
  },
  {
    id: "22691",
    name: "Mumbai Rajdhani",
    type: "Express",
    priority: "High",
    currentStation: "Kota Jn",
    nextStation: "Chittorgarh",
    delay: 22,
    position: { lat: 25.2138, lng: 75.8648 },
    eta: "18:20",
    speed: 85
  },
  {
    id: "19015",
    name: "Saurashtra Express",
    type: "Express",
    priority: "Medium",
    currentStation: "Vadodara Jn",
    nextStation: "Bharuch Jn",
    delay: 5,
    position: { lat: 22.3072, lng: 73.1812 },
    eta: "19:15",
    speed: 95
  },
  {
    id: "82901",
    name: "Gujarat Mail",
    type: "Mail",
    priority: "Medium",
    currentStation: "Surat",
    nextStation: "Vasai Road",
    delay: 35,
    position: { lat: 21.1702, lng: 72.8311 },
    eta: "21:45",
    speed: 75
  }
];

const congestedSections = [
  { from: "Kota Jn", to: "Chittorgarh", severity: "high", trains: 3 },
  { from: "Surat", to: "Mumbai Central", severity: "medium", trains: 5 }
];

const MapPage = () => {
  const [selectedTrain, setSelectedTrain] = useState<typeof mockTrains[0] | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDelay, setFilterDelay] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getTrainStatusColor = (delay: number) => {
    if (delay === 0) return "success";
    if (delay < 15) return "warning";
    return "destructive";
  };

  const getTrainStatusText = (delay: number) => {
    if (delay === 0) return "On Time";
    if (delay < 15) return "Minor Delay";
    return "Major Delay";
  };

  const filteredTrains = mockTrains.filter(train => {
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.id.includes(searchTerm);
    const matchesType = filterType === "all" || train.type === filterType;
    const matchesDelay = filterDelay === "all" || 
                        (filterDelay === "ontime" && train.delay === 0) ||
                        (filterDelay === "minor" && train.delay > 0 && train.delay < 15) ||
                        (filterDelay === "major" && train.delay >= 15);
    
    return matchesSearch && matchesType && matchesDelay;
  });

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Filters */}
      <div className="w-80 border-r bg-card/50 p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </h2>
          
          {/* Search */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Search Trains</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Train name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Train Type Filter */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Train Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Mail">Mail</SelectItem>
                <SelectItem value="Passenger">Passenger</SelectItem>
                <SelectItem value="Freight">Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delay Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delay Status</label>
            <Select value={filterDelay} onValueChange={setFilterDelay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delays</SelectItem>
                <SelectItem value="ontime">On Time</SelectItem>
                <SelectItem value="minor">Minor Delay (&lt;15 min)</SelectItem>
                <SelectItem value="major">Major Delay (≥15 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Train List */}
        <div className="space-y-3">
          <h3 className="font-medium">Active Trains ({filteredTrains.length})</h3>
          {filteredTrains.map((train) => (
            <Card 
              key={train.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTrain?.id === train.id ? 'ring-2 ring-primary shadow-status' : ''
              }`}
              onClick={() => setSelectedTrain(train)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Train className="h-4 w-4" />
                    <span className="font-medium text-sm">{train.id}</span>
                  </div>
                  <Badge variant={getTrainStatusColor(train.delay) as any}>
                    {train.delay > 0 ? `+${train.delay}m` : 'On Time'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>{train.name}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{train.currentStation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Congested Sections Alert */}
        <Card className="border-warning bg-warning-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span>Congested Sections</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {congestedSections.map((section, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">{section.from} → {section.to}</div>
                <div className="text-muted-foreground">
                  {section.trains} trains affected
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Map Container */}
        <div className="h-full bg-muted/30 relative overflow-hidden">
          {/* Map Header */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <Card className="px-4 py-2">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>On Time ({mockTrains.filter(t => t.delay === 0).length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>Minor Delay ({mockTrains.filter(t => t.delay > 0 && t.delay < 15).length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span>Major Delay ({mockTrains.filter(t => t.delay >= 15).length})</span>
                </div>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="live-indicator text-success-foreground">LIVE</div>
                <span>Delhi-Mumbai Corridor</span>
              </div>
            </Card>
          </div>

          {/* Simulated Map Interface */}
          <div className="absolute inset-4 top-16 bg-gradient-to-br from-background to-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-xl font-semibold">Interactive Map</h3>
                <p className="text-muted-foreground">
                  Delhi-Mumbai Railway Corridor
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Map integration ready for Leaflet/MapBox implementation
                </p>
              </div>
              
              {/* Simulated train markers */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {filteredTrains.slice(0, 4).map((train) => (
                  <div 
                    key={train.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      getTrainStatusColor(train.delay) === 'success' ? 'border-success bg-success-muted' :
                      getTrainStatusColor(train.delay) === 'warning' ? 'border-warning bg-warning-muted' :
                      'border-destructive bg-destructive-muted'
                    }`}
                    onClick={() => setSelectedTrain(train)}
                  >
                    <div className="text-xs font-medium">{train.id}</div>
                    <div className="text-xs text-muted-foreground">{train.currentStation}</div>
                    <div className="text-xs">
                      {train.delay > 0 ? `+${train.delay}m` : 'On Time'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
            <Button size="sm" variant="outline">+</Button>
            <Button size="sm" variant="outline">-</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Train Details */}
      <div className="w-80 border-l bg-card/50 p-4 space-y-4 overflow-y-auto">
        {selectedTrain ? (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-4">Train Details</h2>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{selectedTrain.name}</CardTitle>
                    <Badge variant={getTrainStatusColor(selectedTrain.delay) as any}>
                      {getTrainStatusText(selectedTrain.delay)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Train {selectedTrain.id} • {selectedTrain.type} • Priority: {selectedTrain.priority}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Station</div>
                      <div className="font-medium">{selectedTrain.currentStation}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Next Station</div>
                      <div className="font-medium">{selectedTrain.nextStation}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">ETA</div>
                      <div className="font-medium flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{selectedTrain.eta}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Speed</div>
                      <div className="font-medium">{selectedTrain.speed} km/h</div>
                    </div>
                  </div>
                  
                  {selectedTrain.delay > 0 && (
                    <div className="p-3 rounded-lg bg-warning-muted border border-warning">
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium">Delayed by {selectedTrain.delay} minutes</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Priority Override
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Adjustment
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Timetable Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Upcoming Stations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border">
                    <span>{selectedTrain.nextStation}</span>
                    <span className="text-muted-foreground">{selectedTrain.eta}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span>Ajmer Jn</span>
                    <span className="text-muted-foreground">19:45</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Mumbai Central</span>
                    <span className="text-muted-foreground">23:30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <Train className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Select a train from the map or list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;