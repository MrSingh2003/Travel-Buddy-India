$ErrorActionPreference = "Stop"

Write-Host "Checking prerequisites..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot/check-prereqs.ps1"

Write-Host ""
Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\..\backend`"; mvn spring-boot:run"

Write-Host "Starting React frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot\..`"; npm install; npm run dev"

Write-Host ""
Write-Host "If MySQL is not already running, start it separately or use Docker Compose." -ForegroundColor Yellow
