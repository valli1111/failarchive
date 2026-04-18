// Submit form JavaScript

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();

    const form = document.getElementById('submitForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

async function handleSubmit(e) {
    e.preventDefault();

    // Collect form data
    const data = {
        title: document.getElementById('title').value.trim(),
        company: document.getElementById('company').value.trim() || null,
        industry: document.getElementById('industry').value,
        category: document.getElementById('category').value,
        story: document.getElementById('story').value.trim(),
        what_went_wrong: document.getElementById('whatWentWrong').value.trim(),
        what_learned: document.getElementById('whatLearned').value.trim(),
        recovery: document.getElementById('recovery').value.trim() || null,
        impact_level: parseInt(document.getElementById('impactLevel').value),
        company_stage: document.getElementById('companyStage').value || null,
        time_lost: document.getElementById('timeLost').value.trim() || null,
        author: document.getElementById('author').value.trim() || 'Anonymous',
        tags: document.getElementById('tags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
    };

    // Validate required fields
    const requiredFields = ['title', 'industry', 'category', 'story', 'what_went_wrong', 'what_learned'];
    for (const field of requiredFields) {
        if (!data[field]) {
            showMessage(`Please fill in ${field.replace(/_/g, ' ')}`, 'error');
            return;
        }
    }

    // Validate field lengths
    if (data.title.length > 200) {
        showMessage('Title is too long (max 200 characters)', 'error');
        return;
    }

    if (data.story.length < 50) {
        showMessage('Story must be at least 50 characters', 'error');
        return;
    }

    if (data.what_learned.length < 50) {
        showMessage('Lesson learned must be at least 50 characters', 'error');
        return;
    }

    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const result = await createEntry(data);

        showMessage('Success! Your failure story has been submitted. Thank you for contributing to FailArchive!', 'success');

        // Reset form
        document.getElementById('submitForm').reset();

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = `/entry.html?id=${result.id}`;
        }, 2000);

    } catch (error) {
        console.error('Error submitting:', error);
        showMessage('Error submitting your story. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Story';
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('submitMessage');
    messageEl.textContent = message;
    messageEl.className = `submit-message ${type}`;
    messageEl.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}
