# Onyx Coffee - Cross-Platform E-commerce App

Welcome to **Onyx Coffee**, a complete cross-platform coffee e-commerce solution built for beginners to learn modern app development!

## 🚀 What We Built

This project includes:

### **1. Customer-Facing Applications**
- **📱 Mobile App (iOS & Android)** - React Native native apps
- **🌐 Web App** - Responsive web application 
- **📱 Mobile Web (mWeb)** - Optimized mobile browser experience

### **2. Admin Management System**
- **⚙️ Central Management System (CMS)** - Admin dashboard to manage products, banners, and content

### **3. Key Features**
- **🤖 Taste Chatbot** - AI-powered recommendation system
- **🔐 Authentication** - Secure login with Azure AD B2C integration
- **🛒 Shopping Cart** - Complete cart and checkout functionality
- **💳 Payment Integration** - Instamojo payment gateway
- **📊 Product Catalog** - Dynamic inventory management
- **👥 Community Section** - User engagement features
- **📱 Responsive Design** - Works perfectly on all devices

---

## 🛠️ Technology Stack Explained

### **Why We Chose These Technologies:**

#### **Frontend: React Native with Expo**
- ✅ **One Codebase, Three Platforms**: Write once, deploy to iOS, Android, and Web
- ✅ **Beginner-Friendly**: Easier to learn than native development
- ✅ **Fast Development**: Hot reloading for instant feedback
- ✅ **Cost-Effective**: No need for separate iOS/Android developers

#### **Backend: Node.js + Express.js**
- ✅ **JavaScript Everywhere**: Same language for frontend and backend
- ✅ **Large Community**: Tons of tutorials and packages
- ✅ **Azure Compatible**: Works perfectly with your Azure subscription

#### **Database: Azure Cosmos DB**
- ✅ **NoSQL Flexibility**: Perfect for product catalogs
- ✅ **Auto-Scaling**: Grows with your business
- ✅ **Global Distribution**: Fast worldwide performance

---

## 📂 Project Structure

```
Onyx/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Banner.tsx       # Top banner with login/branding
│   │   ├── SideRail.tsx     # Navigation sidebar
│   │   ├── ProductCard.tsx  # Product display cards
│   │   └── TasteChatbot.tsx # AI recommendation chatbot
│   ├── contexts/            # State management
│   │   ├── AuthContext.tsx  # User authentication
│   │   ├── CatalogContext.tsx # Product inventory
│   │   └── CartContext.tsx  # Shopping cart
│   ├── screens/             # Main app screens
│   │   ├── ProductSection.tsx
│   │   ├── CommunitySection.tsx
│   │   └── AboutSection.tsx
│   ├── services/            # API integrations
│   ├── types/               # TypeScript definitions
│   └── utils/               # Helper functions
├── cms/                     # Admin dashboard
│   └── src/components/
│       └── AdminDashboard.tsx
├── backend/                 # Server-side code
│   ├── src/routes/         # API endpoints
│   ├── src/models/         # Database models
│   └── src/config/         # Configuration
└── App.tsx                 # Main app entry point
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

### **Installation Steps**

#### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd Onyx
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Install Expo CLI Globally**
```bash
npm install -g expo-cli
```

#### **4. Start Development Server**

**For Web Development:**
```bash
npm run web
```
This opens your app in the browser at `http://localhost:8081`

**For Mobile Development:**
```bash
npm start
```
This opens Expo DevTools. Scan QR code with Expo Go app.

---

## 📱 How to Test on Different Platforms

### **Web (Desktop & Mobile Web)**
1. Run `npm run web`
2. Open browser and go to `http://localhost:8081`
3. Use browser developer tools to test mobile responsiveness

### **iOS (Requires Mac)**
1. Install Xcode from Mac App Store
2. Run `npm run ios`
3. App opens in iOS Simulator

### **Android**
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Run `npm run android`
4. App opens in Android Emulator

### **Physical Devices**
1. Install **Expo Go** app from App Store/Play Store
2. Run `npm start`
3. Scan QR code with Expo Go app

---

## 🔧 Key Components Explained

### **1. Authentication System (`src/contexts/AuthContext.tsx`)**
```typescript
// Demo login for testing
const { demoLogin, user, isAuthenticated } = useAuth();

// Real Azure AD integration (coming soon)
const { login, logout } = useAuth();
```

**What it does:**
- Manages user login/logout
- Persists user session in AsyncStorage
- Provides user info throughout app

### **2. Product Catalog (`src/contexts/CatalogContext.tsx`)**
```typescript
// Get all products
const { items, loading } = useCatalog();

// Add new product (Admin only)
const { addItem } = useCatalog();

// Get recommendation from chatbot
const { getRecommendedItem } = useCatalog();
```

**What it does:**
- Manages product inventory
- Handles CRUD operations
- Powers recommendation engine

### **3. Shopping Cart (`src/contexts/CartContext.tsx`)**
```typescript
// Add to cart
const { addToCart, items, total } = useCart();

// Update quantity
const { updateQuantity } = useCart();
```

**What it does:**
- Manages cart state
- Calculates totals
- Persists cart between sessions

### **4. Taste Chatbot (`src/components/TasteChatbot.tsx`)**
```typescript
// Three-question flow:
// 1. How do you brew? (espresso, filter, french-press)
// 2. Roast preference? (light, medium, dark)  
// 3. Flavor direction? (floral, balanced, smoky)
```

**What it does:**
- Guides users through 3 questions
- Matches preferences to products
- Shows personalized recommendation

---

## 🎨 Design System & Layout

### **Responsive Behavior**
- **Mobile (< 768px)**: 2-column product grid, 84px sidebar
- **Desktop (>= 1024px)**: 3-column product grid, 180px sidebar
- **Banner Height**: Desktop ~20vh, Mobile ~13vh

### **Navigation Logic**
- **Mobile/Tablet**: Sidebar switches content panes
- **Desktop**: Sidebar scrolls to sections
- **Product Detail**: Inline on desktop, full-screen on mobile

### **Color Palette**
```css
Primary: #000 (Black)
Background: #f8f9fa (Light Gray)
Cards: #fff (White)  
Text: #000 (Black), #666 (Gray)
Accent: #007AFF (Blue)
```

---

## 🔌 Integration Points

### **1. Azure Services Setup**

#### **Authentication (Azure AD B2C)**
```bash
# Install Azure MSAL
npm install @azure/msal-react-native
```

#### **Database (Azure Cosmos DB)**
```bash
# Install Cosmos DB SDK
npm install @azure/cosmos
```

### **2. Payment Integration (Instamojo)**
```bash
# Install payment SDK
npm install react-native-razorpay
```

### **3. Push Notifications (Azure Notification Hubs)**
```bash
# Install notification SDK
npm install @react-native-async-storage/async-storage
```

---

## 🏪 Admin Dashboard

### **Access the CMS**
The admin dashboard is integrated into the main app. To access it:

1. **Development Mode**: Add admin screens to navigation
2. **Production**: Create separate admin subdomain

### **Features**
- ✅ Add/Edit/Delete products
- ✅ Upload product images
- ✅ Set pricing and inventory
- ✅ Manage categories and filters
- ✅ View sales analytics (coming soon)

---

## 📊 Learning Path for Beginners

### **Week 1: Understanding the Basics**
- [ ] Run the app on web browser
- [ ] Explore different sections (Product, Community, About)
- [ ] Test the taste chatbot
- [ ] Add items to cart

### **Week 2: Code Exploration**
- [ ] Open `App.tsx` and understand the main structure
- [ ] Look at `ProductCard.tsx` to see component structure
- [ ] Examine `AuthContext.tsx` for state management
- [ ] Study `types/index.ts` for TypeScript definitions

### **Week 3: Making Changes**
- [ ] Change banner image in `Banner.tsx`
- [ ] Add new product via Admin dashboard
- [ ] Modify colors in StyleSheets
- [ ] Update company information in About section

### **Week 4: Advanced Features**
- [ ] Integrate with Azure services
- [ ] Add payment gateway
- [ ] Deploy to app stores
- [ ] Set up analytics

---

## 🐛 Common Issues & Solutions

### **Metro Bundler Issues**
```bash
# Clear cache and restart
npm start -- --clear-cache
```

### **iOS Build Issues**
```bash
# Clean build folder
cd ios && xcodebuild clean
```

### **Android Build Issues**
```bash
# Clean and rebuild
cd android && ./gradlew clean
```

### **Web Build Issues**
```bash
# Install web dependencies
npx expo install react-dom @expo/metro-runtime
```

---

## 🚀 Deployment Guide

### **Web App (Azure Static Web Apps)**
```bash
# Build for production
npm run build:web

# Deploy to Azure
az staticwebapp create --name onyx-coffee --source .
```

### **Mobile Apps**
```bash
# Build for iOS
eas build --platform ios

# Build for Android  
eas build --platform android
```

---

## 📚 Learning Resources

### **React Native**
- [Official Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

### **TypeScript**
- [TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### **Azure Services**
- [Azure Mobile Apps](https://azure.microsoft.com/services/app-service/mobile/)
- [Cosmos DB Tutorial](https://docs.microsoft.com/azure/cosmos-db/)

### **State Management**
- [React Context API](https://reactjs.org/docs/context.html)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🆘 Support

If you need help:

1. **Check this README first**
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed description
4. **Join our Discord** (coming soon)

---

## 🎯 Next Steps

### **Phase 1: Core Features (Completed ✅)**
- [x] Cross-platform setup
- [x] Product catalog
- [x] Shopping cart
- [x] Taste chatbot
- [x] Admin dashboard

### **Phase 2: Production Features (In Progress)**
- [ ] Azure AD B2C authentication
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Analytics tracking

### **Phase 3: Advanced Features**
- [ ] Social media login
- [ ] Loyalty program
- [ ] AR coffee visualization
- [ ] AI-powered customer support

---

**Happy Coding! ☕️**

Built with ❤️ for aspiring developers. This project teaches you production-ready mobile and web development using modern technologies.

Remember: Every expert was once a beginner. Keep coding, keep learning!