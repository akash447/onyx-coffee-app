# ✅ Pre-Deployment Checklist - Onyx Coffee App

Complete this checklist before deploying to ensure everything works perfectly in production.

## 🧪 Local Testing

### ✅ Core App Functionality
- [ ] **App loads without errors** in browser (http://localhost:19006)
- [ ] **All sections accessible**: Products, Community, About, Admin
- [ ] **Navigation works** between all sections
- [ ] **Responsive design** works on mobile/tablet/desktop
- [ ] **No console errors** in browser developer tools

### ✅ Community Features
- [ ] **Create new posts** works (story & review types)
- [ ] **Like/unlike posts** works and persists
- [ ] **Comment system** works (add, like, delete own comments)
- [ ] **Reshare functionality** works and shows correct counts
- [ ] **Three-dot menu** appears with correct options:
  - [ ] **Own posts**: Delete option
  - [ ] **Others' posts**: Report option
- [ ] **Reporting system** works with reason selection
- [ ] **Data persistence**: Refresh page, all data remains

### ✅ Content Management
- [ ] **Admin section accessible** 
- [ ] **Content editing** works for all sections
- [ ] **Apply button** works for individual fields
- [ ] **Save All Changes** works and persists
- [ ] **Live preview** updates correctly
- [ ] **Content persistence**: Changes remain after refresh

### ✅ User Authentication
- [ ] **Login/logout** functionality works
- [ ] **User permissions** correct (only see own delete options)
- [ ] **Unauthenticated users** can view but not interact

## 🏗️ Build Preparation

### ✅ Dependencies & Configuration
- [ ] **All dependencies** installed (`npm install` completed)
- [ ] **No TypeScript errors** (`npm run type-check` passes)
- [ ] **Build configuration** exists (`package.json` has build:web script)
- [ ] **Static web app config** present (`staticwebapp.config.json`)

### ✅ Production Build
- [ ] **Build completes** without errors (`npm run build:web`)
- [ ] **Dist folder** created with all assets
- [ ] **Index.html** exists in dist folder
- [ ] **Static assets** properly bundled
- [ ] **Build size** reasonable (< 50MB recommended)

## 🌐 Deployment Readiness

### ✅ Azure Configuration
- [ ] **Azure account** set up and accessible
- [ ] **Resource group** created or identified
- [ ] **Static Web App name** chosen and available
- [ ] **Domain name** planned (if using custom domain)

### ✅ Environment Setup
- [ ] **Azure CLI** installed (if using CLI deployment)
- [ ] **Login to Azure** completed (`az login`)
- [ ] **Deployment method** chosen:
  - [ ] Azure CLI
  - [ ] Azure Portal upload
  - [ ] GitHub Actions

## 🔍 Performance Checks

### ✅ App Performance
- [ ] **Fast loading** on localhost
- [ ] **Smooth animations** and interactions
- [ ] **No memory leaks** (check dev tools memory tab)
- [ ] **Offline behavior** acceptable (shows cached content)

### ✅ Data Management
- [ ] **LocalStorage** working correctly
- [ ] **Data migration** handles old formats
- [ ] **Error handling** graceful for corrupt data
- [ ] **Storage size** reasonable (check Application tab in dev tools)

## 🚨 Known Issues Check

### ✅ Common Problems Resolved
- [ ] **Community page** loads without crashes
- [ ] **Story data migration** working for old localStorage
- [ ] **All new fields** (comments, reshares) have defaults
- [ ] **TypeScript errors** resolved
- [ ] **Missing imports** fixed

## 📋 Final Deployment Steps

1. **Run deployment script**: `./deploy.ps1` (Windows) or `./deploy.sh` (Mac/Linux)
2. **Choose deployment method** when prompted
3. **Provide Azure details** (resource group, app name)
4. **Wait for deployment** to complete
5. **Test deployed app** at provided URL

## 🧪 Post-Deployment Testing

After deployment, verify:

### ✅ Production App
- [ ] **App loads** at Azure URL
- [ ] **All features work** same as localhost
- [ ] **HTTPS** working correctly
- [ ] **Custom domain** (if configured)

### ✅ Performance
- [ ] **Fast loading** on production
- [ ] **CDN delivery** working for static assets
- [ ] **Mobile performance** acceptable

### ✅ Data Persistence
- [ ] **LocalStorage** works in production
- [ ] **User actions persist** across sessions
- [ ] **Content management** saves correctly

---

## 🚀 Ready to Deploy?

If all items above are checked ✅, your app is ready for production!

Run the deployment command:

**Windows:**
```powershell
.\deploy.ps1
```

**Mac/Linux:**
```bash
./deploy.sh
```

**Or manual build:**
```bash
npm run build:web
az staticwebapp deploy --name YOUR_APP_NAME --source ./dist --resource-group YOUR_RESOURCE_GROUP
```

---

## 📞 Support

If any checklist items fail:
1. **Check console logs** for specific errors
2. **Review deployment guide** (`AZURE_DEPLOYMENT_GUIDE.md`)
3. **Test locally** until all items pass
4. **Clear localStorage** if data issues persist (`localStorage.clear()` in console)

**Your Onyx Coffee app is almost live! ☕🚀**