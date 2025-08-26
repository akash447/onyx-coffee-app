# 🚀 Azure Deployment Guide - Onyx Coffee App

Your app is ready for production deployment! Here's the complete guide to deploy to Azure Static Web Apps.

## ✅ Pre-Deployment Checklist

- ✅ **App is working locally**
- ✅ **Community features implemented** (posts, comments, likes, reshares)
- ✅ **Content management system ready**
- ✅ **localStorage persistence working**
- ✅ **Static web app configuration ready**

## 🛠️ Step 1: Build for Production

Run these commands in your project directory:

```bash
# Install dependencies (if not already done)
npm install

# Build for web production
npm run build:web

# Or alternatively
expo export --platform web
```

This creates a `dist/` folder with your production-ready files.

## 🔧 Step 2: Deploy to Azure Static Web Apps

### Option A: Using Azure CLI (Recommended)

1. **Install Azure CLI** (if not installed):
   ```bash
   # Windows (run as Administrator)
   winget install Microsoft.AzureCLI
   
   # Or download from: https://aka.ms/installazurecliwindows
   ```

2. **Login to Azure**:
   ```bash
   az login
   ```

3. **Deploy your app**:
   ```bash
   # Navigate to your project
   cd C:\Users\akasi\Desktop\Onyx
   
   # Deploy to Azure Static Web Apps
   az staticwebapp deploy --name your-app-name --source ./dist --resource-group your-resource-group
   ```

### Option B: Using Azure Portal (GUI Method)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Static Web App**:
   - Search for "Static Web Apps"
   - Click "Create"
   - Fill in details:
     - **Subscription**: Your Azure subscription
     - **Resource Group**: Create new or use existing
     - **Name**: `onyx-coffee-app` (or your choice)
     - **Plan**: Free (for now)
     - **Deployment Source**: Local Git or Upload

3. **Upload your build**:
   - Choose "Upload" if available
   - Or connect to your GitHub repository

### Option C: Using GitHub Actions (Automated)

1. **Push to GitHub**:
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Ready for Azure deployment 🚀"
   
   # Add your GitHub remote
   git remote add origin https://github.com/YOUR_USERNAME/onyx-coffee-app.git
   git push -u origin main
   ```

2. **Create Static Web App with GitHub**:
   - In Azure Portal, create Static Web App
   - Choose "GitHub" as deployment source
   - Authorize and select your repository
   - Azure will automatically create GitHub Actions workflow

## 📁 Step 3: Verify Build Structure

Your `dist/` folder should contain:
```
dist/
├── index.html           # Main HTML file
├── static/              # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript bundles
│   └── media/          # Images, fonts
├── favicon.png         # App favicon
└── [other assets]      # Additional files
```

## ⚙️ Step 4: Configure Environment

### Update staticwebapp.config.json (already configured)
Your configuration is already set up for SPA routing:
```json
{
  "routes": [
    {"route": "/", "serve": "/index.html", "statusCode": 200},
    {"route": "/*", "serve": "/index.html", "statusCode": 200}
  ],
  "navigationFallback": {"rewrite": "/index.html"}
}
```

## 🌐 Step 5: Custom Domain (Optional)

1. **In Azure Portal**:
   - Go to your Static Web App
   - Navigate to "Custom domains"
   - Add your domain (e.g., `coffee.yourdomain.com`)

2. **DNS Configuration**:
   - Add CNAME record pointing to your Azure URL

## 🔍 Step 6: Post-Deployment Testing

After deployment, test these features:

### ✅ Basic Functionality
- [ ] App loads without errors
- [ ] All sections work (Products, Community, About)
- [ ] Content management accessible
- [ ] Responsive design works

### ✅ Community Features
- [ ] Create new posts
- [ ] Like/unlike posts
- [ ] Add comments
- [ ] Reshare posts
- [ ] Three-dot menu (report/delete)
- [ ] Data persists after refresh

### ✅ Content Management
- [ ] Admin can edit content
- [ ] Changes reflect immediately
- [ ] Content persists after refresh

## 🚨 Common Issues & Solutions

### Issue 1: 404 Errors on Refresh
**Solution**: Ensure `staticwebapp.config.json` is in the `dist/` folder after build.

### Issue 2: Assets Not Loading
**Solution**: Check that all assets are in the `dist/` folder and paths are relative.

### Issue 3: localStorage Not Working
**Solution**: This is expected - localStorage only works in browser, not during build.

### Issue 4: Build Fails
**Solution**: 
```bash
# Clear cache and rebuild
npx expo install --fix
npm run build:web
```

## 📊 Monitoring Your App

1. **Azure Portal**: Monitor performance, errors, and usage
2. **Console Logs**: Check browser developer tools for any issues
3. **User Feedback**: Monitor reports from the community features

## 🔄 Future Updates

To update your deployed app:

```bash
# Make your changes locally
# Test thoroughly
# Build for production
npm run build:web

# Deploy update
az staticwebapp deploy --name your-app-name --source ./dist --resource-group your-resource-group
```

## 📞 Support

If you encounter issues:
1. Check Azure Static Web Apps documentation
2. Review console logs for errors  
3. Ensure all environment configurations are correct

---

## 🎉 Quick Deployment Commands

```bash
# Full deployment pipeline
npm install
npm run build:web
az staticwebapp deploy --name onyx-coffee-app --source ./dist --resource-group your-resource-group

# Check deployment status
az staticwebapp show --name onyx-coffee-app --resource-group your-resource-group
```

**Your Onyx Coffee app is now ready for the world! ☕🚀**