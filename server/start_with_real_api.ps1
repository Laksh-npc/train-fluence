# PowerShell script to start server with real RailRadar API
Write-Host "🚀 Starting server with real RailRadar API..." -ForegroundColor Green

# Set environment variables
$env:RAILRADAR_USE_API="true"
$env:RAILRADAR_API_KEY="rr_live_68mRpdUOSNYawkrOPF_rBQhkdTQXu5X5"
$env:RAILRADAR_FROM="NDLS"
$env:RAILRADAR_TO="MMCT"
$env:RAILRADAR_DATE="2025-09-19"

Write-Host "✅ Environment variables set:" -ForegroundColor Yellow
Write-Host "   RAILRADAR_USE_API: $env:RAILRADAR_USE_API"
Write-Host "   RAILRADAR_API_KEY: $env:RAILRADAR_API_KEY"
Write-Host "   RAILRADAR_FROM: $env:RAILRADAR_FROM"
Write-Host "   RAILRADAR_TO: $env:RAILRADAR_TO"
Write-Host "   RAILRADAR_DATE: $env:RAILRADAR_DATE"

Write-Host "🔄 Starting server..." -ForegroundColor Blue
npm run dev
