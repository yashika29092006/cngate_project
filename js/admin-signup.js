import { API_BASE } from './stations-data.js';

const form = document.getElementById('adminSignupForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        const nameInput = document.getElementById('admin-signup-name');
        const nameValue = nameInput.value;
        const nameRegex = /^[A-Za-z\s]+$/;

        if (!nameRegex.test(nameValue)) {
            alert('Station name should only contain letters and spaces.');
            nameInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const emailInput = document.getElementById('admin-signup-email');
        const emailValue = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
        if (!emailRegex.test(emailValue)) {
            alert('Please enter a valid email containing "@" and ending with ".com"');
            emailInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const phoneInput = document.getElementById('admin-signup-phone');
        const phoneValue = phoneInput.value;
        if (phoneValue.length !== 10 || isNaN(phoneValue)) {
            alert('Phone number must be exactly 10 digits.');
            phoneInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const latInput = document.getElementById('admin-signup-latitude');
        const lngInput = document.getElementById('admin-signup-longitude');
        const latValue = parseFloat(latInput.value);
        const lngValue = parseFloat(lngInput.value);
        if (isNaN(latValue) || isNaN(lngValue)) {
            alert('Please enter valid numerical latitude and longitude.');
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const selectedAmenities = Array.from(document.querySelectorAll('input[name="amenity"]:checked'))
            .map((cb) => cb.value)
            .join(', ');

        const admin = {
            name: document.getElementById('admin-signup-name').value,
            area: document.getElementById('admin-signup-area').value,
            address: document.getElementById('admin-signup-address').value,
            phone: document.getElementById('admin-signup-phone').value,
            lat: parseFloat(document.getElementById('admin-signup-latitude').value),
            lng: parseFloat(document.getElementById('admin-signup-longitude').value),
            email: document.getElementById('admin-signup-email').value,
            password: document.getElementById('admin-signup-password').value,
            amenities: selectedAmenities
        };

        fetch(`${API_BASE}/admin/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Signup failed');
                return data;
            })
            .then(data => {
                alert(data.message || 'Signup successful!');
                window.location.href = 'admin-login.html';
            })
            .catch(err => {
                console.error(err);
                alert('Signup failed. ' + (err.message || 'Try again'));
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            });
    });
}

export function getCurrentLocation(btn) {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    if (btn) btn.classList.add('btn-loading');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('admin-signup-latitude').value = position.coords.latitude.toFixed(6);
            document.getElementById('admin-signup-longitude').value = position.coords.longitude.toFixed(6);
            if (btn) btn.classList.remove('btn-loading');
        },
        (error) => {
            console.error(error);
            alert("Unable to retrieve location via GPS. Please enter manually.");
            if (btn) btn.classList.remove('btn-loading');
        }
    );
}

window.getCurrentLocation = getCurrentLocation;

// Real-time validation for Station Name (only characters and spaces)
const stationNameInput = document.getElementById('admin-signup-name');
if (stationNameInput) {
    stationNameInput.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });
}

// Real-time validation for Phone Number (only numbers, max 10)
const phoneInput = document.getElementById('admin-signup-phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 10) {
            value = value.slice(0, 10); // Limit to 10 digits
        }
        e.target.value = value;
    });
}


