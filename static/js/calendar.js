document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');
    const detailView = document.getElementById('calendarTaskDetails');

    if (!calendarEl) return;

    try {
        // 1. Fetch tasks from your Flask API
        const response = await fetch('/api/tasks');
        const tasks = await response.json();

        // 2. Map tasks to FullCalendar events with priority-based colors
        const events = tasks.map(task => {
            let color = '#2ecc71'; // Default: Low (Green)

            if (task.priority === 'High') {
                color = '#ff4d4d'; // Red
            } else if (task.priority === 'Medium') {
                color = '#ffcc00'; // Yellow
            }

            return {
                id: task._id,
                title: task.title,
                start: task.due_date, // FullCalendar needs YYYY-MM-DD
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    description: task.description,
                    category: task.category,
                    priority: task.priority,
                    status: task.status
                }
            };
        });

        // 3. Initialize the Calendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            events: events,
            eventClick: function (info) {
                // Show task details below the calendar
                document.getElementById('detailTitle').innerText = info.event.title;
                document.getElementById('detailDesc').innerText = info.event.extendedProps.description || "No description provided.";

                const statusIcon = info.event.extendedProps.status === 'completed' ? '✅' : '⏳';

                document.getElementById('detailMeta').innerHTML = `
                    <strong>Status:</strong> ${statusIcon} ${info.event.extendedProps.status} | 
                    <strong>Category:</strong> ${info.event.extendedProps.category || 'General'} | 
                    <strong>Priority:</strong> ${info.event.extendedProps.priority}
                `;

                // Match the detail box border to the task priority color
                detailView.style.borderLeftColor = info.event.backgroundColor;
                detailView.style.display = 'block';

                // Optional: Smooth scroll to details
                detailView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        calendar.render();

    } catch (err) {
        console.error("Error loading calendar tasks:", err);
    }
});