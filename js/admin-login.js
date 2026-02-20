const form = document.getElementById('adminLoginForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        const loginData = {
            email: document.getElementById('admin-email').value,
            password: document.getElementById('admin-password').value
        };

        fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Login failed');
                }
                return await res.json();
            })
            .then(data => {
                sessionStorage.setItem('token', data.access_token);
                sessionStorage.setItem('currentAdmin', JSON.stringify(data.admin));

                // Super Admin Redirect
                if (data.admin.email === 'superadmin@cngate.com') {
                    window.location.href = 'super-admin-dashboard.html';
                } else {
                    window.location.href = 'admin-dashboard.html';
                }
            })
            .catch(err => {
                console.error(err);
                alert(err.message || 'Login failed. Check credentials and try again.');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            });
    });
}

