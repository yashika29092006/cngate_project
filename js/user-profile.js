async function loadProfile() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'user-login.html';
        return;
    }

    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('profileContent');

    try {
        const res = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();

            // Populate fields
            if (document.getElementById('p-name')) document.getElementById('p-name').textContent = user.name || 'N/A';
            if (document.getElementById('p-email')) document.getElementById('p-email').textContent = user.email || 'N/A';
            if (document.getElementById('p-phone')) document.getElementById('p-phone').textContent = user.phone || 'N/A';
            if (document.getElementById('p-vehicle')) document.getElementById('p-vehicle').textContent = user.vehicle || 'N/A';

            // Initials
            const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            if (document.getElementById('avatarInitials')) document.getElementById('avatarInitials').textContent = initial;

            // Show content
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
        } else {
            alert("Failed to load profile. Please login again.");
            window.location.href = 'user-login.html';
        }
    } catch (err) {
        console.error(err);
        if (loadingEl) loadingEl.textContent = 'Error loading profile.';
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);

