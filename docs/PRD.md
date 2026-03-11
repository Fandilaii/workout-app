# Product Requirements Document (PRD): FitPulse 🇮🇩

## 1. Meta / Overview
**Product Name:** FitPulse
**Platform:** Mobile-First Progressive Web App (PWA)
**Target Market:** Indonesia (inclusive of local *tempat gym* and mega-gyms)
**Status:** In Development (Phase 4 Completed)
**Primary Objective:** To become the #1 social fitness companion in Indonesia by bridging the gap between rigorous workout tracking and gamified, highly shareable social experiences, all while functioning perfectly in poor network conditions.

## 2. Problem Statement
The Indonesian fitness market is highly social and rapidly growing, yet it is underserved by existing western-centric fitness apps. Key problems include:
1.  **Poor Connectivity:** Many local gyms (especially in mall basements or rural areas) suffer from terrible cell reception. Cloud-only apps fail to save workouts.
2.  **Lack of Flexibility:** Routine tracking apps force users into rigid exercise databases that do not match the diverse layout of equipment in local gyms.
3.  **Missing Social Friction:** Gym-goers love to share progress ("flex"), but existing apps only allow boring spreadsheet-like screenshots on Instagram Stories. 

## 3. Goals & Success Metrics
**Business Goals:**
*   Achieve strong Product-Market Fit (PMF) in the Indonesian demographic.
*   Drive viral user acquisition through seamless social sharing capabilities.

**Product Goals:**
*   **Zero-Friction Logging:** A user should be able to log a set in under 3 seconds.
*   **100% Offline Reliability:** No data loss, ever, regardless of internet connection.
*   **Gamified Retention:** Keep users coming back via visual progress and unlockable milestone badges.

**KPIs (Key Performance Indicators):**
*   **W1/W4 Retention:** Percentage of users logging a workout in week 1 and week 4.
*   **Viral Coefficient (k-factor):** Driven by the "Share to IG Story" feature.
*   **Offline Action Rate:** Number of workouts logged while offline (measuring the usefulness of the offline architecture).

## 4. Target Audience (Personas)
*   **The Content Creator (Budi):** 24 years old. Goes to a commercial gym. Motivates himself by sharing his post-workout pump on IG Stories. Needs aesthetic summaries.
*   **The Local Lifter (Arief):** 28 years old. Works out at a hardcore garage gym (*tempat gym besi*). Reception is zero. Needs offline capabilities and custom exercise entries because machines are DIY.
*   **The Data Nerd (Siska):** 30 years old. Tracks every millimeter of progress. Needs the "Trophy Room" to see her Squat 1RM trend map.

## 5. Core Features (Scope & Requirements)

### 5.1 Registration & Authentication
*   **Google SSO:** One-tap sign-in. No password fatigue.
*   **Account Portability:** Health data (Age, Weight, Height, Gender) and workouts sync securely to the cloud.

### 5.2 The Logging Engine (Core Loop)
*   **Smart Autocomplete:** A highly interactive dropdown instantly filtering 120+ built-in exercises.
*   **Custom Environments:** Users can type custom exercises (e.g., "Besi Tua Chest Press") and it saves locally and to the cloud for future autocomplete.
*   **My Routines:** Users can group a session of exercises into a template (e.g., "Hari Dada") for 1-tap loading on their next visit.

### 5.3 Offline-First Architecture (PWA)
*   **Service Worker:** Caches HTML, CSS, fonts, and JS. The app shell loads instantly.
*   **Firestore Persistence:** `enablePersistence()` allows the database to queue offline writes and seamlessly sync them when an internet connection is re-established.
*   **Installable:** Prompts the user to "Add to Home Screen" on iOS/Android.

### 5.4 Gamification: The Trophy Room
*   **The Big 3 Board:** Automatic tracking and highlighting of Personal Records (PRs) for Bench Press, Squat, and Deadlift.
*   **Volume Milestones:** Badges awarded retroactively based on aggregated volume (e.g., 10,000kg lifted club).
*   **Consistency Badges:** Streak tracking to encourage daily/weekly habit formation.

### 5.5 Social Integration (The Flex Canvas)
*   **End Workout Generator:** Upon finishing, the app dynamically renders an HTML Canvas showing statistics (Total Volume, Duration, PRs hit).
*   **Web Share API:** Passes the rendered image directly to Instagram Stories or WhatsApp with native OS share sheets.
*   **Branding:** Forces FitPulse watermarks on all shared images for organic growth.

### 5.6 Theming & Accessibility
*   **Light Mode Default:** High contrast, glare-resistant UI for well-lit open-air gyms.
*   **Dark Mode Toggle:** A persistent user preference stored in `localStorage` for night sessions.

## 6. Future Roadmap (Phase 5+)
*   **Social Leaderboards:** Compare Total Volume lifted this month with friends.
*   **Rest Timer Notifications:** Web Push APIs to alert the user when their 90-second rest is over, even if the app is backgrounded.
*   **AI Analytics:** Basic insights ("Your chest volume dropped 20% this week. Try adding an isolation movement.")

## 7. Dependencies & Constraints
*   **Database:** Firebase Firestore (NoSQL) is the backbone. Security rules must aggressively protect `users/{uid}/...` paths.
*   **Hosting:** GitHub Pages / Vercel (Must support HTTPS for PWA and Web Share APIs).
*   **Browser Support:** Web Share API functionality is dependent on iOS Safari / Chrome Android mobile environments. Fallbacks (Download Image) must remain intact for desktop.
