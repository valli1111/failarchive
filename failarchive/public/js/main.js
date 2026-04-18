// Homepage JavaScript

let currentOffset = 0;
const ENTRIES_PER_PAGE = 12;

async function loadEntries() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'recent';
    const list = document.getElementById('entriesList');

    if (!list) return;

    const loading = document.getElementById('loadingIndicator');
    if (loading) loading.style.display = 'block';

    try {
        const entries = await fetchEntries({
            category: category,
            sort: sort,
            limit: ENTRIES_PER_PAGE,
            offset: currentOffset
        });

        if (currentOffset === 0) {
            list.innerHTML = '';
        }

        if (entries.length === 0 && currentOffset === 0) {
            list.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
                    <h2>No stories found</h2>
                    <p>Try adjusting your filters or <a href="/submit.html">share a story</a></p>
                </div>
            `;
        } else {
            entries.forEach(entry => {
                list.innerHTML += createEntryCardHTML(entry);
            });

            if (entries.length < ENTRIES_PER_PAGE) {
                if (loading) loading.style.display = 'none';
            }

            currentOffset += entries.length;
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        if (list) list.innerHTML = '<div class="error-message">Error loading entries</div>';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

async function search() {
    const query = document.getElementById('searchInput')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const sort = document.getElementById('sortFilter')?.value || 'recent';
    const list = document.getElementById('entriesList');

    if (!list) return;

    const loading = document.getElementById('loadingIndicator');
    if (loading) loading.style.display = 'block';

    try {
        const entries = await fetchEntries({
            q: query,
            category: category,
            sort: sort
        });

        list.innerHTML = entries.length === 0
            ? `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h2>No results for "${escapeHtml(query)}"</h2>
                    <p>Try different search terms or <a href="/submit.html">share your own story</a></p>
                </div>
              `
            : entries.map(entry => createEntryCardHTML(entry)).join('');

        currentOffset = 0;
    } catch (error) {
        console.error('Error searching:', error);
        list.innerHTML = '<div class="error-message">Error searching entries</div>';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

function filterEntries() {
    currentOffset = 0;
    loadEntries();
}

async function updateStats() {
    try {
        const stats = await getStats();
        const entriesEl = document.getElementById('statEntries');
        const tipsEl = document.getElementById('statTips');

        if (entriesEl) entriesEl.textContent = stats.entries;
        if (tipsEl) tipsEl.textContent = stats.tips;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Infinite scroll
let isLoading = false;

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (isLoading) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 500) {
            isLoading = true;
            loadEntries().then(() => {
                isLoading = false;
            });
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    updateStats();
    loadEntries();
    setupInfiniteScroll();

    // Add enter key support for search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                search();
            }
        });
    }

    // Reset offset when filters change
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentOffset = 0;
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            currentOffset = 0;
        });
    }
});
