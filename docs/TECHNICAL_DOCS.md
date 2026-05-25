# FitPulse: Technical Documentation & API Structure

## 1. System Architecture
FitPulse is an **Offline-First Progressive Web App (PWA)** built on a Vanilla Web Stack connected to Firebase ecosystem services.

### 1.1 Tech Stack
*   **Frontend UI:** Vanilla HTML5, CSS3 (Custom Properties for Theming). No frontend UI frameworks (React/Vue) to ensure absolute minimum bundle size and maximum load speed in low-bandwidth environments.
*   **Frontend Logic:** Vanilla JavaScript (ES6+).
*   **Authentication:** Firebase Auth (Google OAuth 2.0 Provider).
*   **Database:** Cloud Firestore (NoSQL Document Database).
*   **Offline Capabilities:** Service Workers (`sw.js`), Web App Manifest, and Firestore Offline Persistence.

### 1.2 Data Flow & Offline Strategy
1.  **Read:** On load, the app immediately checks `localStorage` and IndexedDB (via Firestore Persistence) for instant data hydration. Any active network connection silently updates the cache in the background.
2.  **Write:** User actions (logging a set) write immediately to the local UI state and local storage.
3.  **Sync:** Changes are pushed to Firestore. If offline, Firestore queues the mutation and executes it automatically upon `navigator.onLine == true`.

---

## 2. Feature Implementations

### 2.1 PWA (Progressive Web App)
- **`manifest.json`**: Declares standalone `display` mode, theme colors, and varied icon dimensions (`192x192`, `512x512`) required for iOS/Android home screen installation.
- **`sw.js` (Service Worker)**: Intercepts network requests. Uses a Cache-First strategy for static assets (fonts, images, JS, CSS) to ensure the app functions perfectly when launched without the internet.

### 2.2 Smart Autocomplete Dropdown
- Deprecated native `<datalist>` in favor of a custom absolute-positioned `div` (`#exercise-dropdown`).
- Features a real-time fuzzy filter combining `WORKOUT_PRESETS` (120+ built-ins) and `customExercises` (Cloud synced). 
- Captures `keydown` events (`ArrowUp`, `ArrowDown`, `Enter`) for full keyboard navigation and auto-advances form focus to the next logical input.

### 2.3 Theming Strategy
- Uses CSS Variables (`:root`). 
- **Light Mode:** Default variables map to high-contrast whites and grays.
- **Dark Mode:** A `[data-theme="dark"]` attribute is appended to `document.documentElement`, overriding the `:root` variables.
- User preference is saved to `localStorage('fitpulse_theme')` for instant application before DOM render avoiding FOUC (Flash of Unstyled Content).

### 2.4 HTML5 Canvas Export
- Translates dynamic HTML metrics into a shareable asset using the `<canvas>` API.
- Generates a branded layout detailing user statistics.
- Utilizes `navigator.share()` (Web Share API) to pass the generated BLOB directly to native OS intents (Instagram Stories, Messages).

### 2.5 AI Set Scanner
- **Camera Access:** Uses standard HTML5 file inputs with `accept="image/*"` and `capture="environment"` to trigger the native camera interface in standalone PWAs across iOS and Android.
- **Canvas Image Compression:** Compresses image inputs on-the-fly using the HTML5 Canvas API, resizing to a maximum of 800px on either side and iteratively lowering the WebP quality parameter until the base64-encoded output size is under 100KB.
- **Client/Server Cache Synchronization:** Generates an FNV-1a hash of the compressed base64 image data to check both an in-memory session cache Map and a Firestore `scanCache` collection, preventing redundant Cloud Function and Claude API calls.
- **Dual-Model Fallback Proxy:** Implements a Firebase Cloud Function that proxies image requests securely to Anthropic. If the cheaper Claude Haiku v4.5 fails to return a parseable JSON schema or encounters a vision error, the function transparently falls back to Claude Sonnet v4.6.

---

## 3. Database Schema & API Reference (Firestore)

All user data is siloed under the `users/{userId}` path securely.

### 3.1 `users/{userId}` (Root Profile)
Maintains high-level settings and health data.
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "photoURL": "https://...",
  "age": 25,
  "gender": "Male",
  "weight": 70.5,
  "height": 175,
  "lastLogin": "timestamp",
  "settings": {
    "weightUnit": "kg"
  }
}
```

### 3.2 `users/{userId}/sessions/{sessionId}`
Logs of completed workouts. Used extensively by the gamification engine to retroactively grant badges.
```json
{
  "id": 1678523423400,
  "timestamp": "serverTimestamp()",
  "date": "2026-03-11",
  "duration": 3600000, 
  "totalVolume": 10500,
  "exerciseCount": 6,
  "muscleGroups": ["chest", "tricep"],
  "exercises": [
    {
      "name": "Bench Press",
      "weight": 80,
      "reps": 8,
      "sets": 4,
      "notes": "Felt good",
      "scan": {
        "confidence": 0.92,
        "model": "claude-haiku-4-5",
        "exerciseOverride": false,
        "weightOverride": true,
        "scanSessionId": "hash123"
      }
    }
  ]
}
```

### 3.3 `users/{userId}/records/{exerciseName}`
Tracks the ultimate high scores for any given movement.
```json
{
  "bestWeight": 100,
  "bestVolume": 4000,
  "lastPerformed": 1678523423400,
  "totalSessions": 12
}
```

### 3.4 `users/{userId}/routines/{routineId}`
User-created workout templates.
```json
{
  "id": 1678523423400,
  "name": "Hari Dada (Push Day)",
  "exercises": [
    { "name": "Bench Press", "sets": 4, "reps": 8, "weight": 80 },
    { "name": "Incline Dumbbell Press", "sets": 3, "reps": 10, "weight": 30 }
  ]
}
```

### 3.5 `users/{userId}/scanCache/{imageHash}`
Stores caching information for image analysis results to reduce Cloud Function billing.
```json
{
  "imageHash": "abc123hash",
  "exercise": "Lat Pulldown (Wide bar)",
  "weight_kg": 45,
  "confidence": 0.92,
  "model": "claude-haiku-4-5",
  "createdAt": "serverTimestamp()",
  "expiresAt": "Timestamp(serverTimestamp() + 90min)",
  "hitCount": 2
}
```

---

## 4. Key JavaScript APIs (`app.js` & `firebase-config.js`)

*   `signInWithGoogle()`: Invokes Firebase Google Auth provider popup.
*   `updateHealthProfile(healthData)`: Merges `{ age, weight, height, gender }` into the root profile document.
*   `saveSessionToCloud(session)`: Pushes a completed workout and simultaneously loops through session exercises to trigger `updatePersonalRecord(exercise, currentWeight)`.
*   `loadSessionsFromCloud()`: Fetches the last 50 workout history documents on boot for UI population and badge calculation.
*   `setupThemeToggle()`: Injected UI hook for live DOM mutation between Light/Dark variants.
*   `renderFlexCanvas()`: The 2D rendering engine construct stringing UI text into rasterized pixels for export.
*   `setupScanner()`: Inits camera/modal hooks, file-upload listeners, step navigation flow, and result confirmation UI.
*   `compressImage(file)`: Compresses user-captured images utilizing HTML Canvas, downscaling dimensions (max 800px) and iteratively reducing quality parameter to force output size `<100KB` WebP.
*   `fnvHash(str)`: Generates an 8-character FNV-1a hash key from image data base64 string to check cache entries.
*   `callIdentifyWorkout(photo1Base64, photo2Base64, imageHash)`: Front-end wrapper calling the v2 `identifyWorkoutSet` Firebase Cloud Function.

