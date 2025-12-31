const form = document.getElementById('userSignupForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const user = {
            name: document.getElementById('user-signup-name').value,
            email: document.getElementById('user-signup-email').value,
            phone: document.getElementById('user-signup-phone').value,
            vehicle: document.getElementById('user-signup-vehicle').value,
            password: document.getElementById('user-signup-password').value
        };

        fetch('https://cngate-project.vercel.app/api/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Signup failed');
            return data;
        })
        .then(data => {
            alert(data.message);
            window.location.href = 'user-login.html';
        })
        .catch(err => {
            console.error(err);
            alert('Signup failed. ' + (err.message || 'Try again'));
        });
    });
}
