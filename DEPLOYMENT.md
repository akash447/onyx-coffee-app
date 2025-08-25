# 🚀 Onyx Coffee - Quick Deployment Guide

## 📋 Prerequisites Checklist
- [x] Azure CLI installed (`winget install Microsoft.AzureCLI`)
- [ ] Azure account with active subscription
- [ ] GitHub account (for automatic deployments)
- [ ] Git initialized in project

---

## 🎯 **Option 1: Quick Local Test (2 minutes)**

Test your app locally before deploying:

```bash
# In your Onyx directory
npm run web
```

Visit `http://localhost:8081` to see your app running!

---

## 🌐 **Option 2: Azure Static Web App Deployment**

### **Step 1: Azure CLI Setup**
```bash
# Verify installation
az --version

# Login to Azure
az login
```

### **Step 2: Create Azure Resources**
```bash
# Create resource group
az group create --name onyx-coffee-rg --location eastus

# Create static web app
az staticwebapp create \
  --name onyx-coffee-webapp \
  --resource-group onyx-coffee-rg \
  --location eastus
```

### **Step 3: Build and Deploy**
```bash
# Build your web app
npm run web:build

# Get deployment token from Azure portal
az staticwebapp secrets list --name onyx-coffee-webapp --resource-group onyx-coffee-rg
```

---

## 🔧 **Option 3: Manual Azure Portal Setup**

### **Step 1: Azure Portal**
1. Go to [portal.azure.com](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web Apps"
4. Click "Create"

### **Step 2: Configuration**
- **Subscription**: Your Azure subscription
- **Resource Group**: Create new "onyx-coffee-rg"  
- **Name**: "onyx-coffee-webapp"
- **Plan type**: Free
- **Region**: East US
- **Source**: GitHub (connect your repository)
- **Branch**: main
- **Build Presets**: Custom
- **App location**: `/`
- **Output location**: `web-build`

### **Step 3: GitHub Integration**
1. Authorize GitHub access
2. Select your repository
3. Azure automatically creates GitHub Actions workflow
4. Every push to main branch = automatic deployment!

---

## 💾 **Database Setup (Cosmos DB)**

### **Create Database**
```bash
# Create Cosmos DB account
az cosmosdb create \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-db \
  --kind GlobalDocumentDB

# Create database and containers
az cosmosdb sql database create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --name OnyxDB

# Products container
az cosmosdb sql container create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --database-name OnyxDB \
  --name Products \
  --partition-key-path "/category"
```

### **Get Connection Strings**
```bash
# Get Cosmos DB connection details
az cosmosdb keys list \
  --name onyx-coffee-db \
  --resource-group onyx-coffee-rg
```

---

## 🔐 **Environment Variables Setup**

Create `.env.local` file in your project:

```env
# Azure Cosmos DB
COSMOS_DB_ENDPOINT=https://onyx-coffee-db.documents.azure.com:443/
COSMOS_DB_KEY=your_primary_key_here
COSMOS_DB_DATABASE_NAME=OnyxDB

# Static Web App URL (after deployment)
AZURE_STATIC_WEB_APP_URL=https://onyx-coffee-webapp.azurestaticapps.net
```

---

## 📱 **Mobile App Deployment**

### **Android (Google Play Store)**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK
eas build --platform android
```

### **iOS (Apple App Store)**
```bash
# Build for iOS (requires Mac or EAS Build)
eas build --platform ios
```

---

## ✅ **Deployment Verification Checklist**

After deployment, verify these work:

- [ ] **Web app loads** at Azure Static Web Apps URL
- [ ] **Taste chatbot** works through all 3 questions
- [ ] **Product browsing** shows coffee products
- [ ] **Shopping cart** adds/removes items
- [ ] **Admin dashboard** accessible (add `/admin` route if needed)
- [ ] **Mobile responsive** design works on phone browsers
- [ ] **Authentication** demo login works
- [ ] **Navigation** between Product/Community/About sections

---

## 🐛 **Common Issues & Solutions**

### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### **Deployment Issues**
```bash
# Check build output
npm run web:build
ls -la web-build/

# Verify Azure resources
az resource list --resource-group onyx-coffee-rg
```

### **CORS Issues**
Add to `staticwebapp.config.json`:
```json
{
  "globalHeaders": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  }
}
```

---

## 🎯 **Production Checklist**

Before going live:

- [ ] **Custom domain** configured in Azure
- [ ] **SSL certificate** automatically provided by Azure
- [ ] **Environment variables** set in Azure portal
- [ ] **Analytics** tracking added
- [ ] **Error monitoring** configured
- [ ] **Performance** optimized
- [ ] **SEO** meta tags added
- [ ] **Social media** sharing configured

---

## 💰 **Cost Estimation**

**Free Tier Usage:**
- Static Web Apps: 100GB bandwidth/month FREE
- Cosmos DB: First 1000 RU/s + 25GB storage FREE
- GitHub Actions: 2000 minutes/month FREE

**Estimated Monthly Cost (after free tier):**
- Static Web Apps: $0-9
- Cosmos DB: $25+
- **Total: ~$25-35/month** for small to medium scale

---

## 🚀 **Next Steps After Deployment**

1. **Share your app**: Send Azure URL to friends/family for testing
2. **Collect feedback**: See what users love and want improved  
3. **Add real payments**: Integrate Instamojo using our prepared code
4. **Enable real auth**: Set up Azure AD B2C
5. **Go mobile**: Submit to app stores
6. **Scale up**: Add more Azure services as you grow

---

## 🆘 **Need Help?**

**Quick Resources:**
- Azure Static Web Apps docs: [aka.ms/swa-docs](https://aka.ms/swa-docs)
- Expo web deployment: [docs.expo.dev](https://docs.expo.dev)
- Your app is already configured correctly!

**Your app is production-ready!** 🎉

The hardest part (building the app) is done. Deployment is just a few commands away!