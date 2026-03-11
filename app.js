/* =============================================
   FitPulse — Application Logic
   ============================================= */

// ===== STORAGE KEYS =====
const STORAGE_KEY = 'fitpulse_workouts';
const TODAY_KEY = 'fitpulse_today';
const FAVORITES_KEY = 'fitpulse_favorites';

// ===== WORKOUT PRESETS (with muscle groups) =====
const WORKOUT_PRESETS = [
    // Chest
    { name: 'Barbell Bench Press', icon: '🏋️', group: 'chest', defaultWeight: 60, defaultReps: 8, defaultSets: 3 },
    { name: 'Dumbbell Bench Press', icon: '✊', group: 'chest', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Incline Barbell Bench', icon: '📐', group: 'chest', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Incline Dumbbell Press', icon: '📐', group: 'chest', defaultWeight: 18, defaultReps: 10, defaultSets: 3 },
    { name: 'Decline Bench Press', icon: '↘️', group: 'chest', defaultWeight: 50, defaultReps: 10, defaultSets: 3 },
    { name: 'Machine Chest Press', icon: '🤖', group: 'chest', defaultWeight: 40, defaultReps: 12, defaultSets: 3 },
    { name: 'Dumbbell Flyes', icon: '🦅', group: 'chest', defaultWeight: 12, defaultReps: 12, defaultSets: 3 },
    { name: 'Cable Crossover', icon: '❌', group: 'chest', defaultWeight: 15, defaultReps: 15, defaultSets: 3 },
    { name: 'Pec Deck Machine', icon: '🦋', group: 'chest', defaultWeight: 30, defaultReps: 12, defaultSets: 3 },
    { name: 'Push-ups', icon: '🫸', group: 'chest', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Weighted Push-ups', icon: '🎒', group: 'chest', defaultWeight: 10, defaultReps: 10, defaultSets: 3 },
    { name: 'Chest Dips', icon: '⬇️', group: 'chest', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    { name: 'Dumbbell Pullover', icon: '⬆️', group: 'chest', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Svend Press', icon: '🙌', group: 'chest', defaultWeight: 10, defaultReps: 15, defaultSets: 3 },

    // Back
    { name: 'Deadlift', icon: '💀', group: 'back', defaultWeight: 100, defaultReps: 5, defaultSets: 3 },
    { name: 'Romanian Deadlift (RDL)', icon: '🏋️', group: 'back', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    { name: 'Pull-ups', icon: '💪', group: 'back', defaultWeight: 0, defaultReps: 8, defaultSets: 3 },
    { name: 'Weighted Pull-ups', icon: '⛓️', group: 'back', defaultWeight: 10, defaultReps: 5, defaultSets: 3 },
    { name: 'Chin-ups', icon: '✊', group: 'back', defaultWeight: 0, defaultReps: 8, defaultSets: 3 },
    { name: 'Lat Pulldown (Wide bar)', icon: '⬇️', group: 'back', defaultWeight: 45, defaultReps: 10, defaultSets: 3 },
    { name: 'Lat Pulldown (Close grip)', icon: '👐', group: 'back', defaultWeight: 45, defaultReps: 10, defaultSets: 3 },
    { name: 'Barbell Row', icon: '🚣', group: 'back', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Dumbbell Row', icon: '🛶', group: 'back', defaultWeight: 22, defaultReps: 10, defaultSets: 3 },
    { name: 'T-Bar Row', icon: '🛤️', group: 'back', defaultWeight: 40, defaultReps: 10, defaultSets: 3 },
    { name: 'Pendlay Row', icon: '💥', group: 'back', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Seated Cable Row', icon: '🚣‍♂️', group: 'back', defaultWeight: 40, defaultReps: 12, defaultSets: 3 },
    { name: 'Straight Arm Pulldown', icon: '📏', group: 'back', defaultWeight: 20, defaultReps: 15, defaultSets: 3 },
    { name: 'Good Mornings', icon: '☀️', group: 'back', defaultWeight: 40, defaultReps: 10, defaultSets: 3 },
    { name: 'Back Extension (Hyperextension)', icon: '🔙', group: 'back', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Barbell Shrugs', icon: '🤷', group: 'back', defaultWeight: 60, defaultReps: 15, defaultSets: 3 },
    { name: 'Dumbbell Shrugs', icon: '🤷‍♂️', group: 'back', defaultWeight: 26, defaultReps: 15, defaultSets: 3 },

    // Leg
    { name: 'Barbell Back Squat', icon: '🦵', group: 'leg', defaultWeight: 80, defaultReps: 8, defaultSets: 4 },
    { name: 'Front Squat', icon: '🦵', group: 'leg', defaultWeight: 60, defaultReps: 8, defaultSets: 3 },
    { name: 'Goblet Squat', icon: '🍷', group: 'leg', defaultWeight: 24, defaultReps: 12, defaultSets: 3 },
    { name: 'Leg Press', icon: '🦿', group: 'leg', defaultWeight: 120, defaultReps: 10, defaultSets: 3 },
    { name: 'Hack Squat', icon: '🎢', group: 'leg', defaultWeight: 80, defaultReps: 10, defaultSets: 3 },
    { name: 'Bulgarian Split Squat', icon: '🇧🇬', group: 'leg', defaultWeight: 16, defaultReps: 10, defaultSets: 3 },
    { name: 'Walking Lunges', icon: '🚶‍♀️', group: 'leg', defaultWeight: 12, defaultReps: 12, defaultSets: 3 },
    { name: 'Reverse Lunges', icon: '⏪', group: 'leg', defaultWeight: 16, defaultReps: 10, defaultSets: 3 },
    { name: 'Leg Extension', icon: '💺', group: 'leg', defaultWeight: 40, defaultReps: 15, defaultSets: 3 },
    { name: 'Lying Leg Curl', icon: '🛏️', group: 'leg', defaultWeight: 35, defaultReps: 12, defaultSets: 3 },
    { name: 'Seated Leg Curl', icon: '🪑', group: 'leg', defaultWeight: 40, defaultReps: 12, defaultSets: 3 },
    { name: 'Barbell Hip Thrust', icon: '🍑', group: 'leg', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    { name: 'Glute Bridge', icon: '🌉', group: 'leg', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Standing Calf Raise', icon: '🦶', group: 'leg', defaultWeight: 40, defaultReps: 15, defaultSets: 3 },
    { name: 'Seated Calf Raise', icon: '🪑', group: 'leg', defaultWeight: 30, defaultReps: 15, defaultSets: 3 },
    { name: 'Hip Abductor Machine', icon: '↔️', group: 'leg', defaultWeight: 35, defaultReps: 15, defaultSets: 3 },
    { name: 'Hip Adductor Machine', icon: '➡️', group: 'leg', defaultWeight: 35, defaultReps: 15, defaultSets: 3 },

    // Biceps
    { name: 'Standing Barbell Curl', icon: '🏋️', group: 'bicep', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'EZ Bar Curl', icon: '〰️', group: 'bicep', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Dumbbell Curl', icon: '💪', group: 'bicep', defaultWeight: 12, defaultReps: 10, defaultSets: 3 },
    { name: 'Hammer Curl', icon: '🔨', group: 'bicep', defaultWeight: 10, defaultReps: 10, defaultSets: 3 },
    { name: 'Preacher Curl', icon: '🛐', group: 'bicep', defaultWeight: 15, defaultReps: 10, defaultSets: 3 },
    { name: 'Incline Dumbbell Curl', icon: '📐', group: 'bicep', defaultWeight: 10, defaultReps: 12, defaultSets: 3 },
    { name: 'Concentration Curl', icon: '🤔', group: 'bicep', defaultWeight: 10, defaultReps: 12, defaultSets: 3 },
    { name: 'Cable Bicep Curl', icon: '⚡', group: 'bicep', defaultWeight: 20, defaultReps: 12, defaultSets: 3 },
    { name: 'Reverse Barbell Curl', icon: '🔄', group: 'bicep', defaultWeight: 15, defaultReps: 12, defaultSets: 3 },
    { name: 'Zottman Curl', icon: '🎭', group: 'bicep', defaultWeight: 10, defaultReps: 10, defaultSets: 3 },

    // Triceps
    { name: 'Tricep Rope Pushdown', icon: '⬇️', group: 'tricep', defaultWeight: 20, defaultReps: 12, defaultSets: 3 },
    { name: 'Straight Bar Pushdown', icon: '➖', group: 'tricep', defaultWeight: 25, defaultReps: 12, defaultSets: 3 },
    { name: 'Skull Crushers (EZ Bar)', icon: '💀', group: 'tricep', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Close-Grip Bench Press', icon: '👐', group: 'tricep', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Overhead Dumbbell Extension', icon: '🙆', group: 'tricep', defaultWeight: 16, defaultReps: 10, defaultSets: 3 },
    { name: 'Dumbbell Kickback', icon: '🥾', group: 'tricep', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Tricep Dips (Bench)', icon: '🪑', group: 'tricep', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Parallel Bar Tricep Dips', icon: '🟰', group: 'tricep', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    { name: 'Cable Overhead Extension', icon: '⚡', group: 'tricep', defaultWeight: 15, defaultReps: 12, defaultSets: 3 },

    // Shoulders
    { name: 'Overhead Barbell Press', icon: '🙆‍♂️', group: 'shoulder', defaultWeight: 40, defaultReps: 8, defaultSets: 3 },
    { name: 'Dumbbell Shoulder Press', icon: '🏋️‍♂️', group: 'shoulder', defaultWeight: 16, defaultReps: 10, defaultSets: 3 },
    { name: 'Arnold Press', icon: '💪🤖', group: 'shoulder', defaultWeight: 14, defaultReps: 10, defaultSets: 3 },
    { name: 'Dumbbell Lateral Raise', icon: '🤸', group: 'shoulder', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Cable Lateral Raise', icon: '⚡', group: 'shoulder', defaultWeight: 5, defaultReps: 15, defaultSets: 3 },
    { name: 'Dumbbell Front Raise', icon: '🙌', group: 'shoulder', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Cable Front Raise', icon: '⬆️', group: 'shoulder', defaultWeight: 10, defaultReps: 12, defaultSets: 3 },
    { name: 'Face Pulls', icon: '🎯', group: 'shoulder', defaultWeight: 15, defaultReps: 15, defaultSets: 3 },
    { name: 'Reverse Pec Deck / Rear Delt Fly', icon: '🔙', group: 'shoulder', defaultWeight: 25, defaultReps: 15, defaultSets: 3 },
    { name: 'Upright Row', icon: '⬆️', group: 'shoulder', defaultWeight: 20, defaultReps: 12, defaultSets: 3 },
    { name: 'Push Press', icon: '🚀', group: 'shoulder', defaultWeight: 50, defaultReps: 6, defaultSets: 3 },

    // Core
    { name: 'Plank', icon: '🧱', group: 'core', defaultWeight: 0, defaultReps: 1, defaultSets: 3 },
    { name: 'Weighted Plank', icon: '🎒', group: 'core', defaultWeight: 10, defaultReps: 1, defaultSets: 3 },
    { name: 'Crunches', icon: '🤏', group: 'core', defaultWeight: 0, defaultReps: 20, defaultSets: 3 },
    { name: 'Sit-ups', icon: '🪑', group: 'core', defaultWeight: 0, defaultReps: 20, defaultSets: 3 },
    { name: 'Decline Sit-ups', icon: '↘️', group: 'core', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Russian Twists', icon: '🪆', group: 'core', defaultWeight: 10, defaultReps: 20, defaultSets: 3 },
    { name: 'Leg Raises', icon: '🦵', group: 'core', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Hanging Leg Raises', icon: '🐒', group: 'core', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    { name: 'Ab Wheel Rollout', icon: '🛞', group: 'core', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    { name: 'Bicycle Crunches', icon: '🚲', group: 'core', defaultWeight: 0, defaultReps: 20, defaultSets: 3 },
    { name: 'Cable Woodchoppers', icon: '🪓', group: 'core', defaultWeight: 15, defaultReps: 12, defaultSets: 3 },
    { name: 'Dead Bug', icon: '🐞', group: 'core', defaultWeight: 0, defaultReps: 12, defaultSets: 3 },
    { name: 'Suitcase Carry', icon: '🧳', group: 'core', defaultWeight: 20, defaultReps: 2, defaultSets: 3 },

    // Cardio
    { name: 'Treadmill Run', icon: '🏃', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Cycling', icon: '🚴', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Rowing Machine', icon: '🚣', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Stairmaster', icon: '🪜', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Jump Rope', icon: '➰', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Elliptical', icon: '⚙️', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 1 },
    { name: 'Sprinting', icon: '💨', group: 'cardio', defaultWeight: 0, defaultReps: 1, defaultSets: 5 },
    { name: 'Burpees', icon: '🔥', group: 'cardio', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Jumping Jacks', icon: '⭐', group: 'cardio', defaultWeight: 0, defaultReps: 50, defaultSets: 3 },
];

// ===== STATE =====
let todayExercises = [];
let allWorkouts = [];
let favoriteNames = [];
let customExercises = [];
let userRoutines = [];
let personalRecords = {};
let calendarDate = new Date();
let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let timerRunning = false;
let selectedPreset = null;
let activeGroup = 'all';
let isLoggedIn = false;
let sessionStartTime = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupNavigation();
    setupWorkoutForm();
    setupWorkoutSelector();
    setupFilterTabs();
    setupTimer();
    setupCalendar();
    setupAccountUI();
    setupChartTabs();
    renderWeekTracker();
    updateTodayView();
    updateHistoryView();
    updateCalendarView();
    setupExerciseAutocomplete();
    setupRoutinesUI();
    setupThemeToggle();

    // Start session timer when first exercise is logged
    if (todayExercises.length > 0 && !sessionStartTime) {
        sessionStartTime = Date.now();
    }

    // Register Service Worker for Offline PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('ServiceWorker registered:', reg.scope))
                .catch(err => console.log('ServiceWorker registration failed:', err));
        });
    }

    // Handle Online/Offline Status
    window.addEventListener('online', () => {
        showToast('You are back online! Syncing data...', 'success');
        if (isLoggedIn) syncLocalToCloud();
    });

    window.addEventListener('offline', () => {
        showToast('You are offline. Workouts will be saved locally.', 'error');
    });

    // Firebase Auth listener
    auth.onAuthStateChanged(async (user) => {
        isLoggedIn = !!user;
        updateAccountUI(user);

        if (user) {
            await syncLocalToCloud();

            const cloudSessions = await loadSessionsFromCloud();
            if (cloudSessions !== null) {
                allWorkouts = cloudSessions;
                saveWorkoutsLocal();
            }

            const cloudFavs = await loadFavoritesFromCloud();
            if (cloudFavs !== null) {
                favoriteNames = cloudFavs;
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteNames));
            }

            const cloudCustom = await loadCustomExercisesFromCloud();
            if (cloudCustom !== null) {
                customExercises = cloudCustom;
                localStorage.setItem('fitpulse_custom', JSON.stringify(customExercises));
            }

            const cloudRecords = await loadPersonalRecords();
            if (cloudRecords !== null) {
                personalRecords = cloudRecords;
            }

            const cloudRoutines = await loadRoutinesFromCloud();
            if (cloudRoutines !== null) {
                userRoutines = cloudRoutines;
                localStorage.setItem('fitpulse_routines', JSON.stringify(userRoutines));
            }

            // Load Health Profile
            const profile = await getUserProfile();
            if (profile) populateHealthForm(profile);

        } else {
            loadData();
        }

        renderChips();
        renderRoutines();
        renderWeekTracker();
        updateTodayView();
        updateHistoryView();
        updateCalendarView();
    });
});

// ===== THEME TOGGLE =====
// Apply saved theme immediately on load
const lsTheme = localStorage.getItem('fitpulse_theme') || 'light';
if (lsTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconSpan = document.getElementById('theme-icon');
    
    const updateBtnUI = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (iconSpan) iconSpan.textContent = isDark ? '🌙 Dark' : '☀️ Light';
    };
    updateBtnUI();

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('fitpulse_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('fitpulse_theme', 'dark');
            }
            updateBtnUI();
        });
    }
}

// ===== ACCOUNT UI =====
function setupAccountUI() {
    const accountBtn = document.getElementById('account-btn');
    const modal = document.getElementById('account-modal');
    const closeBtn = document.getElementById('modal-close');
    const googleBtn = document.getElementById('btn-google-signin');
    const signOutBtn = document.getElementById('btn-signout');
    const saveProfileBtn = document.getElementById('btn-save-profile');

    accountBtn.addEventListener('click', async () => {
        // Always refresh auth state when opening the modal
        const currentUser = auth.currentUser;
        updateAccountUI(currentUser);
        if (currentUser) {
            const profile = await getUserProfile();
            if (profile) populateHealthForm(profile);
        }
        modal.style.display = 'flex';
    });
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    googleBtn.addEventListener('click', async () => {
        await signInWithGoogle();
        modal.style.display = 'none';
    });

    signOutBtn.addEventListener('click', async () => {
        await signOutUser();
        modal.style.display = 'none';
        clearHealthForm();
    });

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async () => {
            if (!isLoggedIn) return;
            const age = document.getElementById('profile-age').value;
            const gender = document.getElementById('profile-gender').value;
            const weight = document.getElementById('profile-weight').value;
            const height = document.getElementById('profile-height').value;
            
            const healthData = {};
            if (age) healthData.age = parseInt(age);
            if (gender) healthData.gender = gender;
            if (weight) healthData.weight = parseFloat(weight);
            if (height) healthData.height = parseFloat(height);

            saveProfileBtn.disabled = true;
            saveProfileBtn.textContent = 'Saving...';
            
            const success = await updateHealthProfile(healthData);
            if (success) {
                showToast('Health Profile saved! 👤', 'success');
            } else {
                showToast('Failed to save profile.', 'error');
            }
            
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = 'Save Health Data';
        });
    }
}

function populateHealthForm(profile) {
    if (profile.age) document.getElementById('profile-age').value = profile.age;
    if (profile.gender) document.getElementById('profile-gender').value = profile.gender;
    if (profile.weight) document.getElementById('profile-weight').value = profile.weight;
    if (profile.height) document.getElementById('profile-height').value = profile.height;
}

function clearHealthForm() {
    document.getElementById('profile-age').value = '';
    document.getElementById('profile-gender').value = '';
    document.getElementById('profile-weight').value = '';
    document.getElementById('profile-height').value = '';
}

function updateAccountUI(user) {
    const loggedOut = document.getElementById('auth-logged-out');
    const loggedIn = document.getElementById('auth-logged-in');
    const avatarEl = document.getElementById('account-avatar');

    if (user) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'block';
        document.getElementById('user-name').textContent = user.displayName || 'User';
        document.getElementById('user-email').textContent = user.email || '';
        document.getElementById('user-photo').src = user.photoURL || '';
        if (user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}" referrerpolicy="no-referrer">`;
        }
    } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
        avatarEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }
}

// ===== DATA =====
function loadData() {
    try {
        allWorkouts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        todayExercises = JSON.parse(localStorage.getItem(TODAY_KEY)) || [];
        favoriteNames = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        customExercises = JSON.parse(localStorage.getItem('fitpulse_custom')) || [];
        userRoutines = JSON.parse(localStorage.getItem('fitpulse_routines')) || [];
    } catch {
        allWorkouts = [];
        todayExercises = [];
        favoriteNames = [];
        customExercises = [];
        userRoutines = [];
    }
}

function saveWorkoutsLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWorkouts));
}

function saveWorkouts() {
    saveWorkoutsLocal();
    if (isLoggedIn) {
        allWorkouts.forEach(w => saveSessionToCloud(w));
    }
}

function saveTodayExercises() {
    localStorage.setItem(TODAY_KEY, JSON.stringify(todayExercises));
}

function saveFavoritesLocal() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteNames));
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getWorkoutDates() {
    return allWorkouts.map(w => w.date);
}

// ===== FAVORITES =====
function toggleFavorite(exerciseName, icon, group) {
    const idx = favoriteNames.indexOf(exerciseName);
    if (idx >= 0) {
        favoriteNames.splice(idx, 1);
        if (isLoggedIn) removeFavoriteFromCloud(exerciseName);
        showToast(`Removed from favorites`, 'success');
    } else {
        favoriteNames.push(exerciseName);
        if (isLoggedIn) addFavoriteToCloud({ name: exerciseName, icon, group });
        showToast(`Added to favorites ⭐`, 'success');
    }
    saveFavoritesLocal();
    renderChips();
}

function isFavorite(name) {
    return favoriteNames.includes(name);
}

// ===== 7-Day WEEK TRACKER =====
function renderWeekTracker() {
    const container = document.getElementById('week-days');
    if (!container) return;

    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const workoutDates = getWorkoutDates();

    container.innerHTML = '';

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = i === 0;
        const hasWorkout = workoutDates.includes(dateStr);

        const dayEl = document.createElement('div');
        dayEl.className = 'week-day';

        const label = document.createElement('span');
        label.className = 'week-day-label';
        label.textContent = dayNames[date.getDay()];

        const circle = document.createElement('div');
        circle.className = 'week-day-circle';
        if (isToday) circle.classList.add('today');
        if (hasWorkout) circle.classList.add('has-workout');
        circle.textContent = date.getDate();

        dayEl.appendChild(label);
        dayEl.appendChild(circle);
        container.appendChild(dayEl);
    }
}

// ===== FILTER TABS =====
function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeGroup = tab.dataset.group;
            renderChips();
        });
    });
}

// ===== WORKOUT SELECTOR =====
function setupWorkoutSelector() {
    const searchInput = document.getElementById('exercise-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderChips();
        });
    }
    renderChips();
}

// ===== WORKOUT CHIPS =====
function renderChips() {
    const chipsContainer = document.getElementById('workout-chips');
    if (!chipsContainer) return;
    
    const searchInput = document.getElementById('exercise-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    chipsContainer.innerHTML = '';

    const combinedExercises = [...WORKOUT_PRESETS, ...customExercises];

    let filtered;
    if (activeGroup === 'favorites') {
        filtered = combinedExercises.filter(p => isFavorite(p.name));
    } else if (activeGroup === 'all') {
        filtered = combinedExercises;
    } else {
        filtered = combinedExercises.filter(p => p.group === activeGroup);
    }

    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (filtered.length === 0) {
        chipsContainer.innerHTML = '<div class="empty-chips">No exercises found</div>';
        return;
    }

    filtered.forEach((preset) => {
        // Find the original index in WORKOUT_PRESETS or assign a unique ID for custom exercises
        const originalIndex = WORKOUT_PRESETS.findIndex(p => p.name === preset.name);
        const index = originalIndex !== -1 ? originalIndex : `custom-${preset.id}`; // Use a string for custom IDs

        const fav = isFavorite(preset.name);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'workout-chip';
        if (selectedPreset === index) chip.classList.add('active');

        chip.innerHTML = `
            <span class="workout-chip-icon">${preset.icon || '✨'}</span>
            <span>${preset.name}</span>
            <span class="chip-fav ${fav ? 'is-fav' : ''}"
                  onclick="event.stopPropagation(); toggleFavorite('${preset.name}', '${preset.icon || '✨'}', '${preset.group || 'other'}')"
                  title="${fav ? 'Remove from favorites' : 'Add to favorites'}">
                ${fav ? '★' : '☆'}
            </span>
        `;
        chip.addEventListener('click', () => selectPreset(index, chip));
        chipsContainer.appendChild(chip);
    });
}

function selectPreset(index, chipEl) {
    let preset;
    if (typeof index === 'number') { // It's a WORKOUT_PRESET
        preset = WORKOUT_PRESETS[index];
    } else { // It's a custom exercise
        const customId = parseInt(index.split('-')[1]);
        preset = customExercises.find(c => c.id === customId);
    }

    document.querySelectorAll('.workout-chip').forEach(c => c.classList.remove('active'));

    if (selectedPreset === index) {
        selectedPreset = null;
        clearForm();
        return;
    }

    selectedPreset = index;
    chipEl.classList.add('active');

    document.getElementById('exercise-name').value = preset.name;
    document.getElementById('exercise-weight').value = preset.defaultWeight || '';
    document.getElementById('exercise-reps').value = preset.defaultReps || '';
    document.getElementById('exercise-sets').value = preset.defaultSets || '';
    document.getElementById('exercise-name').focus();
}

function clearForm() {
    document.getElementById('exercise-name').value = '';
    document.getElementById('exercise-weight').value = '';
    document.getElementById('exercise-reps').value = '';
    document.getElementById('exercise-sets').value = '';
    document.getElementById('exercise-notes').value = '';
    selectedPreset = null;
    document.querySelectorAll('.workout-chip').forEach(c => c.classList.remove('active'));
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const targetView = document.getElementById(`view-${viewName}`);
            if (targetView) targetView.classList.add('active');

            if (viewName === 'history') {
                updateHistoryView();
                renderWeekTracker();
            }
            if (viewName === 'calendar') updateCalendarView();
            if (viewName === 'trophy') updateTrophyView();
            if (viewName === 'workout') renderWeekTracker();
        });
    });
}

// ===== WORKOUT FORM =====
function setupWorkoutForm() {
    const workoutForm = document.getElementById('workout-form');

    const finishBtn = document.getElementById('finish-workout-btn');

    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('exercise-name').value.trim();
        const weightInput = parseFloat(document.getElementById('exercise-weight').value);
        const repsInput = parseInt(document.getElementById('exercise-reps').value);
        const setsInput = parseInt(document.getElementById('exercise-sets').value);
        const notesInput = document.getElementById('exercise-notes').value.trim();

        // Check for Custom Exercise Auto-Save
        const isPreset = WORKOUT_PRESETS.find(p => p.name.toLowerCase() === nameInput.toLowerCase());
        const isCustom = customExercises.find(c => c.name.toLowerCase() === nameInput.toLowerCase());

        if (!isPreset && !isCustom && nameInput) { // Only add if name is not empty
            const newCustom = { id: Date.now(), name: nameInput, group: 'other', icon: '✨' };
            customExercises.push(newCustom);
            localStorage.setItem('fitpulse_custom', JSON.stringify(customExercises));
            if (isLoggedIn) addCustomExerciseToCloud(newCustom);
            renderChips(); // Update UI so it appears immediately
            // Autocomplete pulls dynamically on focus, no need to manually repopulate here 
        }

        const exercise = {
            id: Date.now() + 1, // ensure distinct ID if custom was just saved
            name: nameInput,
            weight: weightInput,
            reps: repsInput,
            sets: setsInput,
            notes: notesInput,
        };

        // Track session start
        if (todayExercises.length === 0) {
            sessionStartTime = Date.now();
        }

        todayExercises.push(exercise);
        saveTodayExercises();
        updateTodayView();
        clearForm();
        document.getElementById('exercise-name').focus();
        showToast('Exercise logged! 💪', 'success');
    });

    finishBtn.addEventListener('click', finishWorkout);
}

function setupExerciseAutocomplete() {
    const input = document.getElementById('exercise-name');
    const dropdown = document.getElementById('exercise-dropdown');
    if (!input || !dropdown) return;

    let currentFocus = -1;

    // Helper to get all available exercises
    const getExercises = () => [...WORKOUT_PRESETS, ...customExercises]
        .map(ex => ex.name)
        .sort((a, b) => a.localeCompare(b));

    // Render dropdown items
    const renderOptions = (filterText = '') => {
        const exercises = getExercises();
        const filtered = filterText 
            ? exercises.filter(e => e.toLowerCase().includes(filterText.toLowerCase()))
            : exercises;

        if (filtered.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = '';
        filtered.forEach((exName) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            
            // Determine icon: custom vs built-in
            const isCustom = customExercises.some(c => c.name === exName);
            const iconStr = isCustom ? '✨' : '💪';

            div.innerHTML = `<span class="autocomplete-icon">${iconStr}</span><span>${exName}</span>`;
            div.dataset.value = exName;
            
            div.addEventListener('click', (e) => {
                input.value = exName;
                dropdown.style.display = 'none';
                document.getElementById('exercise-weight').focus(); // Auto-advance to next field
            });
            dropdown.appendChild(div);
        });
        
        dropdown.style.display = 'block';
        currentFocus = -1;
    };

    // Events
    input.addEventListener('focus', () => {
        renderOptions(input.value);
    });

    input.addEventListener('input', () => {
        renderOptions(input.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        if (!items.length || dropdown.style.display === 'none') {
            // Allow normal form behavior if hidden
            return; 
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            addActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            addActive(items);
        } else if (e.key === 'Enter') {
            if (currentFocus > -1) {
                e.preventDefault(); // Prevent form submit if selecting from list
                items[currentFocus].click();
            }
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });

    function addActive(items) {
        if (!items) return;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add('active');
        items[currentFocus].scrollIntoView({ block: 'nearest' });
    }

    function removeActive(items) {
        items.forEach(item => item.classList.remove('active'));
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function finishWorkout() {
    if (todayExercises.length === 0) {
        showToast('No exercises to save!', 'error');
        return;
    }

    // Calculate session metadata
    const totalVolume = todayExercises.reduce((sum, ex) => {
        return sum + (ex.weight * ex.reps * ex.sets);
    }, 0);

    const duration = sessionStartTime ? Date.now() - sessionStartTime : 0;

    const workout = {
        id: Date.now(),
        date: getTodayString(),
        timestamp: new Date().toISOString(),
        exercises: [...todayExercises],
        exerciseCount: todayExercises.length,
        totalVolume: Math.round(totalVolume),
        duration: duration,
        muscleGroups: [...new Set(todayExercises.map(ex => {
            const preset = WORKOUT_PRESETS.find(p => p.name === ex.name);
            return preset ? preset.group : 'other';
        }))],
    };

    const existingIndex = allWorkouts.findIndex(w => w.date === getTodayString());
    if (existingIndex >= 0) {
        // Merge into existing session
        const existing = allWorkouts[existingIndex];
        existing.exercises.push(...todayExercises);
        existing.exerciseCount = existing.exercises.length;
        existing.totalVolume = existing.exercises.reduce((sum, ex) => sum + (ex.weight * ex.reps * ex.sets), 0);
        existing.muscleGroups = [...new Set(existing.exercises.map(ex => {
            const preset = WORKOUT_PRESETS.find(p => p.name === ex.name);
            return preset ? preset.group : 'other';
        }))];
    } else {
        allWorkouts.unshift(workout);
    }

    saveWorkouts();

    // Update personal records for each exercise
    if (isLoggedIn) {
        todayExercises.forEach(ex => updatePersonalRecord(ex));
    }

    // Trigger IG Story Flex Exporter before clearing data
    openFlexModal({
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        volume: totalVolume,
        duration: duration,
        exercises: [...todayExercises]
    });

    todayExercises = [];
    sessionStartTime = null;
    saveTodayExercises();
    updateTodayView();
    updateHistoryView();
    updateCalendarView();
    renderWeekTracker();

    showToast('Workout saved! Great job! 🎉', 'success');
}

function deleteExercise(id) {
    todayExercises = todayExercises.filter(e => e.id !== id);
    saveTodayExercises();
    updateTodayView();
}

function updateTodayView() {
    const list = document.getElementById('exercise-list');
    const countBadge = document.getElementById('exercise-count');
    const sessionActions = document.getElementById('session-actions');

    if (todayExercises.length === 0) {
        list.innerHTML = '';
        list.appendChild(createEmptyState('🏃', 'No exercises logged today. Start your workout!'));
        if (sessionActions) sessionActions.style.display = 'none';
        countBadge.textContent = '0 exercises';
        return;
    }

    countBadge.textContent = `${todayExercises.length} exercise${todayExercises.length !== 1 ? 's' : ''}`;
    if (sessionActions) sessionActions.style.display = 'flex';

    // Calculate running total volume
    const runningVolume = todayExercises.reduce((sum, ex) => sum + (ex.weight * ex.reps * ex.sets), 0);

    list.innerHTML = todayExercises.map(ex => `
        <div class="exercise-item" data-id="${ex.id}">
            <div class="exercise-info">
                <div class="exercise-name">${escapeHtml(ex.name)}</div>
                <div class="exercise-details">
                    <span class="exercise-detail-item">🏋️ ${ex.weight} kg</span>
                    <span class="exercise-detail-item">🔄 ${ex.reps} reps</span>
                    <span class="exercise-detail-item">📊 ${ex.sets} sets</span>
                </div>
                ${ex.notes ? `<div class="exercise-notes-preview">"${escapeHtml(ex.notes)}"</div>` : ''}
            </div>
            <button class="exercise-delete" onclick="deleteExercise(${ex.id})" title="Remove">🗑️</button>
        </div>
    `).join('');
}

// ===== ROUTINES =====
function setupRoutinesUI() {
    const saveBtn = document.getElementById('save-routine-btn');
    const modal = document.getElementById('routine-modal');
    const closeBtn = document.getElementById('routine-close');
    const confirmBtn = document.getElementById('btn-confirm-routine');
    const nameInput = document.getElementById('routine-name');

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (todayExercises.length === 0) {
                return showToast('No exercises to save!', 'error');
            }
            modal.style.display = 'flex';
            nameInput.value = '';
            nameInput.focus();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            if (!name) return showToast('Please enter a name', 'error');

            const routine = {
                id: Date.now(),
                name: name,
                exercises: todayExercises.map(ex => ({
                    name: ex.name,
                    weight: ex.weight,
                    reps: ex.reps,
                    sets: ex.sets
                }))
            };

            userRoutines.push(routine);
            localStorage.setItem('fitpulse_routines', JSON.stringify(userRoutines));
            if (isLoggedIn) {
                await saveRoutineToCloud(routine);
            }
            
            modal.style.display = 'none';
            renderRoutines();
            showToast('Routine saved! ✨', 'success');
        });
    }
}

function renderRoutines() {
    const section = document.getElementById('routines-section');
    const list = document.getElementById('routines-list');
    
    if (!section || !list) return;

    if (userRoutines.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    userRoutines.forEach(r => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'workout-chip';
        chip.innerHTML = `
            <span class="workout-chip-icon">📋</span>
            <span>${escapeHtml(r.name)}</span>
            <span class="chip-fav" onclick="event.stopPropagation(); deleteRoutine(${r.id})" title="Delete Routine">🗑️</span>
        `;
        chip.addEventListener('click', () => loadRoutine(r));
        list.appendChild(chip);
    });
}

function loadRoutine(routine) {
    if (todayExercises.length > 0) {
        if (!confirm('This will add the routine exercises to your current session. Continue?')) {
            return;
        }
    }
    
    if (todayExercises.length === 0) {
        sessionStartTime = Date.now();
    }

    const newExs = routine.exercises.map((ex, i) => ({
        ...ex,
        id: Date.now() + i
    }));

    todayExercises.push(...newExs);
    saveTodayExercises();
    updateTodayView();
    showToast(`${routine.name} loaded!`, 'success');
}

async function deleteRoutine(id) {
    if (!confirm('Delete this routine?')) return;
    
    userRoutines = userRoutines.filter(r => r.id !== id);
    localStorage.setItem('fitpulse_routines', JSON.stringify(userRoutines));
    
    if (isLoggedIn) {
        await deleteRoutineFromCloud(id);
    }
    
    renderRoutines();
    showToast('Routine deleted', 'success');
}

// ===== IG STORY FLEX EXPORTER =====
let flexBlob = null;

function openFlexModal(workoutData) {
    const modal = document.getElementById('flex-modal');
    modal.style.display = 'flex';
    flexBlob = null;
    generateFlexCanvas(workoutData);
}

document.getElementById('flex-close').addEventListener('click', () => {
    document.getElementById('flex-modal').style.display = 'none';
});

document.getElementById('btn-share-flex').addEventListener('click', async () => {
    if (!flexBlob) return showToast('Generating image...', 'error');
    const file = new File([flexBlob], 'fitpulse-workout.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'My FitPulse Workout',
                text: 'Just smashed a workout on FitPulse! 💪'
            });
        } catch (err) {
            console.log('Share canceled or failed', err);
        }
    } else {
        showToast('Native sharing not supported. Use Save Image.', 'error');
    }
});

document.getElementById('btn-download-flex').addEventListener('click', () => {
    if (!flexBlob) return;
    const url = URL.createObjectURL(flexBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitPulse_Flex_${getTodayString()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

function generateFlexCanvas(data) {
    const canvas = document.getElementById('flex-canvas');
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1920;

    // Background Gradient (Dark Emerald)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0d0f0e');      // --bg-dark
    grad.addColorStop(0.5, '#162b1d');    // Mid green-dark
    grad.addColorStop(1, '#0d0f0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle glow circle in middle
    const glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 800);
    glow.addColorStop(0, 'rgba(80, 200, 120, 0.15)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Header: Logo / Brand
    ctx.fillStyle = '#50C878'; // Primary green
    ctx.font = '900 80px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FitPulse', W/2, 200);

    ctx.fillStyle = '#8a9a90';
    ctx.font = '500 40px Inter, sans-serif';
    ctx.fillText(data.date, W/2, 270);

    // Big Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 110px Inter, sans-serif';
    ctx.fillText('WORKOUT', W/2, 500);
    ctx.fillText('COMPLETE', W/2, 620);

    // Stats Boxes
    const drawStatBox = (x, y, label, value) => {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = 'rgba(80, 200, 120, 0.3)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, 400, 250, 40);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#8a9a90';
        ctx.font = '600 40px Inter, sans-serif';
        ctx.fillText(label, x + 200, y + 80);

        ctx.fillStyle = '#50C878';
        ctx.font = '800 70px Inter, sans-serif';
        ctx.fillText(value, x + 200, y + 180);
    };

    const mins = Math.max(1, Math.round(data.duration / 60000));
    drawStatBox(100, 750, 'VOLUME', formatVolume(data.volume));
    drawStatBox(580, 750, 'DURATION', `${mins} min`);

    // Top Exercises
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f0f2f0';
    ctx.font = '700 50px Inter, sans-serif';
    ctx.fillText('Exercises:', 100, 1150);

    let currentY = 1250;
    // Show up to 5 exercises to fit
    const displayExs = data.exercises.slice(0, 5);
    
    displayExs.forEach(ex => {
        // Dot
        ctx.fillStyle = '#50C878';
        ctx.beginPath();
        ctx.arc(120, currentY - 15, 12, 0, Math.PI * 2);
        ctx.fill();

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 45px Inter, sans-serif';
        ctx.fillText(ex.name, 160, currentY);

        // Sets x Reps
        ctx.fillStyle = '#8a9a90';
        ctx.textAlign = 'right';
        ctx.fillText(`${ex.sets} × ${ex.reps}`, W - 100, currentY);
        ctx.textAlign = 'left';

        currentY += 90;
    });

    if (data.exercises.length > 5) {
        ctx.fillStyle = '#8a9a90';
        ctx.font = 'italic 40px Inter, sans-serif';
        ctx.fillText(`+ ${data.exercises.length - 5} more exercises...`, 160, currentY + 20);
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '500 35px Inter, sans-serif';
    ctx.fillText('Tracked with FitPulse App', W/2, 1820);

    // Export to blob for sharing
    canvas.toBlob(blob => {
        flexBlob = blob;
    }, 'image/png');
}

// ===== PERFORMANCE CHART =====
let chartMetric = 'volume';

function setupChartTabs() {
    const tabs = document.querySelectorAll('.chart-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            chartMetric = tab.dataset.metric;
            renderChart();
        });
    });
}

function getWeeklyData() {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let w = 6; w >= 0; w--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekWorkouts = allWorkouts.filter(workout => {
            const d = new Date(workout.date + 'T00:00:00');
            return d >= weekStart && d <= weekEnd;
        });

        const volume = weekWorkouts.reduce((sum, w) => {
            const v = w.totalVolume || w.exercises.reduce((s, e) => s + (e.weight * e.reps * e.sets), 0);
            return sum + v;
        }, 0);

        const startLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
        const endLabel = `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;

        weeks.push({
            label: w === 0 ? 'This wk' : `${startLabel}`,
            volume: Math.round(volume),
            sessions: weekWorkouts.length,
        });
    }
    return weeks;
}

function renderChart() {
    const canvas = document.getElementById('performance-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size for sharp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    const weeks = getWeeklyData();
    const values = weeks.map(w => chartMetric === 'volume' ? w.volume : w.sessions);
    const maxVal = Math.max(...values, 1);

    const padding = { top: 24, bottom: 36, left: 8, right: 8 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const barGap = 10;
    const barWidth = (chartW - barGap * (weeks.length - 1)) / weeks.length;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();
    }

    // Draw bars
    weeks.forEach((week, i) => {
        const val = values[i];
        const barH = maxVal > 0 ? (val / maxVal) * chartH : 0;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + chartH - barH;
        const radius = Math.min(barWidth / 2, 6);

        // Bar gradient
        const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
        if (val > 0) {
            grad.addColorStop(0, 'rgba(80, 200, 120, 0.9)');
            grad.addColorStop(1, 'rgba(80, 200, 120, 0.3)');
        } else {
            grad.addColorStop(0, 'rgba(255,255,255,0.06)');
            grad.addColorStop(1, 'rgba(255,255,255,0.02)');
        }

        // Rounded bar
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (barH > radius * 2) {
            ctx.moveTo(x, y + radius);
            ctx.arcTo(x, y, x + radius, y, radius);
            ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
            ctx.lineTo(x + barWidth, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
        } else if (barH > 2) {
            ctx.rect(x, y, barWidth, barH);
        } else {
            // Minimum 2px bar for zero values
            ctx.rect(x, padding.top + chartH - 2, barWidth, 2);
        }
        ctx.fill();

        // Value label above bar
        if (val > 0) {
            ctx.fillStyle = '#f0f2f0';
            ctx.font = '600 9px Inter, sans-serif';
            ctx.textAlign = 'center';
            const label = chartMetric === 'volume' ? formatVolume(val) : String(val);
            ctx.fillText(label, x + barWidth / 2, y - 6);
        }

        // Week label below
        ctx.fillStyle = '#4a5a50';
        ctx.font = '600 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(week.label, x + barWidth / 2, H - 8);
    });
}

// ===== HISTORY VIEW =====
function updateHistoryView() {
    const list = document.getElementById('history-list');
    const totalEl = document.getElementById('stat-total-workouts');
    const monthEl = document.getElementById('stat-this-month');
    const streakEl = document.getElementById('stat-streak');

    totalEl.textContent = allWorkouts.length;

    const now = new Date();
    const thisMonth = allWorkouts.filter(w => {
        const d = new Date(w.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    monthEl.textContent = thisMonth.length;
    streakEl.textContent = calculateStreak();

    // Update chart
    renderChart();

    if (allWorkouts.length === 0) {
        list.innerHTML = '';
        list.appendChild(createEmptyState('📭', 'No workout history yet. Complete your first workout!'));
        return;
    }

    list.innerHTML = allWorkouts.map(workout => {
        const volume = workout.totalVolume || workout.exercises.reduce((s, e) => s + (e.weight * e.reps * e.sets), 0);
        const exCount = workout.exerciseCount || workout.exercises.length;
        const groups = workout.muscleGroups || [];
        const duration = workout.duration ? formatDuration(workout.duration) : null;

        return `
        <div class="history-card">
            <div class="history-card-header">
                <div>
                    <span class="history-date">${formatDate(workout.date)}</span>
                    ${groups.length > 0 ? `<div class="history-muscles">${groups.map(g => `<span class="muscle-tag">${g}</span>`).join('')}</div>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="history-delete" onclick="deleteWorkout(${workout.id})" title="Delete">🗑️</button>
                </div>
            </div>

            <div class="history-stats-row">
                <div class="history-stat">
                    <span class="history-stat-value">${exCount}</span>
                    <span class="history-stat-label">exercises</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-value">${formatVolume(volume)}</span>
                    <span class="history-stat-label">volume (kg)</span>
                </div>
                ${duration ? `
                <div class="history-stat">
                    <span class="history-stat-value">${duration}</span>
                    <span class="history-stat-label">duration</span>
                </div>` : ''}
            </div>

            <div class="history-exercises">
                ${workout.exercises.map(ex => `
                    <div class="history-exercise-row">
                        <div class="history-exercise-left">
                            <span class="history-exercise-name">${escapeHtml(ex.name)}</span>
                            ${ex.notes ? `<span class="history-exercise-note">${escapeHtml(ex.notes)}</span>` : ''}
                        </div>
                        <span class="history-exercise-stats">${ex.weight}kg × ${ex.reps} × ${ex.sets}</span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }).join('');
}

function deleteWorkout(id) {
    allWorkouts = allWorkouts.filter(w => w.id !== id);
    saveWorkoutsLocal();
    if (isLoggedIn) deleteSessionFromCloud(id);
    updateHistoryView();
    updateCalendarView();
    renderWeekTracker();
    showToast('Workout deleted', 'success');
}

function calculateStreak() {
    if (allWorkouts.length === 0) return 0;

    const dates = [...new Set(allWorkouts.map(w => w.date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkStr = checkDate.toISOString().split('T')[0];

        if (dates.includes(checkStr)) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ===== CALENDAR =====
function setupCalendar() {
    document.getElementById('cal-prev').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        updateCalendarView();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        updateCalendarView();
    });
}

function updateCalendarView() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendar-grid');
    const headers = grid.querySelectorAll('.cal-header');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const workoutDates = getWorkoutDates();

    for (let i = firstDay - 1; i >= 0; i--) {
        const el = document.createElement('div');
        el.className = 'cal-day other-month';
        el.textContent = daysInPrevMonth - i;
        grid.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const el = document.createElement('div');
        el.className = 'cal-day';

        if (dateStr === todayStr) el.classList.add('today');
        if (workoutDates.includes(dateStr)) el.classList.add('has-workout');

        el.textContent = day;
        grid.appendChild(el);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        const el = document.createElement('div');
        el.className = 'cal-day other-month';
        el.textContent = i;
        grid.appendChild(el);
    }
}

// ===== TIMER =====
function setupTimer() {
    const presetBtns = document.querySelectorAll('.btn-preset');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');

    const svg = document.querySelector('.timer-ring');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'timer-gradient';
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#50C878"/>
        <stop offset="100%" stop-color="#6ed492"/>
    `;
    defs.appendChild(gradient);
    svg.prepend(defs);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const seconds = parseInt(btn.dataset.time);
            timerTotal = seconds;
            timerRemaining = seconds;
            timerRunning = false;

            clearInterval(timerInterval);
            updateTimerDisplay();

            startBtn.disabled = false;
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            resetBtn.style.display = 'none';

            document.getElementById('timer-label').textContent = 'Ready';
            document.getElementById('timer-display').classList.remove('pulsing');
        });
    });

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
}

function startTimer() {
    if (timerTotal === 0) return;

    timerRunning = true;
    document.getElementById('timer-start').style.display = 'none';
    document.getElementById('timer-pause').style.display = 'inline-flex';
    document.getElementById('timer-reset').style.display = 'inline-flex';
    document.getElementById('timer-label').textContent = 'Resting...';
    document.getElementById('timer-display').classList.remove('pulsing');

    timerInterval = setInterval(() => {
        timerRemaining--;

        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerRemaining = 0;
            updateTimerDisplay();

            document.getElementById('timer-label').textContent = 'Done! 🎉';
            document.getElementById('timer-display').classList.add('pulsing');
            document.getElementById('timer-start').style.display = 'inline-flex';
            document.getElementById('timer-start').textContent = 'Restart';
            document.getElementById('timer-pause').style.display = 'none';

            playTimerBeep();
            showToast('Rest timer complete! Get back to it! 💪', 'success');
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    const pauseBtn = document.getElementById('timer-pause');
    pauseBtn.textContent = 'Resume';
    pauseBtn.onclick = () => {
        if (!timerRunning && timerRemaining > 0) {
            pauseBtn.textContent = 'Pause';
            pauseBtn.onclick = pauseTimer;
            startTimer();
        }
    };
    document.getElementById('timer-label').textContent = 'Paused';
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerRemaining = timerTotal;
    updateTimerDisplay();

    document.getElementById('timer-start').style.display = 'inline-flex';
    document.getElementById('timer-start').textContent = 'Start';
    document.getElementById('timer-pause').style.display = 'none';
    document.getElementById('timer-pause').textContent = 'Pause';
    document.getElementById('timer-pause').onclick = pauseTimer;
    document.getElementById('timer-reset').style.display = 'none';
    document.getElementById('timer-label').textContent = 'Ready';
    document.getElementById('timer-display').classList.remove('pulsing');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    document.getElementById('timer-value').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;

    const circumference = 2 * Math.PI * 90;
    const progress = timerTotal > 0 ? (timerTotal - timerRemaining) / timerTotal : 0;
    const offset = circumference * (1 - progress);
    document.getElementById('timer-ring-progress').style.strokeDashoffset = offset;
}

function playTimerBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.2, 0.4].forEach(delay => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 0.15);
        });
    } catch (e) { }
}

// ===== TROPHY ROOM & ACHIEVEMENTS =====
function updateTrophyView() {
    // 1. The Big 3 PRs
    let bestBench = 0;
    let bestSquat = 0;
    let bestDeadlift = 0;

    // Scan all workouts for true PRs (even if not saved in personalRecords yet)
    allWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            const lowerName = ex.name.toLowerCase();
            if (lowerName.includes('bench press') && ex.weight > bestBench) bestBench = ex.weight;
            if (lowerName.includes('squat') && !lowerName.includes('split') && ex.weight > bestSquat) bestSquat = ex.weight;
            if (lowerName.includes('deadlift') && ex.weight > bestDeadlift) bestDeadlift = ex.weight;
        });
    });

    // Or fallback to personalRecords object if it exists
    if (personalRecords['Barbell Bench Press'] > bestBench) bestBench = personalRecords['Barbell Bench Press'];
    if (personalRecords['Barbell Back Squat'] > bestSquat) bestSquat = personalRecords['Barbell Back Squat'];
    if (personalRecords['Deadlift'] > bestDeadlift) bestDeadlift = personalRecords['Deadlift'];

    document.getElementById('pr-val-bench').textContent = bestBench > 0 ? `${bestBench} kg` : '-- kg';
    document.getElementById('pr-val-squat').textContent = bestSquat > 0 ? `${bestSquat} kg` : '-- kg';
    document.getElementById('pr-val-deadlift').textContent = bestDeadlift > 0 ? `${bestDeadlift} kg` : '-- kg';

    // 2. Achievement Badges Computation
    let totalVolumeEver = 0;
    let hasNightWorkout = false;
    let highestTotalRepsInOneSession = 0;
    
    // Compute total volume & check timestamps
    allWorkouts.forEach(workout => {
        let sessionVolume = 0;
        let sessionReps = 0;
        workout.exercises.forEach(ex => {
            sessionVolume += (ex.weight * ex.reps * ex.sets);
            sessionReps += (ex.reps * ex.sets);
        });
        totalVolumeEver += sessionVolume;
        if (sessionReps > highestTotalRepsInOneSession) highestTotalRepsInOneSession = sessionReps;

        // Night workout check (after 8 PM)
        const workoutHour = new Date(workout.timestamp).getHours();
        if (workoutHour >= 20 || workoutHour <= 4) {
            hasNightWorkout = true;
        }
    });

    const is10kClub = totalVolumeEver >= 10000;
    const is3DayWarrior = calculateStreak() >= 3;
    const is100RepClub = highestTotalRepsInOneSession >= 100;

    const badges = [
        {
            id: 'vol-10k', title: '10K Volume Club', desc: 'Lifted over 10,000 kg total', icon: '🐘', unlocked: is10kClub 
        },
        {
            id: 'warrior-3d', title: '3-Day Warrior', desc: 'Hit a 3-day workout streak', icon: '🔥', unlocked: is3DayWarrior 
        },
        {
            id: 'night-owl', title: 'Night Owl Lifter', desc: 'Logged a workout after 8 PM', icon: '🦉', unlocked: hasNightWorkout 
        },
        {
            id: 'reps-100', title: '100-Rep Club', desc: 'Did 100+ total reps in one day', icon: '💯', unlocked: is100RepClub 
        }
    ];

    const badgesContainer = document.getElementById('badges-container');
    if (!badgesContainer) return;
    
    badgesContainer.innerHTML = badges.map(b => `
        <div class="badge-card ${b.unlocked ? 'unlocked' : ''}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-info">
                <span class="badge-title">${b.title}</span>
                <span class="badge-desc">${b.desc}</span>
            </div>
        </div>
    `).join('');
}

// ===== EXERCISE SUGGESTIONS =====
function populateExerciseSuggestions() {
    const datalist = document.getElementById('exercise-suggestions');
    const presetNames = WORKOUT_PRESETS.map(p => p.name);
    const historyNames = allWorkouts.flatMap(w => w.exercises.map(e => e.name));
    const allNames = [...new Set([...presetNames, ...historyNames])].sort();
    datalist.innerHTML = allNames.map(name => `<option value="${name}">`).join('');
}

// ===== UTILITIES =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(ms) {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
}

function formatVolume(vol) {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return String(Math.round(vol));
}

function createEmptyState(icon, message) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `<span class="empty-icon">${icon}</span><p>${message}</p>`;
    return div;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}
