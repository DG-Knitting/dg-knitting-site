document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const futureForm = document.getElementById('futureNotifyForm');
    if (futureForm) {
        futureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = futureForm.querySelector('input[type="email"]');
            const messageDiv = document.getElementById('futureFormMessage');
            const email = emailInput.value.trim();

            // very basic validation
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                messageDiv.textContent = 'Please enter a valid email address.';
                messageDiv.style.color = '#df2229';
                return;
            }

            // simulate successful "subscription" (no actual POST)
            messageDiv.textContent = '✓ Thank you! We’ll reach out when a role opens.';
            messageDiv.style.color = '#28a745';
            emailInput.value = '';

            // optionally clear message after a few seconds
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 6000);
        });
    }

    const header = document.querySelector('.career-header');
    if (header) {
        const threadLine = document.querySelector('.thread-line-animated');
        if (threadLine) threadLine.classList.add('loaded');
    }
    console.log('career.js loaded — no open roles, but ready to connect.');
});