/* =============================================
   FitPulse — Application Logic
   ============================================= */

// ===== STORAGE KEYS =====
const STORAGE_KEY = 'fitpulse_workouts';
const TODAY_KEY = 'fitpulse_today';

// ===== STATE =====
let todayExercises = [];
let allWorkouts = [];
let calendarDate = new Date();
let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let timerRunning = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupNavigation();
    setupWorkoutForm();
    setupTimer();
    setupCalendar();
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
            if (targetView) {
                targetView.classList.add('active');
            }

            // Refresh views
            if (viewName === 'history') updateHistoryView();
            if (viewName === 'calendar') updateCalendarView();
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

        form.reset();
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

    // Check if already finished a workout today — merge
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

    showToast('Workout saved! Great job! 🎉', 'success');
}

function deleteExercise(id) {
    todayExercises = todayExercises.filter(e => e.id !== id);
    saveTodayExercises();
    updateTodayView();
}

function updateTodayView() {
    const list = document.getElementById('exercise-list');
    const emptyState = document.getElementById('empty-today');
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

    // Stats
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
                    <button class="history-delete" onclick="deleteWorkout(${workout.id})" title="Delete workout">🗑️</button>
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
    saveWorkouts();
    updateHistoryView();
    updateCalendarView();
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

    // Keep headers
    const headers = grid.querySelectorAll('.cal-header');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const workoutDates = getWorkoutDates();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const el = document.createElement('div');
        el.className = 'cal-day other-month';
        el.textContent = day;
        grid.appendChild(el);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const el = document.createElement('div');
        el.className = 'cal-day';

        if (dateStr === todayStr) el.classList.add('today');
        if (workoutDates.includes(dateStr)) el.classList.add('has-workout');

        el.textContent = day;
        grid.appendChild(el);
    }

    // Fill remaining cells
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

    // Add SVG gradient for the ring
    const svg = document.querySelector('.timer-ring');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'timer-gradient';
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#ec4899"/>
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

            // Play beep
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
    document.getElementById('timer-pause').textContent = 'Resume';
    document.getElementById('timer-pause').addEventListener('click', () => {
        if (!timerRunning && timerRemaining > 0) {
            document.getElementById('timer-pause').textContent = 'Pause';
            startTimer();
        }
    }, { once: true });

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
    document.getElementById('timer-reset').style.display = 'none';
    document.getElementById('timer-label').textContent = 'Ready';
    document.getElementById('timer-display').classList.remove('pulsing');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;
    document.getElementById('timer-value').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;

    // Update ring progress
    const circumference = 2 * Math.PI * 90; // r=90
    const progress = timerTotal > 0 ? (timerTotal - timerRemaining) / timerTotal : 0;
    const offset = circumference * (1 - progress);
    document.getElementById('timer-ring-progress').style.strokeDashoffset = offset;
}

function playTimerBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Play 3 beeps
        [0, 0.2, 0.4].forEach(delay => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            oscillator.start(audioCtx.currentTime + delay);
            oscillator.stop(audioCtx.currentTime + delay + 0.15);
        });
    } catch (e) {
        // Fallback: do nothing
    }
}

// ===== EXERCISE SUGGESTIONS =====
function populateExerciseSuggestions() {
    const datalist = document.getElementById('exercise-suggestions');
    const commonExercises = [
        'Bench Press', 'Squat', 'Deadlift', 'Overhead Press',
        'Barbell Row', 'Pull-ups', 'Push-ups', 'Dumbbell Curl',
        'Tricep Extension', 'Leg Press', 'Leg Curl', 'Leg Extension',
        'Lat Pulldown', 'Cable Row', 'Chest Fly', 'Lateral Raise',
        'Front Raise', 'Face Pull', 'Plank', 'Crunches',
        'Romanian Deadlift', 'Hip Thrust', 'Calf Raise', 'Lunges',
        'Bulgarian Split Squat', 'Incline Bench Press', 'Dips',
    ];

    // Add from history too
    const historyExercises = allWorkouts.flatMap(w => w.exercises.map(e => e.name));
    const allNames = [...new Set([...commonExercises, ...historyExercises])].sort();

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
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}
