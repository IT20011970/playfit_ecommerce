[CmdletBinding()]
param(
  [string]$ResourceGroup = "playfit-rg",
  [string]$Plan = "playfit-plan",
  [string]$Location = "westeurope",
  [string]$Sku = "B1",
  [string[]]$Only = @(),
  [switch]$CreateIfMissing,
  [switch]$SkipBuild,
  [switch]$TailLogs
)

# --- Helpers ---
function Require-AzCli {
  if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    throw "Azure CLI ('az') is not installed or not in PATH. Install: https://aka.ms/azure-cli"
  }
}

function Exec($args, $errMsg) {
  Write-Host ("→ " + ($args -join ' ')) -ForegroundColor Cyan
  $output = & az @args
  if ($LASTEXITCODE -ne 0) {
    throw $errMsg
  }
  return $output
}

function Ensure-Plan($rg, $plan, $location, $sku) {
  $planShow = az appservice plan show -g $rg -n $plan 2>$null | Out-String
  if (-not $planShow) {
    Write-Host "Creating App Service plan '$plan' in '$location' (Linux, $sku)..." -ForegroundColor Yellow
    Exec @("appservice","plan","create","-g",$rg,"-n",$plan,"--location",$location,"--sku",$sku,"--is-linux") "Failed to create plan"
  } else {
    Write-Host "Plan '$plan' exists." -ForegroundColor Green
  }
}

function Ensure-App($rg, $plan, $app, $location) {
  $appShow = az webapp show -g $rg -n $app 2>$null | Out-String
  if (-not $appShow) {
    Write-Host "Creating Web App '$app'..." -ForegroundColor Yellow
    Exec @("webapp","create","-g",$rg,"-p",$plan,"-n",$app,"-i","") "Failed to create webapp"
    # Switch runtime to Node 20
    Exec @("webapp","create","--resource-group",$rg,"--plan",$plan,"--name",$app,"--runtime","NODE:20-lts") "Failed to set runtime"
  } else {
    Write-Host "Web App '$app' exists." -ForegroundColor Green
  }
}

function Build-And-Zip($servicePath, $zipOutPath) {
  Push-Location $servicePath
  try {
    if (-not $SkipBuild) {
      if (Test-Path package-lock.json) { npm ci } else { npm install }
      if (Test-Path "package.json") { npm run build }
    }
    $temp = Join-Path ([System.IO.Path]::GetTempPath()) ("deploy_" + [System.Guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Path $temp | Out-Null

    # Include built output and minimal files for Oryx to install runtime deps
    Copy-Item -Recurse -Force dist $temp 2>$null
    Copy-Item package.json $temp
    if (Test-Path package-lock.json) { Copy-Item package-lock.json $temp }
    if (Test-Path schema.gql) { Copy-Item schema.gql $temp }

    if (Test-Path $zipOutPath) { Remove-Item $zipOutPath -Force }
    Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $zipOutPath
    Remove-Item -Recurse -Force $temp
  }
  finally {
    Pop-Location
  }
}

function Deploy-Zip($rg, $app, $zipPath) {
  Exec @("webapp","deploy","-g",$rg,"-n",$app,"--type","zip","--src-path",$zipPath) "Zip deploy failed for $app"
}

function Set-Common-Settings($rg, $app) {
  Exec @("webapp","config","appsettings","set","-g",$rg,"-n",$app,"--settings","PORT=8080","WEBSITES_PORT=8080","NODE_ENV=production") "Failed to set app settings for $app"
  Exec @("webapp","config","set","-g",$rg,"-n",$app,"--startup-file","node dist/main.js") "Failed to set startup file for $app"
}

function Restart-App($rg, $app) {
  Exec @("webapp","restart","-g",$rg,"-n",$app) "Failed to restart $app"
}

Require-AzCli

$services = @(
  @{ app = "playfit-user-service"; name = "user"; path = "backend/login-sdk" },
  @{ app = "playfit-cart-service"; name = "cart"; path = "backend/cart_service" },
  @{ app = "playfit-order-service"; name = "order"; path = "backend/order_service" },
  @{ app = "playfit-inventory-service"; name = "inventory"; path = "backend/inventory_service" },
  @{ app = "playfit-gateway";     name = "gateway"; path = "backend/federation_gateway" }
)

if ($Only.Count -gt 0) {
  $services = $services | Where-Object { $Only -contains $_.name -or $Only -contains $_.app }
}

if ($services.Count -eq 0) {
  throw "No services to deploy. Use -Only user,cart,gateway or ensure names match."
}

Write-Host "Deploying services: " ($services | ForEach-Object { $_.name } -join ', ') -ForegroundColor Magenta

Ensure-Plan -rg $ResourceGroup -plan $Plan -location $Location -sku $Sku

foreach ($svc in $services) {
  $appName = $svc.app
  $svcPath = $svc.path
  Write-Host "\n=== $($svc.name.ToUpper()) → $appName ===" -ForegroundColor Yellow

  if ($CreateIfMissing) {
    Ensure-App -rg $ResourceGroup -plan $Plan -app $appName -location $Location
  }

  $zipPath = Join-Path $PWD ("$($svc.name)-deploy.zip")
  Build-And-Zip -servicePath $svcPath -zipOutPath $zipPath
  Set-Common-Settings -rg $ResourceGroup -app $appName
  Deploy-Zip -rg $ResourceGroup -app $appName -zipPath $zipPath
  Restart-App -rg $ResourceGroup -app $appName

  if ($TailLogs) {
    Write-Host "Tailing logs for $appName (Ctrl+C to stop)..." -ForegroundColor Gray
    az webapp log tail -g $ResourceGroup -n $appName --provider application
  }
}

Write-Host "\nAll done. Test endpoints:" -ForegroundColor Green
Write-Host "  User:    https://playfit-user-service.azurewebsites.net/graphql"
Write-Host "  Cart:    https://playfit-cart-service.azurewebsites.net/graphql"
Write-Host "  Order:   https://playfit-order-service.azurewebsites.net/graphql"
Write-Host "  Inventory: https://playfit-inventory-service.azurewebsites.net/graphql"
Write-Host "  Gateway: https://playfit-gateway.azurewebsites.net/graphql"
