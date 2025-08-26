#!/bin/bash

# Bash Deployment Script for Onyx Coffee App to Azure
# Run this script from the project root directory

echo "🚀 Starting Onyx Coffee App Deployment to Azure..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

echo -e "${CYAN}📦 Step 1: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${CYAN}🏗️ Step 2: Building for production...${NC}"
npm run build:web
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build folder 'dist' not found${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Step 3: Copying configuration...${NC}"
# Copy staticwebapp.config.json to dist folder if it exists
if [ -f "staticwebapp.config.json" ]; then
    cp staticwebapp.config.json dist/
    echo -e "${GREEN}✅ Configuration copied to dist folder${NC}"
else
    echo -e "${YELLOW}⚠️ Warning: staticwebapp.config.json not found${NC}"
fi

echo -e "${CYAN}🔍 Step 4: Verifying build...${NC}"
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ index.html found${NC}"
else
    echo -e "${RED}❌ index.html missing in dist folder${NC}"
    exit 1
fi

if [ -d "dist/static" ]; then
    echo -e "${GREEN}✅ Static assets found${NC}"
else
    echo -e "${YELLOW}⚠️ Static folder not found (may be normal depending on build)${NC}"
fi

# Get build size
BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${CYAN}📊 Build size: ${BUILD_SIZE}${NC}"

echo -e "${CYAN}🌐 Step 5: Azure deployment options...${NC}"
echo -e "${WHITE}Choose your deployment method:${NC}"
echo -e "${WHITE}1. Azure CLI deployment (recommended)${NC}"
echo -e "${WHITE}2. Create deployment package${NC}"
echo -e "${WHITE}3. Manual instructions${NC}"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${CYAN}🔑 Checking Azure CLI...${NC}"
        
        if command -v az &> /dev/null; then
            echo -e "${GREEN}✅ Azure CLI found${NC}"
            
            echo -e "${WHITE}Please provide your Azure details:${NC}"
            read -p "Resource Group name: " resource_group
            read -p "Static Web App name (e.g., onyx-coffee-app): " app_name
            
            if [ -n "$resource_group" ] && [ -n "$app_name" ]; then
                echo -e "${GREEN}🚀 Deploying to Azure...${NC}"
                az staticwebapp deploy --name "$app_name" --source ./dist --resource-group "$resource_group"
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}🎉 Deployment successful!${NC}"
                    echo -e "${CYAN}Your app should be available at: https://${app_name}.azurestaticapps.net${NC}"
                else
                    echo -e "${RED}❌ Deployment failed. Please check your Azure configuration.${NC}"
                fi
            else
                echo -e "${RED}❌ Resource group and app name are required${NC}"
            fi
        else
            echo -e "${RED}❌ Azure CLI not found or not configured${NC}"
            echo -e "${YELLOW}Please install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
            echo -e "${YELLOW}Then run: az login${NC}"
        fi
        ;;
        
    2)
        echo -e "${CYAN}📦 Creating deployment package...${NC}"
        
        ZIP_FILE="onyx-coffee-deployment-$(date +%Y%m%d-%H%M%S).zip"
        
        # Create zip file
        cd dist && zip -r "../$ZIP_FILE" . && cd ..
        
        echo -e "${GREEN}✅ Deployment package created: $ZIP_FILE${NC}"
        echo -e "${WHITE}📋 Upload this file to your Azure Static Web App:${NC}"
        echo -e "${WHITE}   1. Go to portal.azure.com${NC}"
        echo -e "${WHITE}   2. Navigate to your Static Web App${NC}"
        echo -e "${WHITE}   3. Go to 'Overview' -> 'Browse' -> Upload your zip${NC}"
        ;;
        
    3)
        echo -e "${WHITE}📋 Manual deployment instructions:${NC}"
        echo ""
        echo -e "${GREEN}1. Your build is ready in the 'dist' folder${NC}"
        echo -e "${WHITE}2. Go to https://portal.azure.com${NC}"
        echo -e "${WHITE}3. Create or navigate to your Static Web App${NC}"
        echo -e "${WHITE}4. Upload the contents of the 'dist' folder${NC}"
        echo ""
        echo -e "${WHITE}Or use Azure CLI:${NC}"
        echo -e "${CYAN}   az staticwebapp deploy --name YOUR_APP_NAME --source ./dist --resource-group YOUR_RESOURCE_GROUP${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}🎯 Deployment Summary:${NC}"
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo -e "${GREEN}✅ Production build created${NC}"
echo -e "${GREEN}✅ Configuration verified${NC}"
echo -e "${CYAN}📁 Build location: dist/${NC}"
echo -e "${CYAN}📊 Build size: ${BUILD_SIZE}${NC}"
echo ""
echo -e "${GREEN}🚀 Your Onyx Coffee app is ready for deployment!${NC}"
echo -e "${YELLOW}☕ Happy brewing! ☕${NC}"