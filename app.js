// Student Task Manager Application Logic

// ==========================================
// 1. Initial Mock Data for First-Time Users
// ==========================================
const INITIAL_TASKS = [
    {
        id: "task-mock-1",
        title: "Calculus Assignment: Limits & Derivatives",
        desc: "Solve chapter 3 review questions (problems 1 to 25) and upload PDF to LMS.",
        category: "Study",
        priority: "High",
        dueDate: getRelativeDate(1),
        completed: false
    },
    {
        id: "task-mock-2",
        title: "Group Project: Web Architecture Blueprint",
        desc: "Develop the system flow diagram and compile the API design specifications doc.",
        category: "Project",
        priority: "Medium",
        dueDate: getRelativeDate(3),
        completed: false
    },
    {
        id: "task-mock-3",
        title: "Midterm Preparation: Physics I Review",
        desc: "Review lecture notes on thermodynamics and practice 3 past year papers.",
        category: "Exam",
        priority: "High",
        dueDate: getRelativeDate(2),
        completed: false
    },
    {
        id: "task-mock-4",
        title: "Clean Dorm Room & Laundry",
        desc: "Wash bedding sheets and organize desk space to improve study focus.",
        category: "Personal",
        priority: "Low",
        dueDate: getRelativeDate(5),
        completed: true,
        dateCompleted: getRelativeDate(-1)
    }
];

const PRODUCTIVITY_TIPS = [
    "Try the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break. Repeat 4 times, then take a longer break!",
    "Eat the frog first: Accomplish your most challenging or high-priority task first thing in the morning.",
    "Declutter your digital workspace. Keep only active tab windows open while studying a subject.",
    "Use the 2-Minute Rule: If a task takes less than two minutes to complete, do it immediately.",
    "Write down tomorrow's tasks tonight. It reduces morning anxiety and sets a clear action roadmap.",
    "Stay hydrated and take a quick stretch break every 45 minutes to boost neural activity.",
    "Combine difficult tasks with nice rewards. For example: study history while sipping your favorite tea."
];

// Helper to get dates relative to today
function getRelativeDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// ==========================================
// 2. Application State & Storage Controllers
// ==========================================
let state = {
    currentUser: null,
    tasks: [],
    theme: 'light',
    activeView: 'dashboard',
    
    // Filters for Dashboard View
    dashboardFilters: {
        category: 'all',
        priority: 'all',
        sortBy: 'soonest'
    },
    
    // Filters for Board View
    boardFilters: {
        search: '',
        category: 'all',
        priority: 'all'
    },
    
    currentTipIndex: 0
};

// Load state from LocalStorage
function loadLocalStorage() {
    // 1. Theme
    const savedTheme = localStorage.getItem('academia_theme');
    if (savedTheme) {
        state.theme = savedTheme;
    } else {
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = systemPrefersDark ? 'dark' : 'light';
    }
    
    // 2. User Session
    const savedUser = localStorage.getItem('academia_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
    }
    
    // 3. Tasks
    const savedTasks = localStorage.getItem('academia_tasks');
    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    } else {
        state.tasks = [...INITIAL_TASKS];
        saveTasksToStorage();
    }
}

function saveUserSession(username, level) {
    state.currentUser = { username, level };
    localStorage.setItem('academia_user', JSON.stringify(state.currentUser));
}

function clearUserSession() {
    state.currentUser = null;
    localStorage.removeItem('academia_user');
}

function saveTasksToStorage() {
    localStorage.setItem('academia_tasks', JSON.stringify(state.tasks));
}

function saveThemeToStorage() {
    localStorage.setItem('academia_theme', state.theme);
}

// ==========================================
// 3. DOM Elements Cache
// ==========================================
const DOM = {
    // Screens
    loginScreen: document.getElementById('login-screen'),
    appContainer: document.getElementById('app-container'),
    
    // Auth Form
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username'),
    studentLevelInput: document.getElementById('student-level'),
    
    // Sidebar profile & navigation
    userAvatarInitials: document.getElementById('user-avatar-initials'),
    userDisplayName: document.getElementById('user-display-name'),
    userDisplayLevel: document.getElementById('user-display-level'),
    sidebar: document.getElementById('sidebar'),
    navLinks: document.querySelectorAll('.nav-link'),
    logoutBtn: document.getElementById('logout-btn'),
    mobileCloseBtn: document.getElementById('mobile-close-btn'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    
    // Header elements
    headerUsername: document.getElementById('header-username'),
    currentDate: document.getElementById('current-date'),
    globalSearch: document.getElementById('global-search'),
    themeToggleBtn: document.getElementById('theme-toggle'),
    headerAvatarCircle: document.getElementById('header-avatar-circle'),
    
    // Views
    viewDashboard: document.getElementById('view-dashboard'),
    viewTasks: document.getElementById('view-tasks'),
    viewCompleted: document.getElementById('view-completed'),
    viewInsights: document.getElementById('view-insights'),
    
    // Dashboard Specific elements
    progressCircle: document.getElementById('progress-circle'),
    dashboardProgressPct: document.getElementById('dashboard-progress-pct'),
    dashboardProgressDesc: document.getElementById('dashboard-progress-desc'),
    dashboardProgressRatio: document.getElementById('dashboard-progress-ratio'),
    statPendingCount: document.getElementById('stat-pending'),
    statCompletedCount: document.getElementById('stat-completed'),
    statHighPriorityCount: document.getElementById('stat-high'),
    upcomingTaskCount: document.getElementById('upcoming-task-count'),
    activeTasksList: document.getElementById('active-tasks-list'),
    criticalDeadlinesList: document.getElementById('critical-deadlines-list'),
    productivityTipText: document.getElementById('productivity-tip'),
    btnNextTip: document.getElementById('btn-next-tip'),
    btnAddTaskDash: document.getElementById('btn-add-task-dash'),
    
    // Dashboard Filters
    categoryFilterPills: document.getElementById('category-filter-pills'),
    prioritySortSelect: document.getElementById('priority-sort-select'),
    dateSortSelect: document.getElementById('date-sort-select'),
    
    // Board View Specific elements
    boardTasksList: document.getElementById('board-tasks-list'),
    btnAddTaskBoard: document.getElementById('btn-add-task-board'),
    boardSearchInput: document.getElementById('board-search'),
    boardFilterCategory: document.getElementById('board-filter-category'),
    boardFilterPriority: document.getElementById('board-filter-priority'),
    
    // Completed Archive View elements
    completedCountBadge: document.getElementById('completed-count-badge'),
    completedTasksList: document.getElementById('completed-tasks-list'),
    btnClearCompleted: document.getElementById('btn-clear-completed'),
    
    // Insights elements
    insightsStreak: document.getElementById('insights-streak'),
    insightsVelocity: document.getElementById('insights-velocity'),
    insightsHighPct: document.getElementById('insights-high-pct'),
    barStudy: document.getElementById('bar-study'),
    barProject: document.getElementById('bar-project'),
    barExam: document.getElementById('bar-exam'),
    barPersonal: document.getElementById('bar-personal'),
    
    // Task Add/Edit Modal
    taskModal: document.getElementById('task-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalForm: document.getElementById('task-form'),
    modalTaskEditId: document.getElementById('task-edit-id'),
    modalTaskTitle: document.getElementById('task-title'),
    modalTaskDesc: document.getElementById('task-desc'),
    modalTaskCategory: document.getElementById('task-category'),
    modalTaskPriority: document.getElementById('task-priority'),
    modalTaskDate: document.getElementById('task-date'),
    modalCloseBtnX: document.getElementById('modal-close-btn-x'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// ==========================================
// 4. UI Helper Functions & Notifications
// ==========================================

// Display Date Utility
function initCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    DOM.currentDate.textContent = today.toLocaleDateString('en-US', options);
}

// Show Toast Message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'danger') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-solid fa-circle-info';
    
    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Automatically fade out and remove
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                DOM.toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3200);
}

// Extract Name Initials (e.g. Alex Mercer -> AM)
function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Check Priority Color Hex or Tag Class
function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return 'badge-danger';
        case 'Medium': return 'badge-warning';
        case 'Low': return 'badge-success';
        default: return 'badge-primary';
    }
}

// Get Category Icon Class
function getCategoryIcon(category) {
    switch (category) {
        case 'Study': return 'fa-solid fa-graduation-cap';
        case 'Project': return 'fa-solid fa-diagram-project';
        case 'Exam': return 'fa-solid fa-file-invoice';
        case 'Personal': return 'fa-solid fa-mug-hot';
        default: return 'fa-solid fa-tag';
    }
}

// Set Theme Stylesheet Toggle
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

// Calculate Radial SVG Circle Stroke
function updateRadialProgress(percent) {
    const circle = DOM.progressCircle;
    if (!circle) return;
    
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Limit to bounds 0 - 100
    const boundedPercent = Math.max(0, Math.min(100, percent));
    const offset = circumference - (boundedPercent / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
}

// ==========================================
// 5. Views and Theme Navigation Actions
// ==========================================
function switchView(viewName) {
    state.activeView = viewName;
    
    // 1. Update navigation anchors active classes
    DOM.navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 2. Manage View elements visibility
    const views = [
        { name: 'dashboard', el: DOM.viewDashboard },
        { name: 'tasks', el: DOM.viewTasks },
        { name: 'completed', el: DOM.viewCompleted },
        { name: 'insights', el: DOM.viewInsights }
    ];
    
    views.forEach(v => {
        if (v.name === viewName) {
            v.el.classList.add('active-view');
        } else {
            v.el.classList.remove('active-view');
        }
    });
    
    // Close sidebar on mobile sizes
    DOM.sidebar.classList.remove('mobile-open');
    
    // Trigger special actions depending on view
    if (viewName === 'insights') {
        renderInsightsGraph();
    }
    
    renderApp();
}

// Toggle light/dark modes
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveThemeToStorage();
    showToast(`Switched to ${state.theme} mode!`, 'info');
}

// ==========================================
// 6. Task Management Logic (CRUD)
// ==========================================

// Add or edit task submission logic
function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const taskId = DOM.modalTaskEditId.value;
    const title = DOM.modalTaskTitle.value.trim();
    const desc = DOM.modalTaskDesc.value.trim();
    const category = DOM.modalTaskCategory.value;
    const priority = DOM.modalTaskPriority.value;
    const dueDate = DOM.modalTaskDate.value;
    
    if (taskId) {
        // Edit Mode
        const taskIdx = state.tasks.findIndex(t => t.id === taskId);
        if (taskIdx !== -1) {
            state.tasks[taskIdx] = {
                ...state.tasks[taskIdx],
                title,
                desc,
                category,
                priority,
                dueDate
            };
            showToast("Task updated successfully!");
        }
    } else {
        // Create Mode
        const newTask = {
            id: 'task-' + Date.now(),
            title,
            desc,
            category,
            priority,
            dueDate,
            completed: false
        };
        state.tasks.push(newTask);
        showToast("Task created successfully!");
    }
    
    saveTasksToStorage();
    closeTaskModal();
    renderApp();
}

// Open Task Dialog Modal
function openTaskModal(taskId = null) {
    DOM.taskModal.classList.remove('hidden');
    DOM.modalForm.reset();
    
    // Reset Date to Today's date as default
    const today = new Date().toISOString().split('T')[0];
    DOM.modalTaskDate.value = today;
    
    if (taskId) {
        // Edit Action
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            DOM.modalTitle.textContent = "Edit Study Task";
            DOM.modalTaskEditId.value = task.id;
            DOM.modalTaskTitle.value = task.title;
            DOM.modalTaskDesc.value = task.desc;
            DOM.modalTaskCategory.value = task.category;
            DOM.modalTaskPriority.value = task.priority;
            DOM.modalTaskDate.value = task.dueDate;
        }
    } else {
        // Create Action
        DOM.modalTitle.textContent = "Create New Study Task";
        DOM.modalTaskEditId.value = "";
    }
}

// Close Modal
function closeTaskModal() {
    DOM.taskModal.classList.add('hidden');
}

// Mark Task status Completed toggle
function toggleTaskCompletion(taskId) {
    const taskIdx = state.tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;
    
    const task = state.tasks[taskIdx];
    task.completed = !task.completed;
    
    if (task.completed) {
        task.dateCompleted = new Date().toISOString().split('T')[0];
        showToast(`"${task.title}" marked as completed! 🎉`, 'success');
    } else {
        delete task.dateCompleted;
        showToast(`"${task.title}" moved back to pending.`, 'info');
    }
    
    saveTasksToStorage();
    
    // Apply exit visual transition on task-card before full list repaint
    const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (cardElement) {
        cardElement.classList.toggle('task-completed-state');
        
        // Wait briefly for completion animation before refreshing dashboard view
        setTimeout(() => {
            renderApp();
        }, 400);
    } else {
        renderApp();
    }
}

// Delete Task from state
function deleteTask(taskId) {
    const cardElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (cardElement) {
        cardElement.classList.add('task-exit-animate');
    }
    
    setTimeout(() => {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        showToast("Task removed.", 'danger');
        renderApp();
    }, 350);
}

// Clear all Completed tasks
function clearCompletedTasks() {
    const totalCompleted = state.tasks.filter(t => t.completed).length;
    if (totalCompleted === 0) {
        showToast("No completed tasks to clear.", 'info');
        return;
    }
    
    state.tasks = state.tasks.filter(t => !t.completed);
    saveTasksToStorage();
    showToast(`Archived ${totalCompleted} completed tasks cleared!`, 'danger');
    renderApp();
}

// Next productivity tip trigger
function loadNextTip() {
    state.currentTipIndex = (state.currentTipIndex + 1) % PRODUCTIVITY_TIPS.length;
    DOM.productivityTipText.textContent = `"${PRODUCTIVITY_TIPS[state.currentTipIndex]}"`;
}

// ==========================================
// 7. Core Application Rendering & Engine
// ==========================================

function renderApp() {
    if (!state.currentUser) {
        DOM.loginScreen.classList.remove('hidden');
        DOM.appContainer.classList.add('hidden');
        return;
    }
    
    DOM.loginScreen.classList.add('hidden');
    DOM.appContainer.classList.remove('hidden');
    
    // Set Header/Profile content names
    const name = state.currentUser.username;
    const level = state.currentUser.level;
    const initials = getInitials(name);
    
    DOM.userAvatarInitials.textContent = initials;
    DOM.headerAvatarCircle.textContent = initials;
    DOM.userDisplayName.textContent = name;
    DOM.userDisplayLevel.textContent = level;
    DOM.headerUsername.textContent = name;
    
    // Calculate global stats counts
    const pendingTasks = state.tasks.filter(t => !t.completed);
    const completedTasks = state.tasks.filter(t => t.completed);
    
    const pendingCount = pendingTasks.length;
    const completedCount = completedTasks.length;
    const totalCount = state.tasks.length;
    const highPriorityCount = pendingTasks.filter(t => t.priority === 'High').length;
    
    // Dashboard Stats update
    DOM.statPendingCount.textContent = pendingCount;
    DOM.statCompletedCount.textContent = completedCount;
    DOM.statHighPriorityCount.textContent = highPriorityCount;
    DOM.upcomingTaskCount.textContent = `${pendingCount} Remaining`;
    DOM.completedCountBadge.textContent = completedCount;
    
    // Calculate and animate productivity percentage
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    DOM.dashboardProgressPct.textContent = `${progressPercent}%`;
    DOM.dashboardProgressRatio.textContent = `${completedCount} / ${totalCount} Tasks`;
    updateRadialProgress(progressPercent);
    
    // Progress descriptions responses
    if (totalCount === 0) {
        DOM.dashboardProgressDesc.textContent = "Start by mapping your study plans! Add a new task.";
    } else if (progressPercent === 100) {
        DOM.dashboardProgressDesc.textContent = "Spectacular! Complete coursework. You are all set!";
    } else if (progressPercent >= 70) {
        DOM.dashboardProgressDesc.textContent = "Outstanding progress! You're dominating this term.";
    } else if (progressPercent >= 40) {
        DOM.dashboardProgressDesc.textContent = "Steady going! Take a short break, then tackle another.";
    } else {
        DOM.dashboardProgressDesc.textContent = "Keep studying! Complete tasks to build momentum.";
    }
    
    // Render view-specific lists
    if (state.activeView === 'dashboard') {
        renderDashboardTasks(pendingTasks);
        renderCriticalDeadlines(pendingTasks);
    } else if (state.activeView === 'tasks') {
        renderBoardTasks();
    } else if (state.activeView === 'completed') {
        renderCompletedTasksList(completedTasks);
    }
}

// 7.1 View Renderer: Dashboard Active Task List
function renderDashboardTasks(pendingTasks) {
    const listContainer = DOM.activeTasksList;
    listContainer.innerHTML = '';
    
    // Get parameters
    const catFilter = state.dashboardFilters.category;
    const priorityFilter = state.dashboardFilters.priority;
    const sortBy = state.dashboardFilters.sortBy;
    
    // Run filters on pending items
    let filtered = pendingTasks.filter(task => {
        const matchesCategory = catFilter === 'all' || task.category === catFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        // Header query search connection
        const searchVal = DOM.globalSearch.value.toLowerCase().trim();
        const matchesSearch = !searchVal || 
                              task.title.toLowerCase().includes(searchVal) || 
                              task.desc.toLowerCase().includes(searchVal);
                              
        return matchesCategory && matchesPriority && matchesSearch;
    });
    
    // Sort array
    filtered.sort((a, b) => {
        if (sortBy === 'soonest') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'latest') {
            return new Date(b.dueDate) - new Date(a.dueDate);
        } else if (sortBy === 'priority-desc') {
            const priorityVal = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorityVal[b.priority] - priorityVal[a.priority];
        }
        return 0;
    });
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-list-check"></i></div>
                <h3>No matching tasks found</h3>
                <p>Try refining filters or create a new task!</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card task-enter-animate';
        card.setAttribute('data-task-id', task.id);
        
        // Priority HSL mapping colors
        let cardColor = 'var(--primary-color)';
        if (task.priority === 'High') cardColor = 'var(--danger-color)';
        if (task.priority === 'Medium') cardColor = 'var(--warning-color)';
        if (task.priority === 'Low') cardColor = 'var(--success-color)';
        card.style.setProperty('--badge-color', cardColor);
        
        // Days difference calc
        const dateDiff = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        let dateDesc = `Due ${task.dueDate}`;
        if (dateDiff === 0) dateDesc = "Due Today ⚠️";
        else if (dateDiff === 1) dateDesc = "Due Tomorrow ⏳";
        else if (dateDiff < 0) dateDesc = `Overdue by ${Math.abs(dateDiff)} days 🚨`;
        
        const isOverdue = dateDiff < 0;
        const overdueClass = isOverdue ? 'color: var(--danger-color); font-weight: 700;' : '';
        
        card.innerHTML = `
            <div class="task-checkbox-container">
                <button class="chk-btn" onclick="toggleTaskCompletion('${task.id}')" title="Complete task">
                    <i class="fa-solid fa-check"></i>
                </button>
            </div>
            
            <div class="task-content-main">
                <h4 class="task-title-text">${escapeHTML(task.title)}</h4>
                <p class="task-desc-text">${escapeHTML(task.desc)}</p>
                <div class="task-meta-elements">
                    <span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span>
                    <span class="badge badge-primary"><i class="${getCategoryIcon(task.category)}"></i> ${task.category}</span>
                    <span class="task-date-tag" style="${overdueClass}">
                        <i class="fa-regular fa-calendar"></i> ${dateDesc}
                    </span>
                </div>
            </div>
            
            <div class="task-actions">
                <button class="action-icon-btn edit-btn" onclick="openTaskModal('${task.id}')" title="Edit task">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="action-icon-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
}

// 7.2 Render critical panel deadlines
function renderCriticalDeadlines(pendingTasks) {
    const list = DOM.criticalDeadlinesList;
    list.innerHTML = '';
    
    // Critical = due in <= 2 days and High/Medium priority
    const critical = pendingTasks.filter(task => {
        const dateDiff = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return dateDiff <= 2 && (task.priority === 'High' || task.priority === 'Medium');
    });
    
    if (critical.length === 0) {
        list.innerHTML = `<div class="empty-mini-state">All safe! No urgent tasks due in 48h.</div>`;
        return;
    }
    
    // Sort soonest first
    critical.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    critical.forEach(task => {
        const item = document.createElement('div');
        item.className = 'critical-deadline-item';
        
        const dateDiff = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        let deadlineWord = `Due in ${dateDiff} days`;
        if (dateDiff === 0) deadlineWord = "Due TODAY";
        if (dateDiff === 1) deadlineWord = "Due TOMORROW";
        if (dateDiff < 0) deadlineWord = "OVERDUE";
        
        item.innerHTML = `
            <div style="flex-grow: 1;">
                <h5>${escapeHTML(task.title)}</h5>
                <span><i class="fa-solid fa-triangle-exclamation"></i> ${deadlineWord} (${task.priority})</span>
            </div>
        `;
        list.appendChild(item);
    });
}

// 7.3 View Renderer: All Task Board View
function renderBoardTasks() {
    const grid = DOM.boardTasksList;
    grid.innerHTML = '';
    
    const cat = DOM.boardFilterCategory.value;
    const priority = DOM.boardFilterPriority.value;
    const searchVal = DOM.boardSearchInput.value.toLowerCase().trim();
    
    const filtered = state.tasks.filter(task => {
        const matchesCategory = cat === 'all' || task.category === cat;
        const matchesPriority = priority === 'all' || task.priority === priority;
        const matchesSearch = !searchVal || 
                              task.title.toLowerCase().includes(searchVal) || 
                              task.desc.toLowerCase().includes(searchVal);
        return matchesCategory && matchesPriority && matchesSearch;
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
                <h3>No study tasks match current filters</h3>
                <p>Change your query details or create another task card.</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = `metric-card board-task-card glass-panel ${task.completed ? 'task-completed-state' : ''}`;
        card.setAttribute('data-task-id', task.id);
        
        let cardColor = 'var(--primary-color)';
        if (task.priority === 'High') cardColor = 'var(--danger-color)';
        if (task.priority === 'Medium') cardColor = 'var(--warning-color)';
        if (task.priority === 'Low') cardColor = 'var(--success-color)';
        card.style.setProperty('--badge-color', cardColor);
        
        card.innerHTML = `
            <div class="board-task-header">
                <h4 class="task-title-text">${escapeHTML(task.title)}</h4>
                <span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span>
            </div>
            <p class="board-task-desc">${escapeHTML(task.desc)}</p>
            <div class="board-task-footer">
                <span class="badge badge-primary"><i class="${getCategoryIcon(task.category)}"></i> ${task.category}</span>
                <span class="task-date-tag"><i class="fa-regular fa-calendar-days"></i> ${task.dueDate}</span>
            </div>
            
            <div class="task-actions" style="opacity: 1; margin-top: 10px; justify-content: flex-end;">
                <button class="action-icon-btn check-action-btn" onclick="toggleTaskCompletion('${task.id}')" title="Toggle complete">
                    <i class="fa-solid ${task.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                </button>
                <button class="action-icon-btn edit-btn" onclick="openTaskModal('${task.id}')" title="Edit task">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="action-icon-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 7.4 View Renderer: Completed Archive Tasks list
function renderCompletedTasksList(completedTasks) {
    const list = DOM.completedTasksList;
    list.innerHTML = '';
    
    if (completedTasks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-trophy"></i></div>
                <h3>No finished items in storage yet</h3>
                <p>Complete homework items from your board to unlock achievements!</p>
            </div>
        `;
        return;
    }
    
    // Sort by complete date if present, latest completed first
    completedTasks.sort((a, b) => new Date(b.dateCompleted || b.dueDate) - new Date(a.dateCompleted || a.dueDate));
    
    completedTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card task-completed-state';
        card.setAttribute('data-task-id', task.id);
        
        card.innerHTML = `
            <div class="task-checkbox-container">
                <button class="chk-btn" onclick="toggleTaskCompletion('${task.id}')" title="Move back to pending">
                    <i class="fa-solid fa-check"></i>
                </button>
            </div>
            
            <div class="task-content-main">
                <h4 class="task-title-text">${escapeHTML(task.title)}</h4>
                <p class="task-desc-text" style="text-decoration: line-through;">${escapeHTML(task.desc)}</p>
                <div class="task-meta-elements">
                    <span class="badge badge-success"><i class="fa-solid fa-check-double"></i> Complete</span>
                    <span class="badge badge-primary"><i class="${getCategoryIcon(task.category)}"></i> ${task.category}</span>
                    <span class="task-date-tag"><i class="fa-regular fa-calendar-check"></i> Finished: ${task.dateCompleted || task.dueDate}</span>
                </div>
            </div>
            
            <div class="task-actions">
                <button class="action-icon-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete permanently">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        list.appendChild(card);
    });
}

// 7.5 Render Insights stats metrics and chart visualizer heights
function renderInsightsGraph() {
    // 1. Calculate active Study Streak
    const completedCount = state.tasks.filter(t => t.completed).length;
    let streakText = "0 Days";
    if (completedCount >= 10) streakText = "7 Days 🔥";
    else if (completedCount >= 6) streakText = "4 Days 🔥";
    else if (completedCount >= 2) streakText = "2 Days 🔥";
    else if (completedCount === 1) streakText = "1 Day 👍";
    DOM.insightsStreak.textContent = streakText;
    
    // 2. Velocity
    const velocityRate = completedCount > 0 ? (completedCount / 3).toFixed(1) : 0;
    DOM.insightsVelocity.textContent = `${velocityRate} / day`;
    
    // 3. High priority resolution percentage
    const highPriorityTasks = state.tasks.filter(t => t.priority === 'High');
    const resolvedHighPriority = highPriorityTasks.filter(t => t.completed).length;
    const resolutionPct = highPriorityTasks.length > 0 ? Math.round((resolvedHighPriority / highPriorityTasks.length) * 100) : 0;
    DOM.insightsHighPct.textContent = `${resolutionPct}%`;
    
    // 4. Bar Graph Category Counts
    const categories = ['Study', 'Project', 'Exam', 'Personal'];
    const distribution = { Study: 0, Project: 0, Exam: 0, Personal: 0 };
    
    state.tasks.forEach(t => {
        if (distribution.hasOwnProperty(t.category)) {
            distribution[t.category]++;
        }
    });
    
    // Find Max task count to calculate height scaling ratios
    let maxCount = 0;
    categories.forEach(cat => {
        if (distribution[cat] > maxCount) maxCount = distribution[cat];
    });
    
    // Map bar layouts
    categories.forEach(cat => {
        const count = distribution[cat];
        const percentHeight = maxCount > 0 ? Math.round((count / maxCount) * 80) + 10 : 0; // scaled between 10% and 90%
        
        let fillElement;
        if (cat === 'Study') fillElement = DOM.barStudy;
        if (cat === 'Project') fillElement = DOM.barProject;
        if (cat === 'Exam') fillElement = DOM.barExam;
        if (cat === 'Personal') fillElement = DOM.barPersonal;
        
        if (fillElement) {
            // Animate height values
            fillElement.style.height = `${percentHeight}%`;
            fillElement.querySelector('.bar-val').textContent = count;
        }
    });
}

// Escapes raw strings against HTML Injection attacks
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// 8. Event Listeners & Bootstrapping
// ==========================================

function initEventListeners() {
    // Auth Form Login
    DOM.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = DOM.usernameInput.value.trim();
        const studyLevel = DOM.studentLevelInput.value;
        
        if (username) {
            saveUserSession(username, studyLevel);
            showToast(`Welcome back, ${username}! Let's make today productive.`, 'success');
            switchView('dashboard');
        }
    });
    
    // Logout Action
    DOM.logoutBtn.addEventListener('click', () => {
        clearUserSession();
        DOM.loginScreen.classList.remove('hidden');
        DOM.appContainer.classList.add('hidden');
        showToast("Logged out successfully.", 'info');
    });
    
    // Sidebar view switches
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const destinationView = link.getAttribute('data-view');
            switchView(destinationView);
        });
    });
    
    // Global Header Search input
    DOM.globalSearch.addEventListener('input', () => {
        // Redraw lists filtering matching title queries
        if (state.activeView === 'dashboard') {
            renderDashboardTasks(state.tasks.filter(t => !t.completed));
        }
    });
    
    // Theme Toggle Trigger
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Modal Open Add Tasks actions
    DOM.btnAddTaskDash.addEventListener('click', () => openTaskModal());
    DOM.btnAddTaskBoard.addEventListener('click', () => openTaskModal());
    
    // Modal Close operations
    DOM.modalCloseBtnX.addEventListener('click', closeTaskModal);
    DOM.modalCancelBtn.addEventListener('click', closeTaskModal);
    DOM.taskModal.addEventListener('click', (e) => {
        if (e.target === DOM.taskModal) closeTaskModal();
    });
    
    // Modal Task Form Save Submit
    DOM.modalForm.addEventListener('submit', handleTaskFormSubmit);
    
    // Dashboard Filtering Pills Selection
    DOM.categoryFilterPills.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            // Remove active style from siblings
            DOM.categoryFilterPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            
            state.dashboardFilters.category = e.target.getAttribute('data-category');
            renderDashboardTasks(state.tasks.filter(t => !t.completed));
        }
    });
    
    // Dashboard select filters
    DOM.prioritySortSelect.addEventListener('change', (e) => {
        state.dashboardFilters.priority = e.target.value;
        renderDashboardTasks(state.tasks.filter(t => !t.completed));
    });
    DOM.dateSortSelect.addEventListener('change', (e) => {
        state.dashboardFilters.sortBy = e.target.value;
        renderDashboardTasks(state.tasks.filter(t => !t.completed));
    });
    
    // Board View filters
    DOM.boardSearchInput.addEventListener('input', renderBoardTasks);
    DOM.boardFilterCategory.addEventListener('change', renderBoardTasks);
    DOM.boardFilterPriority.addEventListener('change', renderBoardTasks);
    
    // Clear completed list archive action
    DOM.btnClearCompleted.addEventListener('click', clearCompletedTasks);
    
    // Tips Generator
    DOM.btnNextTip.addEventListener('click', loadNextTip);
    
    // Mobile responsive sidebar layout control
    DOM.mobileMenuBtn.addEventListener('click', () => {
        DOM.sidebar.classList.add('mobile-open');
    });
    DOM.mobileCloseBtn.addEventListener('click', () => {
        DOM.sidebar.classList.remove('mobile-open');
    });
}

// Window globally scope toggle items so onclick binds function triggers correctly
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.openTaskModal = openTaskModal;

// Bootstrap initialize application on load
document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorage();
    initCurrentDate();
    initEventListeners();
    applyTheme();
    
    // Render view
    if (state.currentUser) {
        switchView('dashboard');
    } else {
        renderApp();
    }
});
