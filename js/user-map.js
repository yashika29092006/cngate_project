import { getStations, ensureStationsLoaded } from './stations-data.js';

let map;
let markers = [];
let userLocationMarker = null;

function initMap() {
    if (map) return;

    // Default center (can be adjusted)
    map = L.map('map').setView([13.0827, 80.2707], 12); // Chennai coordinates as default

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Force map to recognize container size
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

function addStationMarkers() {
    const stations = getStations();

    // Clear old markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    stations.forEach((station) => {
        const lat = parseFloat(station.lat);
        const lng = parseFloat(station.lng);

        // Check for valid coordinates
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Station ${station.id} (${station.name}) has missing or invalid coordinates. Skipping.`);
            return;
        }

        const iconClass = station.availability === 'available' ? 'marker-available' : 'marker-unavailable';

        // Custom marker icon
        const icon = L.divIcon({
            className: 'custom-marker ' + iconClass,
            html: '⛽',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        //Create Marker at the location
        const marker = L.marker([lat, lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b><br>${station.area}`)//shows pop when user clicked marker
            .on('click', () => showStationDetails(station.id));

        markers.push(marker);
    });
}
window.addStationMarkers = addStationMarkers;

function showStationDetails(stationId) {
    const station = getStations().find(s => s.id === stationId);
    if (!station) return;

    const popup = document.getElementById('stationPopup');
    const content = document.getElementById('popupContent');

    //crowd badge color
    let crowdColor = '#f39c12';
    if (station.crowd === 'Low') crowdColor = '#27ae60';
    if (station.crowd === 'High') crowdColor = '#c0392b';

    content.innerHTML = `
        <h3>${station.name}</h3>
        <p><strong>Area:</strong> ${station.area}</p>
        <p><strong>Status:</strong> <span class="status-badge ${station.availability}">${station.availability}</span></p>
        <p><strong>Crowd:</strong> <span style="color:${crowdColor}; font-weight:bold;">${station.crowd || 'Unknown'}</span></p>
        <p><strong>Quantity:</strong> ${station.quantity || 0} kg</p>
        <p><strong>Price:</strong> ₹${station.price}/kg</p>
        <p><strong>Timing:</strong> ${station.timing}</p>
        <p><strong>Last Updated:</strong> ${new Date(station.updated_at || station.last_updated || Date.now()).toLocaleString()}</p>

        ${station.amenities ? `
        <div class="amenities-section" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <p><strong>Available Amenities:</strong></p>
            <div class="amenities-list" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                ${station.amenities.split(',').map((item) => `
                    <span class="amenity-item" style="background: #f0f7f4; color: #1b4332; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; border: 1px solid #d8e9e1;">
                        ${item.trim()}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="popup-actions" style="margin-top: 20px;">
            <button onclick="getDirections(${station.lat}, ${station.lng})" class="directions-btn">Get Directions</button>
            <div class="user-actions">
                <h4>Report Status</h4>
                <div class="report-buttons">
                     <button onclick="reportAvailability(${station.id}, 'available', this)" class="btn-avail">Available</button>
                     <button onclick="reportAvailability(${station.id}, 'unavailable', this)" class="btn-unavail">Unavailable</button>
                </div>
            </div>
            <div class="reviews-section">
                <h4>Reviews</h4>
                <div id="reviewsList" class="reviews-list">Loading reviews...</div>
                <div class="add-review">
                    <select id="reviewRating">
                        <option value="5">5 ⭐</option>
                        <option value="4">4 ⭐</option>
                        <option value="3">3 ⭐</option>
                        <option value="2">2 ⭐</option>
                        <option value="1">1 ⭐</option>
                    </select>
                    <textarea id="reviewComment" placeholder="Write a review..."></textarea>
                    <button onclick="submitReview(${station.id}, this)" class="submit-review-btn">Post Review</button>
                </div>
            </div>
        </div>
    `;

    popup.classList.add('active');
    fetchReviews(stationId);
}
window.showStationDetails = showStationDetails;

function closeStationPopup() {
    document.getElementById('stationPopup').classList.remove('active');
}
window.closeStationPopup = closeStationPopup;

function getDirections(lat, lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
}
window.getDirections = getDirections;

function searchStations() {
    const searchTerm = document.getElementById('searchStation').value.toLowerCase();
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    const crowdFilter = document.getElementById('crowdFilter').value;

    const stations = getStations();

    let filteredStations = stations.filter((station) =>
    (station.name.toLowerCase().includes(searchTerm) ||
        station.area.toLowerCase().includes(searchTerm) ||
        station.address.toLowerCase().includes(searchTerm))
    );

    if (availabilityFilter !== 'all') {
        filteredStations = filteredStations.filter((station) => station.availability === availabilityFilter);
    }

    if (crowdFilter !== 'all') {
        filteredStations = filteredStations.filter(station =>
            (station.crowd && station.crowd.toLowerCase() === crowdFilter.toLowerCase())
        );
    }

    // Refresh markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    filteredStations.forEach(station => {
        const lat = parseFloat(station.lat);
        const lng = parseFloat(station.lng);

        if (isNaN(lat) || isNaN(lng)) return;

        const iconClass = station.availability === 'available' ? 'marker-available' : 'marker-unavailable';
        const icon = L.divIcon({
            className: 'custom-marker ' + iconClass,
            html: '⛽',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const marker = L.marker([lat, lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${station.name}</b>`)
            .on('click', () => showStationDetails(station.id));

        markers.push(marker);
    });

    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}
window.searchStations = searchStations;

async function fetchReviews(stationId) {
    try {
        const res = await fetch(`/api/reviews/${stationId}`);
        const reviews = await res.json();
        const list = document.getElementById('reviewsList');
        if (reviews.length === 0) {
            list.innerHTML = '<p style="color: #666; font-style: italic;">No reviews yet.</p>';
            return;
        }
        list.innerHTML = reviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <strong>${r.user_email || 'User'}</strong> 
                    <span class="rating">${'⭐'.repeat(r.rating)}</span>
                </div>
                <div class="review-comment">${r.comment}</div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('reviewsList').innerHTML = 'Error loading reviews.';
    }
}

async function submitReview(stationId, btn) {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    const token = sessionStorage.getItem('token');

    if (!token) {
        alert("Please login to submit a review");
        window.location.href = 'user-login.html';
        return;
    }

    if (btn) btn.classList.add('btn-loading');

    try {
        const res = await fetch(`/api/reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ station_id: stationId, rating: parseFloat(rating), comment })
        });
        if (res.ok) {
            alert("Review submitted!");
            document.getElementById('reviewComment').value = '';
            fetchReviews(stationId);
        } else {
            const err = await res.json();
            alert(err.detail || "Failed to submit review");
        }
    } catch (err) {
        console.error(err);
        alert("Error submitting review");
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}
window.submitReview = submitReview;

async function reportAvailability(stationId, availability, btn) {
    const token = sessionStorage.getItem('token');
    if (!token) {
        alert("Please login to report availability");
        return;
    }

    if (btn) btn.classList.add('btn-loading');

    try {
        const res = await fetch(`/api/stations/${stationId}/report-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ availability })
        });
        if (res.ok) {
            alert("Report submitted! It will appear after admin approval.");
        } else {
            const err = await res.json();
            alert(err.detail || "Failed to report availability");
        }
    } catch (err) {
        console.error(err);
        alert("Error reporting availability");
    } finally {
        if (btn) btn.classList.remove('btn-loading');
    }
}
window.reportAvailability = reportAvailability;

function showNearbyAvailable(btn) {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    if (btn) btn.classList.add('btn-loading');

    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (userLat === null || userLng === null || userLat === undefined || userLng === undefined) {
            alert('Unable to determine accurate coordinates.');
            if (btn) btn.classList.remove('btn-loading');
            return;
        }

        map.setView([userLat, userLng], 13);

        if (userLocationMarker) {
            map.removeLayer(userLocationMarker);
        }
        userLocationMarker = L.marker([userLat, userLng], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '📍',
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup("You are here").openPopup();

        document.getElementById('availabilityFilter').value = 'available';

        searchStations();
        if (btn) btn.classList.remove('btn-loading');
    }, (err) => {
        console.error(err);
        alert('Unable to retrieve your location. Please check browser permissions.');
        if (btn) btn.classList.remove('btn-loading');
    });
}
window.showNearbyAvailable = showNearbyAvailable;

function logout(btn) {
    if (btn) btn.classList.add('btn-loading');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentAdmin');
    sessionStorage.removeItem('token');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}
window.logout = logout;

window.addEventListener('load', async function () {
    try {
        initMap();
        await ensureStationsLoaded();
        addStationMarkers();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('nearby') === 'true') {
            const nearbyBtn = document.querySelector('.action-btn');
            setTimeout(() => {
                showNearbyAvailable(nearbyBtn);
            }, 500);
        }
    } catch (err) {
        console.error('Error during map initialization:', err);
    }
});

