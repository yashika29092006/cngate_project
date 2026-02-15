console.log('contact.js v3 loaded');
// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// Load Public Responses
async function loadPublicResponses() {
    const grid = document.getElementById('responses-grid');
    if (!grid) return;

    try {
        const response = await fetch('/api/contact/responses');
        const data = await response.json();

        if (data.length === 0) {
            grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">No public inquiries yet.</div>';
            return;
        }

        grid.innerHTML = data.map(item => `
            <div style="background: white; padding: 2.5rem; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
                <div style="margin-bottom: 1.5rem;">
                    <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700;">Inquiry</span>
                    <p style="font-weight: 600; font-size: 1.1rem; margin-top: 0.5rem; color: var(--text-main);">"${item.message}"</p>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${item.name} • ${new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--primary);">
                    <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); font-weight: 700; display: block; margin-bottom: 0.5rem;">Official Response</span>
                    <p style="font-size: 0.95rem; color: var(--primary); margin: 0;">${item.admin_response}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading responses:', error);
        grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1; color: var(--text-muted);">Unable to load responses at this time.</div>';
    }
}

// Auto-fill form if logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const currentAdmin = JSON.parse(sessionStorage.getItem('currentAdmin'));

    if (currentAdmin) {
        if (document.getElementById('name')) document.getElementById('name').value = currentAdmin.stationName || '';
        if (document.getElementById('email')) document.getElementById('email').value = currentAdmin.email || '';
    } else if (currentUser) {
        if (document.getElementById('name')) document.getElementById('name').value = currentUser.name || '';
        if (document.getElementById('email')) document.getElementById('email').value = currentUser.email || '';
    }

    loadPublicResponses();
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add('btn-loading');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // Get user/admin info from sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const currentAdmin = JSON.parse(sessionStorage.getItem('currentAdmin'));

        let role = null;
        let station_name = null;

        // Only attach role if the email matches the logged-in account
        if (currentAdmin && currentAdmin.email === email) {
            role = 'admin';
            station_name = currentAdmin.stationName;
        } else if (currentUser && currentUser.email === email) {
            role = 'user';
        }

        const payload = { name, email, phone, message, role, station_name };
        console.log('Sending payload:', payload);

        try {
            const response = await fetch('/api/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Message sent successfully! We will get back to you shortly.');
                // Refresh responses grid or clear form
                e.target.reset();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Submission failed:', errorData);

                let errorMessage = 'Unknown error';
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                } else if (errorData.detail) {
                    errorMessage = JSON.stringify(errorData.detail);
                } else if (response.statusText) {
                    errorMessage = response.statusText;
                }

                alert(`Failed to send message (Status ${response.status}):\n${errorMessage}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        } finally {
            if (submitBtn) submitBtn.classList.remove('btn-loading');
        }
    });
}
