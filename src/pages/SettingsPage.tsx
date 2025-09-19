import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  Bell, 
  Wifi, 
  Shield, 
  Key, 
  Database,
  RefreshCw,
  Save,
  UserPlus
} from "lucide-react";

const SettingsPage = () => {
  const users = [
    { id: 1, name: "Rajesh Kumar", email: "rajesh@railways.gov.in", role: "Controller", status: "Active" },
    { id: 2, name: "Priya Sharma", email: "priya@railways.gov.in", role: "Observer", status: "Active" },
    { id: 3, name: "Amit Singh", email: "amit@railways.gov.in", role: "Controller", status: "Inactive" },
    { id: 4, name: "Sunita Verma", email: "sunita@railways.gov.in", role: "Admin", status: "Active" },
  ];

  const apiConnections = [
    { name: "RailRadar API", status: "Connected", lastSync: "2 minutes ago", health: "good" },
    { name: "Weather Service", status: "Connected", lastSync: "5 minutes ago", health: "good" },
    { name: "Traffic Management", status: "Disconnected", lastSync: "2 hours ago", health: "poor" },
    { name: "Emergency Services", status: "Connected", lastSync: "1 minute ago", health: "good" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
      case "Connected":
        return "bg-success text-success-foreground";
      case "Inactive":
      case "Disconnected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "good":
        return "bg-success";
      case "poor":
        return "bg-destructive";
      default:
        return "bg-warning";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and user access</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </div>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Data Refresh Interval</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Alert Threshold (minutes)</Label>
                <Input 
                  id="alert-threshold"
                  type="number" 
                  defaultValue="15"
                  placeholder="Enter delay threshold for alerts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-trains">Max Trains Display</Label>
                <Input 
                  id="max-trains"
                  type="number" 
                  defaultValue="100"
                  placeholder="Maximum trains to display"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh data at set intervals
                  </p>
                </div>
                <Switch id="auto-refresh" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound-alerts">Sound Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sound for critical alerts
                  </p>
                </div>
                <Switch id="sound-alerts" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="railradar-api">RailRadar API Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="railradar-api"
                    type="password"
                    placeholder="Enter API key..."
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline">Test</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather-api">Weather Service API</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="weather-api"
                    type="password"
                    placeholder="Enter API key..."
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline">Test</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-endpoint">Backup Data Endpoint</Label>
                <Input 
                  id="backup-endpoint"
                  placeholder="https://backup.railways.gov.in/api"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiConnections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getHealthColor(connection.health)}`} />
                    <div>
                      <p className="font-medium text-sm">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {connection.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(connection.status)}>
                      {connection.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Delay Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Minor delays (15+ min)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Major delays (30+ min)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical delays (60+ min)</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">System Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API connection issues</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data sync failures</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Performance degradation</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">AI Recommendations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Route optimizations</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority adjustments</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preventive measures</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;