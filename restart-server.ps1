# Kill any process using port 5000
Write-Host "🔍 Finding and killing process on port 5000..." -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processIds) {
        Write-Host "   Killing process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Killed all processes on port 5000" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   No process found on port 5000" -ForegroundColor Gray
}

# Start the backend server
Write-Host "" -ForegroundColor White
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
npm start

