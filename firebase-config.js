/* =============================================
   FitPulse — Firebase Configuration
   ============================================= */

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAjojHSjlz0emRVHgjiarOso0wdaxVUh3s",
    authDomain: "gymrecord-69953.firebaseapp.com",
    projectId: "gymrecord-69953",
    storageBucket: "gymrecord-69953.firebasestorage.app",
    messagingSenderId: "281452603014",
    appId: "1:281452603014:web:d15c2f7a0dc1879a801307",
    measurementId: "G-QLPFNYNB4F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ===== AUTH FUNCTIONS =====
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        showToast(`Welcome, ${result.user.displayName}! 👋`, 'success');
        return result.user;
    } catch (error) {
        console.error('Sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-in cancelled', 'error');
        } else {
            showToast('Sign-in failed. Try again.', 'error');
        }
        return null;
    }
}

async function signOutUser() {
    try {
        await auth.signOut();
        showToast('Signed out ✌️', 'success');
    } catch (error) {
        console.error('Sign-out error:', error);
    }
}

function getCurrentUser() {
    return auth.currentUser;
}

// ===== FIRESTORE FUNCTIONS =====

// Save a completed workout to Firestore
async function saveWorkoutToCloud(workout) {
    const user = getCurrentUser();
    if (!user) return false;

    try {
        await db.collection('users').doc(user.uid)
            .collection('workouts').doc(String(workout.id))
            .set(workout);
        return true;
    } catch (error) {
        console.error('Save workout error:', error);
        return false;
    }
}

// Load all workouts from Firestore
async function loadWorkoutsFromCloud() {
    const user = getCurrentUser();
    if (!user) return null;

    try {
        const snapshot = await db.collection('users').doc(user.uid)
            .collection('workouts')
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Load workouts error:', error);
        return null;
    }
}

// Delete a workout from Firestore
async function deleteWorkoutFromCloud(workoutId) {
    const user = getCurrentUser();
    if (!user) return false;

    try {
        await db.collection('users').doc(user.uid)
            .collection('workouts').doc(String(workoutId))
            .delete();
        return true;
    } catch (error) {
        console.error('Delete workout error:', error);
        return false;
    }
}

// Sync localStorage workouts to Firestore (first-time migration)
async function syncLocalToCloud() {
    const user = getCurrentUser();
    if (!user) return;

    const localWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts')) || [];
    if (localWorkouts.length === 0) return;

    const cloudWorkouts = await loadWorkoutsFromCloud();
    if (cloudWorkouts && cloudWorkouts.length > 0) return; // Already has cloud data

    // Migrate local data to cloud
    const batch = db.batch();
    localWorkouts.forEach(workout => {
        const ref = db.collection('users').doc(user.uid)
            .collection('workouts').doc(String(workout.id));
        batch.set(ref, workout);
    });

    try {
        await batch.commit();
        console.log(`Migrated ${localWorkouts.length} workouts to cloud`);
    } catch (error) {
        console.error('Migration error:', error);
    }
}
