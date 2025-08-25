# Azure Configuration Guide for Onyx Coffee

This guide helps you set up Azure services for your Onyx Coffee e-commerce platform.

## 🚀 Azure Services Required

### 1. **Azure Static Web Apps** (For Web App)
### 2. **Azure Cosmos DB** (Database)
### 3. **Azure Active Directory B2C** (Authentication)
### 4. **Azure Blob Storage** (File Storage)
### 5. **Azure App Service** (Backend API)
### 6. **Azure Notification Hubs** (Push Notifications)

---

## 📋 Step-by-Step Setup

### **Step 1: Azure Static Web Apps**

```bash
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login to Azure
az login

# Create resource group
az group create --name onyx-coffee-rg --location eastus

# Create static web app
az staticwebapp create \
  --name onyx-coffee-webapp \
  --resource-group onyx-coffee-rg \
  --source https://github.com/YOUR_USERNAME/onyx-coffee \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "web-build"
```

### **Step 2: Azure Cosmos DB**

```bash
# Create Cosmos DB account
az cosmosdb create \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-db \
  --kind GlobalDocumentDB \
  --default-consistency-level Session \
  --locations regionName=eastus failoverPriority=0 isZoneRedundant=False

# Create database
az cosmosdb sql database create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --name OnyxDB

# Create containers
az cosmosdb sql container create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --database-name OnyxDB \
  --name Products \
  --partition-key-path "/category" \
  --throughput 400

az cosmosdb sql container create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --database-name OnyxDB \
  --name Users \
  --partition-key-path "/email" \
  --throughput 400

az cosmosdb sql container create \
  --account-name onyx-coffee-db \
  --resource-group onyx-coffee-rg \
  --database-name OnyxDB \
  --name Orders \
  --partition-key-path "/userId" \
  --throughput 400
```

### **Step 3: Azure AD B2C**

```bash
# Create B2C tenant (this needs to be done via Azure Portal)
# Go to: https://portal.azure.com
# Search for "Azure AD B2C"
# Create new B2C tenant with domain: onyx-coffee.onmicrosoft.com

# After creating B2C tenant, create application registration:
```

**In Azure Portal:**
1. Go to Azure AD B2C
2. App registrations → New registration
3. Name: "Onyx Coffee Mobile App"
4. Supported account types: "Accounts in any identity provider or organizational directory"
5. Redirect URI: 
   - Type: Mobile and desktop applications
   - Value: `exp://localhost:19000/--/auth` (for Expo development)

### **Step 4: Azure Blob Storage**

```bash
# Create storage account
az storage account create \
  --name onyxcoffeestorage \
  --resource-group onyx-coffee-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create blob container for images
az storage container create \
  --name product-images \
  --account-name onyxcoffeestorage \
  --public-access blob
```

### **Step 5: Azure App Service (Backend)**

```bash
# Create App Service Plan
az appservice plan create \
  --name onyx-coffee-plan \
  --resource-group onyx-coffee-rg \
  --location eastus \
  --sku B1 \
  --is-linux

# Create Web App for API
az webapp create \
  --resource-group onyx-coffee-rg \
  --plan onyx-coffee-plan \
  --name onyx-coffee-api \
  --runtime "NODE|18-lts"
```

---

## 🔧 Environment Configuration

Create a `.env` file in your project root:

```env
# Azure Cosmos DB
COSMOS_DB_ENDPOINT=https://onyx-coffee-db.documents.azure.com:443/
COSMOS_DB_KEY=YOUR_PRIMARY_KEY_HERE
COSMOS_DB_DATABASE_NAME=OnyxDB

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME=onyxcoffeestorage
AZURE_STORAGE_ACCESS_KEY=YOUR_STORAGE_KEY_HERE
AZURE_STORAGE_CONNECTION_STRING=YOUR_CONNECTION_STRING_HERE

# Azure AD B2C
B2C_TENANT_NAME=onyx-coffee
B2C_CLIENT_ID=YOUR_CLIENT_ID_HERE
B2C_POLICY_NAME=B2C_1_signupsignin
B2C_REDIRECT_URI=exp://localhost:19000/--/auth

# Instamojo Payment
INSTAMOJO_API_KEY=YOUR_INSTAMOJO_API_KEY
INSTAMOJO_AUTH_TOKEN=YOUR_INSTAMOJO_AUTH_TOKEN
INSTAMOJO_ENDPOINT=https://www.instamojo.com/api/1.1/

# App Configuration
API_BASE_URL=https://onyx-coffee-api.azurewebsites.net
WEB_APP_URL=https://onyx-coffee-webapp.azurestaticapps.net
```

---

## 💾 Database Schema

### **Products Collection**
```json
{
  "id": "string",
  "name": "string",
  "description": "string", 
  "price": "number",
  "category": "string", // partition key
  "imageUrl": "string",
  "rating": "number",
  "reviewCount": "number",
  "roastProfile": "light|medium|dark",
  "brewStyle": "espresso|filter|french-press",
  "flavorNotes": ["string"],
  "inStock": "boolean",
  "inventory": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### **Users Collection**
```json
{
  "id": "string",
  "email": "string", // partition key
  "name": "string",
  "phone": "string",
  "addresses": [
    {
      "id": "string",
      "name": "string",
      "street": "string",
      "city": "string",
      "state": "string", 
      "pincode": "string",
      "isDefault": "boolean"
    }
  ],
  "preferences": {
    "brewStyle": "string",
    "roastProfile": "string",
    "flavorDirection": "string"
  },
  "createdAt": "datetime",
  "lastLoginAt": "datetime"
}
```

### **Orders Collection**
```json
{
  "id": "string",
  "userId": "string", // partition key
  "userEmail": "string",
  "items": [
    {
      "productId": "string",
      "name": "string",
      "price": "number",
      "quantity": "number"
    }
  ],
  "total": "number",
  "status": "pending|paid|processing|shipped|delivered|cancelled",
  "paymentMethod": "instamojo|cod",
  "paymentId": "string",
  "shippingAddress": {
    "name": "string",
    "street": "string", 
    "city": "string",
    "state": "string",
    "pincode": "string",
    "phone": "string"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 🔐 Security Configuration

### **Cosmos DB Firewall**
```bash
# Allow Azure services
az cosmosdb update \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-db \
  --enable-public-network true \
  --enable-multiple-write-locations false

# Add specific IP ranges (optional)
az cosmosdb network-rule add \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-db \
  --ip-range-filter "YOUR_IP_ADDRESS"
```

### **CORS Configuration for API**
```bash
# Enable CORS for web app
az webapp cors add \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-api \
  --allowed-origins "https://onyx-coffee-webapp.azurestaticapps.net" \
                    "http://localhost:8081" \
                    "exp://localhost:19000"
```

---

## 📱 Mobile App Configuration

### **For React Native Azure Integration:**

```bash
# Install Azure packages
npm install @azure/cosmos
npm install @azure/storage-blob
npm install react-native-azure-auth
```

### **Update your React Native code:**

```typescript
// src/config/azure.ts
export const azureConfig = {
  cosmosDB: {
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
    databaseName: process.env.COSMOS_DB_DATABASE_NAME,
  },
  b2c: {
    tenantName: process.env.B2C_TENANT_NAME,
    clientId: process.env.B2C_CLIENT_ID,
    policyName: process.env.B2C_POLICY_NAME,
    redirectUri: process.env.B2C_REDIRECT_URI,
  },
  storage: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY,
  }
};
```

---

## 🚀 Deployment Scripts

### **Deploy Web App**
```bash
# Build and deploy web app
npm run build:web
az staticwebapp deploy --name onyx-coffee-webapp --source ./web-build
```

### **Deploy API**
```bash
# Deploy backend API
az webapp deployment source config-zip \
  --resource-group onyx-coffee-rg \
  --name onyx-coffee-api \
  --src api.zip
```

---

## 📊 Monitoring & Analytics

### **Application Insights**
```bash
# Create Application Insights
az monitor app-insights component create \
  --resource-group onyx-coffee-rg \
  --app onyx-coffee-insights \
  --location eastus \
  --kind web

# Get instrumentation key
az monitor app-insights component show \
  --resource-group onyx-coffee-rg \
  --app onyx-coffee-insights \
  --query instrumentationKey -o tsv
```

---

## 💰 Cost Optimization

### **Pricing Estimates (Monthly)**
- **Azure Static Web Apps**: $0 - $9 (Free tier available)
- **Cosmos DB**: $24+ (400 RU/s per container)
- **App Service B1**: $13+ 
- **Blob Storage**: $0.02 per GB
- **AD B2C**: $0.00325 per authentication (first 50k free)

### **Cost-Saving Tips**
1. Use Free tier for Static Web Apps initially
2. Start with minimal Cosmos DB throughput (400 RU/s)
3. Use B1 App Service plan for development
4. Enable autoscale only when needed

---

## 🔍 Troubleshooting

### **Common Issues**

#### **CORS Errors**
```bash
# Check CORS settings
az webapp cors show --resource-group onyx-coffee-rg --name onyx-coffee-api
```

#### **Database Connection Issues**
```bash
# Check firewall rules
az cosmosdb network-rule list --resource-group onyx-coffee-rg --name onyx-coffee-db
```

#### **Authentication Issues**
- Verify B2C tenant configuration
- Check redirect URIs
- Validate client ID and policy names

---

## 📚 Next Steps

1. **Set up monitoring and alerting**
2. **Configure backup and disaster recovery**
3. **Implement CI/CD pipelines**
4. **Add performance monitoring**
5. **Set up automated testing**

---

**Pro Tips:**
- Always use the same Azure region for all services to minimize latency
- Set up staging environments before production deployment
- Use Azure Key Vault for sensitive configuration
- Enable diagnostic logging for all services
- Monitor costs regularly with Azure Cost Management