const form = document.getElementById('userLoginForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

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
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.detail || 'Login failed');
                }
                return data;
            })
            .then(data => {
                sessionStorage.setItem('token', data.access_token);
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = 'user-map.html?nearby=true';
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

