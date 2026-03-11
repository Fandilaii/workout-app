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
      "notes": "Felt good"
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

---

## 4. Key JavaScript APIs (`app.js` & `firebase-config.js`)

*   `signInWithGoogle()`: Invokes Firebase Google Auth provider popup.
*   `updateHealthProfile(healthData)`: Merges `{ age, weight, height, gender }` into the root profile document.
*   `saveSessionToCloud(session)`: Pushes a completed workout and simultaneously loops through session exercises to trigger `updatePersonalRecord(exercise, currentWeight)`.
*   `loadSessionsFromCloud()`: Fetches the last 50 workout history documents on boot for UI population and badge calculation.
*   `setupThemeToggle()`: Injected UI hook for live DOM mutation between Light/Dark variants.
*   `renderFlexCanvas()`: The 2D rendering engine construct stringing UI text into rasterized pixels for export.
