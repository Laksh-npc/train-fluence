import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Play, Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UploadPage = () => {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadStatus("uploading");
      
      // Simulate upload
      setTimeout(() => {
        setUploadStatus("success");
      }, 2000);
    }
  };

  const mockTableData = [
    { trainId: "12951", departure: "16:55", arrival: "06:35", route: "DEL-BOM", priority: "High" },
    { trainId: "12009", departure: "06:00", arrival: "22:30", route: "DEL-BOM", priority: "Medium" },
    { trainId: "22691", departure: "17:05", arrival: "09:45", route: "BOM-DEL", priority: "High" },
    { trainId: "12903", departure: "22:20", arrival: "05:55", route: "DEL-BOM", priority: "Medium" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
          <p className="text-muted-foreground">Upload timetables and manage operational data</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Timetable Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Upload CSV or Excel file</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your timetable file here, or click to browse
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
                
                {uploadStatus === "success" && fileName && (
                  <div className="flex items-center justify-center space-x-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Successfully uploaded: {fileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Guidelines */}
            <div className="space-y-3">
              <h4 className="font-medium">File Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV or Excel format (.csv, .xlsx, .xls)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Required columns: Train ID, Departure, Arrival, Route</li>
                <li>• Optional: Priority, Train Type, Platform</li>
              </ul>
            </div>

            {/* Sample Data Format */}
            <div className="space-y-2">
              <h4 className="font-medium">Sample Format:</h4>
              <div className="bg-muted p-3 rounded-lg text-xs font-mono">
                <div>Train ID, Departure, Arrival, Route, Priority</div>
                <div>12951, 16:55, 06:35, DEL-BOM, High</div>
                <div>12009, 06:00, 22:30, DEL-BOM, Medium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optimization-mode">Optimization Mode</Label>
                <select 
                  id="optimization-mode"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="minimize-delay">Minimize Total Delay</option>
                  <option value="maximize-throughput">Maximize Throughput</option>
                  <option value="prioritize-express">Prioritize Express Trains</option>
                  <option value="balanced">Balanced Approach</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delay-threshold">Delay Threshold (minutes)</Label>
                <Input 
                  id="delay-threshold"
                  type="number" 
                  defaultValue="15"
                  placeholder="Enter delay threshold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority-weights">Priority Weights</Label>
                <Textarea 
                  id="priority-weights"
                  placeholder="High: 1.0, Medium: 0.7, Low: 0.4"
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints">Additional Constraints</Label>
                <Textarea 
                  id="constraints"
                  placeholder="Enter any additional constraints or notes..."
                  className="h-24"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button className="flex-1" disabled={uploadStatus !== "success"}>
                <Play className="h-4 w-4 mr-2" />
                Run Optimization
              </Button>
              <Button variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      {uploadStatus === "success" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Data Preview</span>
              <Badge variant="secondary">4 records</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Train ID</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Route</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTableData.map((row, index) => (
                    <tr key={index}>
                      <td className="font-medium">{row.trainId}</td>
                      <td>{row.departure}</td>
                      <td>{row.arrival}</td>
                      <td>{row.route}</td>
                      <td>
                        <Badge 
                          variant={row.priority === "High" ? "default" : "secondary"}
                          className={row.priority === "High" ? "bg-primary" : ""}
                        >
                          {row.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Valid
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                All records validated successfully. Ready for optimization.
              </p>
              <Button>
                Process Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;