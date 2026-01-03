# Start ngrok in background (hidden window)
# This script runs ngrok for PlayFit application

$ngrokPath = "C:\Users\gayan\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"


# Check if ngrok is already running
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue

if ($ngrokProcess) {
    Write-Host "ngrok is already running (PID: $($ngrokProcess.Id))"
} else {
    Write-Host "Starting ngrok tunnel on port 80 (PlayFit proxy)..."
    Start-Process -FilePath $ngrokPath -ArgumentList "http", "80" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "ngrok started! Check dashboard at http://localhost:4040"
}
