// Admin panel JavaScript

const ADMIN_TOKEN = 'failarchive-admin-2024';

function adminLogin() {
    const token = document.getElementById('adminToken').value.trim();
    const errorDiv = document.getElementById('loginError');

    if (token === ADMIN_TOKEN) {
        setAdminToken(token);
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadDashboard();
    } else {
        errorDiv.textContent = 'Invalid admin token';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

async function loadDashboard() {
    try {
        const stats = await getStats();

        document.getElementById('statTotalEntries').textContent = stats.entries;
        document.getElementById('statTotalTips').textContent = stats.tips;
        document.getElementById('statTotalUpvotes').textContent = formatNumber(stats.upvotes || 0);

        // Load entries
        const entries = await fetchEntries({ limit: 50 });
        loadEntriesTable(entries);

        // Count featured
        const featured = entries.filter(e => e.featured).length;
        document.getElementById('statFeatured').textContent = featured;

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard', 'error');
    }
}

function loadEntriesTable(entries) {
    const tbody = document.getElementById('entriesTableBody');
    tbody.innerHTML = entries.map(entry => `
        <tr>
            <td>${entry.id}</td>
            <td><a href="/entry.html?id=${entry.id}" target="_blank">${escapeHtml(entry.title.substring(0, 50))}</a></td>
            <td>${escapeHtml(entry.category)}</td>
            <td>${escapeHtml(entry.author || 'Anonymous')}</td>
            <td>${entry.upvotes}</td>
            <td>${formatDate(entry.created_at)}</td>
            <td>
                <button onclick="window.open('/entry.html?id=${entry.id}', '_blank')" class="btn-secondary">View</button>
            </td>
        </tr>
    `).join('');
}

function updateFeatured() {
    const input = document.getElementById('featuredInput').value;
    const ids = input.split(',').map(id => id.trim()).filter(id => id);

    if (ids.length === 0) {
        showNotification('No IDs entered', 'error');
        return;
    }

    showNotification('Featured entries updated (feature coming soon)', 'success');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (isAdminLoggedIn()) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadDashboard();
    } else {
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }

    // Enter key to login
    const tokenInput = document.getElementById('adminToken');
    if (tokenInput) {
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                adminLogin();
            }
        });
    }
});
