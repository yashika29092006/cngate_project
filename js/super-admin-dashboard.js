const API_URL = '/api';

async function checkAuthAndLoad() {
    // Set current date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        await Promise.all([
            loadPendingStations(),
            loadContactRequests(),
            loadStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Handle unauthorized or server error
    }
}

async function loadStats() {
    try {
        // Fetch approved stations from regular endpoint
        const respStations = await fetch(`${API_URL}/stations/`);
        const stations = await respStations.json();
        document.getElementById('stat-total').innerText = stations.length;

    } catch (e) {
        console.error(e);
    }
}

async function loadPendingStations() {
    const container = document.getElementById('pending-grid');

    try {
        const response = await fetch(`${API_URL}/super-admin/stations/pending`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403) {
            container.innerHTML = '<div class="empty-state">Not authorized. Please login as Super Admin.</div>';
            return;
        }

        const stations = await response.json();
        document.getElementById('stat-pending').innerText = stations.length;

        if (stations.length === 0) {
            container.innerHTML = '<div class="empty-state">No new station requests at the moment.</div>';
            return;
        }

        container.innerHTML = stations.map(station => `
            <div class="modern-card">
                <div class="card-header">
                    <span class="card-title">${station.name}</span>
                    <span class="badge badge-pending">PENDING</span>
                </div>
                <div class="card-details">
                    <div class="detail-item">📧 <span>${station.email}</span></div>
                    <div class="detail-item">📍 <span>${station.area}</span></div>
                    <div class="detail-item">📞 <span>${station.phone}</span></div>
                </div>
                <div class="action-row">
                    <button class="btn btn-approve" onclick="approveStation(${station.id}, this)">Approve</button>
                    <button class="btn btn-reject" onclick="rejectStation(${station.id}, this)">Reject</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading stations.</div>';
    }
}

async function loadContactRequests() {
    const container = document.getElementById('contacts-list');

    try {
        const response = await fetch(`${API_URL}/super-admin/contacts`, {
            headers: getAuthHeaders()
        });

        if (response.status === 403) return;

        const contacts = await response.json();
        document.getElementById('stat-contacts').innerText = contacts.length;

        if (contacts.length === 0) {
            container.innerHTML = '<div class="empty-state">Zero unread messages. Good job!</div>';
            return;
        }

        container.innerHTML = contacts.map(contact => {
            let emailDisplay = contact.email;
            if (contact.role === 'user') {
                emailDisplay = `user : ${contact.email}`;
            } else if (contact.role === 'admin') {
                emailDisplay = `admin : ${contact.email}${contact.station_name ? ` ( ${contact.station_name} )` : ''}`;
            }

            return `
            <div class="request-item">
                <div class="request-top">
                    <div class="user-info">
                        <h4>${contact.name}</h4>
                        <p>${emailDisplay} • 📞 ${contact.phone || 'N/A'}</p>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(contact.created_at + (contact.created_at.includes('Z') || contact.created_at.includes('+') ? '' : 'Z')).toLocaleString()}</span>
                        <button class="btn btn-reject" style="padding: 0.25rem 0.75rem; font-size: 0.75rem;" onclick="deleteContact(${contact.id}, this)">Delete</button>
                    </div>
                </div>
                <div class="msg-content">
                    "${contact.message}"
                </div>
                
                <div class="response-section" style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">ADMIN RESPONSE</label>
                    <textarea id="response-text-${contact.id}" placeholder="Type your response here..." style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; font-family: inherit; font-size: 0.9rem; margin-bottom: 0.75rem;">${contact.admin_response || ''}</textarea>
                    <button class="btn btn-approve" style="width: auto; padding: 0.5rem 1.5rem;" onclick="respondToContact(${contact.id}, this)">
                        ${contact.admin_response ? 'Update Response' : 'Post to Contact Page'}
                    </button>
                </div>
            </div>
        `;
        }).join('');

    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading contacts.</div>';
    }
}

async function approveStation(id, btn) {
    if (!confirm('Are you sure you want to approve this station?')) return;

    if (btn) btn.classList.add('btn-loading');
    try {
        const response = await fetch(`${API_URL}/super-admin/stations/${id}/approve`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showToast('Station Approved', 'success');
            loadPendingStations();
            loadStats();
        } else {
            showToast('Failed to approve', 'error');
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}

async function rejectStation(id, btn) {
    if (!confirm('Reject and delete this station request permanently?')) return;

    if (btn) btn.classList.add('btn-loading');
    try {
        const response = await fetch(`${API_URL}/super-admin/stations/${id}/reject`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showToast('Station Rejected', 'info');
            loadPendingStations();
        } else {
            showToast('Failed to reject', 'error');
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}

async function respondToContact(id, btn) {
    const responseText = document.getElementById(`response-text-${id}`).value;
    if (!responseText.trim()) {
        showToast('Please enter a response', 'error');
        return;
    }

    if (btn) btn.classList.add('btn-loading');
    try {
        const response = await fetch(`${API_URL}/super-admin/contacts/${id}/respond`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ response: responseText })
        });

        if (response.ok) {
            showToast('Response posted to Contact Page', 'success');
            loadContactRequests();
        } else {
            showToast('Failed to post response', 'error');
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}

async function deleteContact(id, btn) {
    if (!confirm('Delete this message permanently?')) return;

    if (btn) btn.classList.add('btn-loading');
    try {
        const response = await fetch(`${API_URL}/super-admin/contacts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showToast('Message Deleted', 'info');
            loadContactRequests();
        } else {
            showToast('Failed to delete', 'error');
        }
    } catch (error) {
        console.error(error);
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}

function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function logout(btn) {
    if (btn) btn.classList.add('btn-loading');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentAdmin');
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 500);
}
window.logout = logout;
window.approveStation = approveStation;
window.rejectStation = rejectStation;
window.deleteContact = deleteContact;
window.respondToContact = respondToContact;

function showToast(msg, type) {
    // Simple alert for now, but UI-wise we could do better
    alert(msg);
}

document.addEventListener('DOMContentLoaded', checkAuthAndLoad);
