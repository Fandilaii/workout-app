/* =============================================
   FitPulse — Firebase Configuration & Database
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

// Enable robust offline persistence for the PWA
db.enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          console.warn('Multiple tabs open, online persistence can only be enabled in one tab at a a time.');
      } else if (err.code == 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence.');
      }
  });

// =============================================
//   AUTH FUNCTIONS
// =============================================

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

// Helper to get user doc ref
function userRef() {
    const user = getCurrentUser();
    return user ? db.collection('users').doc(user.uid) : null;
}

// =============================================
//   USER PROFILE
// =============================================

async function saveUserProfile(user) {
    const ref = userRef();
    if (!ref) return;

    try {
        await ref.set({
            name: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            settings: {
                weightUnit: 'kg',
            }
        }, { merge: true });
    } catch (error) {
        console.error('Save profile error:', error);
    }
}

async function getUserSettings() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const doc = await ref.get();
        return doc.exists ? (doc.data().settings || {}) : {};
    } catch (error) {
        console.error('Get settings error:', error);
        return {};
    }
}

async function updateUserSettings(settings) {
    const ref = userRef();
    if (!ref) return;

    try {
        await ref.set({ settings }, { merge: true });
    } catch (error) {
        console.error('Update settings error:', error);
    }
}

// =============================================
//   WORKOUT SESSIONS (History)
// =============================================
//   Structure:
//   sessions/{sessionId}: {
//     id, date, timestamp,
//     exercises: [{ name, weight, reps, sets, notes }],
//     exerciseCount, totalVolume, duration (ms)
//   }

async function saveSessionToCloud(session) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('sessions').doc(String(session.id)).set(session);
        return true;
    } catch (error) {
        console.error('Save session error:', error);
        return false;
    }
}

async function loadSessionsFromCloud() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const snapshot = await ref.collection('sessions')
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Load sessions error:', error);
        return null;
    }
}

async function deleteSessionFromCloud(sessionId) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('sessions').doc(String(sessionId)).delete();
        return true;
    } catch (error) {
        console.error('Delete session error:', error);
        return false;
    }
}

// =============================================
//   FAVORITES
// =============================================
//   Structure:
//   favorites/{exerciseName}: {
//     name, icon, group, addedAt
//   }

async function addFavoriteToCloud(exercise) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('favorites').doc(exercise.name).set({
            name: exercise.name,
            icon: exercise.icon,
            group: exercise.group,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Add favorite error:', error);
        return false;
    }
}

async function removeFavoriteFromCloud(exerciseName) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('favorites').doc(exerciseName).delete();
        return true;
    } catch (error) {
        console.error('Remove favorite error:', error);
        return false;
    }
}

async function loadFavoritesFromCloud() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const snapshot = await ref.collection('favorites').get();
        return snapshot.docs.map(doc => doc.data().name);
    } catch (error) {
        console.error('Load favorites error:', error);
        return null;
    }
}

// =============================================
//   CUSTOM EXERCISES
// =============================================
//   Structure:
//   custom_exercises/{exerciseId}: {
//     id, name, group, addedAt
//   }

async function addCustomExerciseToCloud(exercise) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('custom_exercises').doc(String(exercise.id)).set({
            ...exercise,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Add custom exercise error:', error);
        return false;
    }
}

async function loadCustomExercisesFromCloud() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const snapshot = await ref.collection('custom_exercises').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Load custom exercises error:', error);
        return null;
    }
}

async function removeCustomExerciseFromCloud(id) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('custom_exercises').doc(String(id)).delete();
        return true;
    } catch (error) {
        console.error('Delete custom exercise error:', error);
        return false;
    }
}

// =============================================
//   ROUTINES / TEMPLATES
// =============================================
//   Structure:
//   routines/{routineId}: {
//     id, name, exercises: [{name, reps, sets}], addedAt
//   }

async function saveRoutineToCloud(routine) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('routines').doc(String(routine.id)).set({
            ...routine,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Save routine error:', error);
        return false;
    }
}

async function loadRoutinesFromCloud() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const snapshot = await ref.collection('routines').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Load routines error:', error);
        return null;
    }
}

async function deleteRoutineFromCloud(id) {
    const ref = userRef();
    if (!ref) return false;

    try {
        await ref.collection('routines').doc(String(id)).delete();
        return true;
    } catch (error) {
        console.error('Delete routine error:', error);
        return false;
    }
}

// =============================================
//   PERSONAL RECORDS
// =============================================
//   Structure:
//   records/{exerciseName}: {
//     name,
//     bestWeight, bestWeightDate,
//     bestVolume, bestVolumeDate,
//     lastPerformed, totalSessions
//   }

async function updatePersonalRecord(exercise) {
    const ref = userRef();
    if (!ref) return;

    const docRef = ref.collection('records').doc(exercise.name);

    try {
        const doc = await docRef.get();
        const volume = exercise.weight * exercise.reps * exercise.sets;
        const today = new Date().toISOString().split('T')[0];

        if (doc.exists) {
            const data = doc.data();
            const updates = {
                lastPerformed: today,
                totalSessions: (data.totalSessions || 0) + 1
            };

            if (exercise.weight > (data.bestWeight || 0)) {
                updates.bestWeight = exercise.weight;
                updates.bestWeightDate = today;
            }
            if (volume > (data.bestVolume || 0)) {
                updates.bestVolume = volume;
                updates.bestVolumeDate = today;
            }

            await docRef.update(updates);
        } else {
            await docRef.set({
                name: exercise.name,
                bestWeight: exercise.weight,
                bestWeightDate: today,
                bestVolume: volume,
                bestVolumeDate: today,
                lastPerformed: today,
                totalSessions: 1
            });
        }
    } catch (error) {
        console.error('Update PR error:', error);
    }
}

async function loadPersonalRecords() {
    const ref = userRef();
    if (!ref) return null;

    try {
        const snapshot = await ref.collection('records').get();
        const records = {};
        snapshot.docs.forEach(doc => {
            records[doc.id] = doc.data();
        });
        return records;
    } catch (error) {
        console.error('Load PRs error:', error);
        return null;
    }
}

// =============================================
//   MIGRATION (localStorage -> Firestore)
// =============================================

async function syncLocalToCloud() {
    const user = getCurrentUser();
    if (!user) return;

    // Save profile
    await saveUserProfile(user);

    // Migrate workout sessions
    const localWorkouts = JSON.parse(localStorage.getItem('fitpulse_workouts')) || [];
    if (localWorkouts.length === 0) return;

    const cloudSessions = await loadSessionsFromCloud();
    if (cloudSessions && cloudSessions.length > 0) return; // already migrated

    const batch = db.batch();
    localWorkouts.forEach(workout => {
        // Add computed fields if missing
        if (!workout.exerciseCount) {
            workout.exerciseCount = workout.exercises ? workout.exercises.length : 0;
        }
        if (!workout.totalVolume) {
            workout.totalVolume = (workout.exercises || []).reduce((sum, ex) => {
                return sum + (ex.weight * ex.reps * ex.sets);
            }, 0);
        }

        const docRef = userRef().collection('sessions').doc(String(workout.id));
        batch.set(docRef, workout);
    });

    try {
        await batch.commit();
        console.log(`Migrated ${localWorkouts.length} sessions to cloud`);
    } catch (error) {
        console.error('Migration error:', error);
    }
}

// Backwards-compat aliases
const saveWorkoutToCloud = saveSessionToCloud;
const loadWorkoutsFromCloud = loadSessionsFromCloud;
const deleteWorkoutFromCloud = deleteSessionFromCloud;
