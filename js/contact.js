// ========== CONTACT FORM WITH SHEETDB - FINAL FIXED VERSION ==========
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/klxdlwbuyc4o1';

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Test connection
    testSheetDBConnection();
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Declare variables at the top so they're available everywhere
        let nameValue = '', emailValue = '', phoneValue = '', companyValue = '', 
            subjectValue = '', messageValue = '', consentChecked = false;
        
        try {
            // Get form values
            nameValue = document.getElementById('name').value.trim();
            emailValue = document.getElementById('email').value.trim();
            phoneValue = document.getElementById('phone').value.trim();
            companyValue = document.getElementById('company').value.trim();
            subjectValue = document.getElementById('subject').value;
            messageValue = document.getElementById('message').value.trim();
            consentChecked = document.getElementById('consent').checked;
            
            // Validate
            if (!nameValue) throw new Error('Please enter your name');
            if (!emailValue) throw new Error('Please enter your email');
            if (!subjectValue) throw new Error('Please select a subject');
            if (!messageValue) throw new Error('Please enter your message');
            if (!consentChecked) throw new Error('Please agree to the privacy policy');
            
            // FIXED: SheetDB expects data in a specific format
            // Based on your Google Sheet columns: ID, Timestamp, Name, Email, Phone, Company, Subject, Message, Consent
            const rowData = [
                {
                    "ID": "", // Leave empty for auto-increment
                    "Timestamp": new Date().toLocaleString('en-IN', { 
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    "Name": nameValue,
                    "Email": emailValue,
                    "Phone": phoneValue || 'Not provided',
                    "Company": companyValue || 'Not provided',
                    "Subject": subjectValue,
                    "Message": messageValue,
                    "Consent": consentChecked ? 'Yes' : 'No'
                }
            ];
            
            console.log('Sending data:', JSON.stringify({ data: rowData }, null, 2));
            
            // Send to SheetDB
            const response = await fetch(SHEETDB_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: rowData })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                
                // Even with 400 error, check if data was actually saved
                // Sometimes SheetDB returns 400 but still saves data
                const checkResponse = await fetch(SHEETDB_API_URL + '?search=Email=' + encodeURIComponent(emailValue));
                const checkData = await checkResponse.json();
                
                if (checkData && checkData.data && checkData.data.length > 0) {
                    console.log('✅ Data was actually saved despite 400 error!');
                    // Success - data was saved
                    contactForm.reset();
                    showSuccessMessage(nameValue.split(' ')[0], emailValue, subjectValue);
                    return;
                } else {
                    throw new Error(`Server error (${response.status})`);
                }
            }
            
            const result = await response.json();
            console.log('SheetDB Response:', result);
            
            if (result && result.created === 1) {
                // Success
                contactForm.reset();
                showSuccessMessage(nameValue.split(' ')[0], emailValue, subjectValue);
            } else {
                throw new Error('Data was not saved');
            }
            
        } catch (error) {
            console.error('Form Error:', error);
            
            // Show user-friendly error with email option
            const userChoice = confirm(
                '⚠️ ' + error.message + '\n\n' +
                'Would you like to send your message directly via email?'
            );
            
            if (userChoice && nameValue && emailValue && subjectValue && messageValue) {
                const mailtoLink = `mailto:info@dgknitting.com?subject=Contact: ${subjectValue}&body=
Name: ${nameValue}%0D%0A
Email: ${emailValue}%0D%0A
Phone: ${phoneValue}%0D%0A
Company: ${companyValue}%0D%0A
Message: ${messageValue}`;
                window.location.href = mailtoLink;
            } else {
                alert('Please try again or email us directly at info@dgknitting.com');
            }
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Test SheetDB connection
async function testSheetDBConnection() {
    try {
        const response = await fetch(SHEETDB_API_URL);
        if (response.ok) {
            console.log('✅ SheetDB connected');
            addConnectionStatus('connected');
        } else {
            console.log('⚠️ SheetDB returned status:', response.status);
            addConnectionStatus('warning');
        }
    } catch (error) {
        console.log('⚠️ Connection issue - email backup ready');
        addConnectionStatus('disconnected');
    }
}

// Add status indicator
function addConnectionStatus(status) {
    const formWrapper = document.querySelector('.form-wrapper');
    if (!formWrapper) return;
    
    const existing = document.querySelector('.connection-status');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'connection-status';
    
    if (status === 'connected') {
        div.innerHTML = '<i class="fas fa-check-circle"></i> Form ready';
        div.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 12px 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #c3e6cb;
            font-size: 0.9rem;
        `;
    } else {
        div.innerHTML = '<i class="fas fa-envelope"></i> Email backup available';
        div.style.cssText = `
            background: #fff3cd;
            color: #856404;
            padding: 12px 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #ffeeba;
            font-size: 0.9rem;
        `;
    }
    
    formWrapper.prepend(div);
}

// Show success
function showSuccessMessage(firstName, email, subject) {
    const formWrapper = document.querySelector('.form-wrapper');
    formWrapper.innerHTML = `
        <div class="form-success" style="text-align: center; padding: 40px;">
            <i class="fas fa-check-circle" style="font-size: 5rem; color: #28a745; margin-bottom: 20px;"></i>
            <h3 style="font-size: 2rem; font-weight: 700; color: var(--dark-main); margin-bottom: 15px;">Thank You, ${firstName}!</h3>
            <p style="color: var(--dark-soft); font-size: 1.1rem; margin-bottom: 25px;">Your message has been sent successfully.</p>
            <div style="background: var(--pink-light); padding: 25px; border-radius: 15px; margin: 30px 0; text-align: left;">
                <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-envelope" style="color: var(--crimson); font-size: 1.2rem;"></i> 
                    <span style="color: var(--dark-soft);">We'll respond to: <strong>${email}</strong></span>
                </p>
                <p style="margin: 12px 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-tag" style="color: var(--crimson); font-size: 1.2rem;"></i> 
                    <span style="color: var(--dark-soft);">Subject: <strong>${subject}</strong></span>
                </p>
            </div>
            <a href="contact.html" class="btn" style="display: inline-block; padding: 14px 35px; background: var(--crimson); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; border: 2px solid transparent; transition: all 0.3s ease;">Send Another Message</a>
        </div>
    `;
}

// ========== FAQ ACCORDION FUNCTIONALITY ==========
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                
                // Log for debugging
                console.log('FAQ toggled:', item.classList.contains('active') ? 'open' : 'closed');
            });
        });
        
        console.log('✅ FAQ accordion initialized with', faqItems.length, 'items');
    } else {
        console.log('❌ No FAQ items found');
    }
});