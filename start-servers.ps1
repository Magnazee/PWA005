# This script starts both the dev server and API proxy server for local development.
# Each server runs in its own window for easy monitoring and manual closing.
# Usage: Run this script from any location - it uses relative paths from the script location.

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start proxy server for Claude API
Start-Process powershell -ArgumentList "-NoProfile -Command npm start" -WorkingDirectory "$scriptPath\server" -WindowStyle Normal

# Wait a moment to let the proxy server initialize
Start-Sleep -Seconds 2

# Start Vite dev server
Start-Process powershell -ArgumentList "-NoProfile -Command npm run dev" -WorkingDirectory "$scriptPath" -WindowStyle Normal

Write-Host "Servers started. Close the PowerShell windows manually when done."