/* =============================================
   FitPulse — Application Logic
   ============================================= */

// ===== STORAGE KEYS =====
const STORAGE_KEY = 'fitpulse_workouts';
const TODAY_KEY = 'fitpulse_today';

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
let calendarDate = new Date();
let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let timerRunning = false;
let selectedPreset = null;
let activeGroup = 'all';
let isLoggedIn = false;

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
    renderWeekTracker();
    updateTodayView();
    updateHistoryView();
    updateCalendarView();
    populateExerciseSuggestions();

    // Firebase Auth listener
    auth.onAuthStateChanged(async (user) => {
        isLoggedIn = !!user;
        updateAccountUI(user);

        if (user) {
            // Migrate local data to cloud on first login
            await syncLocalToCloud();
            // Load from cloud
            const cloudWorkouts = await loadWorkoutsFromCloud();
            if (cloudWorkouts !== null) {
                allWorkouts = cloudWorkouts;
                saveWorkoutsLocal(); // cache locally too
            }
        } else {
            loadData(); // fallback to localStorage
        }

        // Refresh all views
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

    accountBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

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

        // Update avatar to user photo
        if (user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
        }
    } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
        avatarEl.innerHTML = '👤';
    }
}

// ===== DATA =====
function loadData() {
    try {
        allWorkouts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        todayExercises = JSON.parse(localStorage.getItem(TODAY_KEY)) || [];
    } catch {
        allWorkouts = [];
        todayExercises = [];
    }
}

function saveWorkoutsLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWorkouts));
}

function saveWorkouts() {
    saveWorkoutsLocal();
    // Also save each workout to cloud if logged in
    if (isLoggedIn) {
        allWorkouts.forEach(w => saveWorkoutToCloud(w));
    }
}

function saveTodayExercises() {
    localStorage.setItem(TODAY_KEY, JSON.stringify(todayExercises));
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getWorkoutDates() {
    return allWorkouts.map(w => w.date);
}


// ===== 7-DAY WEEK TRACKER =====
function renderWeekTracker() {
    const containers = [
        document.getElementById('week-days'),
        document.getElementById('week-days-history'),
    ];

    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const workoutDates = getWorkoutDates();

    containers.forEach(container => {
        if (!container) return;
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
    });
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

    const filtered = activeGroup === 'all'
        ? WORKOUT_PRESETS
        : WORKOUT_PRESETS.filter(p => p.group === activeGroup);

    filtered.forEach((preset) => {
        const index = WORKOUT_PRESETS.indexOf(preset);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'workout-chip';
        if (selectedPreset === index) chip.classList.add('active');
        chip.innerHTML = `<span class="workout-chip-icon">${preset.icon}</span>${preset.name}`;
        chip.addEventListener('click', () => selectPreset(index, chip));
        chipsContainer.appendChild(chip);
    });
}

function selectPreset(index, chipEl) {
    const preset = WORKOUT_PRESETS[index];

    // Toggle active state
    document.querySelectorAll('.workout-chip').forEach(c => c.classList.remove('active'));

    if (selectedPreset === index) {
        selectedPreset = null;
        clearForm();
        return;
    }

    selectedPreset = index;
    chipEl.classList.add('active');

    // Fill form
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

    const workout = {
        id: Date.now(),
        date: getTodayString(),
        exercises: [...todayExercises],
        timestamp: new Date().toISOString(),
    };

    const existingIndex = allWorkouts.findIndex(w => w.date === getTodayString());
    if (existingIndex >= 0) {
        allWorkouts[existingIndex].exercises.push(...todayExercises);
    } else {
        allWorkouts.unshift(workout);
    }

    saveWorkouts();
    todayExercises = [];
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

    if (allWorkouts.length === 0) {
        list.innerHTML = '';
        list.appendChild(createEmptyState('📭', 'No workout history yet. Complete your first workout!'));
        return;
    }

    list.innerHTML = allWorkouts.map(workout => `
        <div class="history-card">
            <div class="history-card-header">
                <span class="history-date">${formatDate(workout.date)}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="history-count">${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}</span>
                    <button class="history-delete" onclick="deleteWorkout(${workout.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="history-exercises">
                ${workout.exercises.map(ex => `
                    <div class="history-exercise-row">
                        <span class="history-exercise-name">${escapeHtml(ex.name)}</span>
                        <span class="history-exercise-stats">${ex.weight}kg × ${ex.reps} reps × ${ex.sets} sets</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function deleteWorkout(id) {
    allWorkouts = allWorkouts.filter(w => w.id !== id);
    saveWorkoutsLocal();
    if (isLoggedIn) deleteWorkoutFromCloud(id);
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
