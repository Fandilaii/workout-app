/* =============================================
   FitPulse — Application Logic
   ============================================= */

const STORAGE_KEY = 'fitpulse_workouts';
const TODAY_KEY = 'fitpulse_today';

const WORKOUT_PRESETS = [
    { name: 'Bench Press', icon: '🏋️', defaultWeight: 60, defaultReps: 8, defaultSets: 3 },
    { name: 'Squat', icon: '🦵', defaultWeight: 80, defaultReps: 8, defaultSets: 4 },
    { name: 'Deadlift', icon: '💀', defaultWeight: 100, defaultReps: 5, defaultSets: 3 },
    { name: 'Overhead Press', icon: '🙆', defaultWeight: 40, defaultReps: 8, defaultSets: 3 },
    { name: 'Barbell Row', icon: '🚣', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
    { name: 'Pull-ups', icon: '💪', defaultWeight: 0, defaultReps: 8, defaultSets: 3 },
    { name: 'Push-ups', icon: '🫸', defaultWeight: 0, defaultReps: 15, defaultSets: 3 },
    { name: 'Dumbbell Curl', icon: '💪', defaultWeight: 12, defaultReps: 10, defaultSets: 3 },
    { name: 'Tricep Extension', icon: '🦾', defaultWeight: 15, defaultReps: 10, defaultSets: 3 },
    { name: 'Leg Press', icon: '🦿', defaultWeight: 120, defaultReps: 10, defaultSets: 3 },
    { name: 'Lat Pulldown', icon: '⬇️', defaultWeight: 45, defaultReps: 10, defaultSets: 3 },
    { name: 'Chest Fly', icon: '🦅', defaultWeight: 14, defaultReps: 12, defaultSets: 3 },
    { name: 'Lateral Raise', icon: '🤸', defaultWeight: 8, defaultReps: 12, defaultSets: 3 },
    { name: 'Lunges', icon: '🚶', defaultWeight: 20, defaultReps: 10, defaultSets: 3 },
    { name: 'Calf Raise', icon: '🦶', defaultWeight: 40, defaultReps: 15, defaultSets: 3 },
    { name: 'Plank', icon: '🧘', defaultWeight: 0, defaultReps: 1, defaultSets: 3 },
    { name: 'Hip Thrust', icon: '🍑', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    { name: 'Dips', icon: '⬇️', defaultWeight: 0, defaultReps: 10, defaultSets: 3 },
    { name: 'Romanian Deadlift', icon: '🏋️', defaultWeight: 60, defaultReps: 10, defaultSets: 3 },
    { name: 'Incline Bench', icon: '📐', defaultWeight: 50, defaultReps: 8, defaultSets: 3 },
];

let todayExercises = [];
let allWorkouts = [];
let calendarDate = new Date();
let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let timerRunning = false;
let selectedPreset = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupNavigation();
    setupWorkoutForm();
    setupWorkoutSelector();
    setupTimer();
    setupCalendar();
    setupAccountModal();
    renderWeekTracker();
    updateTodayView();
    updateHistoryView();
    updateCalendarView();
    populateExerciseSuggestions();
});

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

function saveWorkouts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allWorkouts));
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

// ===== ACCOUNT MODAL =====
function setupAccountModal() {
    const modal = document.getElementById('login-modal');
    const openBtn = document.getElementById('account-btn');
    const closeBtn = document.getElementById('modal-close');
    const submitBtn = document.getElementById('login-submit');

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Login coming soon! Data saved locally for now.', 'success');
        modal.classList.remove('active');
    });
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

// ===== WORKOUT SELECTOR =====
function setupWorkoutSelector() {
    const chipsContainer = document.getElementById('workout-chips');
    chipsContainer.innerHTML = '';

    WORKOUT_PRESETS.forEach((preset, index) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'workout-chip';
        chip.innerHTML = `<span class="workout-chip-icon">${preset.icon}</span>${preset.name}`;
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

    // Scroll form into view
    document.getElementById('workout-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
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

            // Scroll to top on view change
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (viewName === 'history') { updateHistoryView(); renderWeekTracker(); }
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
        list.appendChild(createEmptyState('🏃', 'No exercises logged today.'));
        finishBtn.style.display = 'none';
        countBadge.textContent = '0 exercises';
        return;
    }

    countBadge.textContent = `${todayExercises.length} exercise${todayExercises.length !== 1 ? 's' : ''}`;
    finishBtn.style.display = 'flex';

    list.innerHTML = todayExercises.map(ex => `
        <div class="exercise-item">
            <div class="exercise-info">
                <div class="exercise-name">${escapeHtml(ex.name)}</div>
                <div class="exercise-details">
                    <span class="exercise-detail-item">🏋️ ${ex.weight}kg</span>
                    <span class="exercise-detail-item">🔄 ${ex.reps} reps</span>
                    <span class="exercise-detail-item">📊 ${ex.sets} sets</span>
                </div>
                ${ex.notes ? `<div class="exercise-notes-preview">"${escapeHtml(ex.notes)}"</div>` : ''}
            </div>
            <button class="exercise-delete" onclick="deleteExercise(${ex.id})">🗑️</button>
        </div>
    `).join('');
}

// ===== HISTORY =====
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
        list.appendChild(createEmptyState('📭', 'No workout history yet.'));
        return;
    }

    list.innerHTML = allWorkouts.map(workout => `
        <div class="history-card">
            <div class="history-card-header">
                <span class="history-date">${formatDate(workout.date)}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span class="history-count">${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}</span>
                    <button class="history-delete" onclick="deleteWorkout(${workout.id})">🗑️</button>
                </div>
            </div>
            <div class="history-exercises">
                ${workout.exercises.map(ex => `
                    <div class="history-exercise-row">
                        <span class="history-exercise-name">${escapeHtml(ex.name)}</span>
                        <span class="history-exercise-stats">${ex.weight}kg × ${ex.reps} × ${ex.sets}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function deleteWorkout(id) {
    allWorkouts = allWorkouts.filter(w => w.id !== id);
    saveWorkouts();
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
        if (dates.includes(checkStr)) { streak++; }
        else { break; }
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
    const todayStr = new Date().toISOString().split('T')[0];
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
    gradient.innerHTML = `<stop offset="0%" stop-color="#50C878"/><stop offset="100%" stop-color="#6ed492"/>`;
    defs.appendChild(gradient);
    svg.prepend(defs);

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timerTotal = parseInt(btn.dataset.time);
            timerRemaining = timerTotal;
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
            showToast('Rest complete! Get back to it! 💪', 'success');
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
    const m = Math.floor(timerRemaining / 60);
    const s = timerRemaining % 60;
    document.getElementById('timer-value').textContent = `${m}:${String(s).padStart(2, '0')}`;
    const circ = 2 * Math.PI * 90;
    const progress = timerTotal > 0 ? (timerTotal - timerRemaining) / timerTotal : 0;
    document.getElementById('timer-ring-progress').style.strokeDashoffset = circ * (1 - progress);
}

function playTimerBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.2, 0.4].forEach(d => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = 800; o.type = 'sine'; g.gain.value = 0.3;
            o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + 0.15);
        });
    } catch (e) { }
}

// ===== SUGGESTIONS =====
function populateExerciseSuggestions() {
    const datalist = document.getElementById('exercise-suggestions');
    const names = [...new Set([
        ...WORKOUT_PRESETS.map(p => p.name),
        ...allWorkouts.flatMap(w => w.exercises.map(e => e.name))
    ])].sort();
    datalist.innerHTML = names.map(n => `<option value="${n}">`).join('');
}

// ===== UTILITIES =====
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function formatDate(ds) {
    const d = new Date(ds + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function createEmptyState(icon, msg) {
    const d = document.createElement('div');
    d.className = 'empty-state';
    d.innerHTML = `<span class="empty-icon">${icon}</span><p>${msg}</p>`;
    return d;
}

function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { if (t.parentNode) t.remove(); }, 3000);
}
