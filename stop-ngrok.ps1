# Stop ngrok process

$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue

if ($ngrokProcess) {
    Write-Host "Stopping ngrok (PID: $($ngrokProcess.Id))..."
    Stop-Process -Name "ngrok" -Force
    Write-Host "ngrok stopped successfully!"
} else {
    Write-Host "ngrok is not running."
}
