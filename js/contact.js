// ========== CONTACT FORM WITH PHP BACKEND - IMPROVED VERSION ==========

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ accordion
    initializeFAQ();
    
    // Initialize contact form
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Add real-time validation
        initializeValidation(contactForm);
        
        // Initialize character counter
        initializeCharacterCounter();
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Validate form before submission
            if (!validateForm(contactForm)) {
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            // Get values for success message
            const nameValue = document.getElementById('name')?.value.trim() || '';
            const firstName = nameValue.split(' ')[0];
            const emailValue = document.getElementById('email')?.value.trim() || '';
            const subjectSelect = document.getElementById('subject');
            const subjectText = subjectSelect?.options[subjectSelect.selectedIndex]?.text || '';
            
            try {
                // Collect form data
                const formData = new FormData(contactForm);
                
                const response = await fetch('backend/submit_contact.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Server error: ' + response.status);
                }
                
                let result;
                const responseText = await response.text();
                
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Response was not JSON:', responseText);
                    throw new Error('Server returned invalid response');
                }
                
                if (result.success) {
                    showSuccessMessage(firstName, emailValue, subjectText);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Form Error:', error);
                
                const phoneValue = document.getElementById('phone')?.value.trim() || '';
                const companyValue = document.getElementById('company')?.value.trim() || '';
                const messageValue = document.getElementById('message')?.value.trim() || '';
                const subjectValue = document.getElementById('subject')?.value || '';
                
                const userChoice = confirm(
                    'Warning: ' + error.message + '\n\n' +
                    'Would you like to send your message directly via email?'
                );
                
                if (userChoice && nameValue && emailValue && subjectValue && messageValue) {
                    const mailtoLink = 'mailto:info@dgknitting.com?subject=Contact: ' + subjectValue + '&body=' +
                        'Name: ' + nameValue + '%0D%0A' +
                        'Email: ' + emailValue + '%0D%0A' +
                        'Phone: ' + phoneValue + '%0D%0A' +
                        'Company: ' + companyValue + '%0D%0A' +
                        '%0D%0A' +
                        'Message: ' + messageValue;
                    window.location.href = mailtoLink;
                } else {
                    alert('Please try again or call us directly at +91 93274 56808');
                }
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Initialize validation for form fields
function initializeValidation(form) {
    const emailInput = form.querySelector('#email');
    const phoneInput = form.querySelector('#phone');
    const countryCodeSelect = document.getElementById('countryCode');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
        
        emailInput.addEventListener('blur', function() {
            validateEmail(this, true);
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d]/g, '');
            validatePhoneWithCountry(this);
        });
        
        phoneInput.addEventListener('blur', function() {
            validatePhoneWithCountry(this, true);
        });
    }
    
    if (countryCodeSelect && phoneInput) {
        countryCodeSelect.addEventListener('change', function() {
            if (phoneInput.value.trim() !== '') {
                validatePhoneWithCountry(phoneInput, true);
            }
        });
    }
}

// Initialize character counter for message
function initializeCharacterCounter() {
    const messageTextarea = document.getElementById('message');
    const messageCounter = document.getElementById('messageCounter');
    
    if (messageTextarea && messageCounter) {
        messageTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const counterSpan = messageCounter.querySelector('span');
            if (counterSpan) {
                counterSpan.textContent = length;
            }
            
            messageCounter.classList.remove('warning', 'danger');
            if (length > 400) {
                messageCounter.classList.add('warning');
            }
            if (length > 480) {
                messageCounter.classList.add('danger');
            }
            
            if (length > 500) {
                this.value = this.value.slice(0, 500);
                if (counterSpan) counterSpan.textContent = 500;
            }
        });
    }
}

// Email validation function
function validateEmail(input, showErrorFlag = false) {
    const email = input.value.trim();
    const errorElement = document.getElementById('email-error');
    
    if (!errorElement) return true;
    
    if (email === '') {
        hideErrorMessage(errorElement);
        input.classList.remove('invalid', 'valid');
        return true;
    }
    
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const hasValidFormat = emailPattern.test(email);
    const hasConsecutiveDots = email.includes('..');
    const hasInvalidChars = /[<>(){}\[\]]/.test(email);
    const hasValidLength = email.length <= 254;
    const localPart = email.split('@')[0];
    const hasValidLocalLength = localPart && localPart.length <= 64;
    
    let isValid = hasValidFormat && !hasConsecutiveDots && !hasInvalidChars && 
                  hasValidLength && hasValidLocalLength;
    
    if (!isValid && showErrorFlag) {
        let errorMessage = 'Please enter a valid email address';
        if (hasConsecutiveDots) errorMessage = 'Email cannot contain consecutive dots';
        else if (hasInvalidChars) errorMessage = 'Email contains invalid characters';
        else if (!hasValidLength) errorMessage = 'Email is too long (max 254 characters)';
        else if (!hasValidLocalLength) errorMessage = 'Local part is too long (max 64 characters)';
        
        showErrorMessage(errorElement, errorMessage);
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else if (isValid) {
        hideErrorMessage(errorElement);
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else if (!showErrorFlag) {
        input.classList.remove('invalid', 'valid');
    }
    
    return isValid;
}

// Phone validation with country code
function validatePhoneWithCountry(input, showErrorFlag = false) {
    const phone = input.value.trim();
    const countryCodeSelect = document.getElementById('countryCode');
    const countryCode = countryCodeSelect ? countryCodeSelect.value : '+91';
    const errorElement = document.getElementById('phone-error');
    
    if (!errorElement) return true;
    
    if (phone === '') {
        hideErrorMessage(errorElement);
        input.classList.remove('invalid', 'valid');
        return true;
    }
    
    const digitsOnly = phone.replace(/\D/g, '');
    let isValid = false;
    let expectedLength = 10;
    let errorMessage = 'Please enter a valid phone number';
    
    switch(countryCode) {
        case '+91':
            expectedLength = 10;
            isValid = /^[6-9]\d{9}$/.test(digitsOnly);
            if (!isValid && digitsOnly.length === expectedLength) {
                errorMessage = 'Mobile number must start with 6, 7, 8, or 9';
            } else if (digitsOnly.length !== expectedLength) {
                errorMessage = 'Mobile number must be ' + expectedLength + ' digits';
            } else {
                errorMessage = 'Please enter a valid ' + expectedLength + '-digit mobile number';
            }
            break;
        case '+1':
            expectedLength = 10;
            isValid = /^[2-9]\d{9}$/.test(digitsOnly);
            errorMessage = 'Please enter a valid 10-digit US phone number';
            break;
        case '+44':
            expectedLength = 10;
            isValid = digitsOnly.length >= 10 && digitsOnly.length <= 11;
            errorMessage = 'Please enter a valid UK phone number (10-11 digits)';
            break;
        case '+61':
            expectedLength = 9;
            isValid = digitsOnly.length === expectedLength;
            errorMessage = 'Please enter a valid 9-digit Australian phone number';
            break;
        default:
            isValid = digitsOnly.length >= 8 && digitsOnly.length <= 15;
            errorMessage = 'Please enter a valid phone number (' + digitsOnly.length + ' digits)';
    }
    
    if (!isValid && showErrorFlag) {
        showErrorMessage(errorElement, errorMessage);
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else if (isValid) {
        hideErrorMessage(errorElement);
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else if (!showErrorFlag) {
        input.classList.remove('invalid', 'valid');
    }
    
    return isValid;
}

// Show error message
function showErrorMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Hide error message
function hideErrorMessage(element) {
    if (element) {
        element.style.display = 'none';
        element.textContent = '';
    }
}

// Show field error
function showFieldError(input, message) {
    const errorElement = document.getElementById(input.id + '-error');
    if (errorElement) {
        showErrorMessage(errorElement, message);
        input.classList.add('invalid');
        input.classList.remove('valid');
    }
}

// Clear field error
function clearFieldError(input) {
    const errorElement = document.getElementById(input.id + '-error');
    if (errorElement) {
        hideErrorMessage(errorElement);
    }
    input.classList.remove('invalid');
    if (input.value && input.value.trim() !== '') {
        if (input.id === 'email') {
            validateEmail(input);
        } else if (input.id === 'phone' && input.value.trim() !== '') {
            validatePhoneWithCountry(input);
        } else {
            input.classList.add('valid');
        }
    } else {
        input.classList.remove('valid');
    }
}

// Validate entire form before submission
function validateForm(form) {
    let isValid = true;
    
    // Validate name
    const nameInput = form.querySelector('#name');
    if (nameInput && nameInput.value.trim() === '') {
        showFieldError(nameInput, 'Please enter your name');
        isValid = false;
    } else if (nameInput && nameInput.value.trim().length < 2) {
        showFieldError(nameInput, 'Name must be at least 2 characters');
        isValid = false;
    } else if (nameInput) {
        clearFieldError(nameInput);
    }
    
    // Validate email
    const emailInput = form.querySelector('#email');
    if (emailInput && emailInput.value.trim() === '') {
        showFieldError(emailInput, 'Please enter your email address');
        isValid = false;
    } else if (emailInput) {
        const isEmailValid = validateEmail(emailInput, true);
        if (!isEmailValid) isValid = false;
    }
    
    // Validate phone (optional but validate if provided)
    const phoneInput = form.querySelector('#phone');
    if (phoneInput && phoneInput.value.trim() !== '') {
        const isPhoneValid = validatePhoneWithCountry(phoneInput, true);
        if (!isPhoneValid) isValid = false;
    }
    
    // Validate subject
    const subjectInput = form.querySelector('#subject');
    if (subjectInput && (!subjectInput.value || subjectInput.value === '')) {
        showFieldError(subjectInput, 'Please select a subject');
        isValid = false;
    } else if (subjectInput) {
        clearFieldError(subjectInput);
    }
    
    // Validate message
    const messageInput = form.querySelector('#message');
    if (messageInput && messageInput.value.trim() === '') {
        showFieldError(messageInput, 'Please enter your message');
        isValid = false;
    } else if (messageInput && messageInput.value.trim().length < 10) {
        showFieldError(messageInput, 'Message must be at least 10 characters');
        isValid = false;
    } else if (messageInput && messageInput.value.trim().length > 500) {
        showFieldError(messageInput, 'Message cannot exceed 500 characters');
        isValid = false;
    } else if (messageInput) {
        clearFieldError(messageInput);
    }
    
    // Validate consent
    const consentInput = form.querySelector('#consent');
    if (consentInput && !consentInput.checked) {
        showFieldError(consentInput, 'Please accept the privacy policy');
        isValid = false;
    } else if (consentInput) {
        clearFieldError(consentInput);
    }
    
    return isValid;
}

// Initialize FAQ accordion functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            if (question) {
                question.addEventListener('click', function() {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                    item.classList.toggle('active');
                });
            }
        });
        
        console.log('FAQ accordion initialized with', faqItems.length, 'items');
    }
}

// Show success message in form wrapper
function showSuccessMessage(firstName, email, subject) {
    const formWrapper = document.querySelector('.form-wrapper');
    
    if (formWrapper) {
        formWrapper.innerHTML = `
            <div class="form-success" style="text-align: center; padding: 40px;">
                <i class="fas fa-check-circle" style="font-size: 5rem; color: #28a745; margin-bottom: 20px;"></i>
                <h3 style="font-size: 2rem; font-weight: 700; color: var(--dark-main); margin-bottom: 15px;">Thank You, ${escapeHtml(firstName)}!</h3>
                <p style="color: var(--dark-soft); font-size: 1.1rem; margin-bottom: 25px;">Your message has been sent successfully.</p>
                <div style="background: var(--pink-light); padding: 25px; border-radius: 15px; margin: 30px 0; text-align: left;">
                    <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-envelope" style="color: var(--crimson); font-size: 1.2rem;"></i> 
                        <span style="color: var(--dark-soft);">We'll respond to: <strong>${escapeHtml(email)}</strong></span>
                    </p>
                    <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-tag" style="color: var(--crimson); font-size: 1.2rem;"></i> 
                        <span style="color: var(--dark-soft);">Subject: <strong>${escapeHtml(subject)}</strong></span>
                    </p>
                </div>
                <a href="contact.html" class="btn" style="display: inline-block; padding: 14px 35px; background: var(--crimson); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; border: 2px solid transparent; transition: all 0.3s ease;">Send Another Message</a>
            </div>
        `;
        
        formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}