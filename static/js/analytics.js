document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();

        // 1. Calculate Core Metrics
        const total = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const completedCount = completedTasks.length;
        const pendingCount = total - completedCount;
        const score = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // 2. Update Text Elements
        document.getElementById('totalCount').innerText = total;
        document.getElementById('compCount').innerText = completedCount;
        document.getElementById('pendingCount').innerText = pendingCount;
        document.getElementById('focusScore').innerText = score + "%";

        // Dynamic Score Styling
        const scoreLabel = document.getElementById('scoreLabel');
        if (score >= 80) {
            scoreLabel.innerText = "Zen Master";
            scoreLabel.style.color = "#2ecc71";
        } else if (score >= 50) {
            scoreLabel.innerText = "In the Flow";
            scoreLabel.style.color = "#FFD200";
        } else {
            scoreLabel.innerText = "Quiet Growth";
            scoreLabel.style.color = "#888";
        }

        // 3. Prepare Category Data for Donut Chart
        const categories = ['Work', 'Personal', 'Health', 'Finance'];
        const categoryCounts = categories.map(cat => tasks.filter(t => t.category === cat).length);

        // 4. Initialize Productivity Flow (Line Chart)
        const lineCtx = document.getElementById('productivityChart').getContext('2d');
        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Completed',
                    data: [0, 0, 0, 0, completedCount, 0, 0], // Placeholder for daily logic
                    borderColor: '#FFD200',
                    backgroundColor: 'rgba(255, 210, 0, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#FFD200'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 5. Initialize Category Balance (Donut Chart)
        const donutCtx = document.getElementById('categoryChart').getContext('2d');
        new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryCounts,
                    backgroundColor: ['#1e1e2d', '#FFD200', '#2ecc71', '#ff4d4d'],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11, family: 'Inter, sans-serif' } }
                    }
                },
                cutout: '75%'
            }
        });

        // 6. Reflection Logic
        const quoteEl = document.getElementById('zenQuote');
        if (total === 0) {
            quoteEl.innerText = "A blank canvas is full of possibility. Start by adding your first task.";
        } else if (score > 80) {
            quoteEl.innerText = "Your focus is like a laser. You are mastering the art of the present moment.";
        } else if (pendingCount > 5) {
            quoteEl.innerText = "The weight of unfinished things can be heavy. Release one small task today.";
        } else {
            quoteEl.innerText = "Productivity is not about doing more, but being more of who you are.";
        }

    } catch (err) {
        console.error("Analytics Script Error:", err);
    }
});