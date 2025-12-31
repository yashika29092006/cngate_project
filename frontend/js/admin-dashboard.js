const currentAdminData = sessionStorage.getItem('currentAdmin');
if (!currentAdminData) {
    window.location.href = '../pages/admin-login.html';
}


const currentAdmin = JSON.parse(currentAdminData);


async function renderAdminDashboard() {
    const grid = document.getElementById('stations-grid');
    const spinner = document.getElementById('dashboard-spinner');
    if (spinner) {
        spinner.style.display = 'block';
        spinner.setAttribute('aria-hidden', 'false');
    }
    await ensureStationsLoaded();
    const stations = getStations();


    const adminStation = stations.find(s => s.id === currentAdmin.stationId);


    if (!adminStation) {
        grid.innerHTML = '<p style="color: #666;">Station not found.</p>';
        return;
    }

    const quantityDisplay = adminStation.quantity !== undefined ?
        `<p class="station-info"><strong>Available Quantity:</strong> ${adminStation.quantity} KG</p>` : '';

    grid.innerHTML = `
        <div class="station-card admin-station-card card-animate">
            <div class="station-card-header">
                <h3>Station Name: ${adminStation.name}</h3>
                <span class="your-station-badge">Your Station</span>
            </div>
            <p class="station-info"><strong>Area:</strong> ${adminStation.area}</p>
            <p class="station-info"><strong>Address:</strong> ${adminStation.address}</p>
            <p class="station-info"><strong>Phone:</strong> ${adminStation.phone}</p>
            <p class="station-info"><strong>Price:</strong> ₹${adminStation.price}/kg</p>
            ${quantityDisplay}
            <p class="station-info"><strong> Timing:</strong> ${adminStation.timing}</p>
            <p class="station-info"><strong>Email:</strong> ${adminStation.email}</p>
            <div style="margin-top: 0.8rem;">
                <span class="status-badge ${adminStation.availability}">
                    ${adminStation.availability === 'available' ? '✓ Available' : '✗ Not Available'}
                </span>
                <span class="status-badge crowd-${adminStation.crowd}">
                    Crowd: ${adminStation.crowd.charAt(0).toUpperCase() + adminStation.crowd.slice(1)}
                </span>
            </div>
        </div>
    `;

    // hide spinner
    if (spinner) {
        spinner.style.display = 'none';
        spinner.setAttribute('aria-hidden', 'true');
    }

    fetchRequests();
    if (typeof fetchAdminReviews === 'function') {
        fetchAdminReviews(adminStation.id);
    }



    const toolbar = document.getElementById('admin-toolbar');
    if (toolbar) {
        const availabilityLabel = adminStation.availability === 'available' ? 'Available' : 'Not Available';
        const quantity = adminStation.quantity !== undefined ? `${adminStation.quantity} KG` : '—';
        const lastUpdated = adminStation.updated_at || adminStation.last_updated || '';


        toolbar.innerHTML = `
            <div class="toolbar-card">
                <div class="label">Station</div>
                <div class="value">${adminStation.name}</div>
            </div>
            <div class="toolbar-card">
                <div class="label">Availability</div>
                <div class="value">${availabilityLabel}</div>
            </div>
            <div class="toolbar-card">
                <div class="label">Quantity</div>
                <div class="value">${quantity}</div>
            </div>
            <div class="toolbar-card">
                <div class="label">Timing</div>
                <div class="value">${adminStation.timing || '—'}</div>
            </div>
            <div class="toolbar-actions">
                <button id="edit-station-btn">Edit Station</button>
                <button id="refresh-station-btn">Refresh</button>
                <button id="delete-station-btn" style="background:#fff;border:1px solid #dc2626;color:#dc2626;">Delete Station</button>
            </div>
        `;
        // attach handlers
        const editBtn = document.getElementById('edit-station-btn');
        if (editBtn) editBtn.addEventListener('click', () => editStation(adminStation.id));

        const refBtn = document.getElementById('refresh-station-btn');
        if (refBtn) refBtn.addEventListener('click', () => { location.reload(); });

        const delBtn = document.getElementById('delete-station-btn');
        if (delBtn) {
            delBtn.addEventListener('click', async () => {
                const ok = confirm('Delete this station permanently? This cannot be undone.');
                if (!ok) return;

                // show spinner while deleting
                const spinner = document.getElementById('dashboard-spinner');
                if (spinner) { spinner.style.display = 'block'; spinner.setAttribute('aria-hidden', 'false'); }

                try {
                    const token = sessionStorage.getItem('token');
                    // Direct fetch to ensure no dependency issues
                    const res = await fetch(`https://cngate-project.vercel.app/api/stations/${adminStation.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        alert('Station deleted successfully.');
                        sessionStorage.removeItem('currentAdmin');
                        sessionStorage.removeItem('token');
                        window.location.href = '../pages/admin-signup.html';
                    } else {
                        const err = await res.json();
                        alert(err.detail || 'Failed to delete station (Server Error)');
                    }
                } catch (e) {
                    console.error(e);
                    alert('Failed to delete station (Network/Client Error)');
                } finally {
                    if (spinner) { spinner.style.display = 'none'; spinner.setAttribute('aria-hidden', 'true'); }
                }
            });
        }
    }
}


function editStation(id) {
    if (currentAdmin.stationId !== id) {
        alert('You can only edit your own station!');
        return;
    }

    const stations = getStations();
    const station = stations.find(s => s.id === id);
    if (!station) return;


    document.getElementById('edit-station-id').value = id;
    document.getElementById('edit-availability').value = station.availability;
    document.getElementById('edit-quantity').value = station.quantity || 0;
    document.getElementById('edit-crowd').value = station.crowd;
    document.getElementById('edit-price').value = station.price;
    document.getElementById('edit-timing').value = station.timing;


    document.getElementById('edit-modal').classList.add('active');
}


document.getElementById('updateStationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('edit-station-id').value);

    if (currentAdmin.stationId !== id) {
        alert('You can only update your own station!');
        closeModal();
        return;
    }

    const updates = {
        availability: document.getElementById('edit-availability').value,
        quantity: parseInt(document.getElementById('edit-quantity').value),
        crowd: document.getElementById('edit-crowd').value,
        price: parseFloat(document.getElementById('edit-price').value),
        timing: document.getElementById('edit-timing').value
    };


    if (await updateStation(id, updates)) {
        renderAdminDashboard();
        closeModal();
        alert('Station details updated successfully!');
    }
});


function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
}


function logout() {
    sessionStorage.removeItem('currentAdmin');
    sessionStorage.removeItem('token');
    window.location.href = '../../index.html';
}


document.getElementById('edit-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});


window.addEventListener('load', function () {
    renderAdminDashboard();
});

async function fetchRequests() {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('https://cngate-project.vercel.app/api/stations/requests/pending', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const reqs = await res.json();
            const container = document.getElementById('requests-container');
            const list = document.getElementById('requests-list');

            if (reqs.length > 0) {
                container.style.display = 'block';
                list.innerHTML = reqs.map(r => `
                    <div class="request-item" style="background: white; padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>User reported:</strong> <span class="status-badge ${r.requested_availability}">${r.requested_availability}</span>
                            <div style="font-size: 0.8rem; color: #666;">${new Date(r.timestamp).toLocaleString()}</div>
                        </div>
                        <div class="req-actions">
                            <button onclick="resolveRequest(${r.id}, 'approve')" style="background: #27ae60; color: white; border: none; padding: 0.5rem; border-radius: 4px; margin-right: 0.5rem; cursor: pointer;">Approve</button>
                            <button onclick="resolveRequest(${r.id}, 'reject')" style="background: #c0392b; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">Reject</button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.style.display = 'none';
            }
        }
    } catch (e) { console.error(e); }
}

async function resolveRequest(reqId, action) {
    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`https://cngate-project.vercel.app/api/stations/requests/${reqId}/resolve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action })
        });
        if (res.ok) {
            alert(`Request ${action}d`);
            fetchRequests();
            if (action === 'approve') {
                await ensureStationsLoaded(); // refresh cache
                renderAdminDashboard(); // update UI
            }
        } else {
            alert('Failed to resolve request');
        }
    } catch (e) { console.error(e); }
}
window.resolveRequest = resolveRequest;

async function fetchAdminReviews(stationId) {
    try {
        const res = await fetch(`https://cngate-project.vercel.app/api/reviews/${stationId}`);
        const reviews = await res.json();
        const list = document.getElementById('admin-reviews-list');

        if (reviews.length === 0) {
            list.innerHTML = '<p style="color: #666; font-style: italic;">No reviews yet.</p>';
            return;
        }

        list.innerHTML = reviews.map(r => `
            <div class="review-item" style="background: white; padding: 1rem; border-bottom: 1px solid #eee; display:flex; justify-content:space-between;">
                <div>
                     <div style="font-weight:bold; color:#333;">${r.user_email || 'User'} <span style="color:#f39c12;">${'⭐'.repeat(r.rating)}</span></div>
                     <div style="color:#555; margin-top:0.3rem;">${r.comment}</div>
                </div>
                <button onclick="deleteReview(${r.id}, ${stationId})" style="background:none; border:none; color:#dc2626; cursor:pointer;" title="Delete Review">🗑️</button>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('admin-reviews-list').innerHTML = 'Failed to load reviews.';
    }
}

async function deleteReview(reviewId, stationId) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`https://cngate-project.vercel.app/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert("Review deleted");
            fetchAdminReviews(stationId);
        } else {
            const err = await res.json();
            alert(err.detail || "Failed to delete review");
        }
    } catch (e) { console.error(e); }
}

window.deleteReview = deleteReview;
