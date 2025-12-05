chat-demo
=========

App objective
-------------
To build a simple chat app for mobile devices using React Native and Expo. The app provides a chat interface and supports sending images and location data. Conversations are stored online (Google Firebase / Firestore) and cached locally for offline reading.

User stories
------------
- As a new user, I can easily enter a chat room so I can quickly start talking to friends and family.
- As a user, I can send messages to exchange updates with others.
- As a user, I can send images from my library and take pictures to share what I'm doing.
- As a user, I can share my current location with friends via the chat.
- As a user, I can read my messages offline.
- As a user with a visual impairment, the app is compatible with a screen reader.

Key features
------------
- Entry screen to set user name and choose a background color for the chat screen.
- Chat screen showing conversation history, input field and send control.
- Send images from the image library and capture new pictures with the camera.
- Share location (sends a map view link or coordinates in chat).
- Conversations persisted in Google Firestore and cached locally for offline access.
- Anonymous Firebase Authentication.
- Chat UI implemented using `react-native-gifted-chat` (recommended).

Repository structure (important files)
-------------------------------------
- `App.js` — app root, Firebase initialization, navigation setup (`Stack.Navigator` with `Start` and `Chat`), and network status monitoring.
- `index.js` — Expo entry point (registers root component).
- `components/Start.js` — name + color selection screen with anonymous Firebase authentication.
- `components/Chat.js` — chat screen (messages list, input, custom actions, map view for location).
- `components/CustomActions.js` — custom action sheet component for picking images, taking photos, and sharing location.
- `babel.config.js` — Babel configuration with react-native-dotenv plugin for environment variables.
- `.env` — local environment variables (not committed).
- `assets/` — images and icons used by the app.
- `package.json` — project dependencies and scripts.

Prerequisites
-------------
Before setting up the project, ensure you have:
- **Node.js 18+** and npm (download from [nodejs.org](https://nodejs.org/))
- **Expo CLI** (optional but recommended): `npm install -g expo-cli`
- **Expo Go app** on your mobile device (available on iOS App Store and Google Play)
- A **Firebase account** (create one at [firebase.google.com](https://firebase.google.com))

For emulator/simulator testing:
- **iOS:** Xcode (Mac only) or use Expo Go on a physical device
- **Android:** Android Studio or Android emulator

Technical details & recommended packages
--------------------------------------
This project uses Expo and React Native. The following packages are installed and configured:

**Core dependencies:**
- `expo` ~54.0.25 (managed workflow)
- `react` 19.1.0 / `react-native` 0.81.5
- `@react-navigation/native` ^7.1.21 and `@react-navigation/native-stack` ^7.7.0
- `react-native-safe-area-context` ~5.6.0
- `react-native-screens` ~4.16.0

**Firebase & data:**
- `firebase` ^12.6.0 (Firebase JS SDK for Firestore, Storage, and Authentication)
- `@react-native-async-storage/async-storage` 2.2.0 (local message caching)
- `@react-native-community/netinfo` 11.4.1 (network state detection)

**Chat UI:**
- `react-native-gifted-chat` ^3.2.2 (chat interface)
- `@expo/react-native-action-sheet` (action sheet for custom actions)

**Media & location:**
- `expo-image-picker` ^17.0.9 (pick images from library and capture photos with camera)
- `expo-location` ^19.0.8 (read device location)
- `react-native-maps` (render map views for shared locations)

**Development tools:**
- `babel-preset-expo` ^54.0.7
- `react-native-dotenv` ^3.4.5 (environment variable injection via Babel)
- `react-native-reanimated` ^4.1.5 (animation library)

Setup & local development
-------------------------
1. Clone the repo and install dependencies:

```powershell
npm install
```

2. Create a `.env` file in the project root with your Firebase configuration:

```ini
FIREBASE_API_KEY=<your-api-key>
FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
FIREBASE_APP_ID=<your-app-id>
```

**Important:** The `.env` file is excluded from version control (`.gitignore`). Never commit Firebase secrets to the repository.

3. Set up Firebase (see "Firebase setup" below).

4. Start the Expo development server:

```powershell
npm start
```

This runs `expo start --tunnel`, which allows you to test on physical devices without requiring the same network connection as your dev machine. If `--tunnel` times out, the troubleshooting section below has alternatives.

5. Scan the QR code with the **Expo Go app** (iOS/Android) or use an emulator/simulator:
   - **Physical device:** Open Expo Go, tap "Scan QR Code", and scan the terminal QR code
   - **iOS Simulator:** Press `i` in the terminal
   - **Android Emulator:** Press `a` in the terminal

The app should load in a few seconds. If this is your first time, allow permission prompts for camera, location, and media library access.

Offline persistence & local cache
--------------------------------
- Firestore offers offline caching by default in web/mobile SDKs — you can also implement a local cache (e.g. AsyncStorage) to persist the latest message set and load it when the app is offline.
- The `react-native-gifted-chat` data source can be populated from the local cache first, then updated with remote Firestore messages when connectivity resumes.

Implementation notes (current repo):
- Messages are written to Firestore using `serverTimestamp()` so server time is authoritative.
- A local cache (AsyncStorage) is used to persist recent messages for offline reads. The cache stores ISO timestamps and the app restores them to JS `Date` objects on load.
- To avoid unbounded storage growth, the cache is capped to the most recent 200 messages.

Media (images) & location handling
---------------------------------
**Implementation (current repo):**
- **CustomActions component:** Provides an action sheet (+) button in the chat input field with options to:
  - Pick an image from the device library (`expo-image-picker`)
  - Take a photo with the camera (`expo-image-picker`)
  - Share current location (`expo-location`)
- **Image uploads:** Images are uploaded to Firebase Storage with unique reference paths (`images/{userID}-{timestamp}-{filename}`). The download URL is sent to the chat via `onSend()`.
- **Location sharing:** Uses `expo-location` to obtain coordinates (with user permission). Location data is sent as `{longitude, latitude}` and rendered as a MapView in the chat using `react-native-maps`.
- **Permissions:** The app requests and handles permissions for media library, camera, and location access. Users are alerted if permissions are denied.
- **Error handling:** All async operations (image upload, location fetch) include try/catch blocks with user-facing error alerts.

Firebase setup
--------------
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a new project
2. In the Firebase Console, enable these services:
   - **Firestore Database:** Click "Create Database" → Select "Start in test mode" (for development) → Choose your region
   - **Cloud Storage:** Click "Get Started" → Select the same region as Firestore
   - **Authentication:** Go to "Authentication" → Sign-in method → Enable "Anonymous"
3. Get your Firebase config credentials:
   - Go to Project Settings (gear icon) → General tab
   - Scroll down to "Your apps" and create a Web app if needed
   - Copy the configuration object (API Key, Project ID, Storage Bucket, etc.)
4. Create a `.env` file in your project root (see "Setup & local development" step 2)
5. Paste your Firebase credentials into the `.env` file

**Important:** For production, update your Firestore and Storage security rules to restrict access. Test-mode rules allow anyone to read/write—never use this in production.

**Architecture:**
- Firebase is initialized once at module scope in `App.js` using `initializeApp(firebaseConfig)`
- Firestore (`db`) and Storage (`storage`) instances are created and passed down through components
- Chat messages are stored in the `messages` collection with `serverTimestamp()` for consistent ordering
- Images are uploaded to `images/{userID}-{timestamp}-{filename}` in Firebase Storage

Security notes
--------------
- **Environment variables:** Firebase configuration is stored in `.env` (excluded from version control via `.gitignore`).
- **Firebase rules:** While developing, you may use test-mode rules for Firestore; before shipping, adjust security rules to ensure only authenticated users may read/write. Storage rules should protect uploads and validate file types/sizes.
- **Authentication:** The app uses Firebase Anonymous Authentication. Consider implementing additional authentication methods (email/password, OAuth) for production.
- **Best practices:** Never commit API keys or secrets to version control. Use environment variables and secure configuration management.

Accessibility
-------------
**Implementation (current repo):**
- All interactive components include accessibility props (`accessibilityLabel`, `accessibilityHint`, `accessibilityRole`) for screen reader compatibility.
- The CustomActions button is fully accessible with descriptive labels and hints.
- Input fields include accessibility labels and roles for proper screen reader announcements.
- Color contrast and font sizes are designed for readability (verify against WCAG guidelines for production).
- The app is compatible with VoiceOver (iOS) and TalkBack (Android) screen readers.

Styling & design
----------------
- The project includes a `Start` screen styled to match the provided design (title, input, color selection, bottom panel layout).
- Keep styles co-located with components for simplicity; if the app grows, extract shared styles or design tokens into a `styles/` or `constants/` module.

Commands
--------
- `npm start` — start Expo dev server
- `npm run ios` / `npm run android` — open app on simulator/device (if configured)

Troubleshooting
---------------
- **Tunnel timeout:** `npm start` uses `--tunnel` by default (configured in `package.json`). If it times out with "ngrok tunnel took too long to connect", try: `npx expo start --lan` (local network only) or check for VPN/firewall restrictions. For more info, see Expo's [connection guide](https://docs.expo.dev/guides/how-expo-works/#choosing-a-connection-type).
- **Network banners:** If you see unexpected behavior with network banners on startup, ensure your device/emulator and dev machine are on the same network and restart the Expo server.
- **Metro cache:** After changing native dependencies, installing new Expo packages, or modifying `babel.config.js`, run `npx expo start -c` to clear Metro's cache.
- **Environment variables not loading:** Ensure `.env` file exists in the project root and restart the Expo server after creating/modifying it.
- **Firebase errors:** Verify all Firebase configuration values in `.env` are correct and that Firestore Database, Storage, and Anonymous Authentication are enabled in the Firebase Console.
- **Permission errors:** Test on a physical device if emulator/simulator permission dialogs don't appear correctly.

Environment (.env)
------------------
**The app uses `react-native-dotenv` for environment variable management.**

For the `.env` file format and required variables, see "Setup & local development" step 2 above.

**Configuration:**
- Environment variables are injected at build time via the `react-native-dotenv` Babel plugin (configured in `babel.config.js`).
- Variables are imported using `import { VARIABLE_NAME } from '@env'`.
- The `.env` file is excluded from version control (`.gitignore`).

**Important:** Do not commit `.env` or real API keys to source control. Keep secrets secure and follow best practices for storing production keys.

Contributing
------------
- Keep changes small and focused.
- Add comments describing non-obvious implementation choices (the codebase already contains comments in main components).

License
-------
This project template is provided as-is for development and learning. Add a license file (`LICENSE`) if you intend to open-source the project.
