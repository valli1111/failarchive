// Utility functions for FailArchive

const API_BASE = '/api';
const BOOKMARKS_KEY = 'failarchive_bookmarks';

// Bookmarks Management
function getBookmarks() {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
}

function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

function addBookmark(entryId) {
    const bookmarks = getBookmarks();
    if (!bookmarks.includes(entryId)) {
        bookmarks.push(entryId);
        saveBookmarks(bookmarks);
    }
}

function removeBookmark(entryId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(entryId);
    if (index > -1) {
        bookmarks.splice(index, 1);
        saveBookmarks(bookmarks);
    }
}

function isBookmarked(entryId) {
    return getBookmarks().includes(entryId);
}

function toggleBookmark(entryId = null) {
    if (entryId === null) {
        const urlParams = new URLSearchParams(window.location.search);
        entryId = parseInt(urlParams.get('id'));
    }

    if (isBookmarked(entryId)) {
        removeBookmark(entryId);
    } else {
        addBookmark(entryId);
    }

    updateBookmarkIcon(entryId);
}

function updateBookmarkIcon(entryId = null) {
    const icon = document.getElementById('bookmarkIcon');
    if (icon) {
        if (isBookmarked(entryId)) {
            icon.textContent = '★';
        } else {
            icon.textContent = '☆';
        }
    }
}

// API Calls
async function fetchEntries(options = {}) {
    const params = new URLSearchParams();
    if (options.q) params.append('q', options.q);
    if (options.category) params.append('category', options.category);
    if (options.sort) params.append('sort', options.sort);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const response = await fetch(`${API_BASE}/entries?${params}`);
    return await response.json();
}

async function fetchEntry(id) {
    const response = await fetch(`${API_BASE}/entries/${id}`);
    if (!response.ok) throw new Error('Entry not found');
    return await response.json();
}

async function createEntry(data) {
    const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create entry');
    return await response.json();
}

async function upvoteEntry(id) {
    const response = await fetch(`${API_BASE}/entries/${id}/upvote`, {
        method: 'POST'
    });
    return await response.json();
}

async function beenThereEntry(id) {
    const response = await fetch(`${API_BASE}/entries/${id}/been-there`, {
        method: 'POST'
    });
    return await response.json();
}

async function addTip(entryId, data) {
    const response = await fetch(`${API_BASE}/entries/${entryId}/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add tip');
    return await response.json();
}

async function upvoteTip(tipId) {
    const response = await fetch(`${API_BASE}/tips/${tipId}/upvote`, {
        method: 'POST'
    });
    return await response.json();
}

async function getStats() {
    const response = await fetch(`${API_BASE}/stats`);
    return await response.json();
}

// Formatting
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Impact Meter
function createImpactMeter(level) {
    let html = '<div class="impact-meter">';
    for (let i = 1; i <= 5; i++) {
        html += `<span${i <= level ? ' class="filled"' : ''}></span>`;
    }
    html += '</div>';
    return html;
}

// HTML Escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Admin Auth
function setAdminToken(token) {
    sessionStorage.setItem('admin_token', token);
}

function getAdminToken() {
    return sessionStorage.getItem('admin_token');
}

function isAdminLoggedIn() {
    return getAdminToken() !== null;
}

function logout() {
    sessionStorage.removeItem('admin_token');
    window.location.href = '/admin.html';
}

// Check if admin is logged in (for admin pages)
function checkAdminAuth() {
    if (!isAdminLoggedIn() && window.location.pathname.includes('admin')) {
        const loginForm = document.getElementById('loginForm');
        const dashboard = document.getElementById('adminDashboard');
        if (loginForm) loginForm.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }
}

// Tags parsing
function parseTags(tagsStr) {
    if (typeof tagsStr === 'string') {
        return JSON.parse(tagsStr);
    }
    return tagsStr || [];
}

// Entry card HTML generator
function createEntryCardHTML(entry) {
    return `
        <div class="entry-card">
            <div class="card-header">
                <h3><a href="/entry.html?id=${entry.id}">${escapeHtml(entry.title)}</a></h3>
                <span class="category-badge">${escapeHtml(entry.category)}</span>
            </div>
            <p class="card-excerpt">${escapeHtml(entry.what_learned.substring(0, 120))}...</p>
            <div class="card-meta">
                <span>👍 ${entry.upvotes}</span>
                <span>👁️ ${formatNumber(entry.views)}</span>
                <span>💡 ${entry.tip_count || 0} tips</span>
            </div>
            <div class="card-footer">
                <button onclick="window.location.href='/entry.html?id=${entry.id}'">Read</button>
                <button onclick="toggleBookmark(${entry.id}); updateBookmarkIcon(${entry.id})">
                    ${isBookmarked(entry.id) ? '★ Saved' : '☆ Save'}
                </button>
            </div>
        </div>
    `;
}

// Tip card HTML generator
function createTipCardHTML(tip) {
    return `
        <div class="tip-card">
            <div class="tip-author">${escapeHtml(tip.author || 'Anonymous')}</div>
            <div class="tip-content">${escapeHtml(tip.content)}</div>
            <div class="tip-meta">
                <span>${tip.experience_years ? `${tip.experience_years} years exp` : 'Experience not specified'}</span>
                <button onclick="upvoteTip(${tip.id})" class="tip-upvote">👍 ${tip.upvotes}</button>
            </div>
        </div>
    `;
}
