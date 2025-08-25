# Onyx Coffee - Azure Deployment Script
# Run this script in PowerShell as Administrator

Write-Host "🚀 Onyx Coffee - Azure Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Azure CLI is installed
Write-Host "`n1. Checking Azure CLI installation..." -ForegroundColor Yellow
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows" -ForegroundColor Yellow
    Start-Process "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows"
    Read-Host "Press Enter after installing Azure CLI"
}

# Login to Azure
Write-Host "`n2. Logging into Azure..." -ForegroundColor Yellow
az login

# Set variables
$resourceGroup = "onyx-coffee-production"
$webAppName = "onyx-coffee-webapp"
$location = "eastus"

# Create resource group
Write-Host "`n3. Creating resource group..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location

# Create static web app
Write-Host "`n4. Creating Azure Static Web App..." -ForegroundColor Yellow
az staticwebapp create `
  --name $webAppName `
  --resource-group $resourceGroup `
  --location $location

# Deploy the application
Write-Host "`n5. Deploying application..." -ForegroundColor Yellow
if (Test-Path "./dist") {
    az staticwebapp deploy `
      --name $webAppName `
      --resource-group $resourceGroup `
      --source ./dist
    
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "`nYour application is available at:" -ForegroundColor Cyan
    $url = az staticwebapp show --name $webAppName --resource-group $resourceGroup --query "defaultHostname" -o tsv
    Write-Host "🌐 https://$url" -ForegroundColor Blue
    
    # Open the website
    Start-Process "https://$url"
} else {
    Write-Host "❌ Build files not found. Please run 'npm run build:web' first" -ForegroundColor Red
}

Write-Host "`n🎉 Deployment script completed!" -ForegroundColor Cyan
Read-Host "Press Enter to exit"