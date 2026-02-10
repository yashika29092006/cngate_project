const form = document.getElementById('forgotPasswordForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add('btn-loading');

        const email = document.getElementById('reset-email').value;
        const password = document.getElementById('reset-new-password').value;

        // Simple check to determine if it's admin or user reset based on previous page or input
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'user';
        const endpoint = `/api/${type}/forgot-password`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (response.ok) {
                alert(data?.message || 'Password reset successful!');
                window.location.href = type === 'admin' ? 'admin-login.html' : 'user-login.html';
            } else {
                alert(data?.detail || 'Reset failed. Please check your email.');
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred. Please try again later.");
        } finally {
            if (submitBtn) submitBtn.classList.remove('btn-loading');
        }
    });
}
