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
- `App.js` — app root and navigation setup (`Stack.Navigator` with `Start` and `Chat`).
- `index.js` — Expo entry point (registers root component).
- `components/Start.js` — name + color selection screen.
- `components/Chat.js` — chat screen (messages list, input, media/location controls).
- `assets/` — images and icons used by the app.
- `package.json` — project dependencies and scripts.

Technical details & recommended packages
--------------------------------------
This project uses Expo and React Native. The following packages are recommended (install as needed):

- `expo` (managed workflow)
- `react` / `react-native`
- `@react-navigation/native` and `@react-navigation/native-stack`
- `react-native-safe-area-context`
- `firebase` (Firebase JS SDK)
- `react-native-gifted-chat` (chat UI)
- `expo-image-picker` (pick images from library)
- `expo-camera` (capture photos)
- `expo-location` (read device location)
- `@react-native-async-storage/async-storage` (local caching)
- `react-native-maps` or use a web map view for location sharing

Setup & local development
-------------------------
1. Clone the repo and install dependencies:

```powershell
npm install
```

2. Install additional libraries your app uses (example):

```powershell
npm install firebase react-native-gifted-chat @react-native-async-storage/async-storage
expo install expo-image-picker expo-camera expo-location react-native-safe-area-context
```

3. Configure Firebase (see "Firebase setup" below).

4. Start the Expo development server:

```powershell
npm start
# or
npx expo start
```

Offline persistence & local cache
--------------------------------
- Firestore offers offline caching by default in web/mobile SDKs — you can also implement a local cache (e.g. AsyncStorage) to persist the latest message set and load it when the app is offline.
- The `react-native-gifted-chat` data source can be populated from the local cache first, then updated with remote Firestore messages when connectivity resumes.

Media (images) & location handling
---------------------------------
- Use `expo-image-picker` or `expo-camera` to let users pick or capture images.
- Upload images to Firebase Storage and send the download URL as part of the message object stored in Firestore.
- Use `expo-location` to obtain coordinates (with user permission), then send either a map link or a small map snapshot. Consider using `react-native-maps` to render an inline map view.

Security notes
--------------
- While developing you may use test-mode rules for Firestore; before shipping adjust security rules to ensure only authenticated users may read/write and storage rules protect uploads.
- Never commit Firebase secrets (API keys in plain git) to a public repo. Use environment variables or a protected configuration mechanism.

Accessibility
-------------
- Components should include accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`) so screen readers can announce UI controls.
- Use semantic elements, readable font sizes, and sufficient color contrast (the design colours are applied but verify contrast for readability).

Styling & design
----------------
- The project includes a `Start` screen styled to match the provided design (title, input, color selection, bottom panel layout).
- Keep styles co-located with components for simplicity; if the app grows, extract shared styles or design tokens into a `styles/` or `constants/` module.

Commands
--------
- `npm start` — start Expo dev server
- `npm run ios` / `npm run android` — open app on simulator/device (if configured)

Contributing
------------
- Keep changes small and focused.
- Add comments describing non-obvious implementation choices (the codebase already contains comments in main components).

License
-------
This project template is provided as-is for development and learning. Add a license file (`LICENSE`) if you intend to open-source the project.
