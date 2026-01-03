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

