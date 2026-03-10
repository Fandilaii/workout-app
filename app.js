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
    { name: 'Bench Press', icon: '🏋️', group: 'chest', defaultWeight: 60, defaultReps: 8, defaultSets: 3 },
    { name: 'Incline Bench', icon: '📐', group: 'chest', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Chest Fly', icon: '🦅', group: 'chest', defaultWeight: 14, defaultReps: 12, defaultSets: 3 },
    { name: 'Push-ups', icon: '🫸', group: 'chest', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Dips', icon: '⬇️', group: 'chest', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    // Back
    { name: 'Barbell Row', icon: '🚣', group: 'back', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Lat Pulldown', icon: '⬇️', group: 'back', defaultWeight: 45, defaultReps: 10, defaultSets: 3 },
    { name: 'Pull-ups', icon: '💪', group: 'back', defaultWeight: 0, defaultReps: 8, defaultSets: 3 },
    { name: 'Deadlift', icon: '💀', group: 'back', defaultWeight: 100, defaultReps: 5, defaultSets: 3 },
    { name: 'Romanian Deadlift', icon: '🏋️', group: 'back', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    // Leg
    { name: 'Squat', icon: '🦵', group: 'leg', defaultWeight: 80, defaultReps: 8, defaultSets: 4 },
    { name: 'Leg Press', icon: '🦿', group: 'leg', defaultWeight: 120, defaultReps: 10, defaultSets: 3 },
    { name: 'Lunges', icon: '🚶', group: 'leg', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Calf Raise', icon: '🦶', group: 'leg', defaultWeight: 40, defaultReps: 15, defaultSets: 3 },
    { name: 'Hip Thrust', icon: '🍑', group: 'leg', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    // Bicep
    { name: 'Dumbbell Curl', icon: '💪', group: 'bicep', defaultWeight: 12, defaultReps: 10, defaultSets: 3 },
    { name: 'Hammer Curl', icon: '🔨', group: 'bicep', defaultWeight: 10, defaultReps: 10, defaultSets: 3 },
    { name: 'Barbell Curl', icon: '🏋️', group: 'bicep', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    // Tricep
    { name: 'Tricep Extension', icon: '🦾', group: 'tricep', defaultWeight: 15, defaultReps: 10, defaultSets: 3 },
    { name: 'Skull Crushers', icon: '💀', group: 'tricep', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Tricep Pushdown', icon: '⬇️', group: 'tricep', defaultWeight: 25, defaultReps: 12, defaultSets: 3 },
    // Shoulder
    { name: 'Overhead Press', icon: '🙆', group: 'shoulder', defaultWeight: 40, defaultReps: 8, defaultSets: 3 },
    { name: 'Lateral Raise', icon: '🤸', group: 'shoulder', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Face Pull', icon: '🎯', group: 'shoulder', defaultWeight: 15, defaultReps: 15, defaultSets: 3 },
    { name: 'Front Raise', icon: '🙌', group: 'shoulder', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Plank', icon: '🧘', group: 'shoulder', defaultWeight: 0, defaultReps: 1, defaultSets: 3 },
];

// ===== STATE =====
let todayExercises = [];
let allWorkouts = [];
let favoriteNames = [];
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
    populateExerciseSuggestions();

    // Start session timer when first exercise is logged
    if (todayExercises.length > 0 && !sessionStartTime) {
        sessionStartTime = Date.now();
    }

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

            const cloudRecords = await loadPersonalRecords();
            if (cloudRecords !== null) {
                personalRecords = cloudRecords;
            }
        } else {
            loadData();
        }

        renderChips();
        renderWeekTracker();
        updateTodayView();
        updateHistoryView();
        updateCalendarView();
    });
});

// ===== ACCOUNT UI =====
function setupAccountUI() {
    const accountBtn = document.getElementById('account-btn');
    const modal = document.getElementById('account-modal');
    const closeBtn = document.getElementById('modal-close');
    const googleBtn = document.getElementById('btn-google-signin');
    const signOutBtn = document.getElementById('btn-signout');

    accountBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    googleBtn.addEventListener('click', async () => {
        await signInWithGoogle();
        modal.style.display = 'none';
    });

    signOutBtn.addEventListener('click', async () => {
        await signOutUser();
        modal.style.display = 'none';
    });
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
            avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
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
    } catch {
        allWorkouts = [];
        todayExercises = [];
        favoriteNames = [];
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
    renderChips();
}

function renderChips() {
    const chipsContainer = document.getElementById('workout-chips');
    chipsContainer.innerHTML = '';

    let filtered;
    if (activeGroup === 'favorites') {
        filtered = WORKOUT_PRESETS.filter(p => isFavorite(p.name));
    } else if (activeGroup === 'all') {
        filtered = WORKOUT_PRESETS;
    } else {
        filtered = WORKOUT_PRESETS.filter(p => p.group === activeGroup);
    }

    if (filtered.length === 0) {
        chipsContainer.innerHTML = '<div class="empty-chips">No exercises found</div>';
        return;
    }

    filtered.forEach((preset) => {
        const index = WORKOUT_PRESETS.indexOf(preset);
        const fav = isFavorite(preset.name);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'workout-chip';
        if (selectedPreset === index) chip.classList.add('active');

        chip.innerHTML = `
            <span class="workout-chip-icon">${preset.icon}</span>
            <span>${preset.name}</span>
            <span class="chip-fav ${fav ? 'is-fav' : ''}" 
                  onclick="event.stopPropagation(); toggleFavorite('${preset.name}', '${preset.icon}', '${preset.group}')"
                  title="${fav ? 'Remove from favorites' : 'Add to favorites'}">
                ${fav ? '★' : '☆'}
            </span>
        `;
        chip.addEventListener('click', () => selectPreset(index, chip));
        chipsContainer.appendChild(chip);
    });
}

function selectPreset(index, chipEl) {
    const preset = WORKOUT_PRESETS[index];

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
            if (viewName === 'workout') renderWeekTracker();
        });
    });
}

// ===== WORKOUT FORM =====
function setupWorkoutForm() {
    const form = document.getElementById('workout-form');
    const finishBtn = document.getElementById('finish-workout-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const exercise = {
            id: Date.now(),
            name: document.getElementById('exercise-name').value.trim(),
            weight: parseFloat(document.getElementById('exercise-weight').value),
            reps: parseInt(document.getElementById('exercise-reps').value),
            sets: parseInt(document.getElementById('exercise-sets').value),
            notes: document.getElementById('exercise-notes').value.trim(),
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
    const finishBtn = document.getElementById('finish-workout-btn');

    if (todayExercises.length === 0) {
        list.innerHTML = '';
        list.appendChild(createEmptyState('🏃', 'No exercises logged today. Start your workout!'));
        finishBtn.style.display = 'none';
        countBadge.textContent = '0 exercises';
        return;
    }

    countBadge.textContent = `${todayExercises.length} exercise${todayExercises.length !== 1 ? 's' : ''}`;
    finishBtn.style.display = 'flex';

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
