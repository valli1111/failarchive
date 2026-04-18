// Entry detail page JavaScript

let currentEntryId = null;
let currentEntry = null;

async function loadEntry() {
    const urlParams = new URLSearchParams(window.location.search);
    const entryId = urlParams.get('id');

    if (!entryId) {
        window.location.href = '/';
        return;
    }

    currentEntryId = parseInt(entryId);

    try {
        const data = await fetchEntry(currentEntryId);
        const entry = data.entry;
        currentEntry = entry;

        // Set page title
        document.title = `${entry.title} - FailArchive`;

        // Populate entry data
        document.getElementById('entryTitle').textContent = entry.title;
        document.getElementById('categoryBadge').textContent = entry.category;
        document.getElementById('categoryBadge').className = 'badge';

        if (entry.company) {
            document.getElementById('companyName').textContent = entry.company;
        } else {
            document.getElementById('companyName').textContent = 'Anonymous Company';
        }

        if (entry.company_stage) {
            document.getElementById('stageInfo').textContent = `• ${entry.company_stage}`;
        }

        document.getElementById('entryDate').textContent = `• ${formatDate(entry.created_at)}`;

        document.getElementById('entryStory').textContent = entry.story;
        document.getElementById('entryWentWrong').textContent = entry.what_went_wrong;
        document.getElementById('entryLearned').textContent = entry.what_learned;

        if (entry.recovery) {
            document.getElementById('recoverySection').style.display = 'block';
            document.getElementById('entryRecovery').textContent = entry.recovery;
        }

        // Impact level
        const impactMeterHTML = createImpactMeter(entry.impact_level);
        document.getElementById('impactMeter').innerHTML = impactMeterHTML;
        const impactTexts = ['', 'Minor', 'Moderate', 'Significant', 'Major', 'Critical'];
        document.getElementById('impactText').textContent = impactTexts[entry.impact_level];

        // Author
        document.getElementById('authorName').textContent = entry.author || 'Anonymous';

        // Update reaction counts
        document.getElementById('upvoteCount').textContent = entry.upvotes;
        document.getElementById('beenThereCount').textContent = entry.been_there;

        // Update bookmark icon
        updateBookmarkIcon(currentEntryId);

        // Load tips
        loadTips(data.tips);

        // Load related entries
        loadRelated(data.related);

    } catch (error) {
        console.error('Error loading entry:', error);
        document.body.innerHTML = `
            <div class="container" style="padding: 3rem 0; text-align: center;">
                <h1>Entry not found</h1>
                <p>The failure story you're looking for doesn't exist.</p>
                <a href="/" class="btn-primary">Back to Explore</a>
            </div>
        `;
    }
}

function loadTips(tips) {
    const tipsList = document.getElementById('tipsList');
    if (tips.length === 0) {
        tipsList.innerHTML = '<p style="color: var(--text-secondary);">No tips yet. Be the first to share!</p>';
    } else {
        tipsList.innerHTML = tips.map(tip => createTipCardHTML(tip)).join('');
    }
}

function loadRelated(relatedEntries) {
    const relatedList = document.getElementById('relatedList');
    if (relatedEntries.length === 0) {
        relatedList.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No similar stories yet.</p>';
    } else {
        relatedList.innerHTML = relatedEntries.map(entry => createEntryCardHTML(entry)).join('');
    }
}

async function submitTip() {
    const content = document.getElementById('tipContent').value.trim();
    const author = document.getElementById('tipAuthor').value.trim() || 'Anonymous';
    const experience = document.getElementById('tipExperience').value;

    if (!content) {
        showNotification('Please enter a tip', 'error');
        return;
    }

    const submitBtn = event.target;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sharing...';

    try {
        await addTip(currentEntryId, {
            content: content,
            author: author,
            experience_years: experience ? parseInt(experience) : null
        });

        // Clear form
        document.getElementById('tipContent').value = '';
        document.getElementById('tipAuthor').value = '';
        document.getElementById('tipExperience').value = '';

        showNotification('Tip shared! Thanks for contributing.', 'success');

        // Reload tips
        const data = await fetchEntry(currentEntryId);
        loadTips(data.tips);

    } catch (error) {
        console.error('Error submitting tip:', error);
        showNotification('Error sharing tip. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Share Tip';
    }
}

async function upvoteEntry() {
    try {
        const result = await upvoteEntry(currentEntryId);
        document.getElementById('upvoteCount').textContent = result.upvotes;
        showNotification('Upvoted!', 'success', 2000);
    } catch (error) {
        console.error('Error upvoting:', error);
        showNotification('Error upvoting. Try again.', 'error');
    }
}

async function beenThereEntry() {
    try {
        const result = await beenThereEntry(currentEntryId);
        document.getElementById('beenThereCount').textContent = result.been_there;
        showNotification('Added! We\'ve been there too.', 'success', 2000);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error. Try again.', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadEntry();
});
