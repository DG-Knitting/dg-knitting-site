document.addEventListener('DOMContentLoaded', function() {
    console.log('Fabrics page initialized');
    
    // Get all fabric cards
    const fabricCards = document.querySelectorAll('.fabric-card');
    const navPills = document.querySelectorAll('.nav-pill');
    
    if (!fabricCards.length || !navPills.length) {
        console.warn('Fabric cards or navigation pills not found');
        return;
    }
    
    console.log('Found', fabricCards.length, 'fabric cards');
    
    // Function to filter fabrics
    function filterFabrics(type) {
        console.log('Filtering for:', type);
        
        fabricCards.forEach(card => {
            const cardType = card.getAttribute('data-knitting-type');
            
            if (type === 'all' || cardType === type) {
                card.style.display = 'flex';
                card.style.animation = 'cardFadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
        
        if (type === 'all') {
            history.pushState(null, null, ' ');
        } else {
            history.pushState(null, null, '#' + type);
        }
    }
    
    navPills.forEach(pill => {
        pill.addEventListener('click', function() {
            navPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const type = this.getAttribute('data-knitting');
            filterFabrics(type);
        });
    });
    
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const matchingPill = document.querySelector(`[data-knitting="${hash}"]`);
        if (matchingPill) {
            matchingPill.click();
        }
    }
    
    // ===== SAMPLE REQUEST MODAL FUNCTIONALITY =====
    
    // SheetDB Configuration - YOUR ACTUAL URL
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/mvakejms6sj66';
    
    // Get modal elements
    const modal = document.getElementById('sampleModal');
    const closeBtn = document.querySelector('.close-modal');
    const sampleLinks = document.querySelectorAll('.sample-link');
    const sampleForm = document.getElementById('sampleForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitSample');
    const selectedFabricInfo = document.getElementById('selectedFabricInfo');
    
    // Current fabric data
    let currentFabric = {
        name: '',
        type: '',
        tags: []
    };
    
    // Open modal when sample link is clicked
    sampleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get fabric details from parent card
            const card = this.closest('.fabric-card');
            const fabricName = card.querySelector('h3').textContent;
            const fabricType = card.getAttribute('data-knitting-type');
            const fabricTags = Array.from(card.querySelectorAll('.fabric-tags span')).map(span => span.textContent);
            
            // Set current fabric
            currentFabric = {
                name: fabricName,
                type: fabricType,
                tags: fabricTags
            };
            
            // Display selected fabric info
            displaySelectedFabric(currentFabric);
            
            // Set hidden form values
            document.getElementById('fabricName').value = fabricName;
            document.getElementById('fabricType').value = fabricType;
            document.getElementById('fabricTags').value = fabricTags.join(', ');
            
            // Clear any previous form data
            sampleForm.reset();
            formMessage.style.display = 'none';
            
            // Open modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Display selected fabric information
    function displaySelectedFabric(fabric) {
        const typeLabels = {
            'warp': 'Warp Knitting',
            'circular': 'Circular Knitting',
            'flat': 'Flat Knitting'
        };
        
        const tagsHtml = fabric.tags.map(tag => `<span>${tag}</span>`).join('');
        
        selectedFabricInfo.innerHTML = `
            <h4>${fabric.name}</h4>
            <p><strong>Type:</strong> ${typeLabels[fabric.type] || fabric.type}</p>
            <div class="fabric-tags">
                ${tagsHtml}
            </div>
        `;
    }
    
    // Close modal function
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        sampleForm.reset();
        formMessage.style.display = 'none';
        formMessage.className = 'form-message';
        
        // Remove error classes
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }
    
    // Close button click
    closeBtn.addEventListener('click', closeModal);
    
    // Click outside to close - but only on the modal overlay
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent modal from closing when clicking inside the modal content
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Form validation
    function validateForm(formData) {
        const errors = [];
        
        if (!formData.fullName || formData.fullName.trim().length < 2) {
            errors.push('Please enter your full name');
            document.getElementById('fullName').classList.add('error');
        } else {
            document.getElementById('fullName').classList.remove('error');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
            document.getElementById('email').classList.add('error');
        } else {
            document.getElementById('email').classList.remove('error');
        }
        
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            errors.push('Please enter a valid phone number');
            document.getElementById('phone').classList.add('error');
        } else {
            document.getElementById('phone').classList.remove('error');
        }
        
        if (!formData.address || formData.address.trim().length < 5) {
            errors.push('Please enter your complete address');
            document.getElementById('address').classList.add('error');
        } else {
            document.getElementById('address').classList.remove('error');
        }
        
        return errors;
    }
    
    // Form submission
    sampleForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const company = document.getElementById('company').value.trim();
        const quantity = document.getElementById('quantity').value.trim();
        
        const formData = {
            fullName: fullName,
            email: email,
            phone: phone,
            address: address,
            company: company,
            quantity: quantity,
            fabricName: currentFabric.name,
            fabricType: currentFabric.type,
            fabricTags: currentFabric.tags.join(', '),
            timestamp: new Date().toISOString()
        };
        
        const errors = validateForm(formData);
        
        if (errors.length > 0) {
            formMessage.className = 'form-message error';
            formMessage.innerHTML = errors.join('<br>');
            formMessage.style.display = 'block';
            return;
        }
        
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Submitting...';
        formMessage.style.display = 'none';
        
        try {

            const sheetData = {
                data: [{
                    'Timestamp': formData.timestamp,
                    'Fabric Name': formData.fabricName,
                    'Fabric Type': formData.fabricType,
                    'Fabric Tags': formData.fabricTags,
                    'Full Name': formData.fullName,
                    'Email Address': formData.email,
                    'Phone Number': formData.phone,
                    'Business Address': formData.address,
                    'Company Name': formData.company,
                    'Estimated Quantity': formData.quantity,
                    'Status': 'Pending',
                    'Notes': ''
                }]
            };
            
            console.log('Submitting to SheetDB:', sheetData);
            
            // Submit to SheetDB
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sheetData)
            });
            
            const result = await response.json();
            console.log('SheetDB response:', result);
            
            if (response.ok) {
                
                formMessage.className = 'form-message success';
                formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your sample request has been submitted successfully. Our team will contact you within 24 hours.';
                formMessage.style.display = 'block';
                
                sampleForm.reset();
                
                setTimeout(() => {
                    closeModal();
                }, 4000);
                
                console.log('Sample request submitted:', formData);
            } else {
                console.error('SheetDB error:', result);
                throw new Error('Submission failed: ' + JSON.stringify(result));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            const pendingRequests = JSON.parse(localStorage.getItem('pendingSampleRequests') || '[]');
            pendingRequests.push(formData);
            localStorage.setItem('pendingSampleRequests', JSON.stringify(pendingRequests));
            
            formMessage.className = 'form-message success';
            formMessage.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your request has been saved locally. We will process it shortly.';
            formMessage.style.display = 'block';
            
            setTimeout(() => {
                closeModal();
            }, 4000);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
        }
    });
    
    ['fullName', 'email', 'phone', 'address'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                this.classList.remove('error');
            });
        }
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});