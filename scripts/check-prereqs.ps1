$ErrorActionPreference = "Stop"

function Test-Tool {
  param(
    [string]$Name
  )

  $tool = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $tool) {
    Write-Host "[missing] $Name" -ForegroundColor Yellow
    return $false
  }

  Write-Host "[ok] $Name -> $($tool.Source)" -ForegroundColor Green
  return $true
}

$javaOk = Test-Tool "java"
$mvnOk = Test-Tool "mvn"
$nodeOk = Test-Tool "node"
$npmOk = Test-Tool "npm"
$mysqlOk = Test-Tool "mysql"
$dockerOk = Test-Tool "docker"

if ($javaOk) {
  Write-Host ""
  java -version
}

Write-Host ""
if (-not $javaOk -or -not $mvnOk -or -not $nodeOk -or -not $npmOk) {
  Write-Host "Local prerequisites are incomplete. Install Java 17+, Maven 3.9+, Node.js 20+, and npm." -ForegroundColor Yellow
} else {
  Write-Host "Core local prerequisites look available." -ForegroundColor Green
}

if (-not $mysqlOk -and -not $dockerOk) {
  Write-Host "You also need either MySQL client/server or Docker Desktop." -ForegroundColor Yellow
}
