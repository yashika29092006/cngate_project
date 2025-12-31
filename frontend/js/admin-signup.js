const form = document.getElementById('adminSignupForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const admin = {
            name: document.getElementById('admin-signup-name').value,
            area: document.getElementById('admin-signup-area').value,
            address: document.getElementById('admin-signup-address').value,
            phone: document.getElementById('admin-signup-phone').value,
            lat: parseFloat(document.getElementById('admin-signup-latitude').value),
            lng: parseFloat(document.getElementById('admin-signup-longitude').value),
            email: document.getElementById('admin-signup-email').value,
            password: document.getElementById('admin-signup-password').value
        };

        fetch('/api/admin/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Signup failed');
                return data;
            })
            .then(data => {
                alert(data.message);
                window.location.href = 'admin-login.html';
            })
            .catch(err => {
                console.error(err);
                alert('Signup failed. ' + (err.message || 'Try again'));
            });
    });
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    // Show loading state on button if possible, or just wait
    const btn = document.querySelector('.location-btn');
    const originalText = btn.textContent;
    btn.textContent = "Locating...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('admin-signup-latitude').value = position.coords.latitude.toFixed(6);
            document.getElementById('admin-signup-longitude').value = position.coords.longitude.toFixed(6);
            btn.textContent = originalText;
        },
        (error) => {
            console.error(error);
            alert("Unable to retrieve location via GPS. Please enter manually.");
            btn.textContent = originalText;
        }
    );
}
