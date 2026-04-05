let currentEditId = null;

function openModal() {
    currentEditId = null;
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('modalTitle').innerText = "Create New Task";
    document.getElementById('submitBtn').innerText = "CREATE TASK";
    clearModalInputs();
}

function openEditModal(id, title, desc, date, category, priority) {
    currentEditId = id;
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('modalTitle').innerText = "Edit Task";
    document.getElementById('submitBtn').innerText = "SAVE CHANGES";

    document.getElementById('modalTaskName').value = title;
    document.getElementById('modalDesc').value = (desc === 'null' || desc === 'undefined') ? '' : desc;
    document.getElementById('modalDate').value = date;

    // Set the dropdown values
    if (category) document.getElementById('modalCategory').value = category;
    if (priority) document.getElementById('modalPriority').value = priority;
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

async function handleTaskSubmit() {
    const title = document.getElementById('modalTaskName').value;
    const description = document.getElementById('modalDesc').value;
    const due_date = document.getElementById('modalDate').value;
    const category = document.getElementById('modalCategory').value;
    const priority = document.getElementById('modalPriority').value;

    if (!title) return alert("Task name is required!");

    const method = currentEditId ? 'PUT' : 'POST';
    const url = currentEditId ? `/api/tasks/${currentEditId}` : '/api/tasks';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date, category, priority })
    });

    if (response.ok) {
        closeModal();
        fetchAndRenderTasks('taskList');
    }
}

async function completeTask(id) {
    await fetch(`/api/tasks/${id}`, { method: 'PATCH' });
    fetchAndRenderTasks('taskList');
}

async function deleteTask(id) {
    if (confirm("Delete this task?")) {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        fetchAndRenderTasks('taskList');
    }
}

function clearModalInputs() {
    document.getElementById('modalTaskName').value = '';
    document.getElementById('modalDesc').value = '';
    document.getElementById('modalDate').value = '';
    document.getElementById('modalCategory').value = 'Work';
    document.getElementById('modalPriority').value = 'Medium';
}

window.onload = () => {
    fetchAndRenderTasks('taskList');
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Close modal on outside click
window.onclick = (e) => {
    const modal = document.getElementById('taskModal');
    if (e.target == modal) closeModal();
};