// Global storage for filtering without re-fetching from the server
let allTasks = [];

// Fetch tasks and store them in the global array
async function fetchAndRenderTasks(containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        const response = await fetch('/api/tasks');
        allTasks = await response.json();
        renderFilteredTasks(allTasks, containerId);
    } catch (err) {
        console.error("API Error:", err);
    }
}

// Handle category filtering using the stored global array
function filterTasks(category) {
    const filtered = category === 'All'
        ? allTasks
        : allTasks.filter(t => t.category === category);
    renderFilteredTasks(filtered, 'taskList');
}

// --- NEW FUNCTION: Handle status filtering (Pending vs Completed) ---
function filterByStatus(status) {
    const filtered = allTasks.filter(t => t.status === status);
    renderFilteredTasks(filtered, 'taskList');
}

// Core rendering function
function renderFilteredTasks(tasks, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = '';

    // Handle empty states for filters
    if (tasks.length === 0) {
        grid.innerHTML = '<p style="color: #888; padding: 20px; grid-column: 1/-1; text-align: center;">No tasks found.</p>';
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('div');

        // Define priority for CSS class styling
        const priorityClass = task.priority ? task.priority.toLowerCase() : 'medium';

        // Toggle 'completed' class based on status
        card.className = `task-card ${priorityClass} ${task.status === 'completed' ? 'completed' : ''}`;

        card.innerHTML = `
            <div class="task-badge">${task.category || 'General'}</div>
            <div>
                <h3 style="${task.status === 'completed' ? 'text-decoration: line-through; color: #888;' : ''}">${task.title}</h3>
                <p style="color: #666; font-size: 14px;">${task.description || ''}</p>
                <small style="color: #999;">🚩 ${task.priority || 'Medium'} | 📅 Due: ${task.due_date || 'Today'}</small>
            </div>
            <div class="task-actions">
                <button onclick="openEditModal('${task._id}', \`${task.title}\`, \`${task.description || ''}\`, '${task.due_date || ''}', '${task.category}', '${task.priority}')" class="action-btn">✏️ Edit</button>
                
                ${task.status === 'pending' ? `<button onclick="completeTask('${task._id}')" class="action-btn">✅ Done</button>` : ''}
                
                <button onclick="deleteTask('${task._id}')" class="action-btn" style="color: #ff4d4d;">🗑️ Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}