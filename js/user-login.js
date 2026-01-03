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
            const response = await fetch('/api/user/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response:", text);
                throw new Error("Server returned non-JSON response. Check server logs.");
            }

            if (response.ok) {
                alert(data.message || 'Password reset successful!');
                closeModal('forgotPasswordModal');
            } else {
                alert(data.detail || 'Failed to reset password');
            }
        } catch (err) {
            console.error("Forgot Password Error:", err);
            alert("Error: " + err.message);
        }
    });
}
