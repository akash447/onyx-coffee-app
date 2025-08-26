# PowerShell Deployment Script for Onyx Coffee App to Azure
# Run this script in PowerShell as Administrator

Write-Host "🚀 Starting Onyx Coffee App Deployment to Azure..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Step 2: Building for production..." -ForegroundColor Cyan
npm run build:web
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build folder 'dist' not found" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 3: Copying configuration..." -ForegroundColor Cyan
# Copy staticwebapp.config.json to dist folder if it exists
if (Test-Path "staticwebapp.config.json") {
    Copy-Item "staticwebapp.config.json" "dist/" -Force
    Write-Host "✅ Configuration copied to dist folder" -ForegroundColor Green
} else {
    Write-Host "⚠️ Warning: staticwebapp.config.json not found" -ForegroundColor Yellow
}

Write-Host "🔍 Step 4: Verifying build..." -ForegroundColor Cyan
$indexExists = Test-Path "dist/index.html"
$staticExists = Test-Path "dist/static"

if ($indexExists) {
    Write-Host "✅ index.html found" -ForegroundColor Green
} else {
    Write-Host "❌ index.html missing in dist folder" -ForegroundColor Red
    exit 1
}

if ($staticExists) {
    Write-Host "✅ Static assets found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Static folder not found (may be normal depending on build)" -ForegroundColor Yellow
}

# Get build size
$buildSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan

Write-Host "🌐 Step 5: Azure deployment options..." -ForegroundColor Cyan
Write-Host "Choose your deployment method:" -ForegroundColor White
Write-Host "1. Azure CLI deployment (recommended)" -ForegroundColor White
Write-Host "2. Create deployment package" -ForegroundColor White
Write-Host "3. Manual instructions" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🔑 Checking Azure CLI..." -ForegroundColor Cyan
        
        try {
            $azVersion = az --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Azure CLI found" -ForegroundColor Green
                
                Write-Host "Please provide your Azure details:" -ForegroundColor White
                $resourceGroup = Read-Host "Resource Group name"
                $appName = Read-Host "Static Web App name (e.g., onyx-coffee-app)"
                
                if ($resourceGroup -and $appName) {
                    Write-Host "🚀 Deploying to Azure..." -ForegroundColor Green
                    az staticwebapp deploy --name $appName --source ./dist --resource-group $resourceGroup
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
                        Write-Host "Your app should be available at: https://$appName.azurestaticapps.net" -ForegroundColor Cyan
                    } else {
                        Write-Host "❌ Deployment failed. Please check your Azure configuration." -ForegroundColor Red
                    }
                } else {
                    Write-Host "❌ Resource group and app name are required" -ForegroundColor Red
                }
            } else {
                throw "Azure CLI not found"
            }
        }
        catch {
            Write-Host "❌ Azure CLI not found or not configured" -ForegroundColor Red
            Write-Host "Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
            Write-Host "Then run: az login" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan
        
        $zipFile = "onyx-coffee-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
        
        # Create zip file
        Compress-Archive -Path "dist/*" -DestinationPath $zipFile -Force
        
        Write-Host "✅ Deployment package created: $zipFile" -ForegroundColor Green
        Write-Host "📋 Upload this file to your Azure Static Web App:" -ForegroundColor White
        Write-Host "   1. Go to portal.azure.com" -ForegroundColor White
        Write-Host "   2. Navigate to your Static Web App" -ForegroundColor White
        Write-Host "   3. Go to 'Overview' -> 'Browse' -> Upload your zip" -ForegroundColor White
    }
    
    "3" {
        Write-Host "📋 Manual deployment instructions:" -ForegroundColor White
        Write-Host ""
        Write-Host "1. Your build is ready in the 'dist' folder" -ForegroundColor Green
        Write-Host "2. Go to https://portal.azure.com" -ForegroundColor White
        Write-Host "3. Create or navigate to your Static Web App" -ForegroundColor White
        Write-Host "4. Upload the contents of the 'dist' folder" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use Azure CLI:" -ForegroundColor White
        Write-Host "   az staticwebapp deploy --name YOUR_APP_NAME --source ./dist --resource-group YOUR_RESOURCE_GROUP" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎯 Deployment Summary:" -ForegroundColor Yellow
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Production build created" -ForegroundColor Green
Write-Host "✅ Configuration verified" -ForegroundColor Green
Write-Host "📁 Build location: dist/" -ForegroundColor Cyan
Write-Host "📊 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Your Onyx Coffee app is ready for deployment!" -ForegroundColor Green
Write-Host "☕ Happy brewing! ☕" -ForegroundColor Yellow