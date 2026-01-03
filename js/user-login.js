const form = document.getElementById('userLoginForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const loginData = {
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value
        };

        fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Login failed');
                }
                return await res.json();
            })
            .then(data => {
                sessionStorage.setItem('token', data.access_token);
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'user-map.html?nearby=true';
            })
            .catch(err => {
                console.error(err);
                alert('Login failed. Check credentials and try again.');
            });
    });
}

function forgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// Close modal if clicking outside - using addEventListener to avoid overwriting
window.addEventListener('click', function (event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal && event.target == modal) {
        modal.classList.remove('active');
    }
});

// Handle Forgot Password Form
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const password = document.getElementById('reset-new-password').value;

        try {
            console.log("Sending forgot password request to /api/user/forgot-password...");
            const response = await fetch('/api/user/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log("Response status:", response.status);
            const contentType = response.headers.get("content-type");
            console.log("Content-Type:", contentType);

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (response.ok) {
                    alert(data.message || 'Password reset successful!');
                    closeModal('forgotPasswordModal');
                } else {
                    alert(data.detail || 'Failed to reset password');
                }
            } else {
                const text = await response.text();
                console.error("Non-JSON Response Snippet:", text.substring(0, 200));

                if (response.status === 404) {
                    alert("Error 404: The reset password endpoint was not found. Please check if the backend server is running correctly and the path /api/user/forgot-password exists.");
                } else {
                    alert("Server Error (" + response.status + "): Could not process the request. Please check the browser console for details.");
                }
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Connection Error: " + err.message);
        }
    });
}
