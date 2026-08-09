# 📱 Best Films - Mobile App Build & Publishing Guide (iOS & Android)

This guide provides step-by-step instructions to convert and build the **Best Films** web application into native **Android (.apk / .aab)** and **iOS (.ipa)** mobile apps for publishing on **Google Play Store** and **Apple App Store**.

---

## 🚀 Method 1: Capacitor Native Wrapper (Recommended)

Capacitor by Ionic wraps the high-performance React + Vite web application inside native WebViews with full native bridge support (Push Notifications, Offline Storage, Media Streaming).

### 📋 Prerequisites
- **Node.js** v18+ and `npm` installed.
- **Android Studio** (for Android APK / Play Store AAB builds).
- **Xcode** on macOS (for iOS App Store IPA builds).

---

### Step 1: Install Capacitor Dependencies

In your project root terminal, run:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/push-notifications @capacitor/splash-screen
```

---

### Step 2: Initialize Capacitor

```bash
npx cap init "Best Films" "com.bestfilms.mobile" --web-dir "dist"
```

---

### Step 3: Build Web Production Assets

```bash
npm run build
```

---

### Step 4: Add Android & iOS Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (requires macOS)
npx cap add ios
```

---

### Step 5: Sync Assets to Native Projects

```bash
npx cap sync
```

---

## 🤖 Building Android App (APK / Google Play AAB)

1. Open the Android native project in Android Studio:
   ```bash
   npx cap open android
   ```
2. Wait for Gradle sync to complete.
3. **Build Debug APK**:
   - Go to `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
   - Find the output `.apk` file in `android/app/build/outputs/apk/debug/app-debug.apk`.
4. **Build Signed Production AAB for Google Play Store**:
   - Go to `Build` > `Generate Signed Bundle / APK`.
   - Choose `Android App Bundle (.aab)`.
   - Create or select your keystore file (`.jks`), enter password and key alias.
   - Click `Finish`. Upload the generated `.aab` file to Google Play Console.

---

## 🍎 Building iOS App (Apple App Store IPA)

1. Open the iOS native project in Xcode (macOS only):
   ```bash
   npx cap open ios
   ```
2. Select `App` in the left sidebar, go to `Signing & Capabilities`.
3. Select your Apple Developer Team and Bundle Identifier (`com.bestfilms.mobile`).
4. Select target device as `Any iOS Device (arm64)`.
5. Go to `Product` > `Archive`.
6. Once archived, click `Distribute App` > `App Store Connect` to upload directly to Apple TestFlight and App Store.

---

## 🔔 Enabling Push Notifications

The app includes `@capacitor/push-notifications` and browser Web Push API integration.
- For Firebase Cloud Messaging (FCM) on Android: Place `google-services.json` inside `android/app/`.
- For Apple Push Notification service (APNs) on iOS: Place `GoogleService-Info.plist` inside `ios/App/App/` and enable Push Notifications capability in Xcode.

---

## 📲 Method 2: Instant PWA Installation

The application also includes `manifest.json` and `sw.js` (Service Worker) pre-configured.
- **Android / Chrome**: Users tapping **GET APP** on the website will be prompted to install Best Films as a standalone app on their home screen without taking device storage space.
- **iOS / Safari**: Users can tap Share > **Add to Home Screen**.

---

## 🛡️ App Store & Google Play Publishing Requirements Checklist

- [x] Responsive layout optimized for mobile touch targets (44px+).
- [x] Offline Service Worker fallback (`/sw.js`).
- [x] Android Manifest (`manifest.json`) with standard icons.
- [x] Language Selection screen (Kinyarwanda & English).
- [x] Privacy Policy & Help page (`/help`).
- [x] Clean navigation tabs (Home, Search, Help, Account).
