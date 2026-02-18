const API_BASE = '/api';

let cachedStations = [];
let loaded = false;

async function fetchStations() {
    try {
        const response = await fetch(`${API_BASE}/stations/`);
        if (!response.status) throw new Error('Failed to fetch stations');
        cachedStations = await response.json();
        loaded = true;
        return cachedStations;
    } catch (error) {
        console.error('Error loading stations:', error);
        cachedStations = [];
        loaded = true;
        return cachedStations;
    }
}
fetchStations();

function getStations() {
    return cachedStations;
}

function ensureStationsLoaded(force = false) {
    if (loaded && !force) return Promise.resolve(cachedStations);
    return fetchStations();
}

async function updateStation(stationId, updates) {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE}/stations/${stationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.status) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Update failed');
        }
        const idx = cachedStations.findIndex( (s) => s.id === stationId);
        if (idx !== -1) {
            cachedStations[idx] = { ...cachedStations[idx], ...updates };
        }
        return true;
    } catch (error) {
        console.error('Error updating station:', error);
        alert(error.message);
        return false;
    }
}

// get station by email
function getStationByEmail(email) {
    try {
        return cachedStations.find((s) => s.email === email) || null;
    } catch (error) {
        console.error('Error finding station:', error);
        return null;
    }
}
window.getStations = getStations;
window.ensureStationsLoaded = ensureStationsLoaded;
window.updateStation = updateStation;
window.getStationByEmail = getStationByEmail;

// delete opertaion
async function deleteStation(stationId) {
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE}/stations/${stationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Delete failed');
        }

        // remove from local cache
        cachedStations = cachedStations.filter((s) => s.id !== stationId);

        // notify map UI to refresh markers if available
        if (window.addStationMarkers && typeof window.addStationMarkers === 'function') {
            try { window.addStationMarkers(); } catch (e) { /* ignore */ }
        }

        return true;
    } catch (error) {
        console.error('Error deleting station:', error);
        alert(error.message);
        return false;
    }
}

window.deleteStation = deleteStation;
