# WinMarket V2 Mobile App

A comprehensive React Native mobile application for the WinMarket marketplace, built with Expo and featuring native iOS/Android optimizations.

## 🚀 Features

### Core Functionality
- **📱 Native Navigation** - Tab-based navigation with Expo Router
- **🛍️ Product Discovery** - Browse, search, and filter products
- **🛒 Shopping Cart** - Full cart management with mobile UX patterns
- **👤 User Profiles** - Account management and order tracking
- **🔐 Authentication** - Secure login/register with Better Auth integration

### Mobile-Optimized UX
- **📸 Camera Integration** - Photo capture for product uploads
- **🔔 Push Notifications** - Order updates and alerts
- **📍 Location Services** - Nearby sellers and delivery options
- **👆 Haptic Feedback** - Native touch responses
- **🎨 Dark Mode Support** - Automatic theme switching
- **♿ Accessibility** - Full screen reader support

### Native Features
- **📷 Image Picker** - Camera and photo library access
- **🔄 Pull-to-Refresh** - Native refresh patterns
- **📲 Deep Linking** - Universal links for product sharing
- **💾 Offline Support** - Cache-first GraphQL queries
- **🔒 Biometric Auth** - Touch ID / Face ID support

## 🏗️ Architecture

### Tech Stack
- **React Native** 0.74+ with Expo 51
- **Expo Router** for native navigation
- **Tamagui** for cross-platform UI components
- **Apollo Client** for GraphQL state management
- **TypeScript** for type safety
- **React Native Reanimated** for smooth animations

### Project Structure
```
apps/mobile/
├── app/                     # Expo Router screens
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Home tab
│   │   ├── search.tsx      # Search/Discovery
│   │   ├── cart.tsx        # Shopping cart
│   │   ├── wallet.tsx      # Wallet/Transactions
│   │   └── profile.tsx     # User profile
│   ├── product/[id].tsx    # Product detail screen
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Reusable components
│   │   ├── products/       # Product-related components
│   │   ├── ui/            # Base UI components
│   │   └── common/        # Shared components
│   ├── hooks/             # Custom React hooks
│   │   ├── use-products.ts # Product data hooks
│   │   ├── use-camera.ts   # Camera integration
│   │   └── use-notifications.ts # Push notifications
│   ├── graphql/           # GraphQL operations
│   │   ├── queries/       # GraphQL queries
│   │   └── mutations/     # GraphQL mutations
│   ├── lib/               # Utilities and configuration
│   │   └── apollo.ts      # Apollo Client setup
│   └── providers/         # React context providers
│       └── auth-provider.tsx # Authentication context
└── assets/                # Static assets
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Expo CLI 49+
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Getting Started

1. **Install Dependencies**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run on Device**
   ```bash
   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android

   # Physical device (scan QR code)
   npm run dev
   ```

### Environment Configuration

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/graphql
EXPO_PUBLIC_WS_URL=ws://localhost:4000/graphql
```

### Available Scripts

```bash
npm run dev          # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in web browser
npm run build:ios    # Build for iOS App Store
npm run build:android # Build for Google Play Store
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 📱 Key Components

### Home Tab (`app/(tabs)/index.tsx`)
- Featured products carousel
- Category navigation
- Quick action buttons
- Real-time data with GraphQL

### Search Tab (`app/(tabs)/search.tsx`)
- Product search with filters
- Category browsing
- Grid/List view toggle
- Voice search integration

### Product Detail (`app/product/[id].tsx`)
- Image gallery with zoom
- Product information
- Add to cart functionality
- Seller contact options

### Shopping Cart (`app/(tabs)/cart.tsx`)
- Cart item management
- Quantity controls
- Swipe-to-delete
- Checkout flow

### Profile Tab (`app/(tabs)/profile.tsx`)
- User dashboard
- Order tracking
- Account settings
- Wallet management

## 🔗 GraphQL Integration

The mobile app uses Apollo Client with optimized caching for mobile performance:

```typescript
// Custom hooks for data fetching
import { useFeaturedProducts, useSearchProducts } from '../hooks/use-products';

// Usage in components
const { data: products, loading } = useFeaturedProducts(10);
```

### Key Features:
- **Offline-first caching** - Works without internet
- **Optimistic updates** - Instant UI feedback
- **Error handling** - Graceful error states
- **Auto-retry** - Automatic retry on network errors

## 📸 Native Features

### Camera Integration
```typescript
import { useCamera } from '../hooks/use-camera';

const { takePicture, pickImage } = useCamera();
```

### Push Notifications
```typescript
import { useNotifications } from '../hooks/use-notifications';

const { scheduleLocalNotification } = useNotifications();
```

### Haptic Feedback
```typescript
import * as Haptics from 'expo-haptics';

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

## 🏪 App Store Deployment

### iOS App Store

1. **Configure EAS Build**
   ```bash
   eas build --platform ios
   ```

2. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Google Play Store

1. **Build APK/AAB**
   ```bash
   eas build --platform android
   ```

2. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

### Build Configuration

See `eas.json` for build profiles:
- **development** - Development builds with debug symbols
- **preview** - Internal testing builds
- **production** - App store release builds

## 🎨 Design System

### Tamagui Theme
- Consistent spacing system (`$1`, `$2`, `$3`, etc.)
- Color tokens (`$blue6`, `$gray10`, etc.)
- Typography scale (`$3`, `$4`, `$5`, etc.)
- Dark mode support

### Mobile UX Patterns
- **Swipe gestures** - Cart item deletion, image gallery
- **Pull-to-refresh** - Product lists and feeds
- **Haptic feedback** - Button presses and interactions
- **Native modals** - Bottom sheets and overlays

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Testing
```bash
npm run e2e
```

### Manual Testing Checklist
- [ ] Tab navigation works smoothly
- [ ] Products load and display correctly
- [ ] Search functionality works
- [ ] Cart operations are responsive
- [ ] Authentication flow is complete
- [ ] Camera integration works
- [ ] Push notifications are received
- [ ] Deep links open correct screens
- [ ] Offline mode functions properly

## 🔐 Security

### Data Protection
- JWT tokens stored in secure storage
- Biometric authentication support
- Network traffic encryption
- Input validation and sanitization

### Privacy
- Camera permission descriptions
- Location usage explanations
- Notification consent
- Data collection transparency

## 📊 Performance

### Optimization Features
- **Image optimization** - Multiple resolutions for different devices
- **Code splitting** - Lazy loading for better performance
- **Cache management** - Intelligent GraphQL caching
- **Bundle optimization** - Tree shaking and minification

### Metrics
- **Bundle size** - < 50MB for initial download
- **Startup time** - < 3 seconds on average devices
- **Navigation** - < 16ms frame time for smooth animations
- **Memory usage** - < 200MB for typical usage

## 🐛 Troubleshooting

### Common Issues

**Metro bundler not starting**
```bash
npx expo start --clear
```

**iOS build failing**
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

**Android emulator not detected**
```bash
adb devices
npx expo run:android
```

## 📚 Documentation

### Related Documentation
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Tamagui Documentation](https://tamagui.dev/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [React Native Documentation](https://reactnative.dev/)

### API Documentation
- GraphQL schema available at `/apps/web/src/graphql/schema.graphql`
- Authentication endpoints documented in Better Auth integration

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on both iOS and Android

## 📄 License

This project is part of the WinMarket V2 ecosystem. See the root LICENSE file for details.