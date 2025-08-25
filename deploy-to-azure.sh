#!/bin/bash

# Onyx Coffee - Azure Deployment Script
# Run this script in Terminal/Bash

echo "🚀 Onyx Coffee - Azure Deployment Script"
echo "=========================================="

# Check if Azure CLI is installed
echo -e "\n1. Checking Azure CLI installation..."
if command -v az &> /dev/null; then
    echo "✅ Azure CLI is installed"
else
    echo "❌ Azure CLI not found. Installing..."
    echo "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    echo "For macOS: brew install azure-cli"
    echo "For Ubuntu: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    read -p "Press Enter after installing Azure CLI..."
fi

# Login to Azure
echo -e "\n2. Logging into Azure..."
az login

# Set variables
RESOURCE_GROUP="onyx-coffee-production"
WEB_APP_NAME="onyx-coffee-webapp"
LOCATION="eastus"

# Create resource group
echo -e "\n3. Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create static web app
echo -e "\n4. Creating Azure Static Web App..."
az staticwebapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy the application
echo -e "\n5. Deploying application..."
if [ -d "./dist" ]; then
    az staticwebapp deploy \
      --name $WEB_APP_NAME \
      --resource-group $RESOURCE_GROUP \
      --source ./dist
    
    echo "✅ Deployment completed successfully!"
    echo -e "\nYour application is available at:"
    URL=$(az staticwebapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv)
    echo "🌐 https://$URL"
    
    # Try to open the website
    if command -v open &> /dev/null; then
        open "https://$URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://$URL"
    else
        echo "Please open the URL manually in your browser"
    fi
else
    echo "❌ Build files not found. Please run 'npm run build:web' first"
fi

echo -e "\n🎉 Deployment script completed!"
read -p "Press Enter to exit..."