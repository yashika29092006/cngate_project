import { API_BASE } from './stations-data.js';

const form = document.getElementById('userSignupForm');
if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        const nameInput = document.getElementById('user-signup-name');
        const emailInput = document.getElementById('user-signup-email');
        const phoneInput = document.getElementById('user-signup-phone');

        // Submission Validation
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(nameInput.value)) {
            alert('Name should only contain letters and spaces.');
            nameInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
        if (!emailRegex.test(emailInput.value)) {
            alert('Email must contain "@" and end with ".com"');
            emailInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        if (phoneInput.value.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            phoneInput.focus();
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
            return;
        }

        const user = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            vehicle: document.getElementById('user-signup-vehicle').value,
            password: document.getElementById('user-signup-password').value
        };

        fetch(`${API_BASE}/user/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.detail || 'Signup failed');
                return data;
            })
            .then(data => {
                alert(data.message || 'Signup successful!');
                window.location.href = 'user-login.html';
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

// Real-time validation for User Name (only characters and spaces)
const userNameInput = document.getElementById('user-signup-name');
if (userNameInput) {
    userNameInput.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });
}

// Real-time validation for User Phone (only numbers, max 10)
const userPhoneInput = document.getElementById('user-signup-phone');
if (userPhoneInput) {
    userPhoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
    });
}


