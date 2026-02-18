const form = document.getElementById('adminLoginForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add('btn-loading');

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
                if (!res.status) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Login failed');
                }
                return await res.json();
            })
            .then(data => {
                sessionStorage.setItem('token', data.access_token);
                sessionStorage.setItem('currentAdmin', JSON.stringify(data.admin));

                CngateLoader.show("Accessing Station Dashboard...", true);

                setTimeout(() => {
                    // Super Admin Redirect
                    if (data.admin.email === 'superadmin@cngate.com') {
                        window.location.href = 'super-admin-dashboard.html';
                    } else {
                        window.location.href = 'admin-dashboard.html';
                    }
                }, 1500);
            })
            .catch(err => {
                console.error(err);
                alert('Login failed. Check credentials and try again.');
            })
            .finally(() => {
                if (submitBtn) submitBtn.classList.remove('btn-loading');
            });
    });
}

