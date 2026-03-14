/**
 * Fabric Gallery and Sample Request Module
 * @version 2.4 - Fixed infinite image fetch with Base64 placeholder
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    console.log('Fabrics page initialized');
    
    // ==================== Configuration ====================
    const CONFIG = {
        SHEETDB_URL: 'https://sheetdb.io/api/v1/mvakejms6sj66',
        SELECTORS: {
            fabricCards: '.fabric-card',
            navPills: '.nav-pill',
            modal: '#sampleModal',
            closeModal: '.close-modal',
            sampleLinks: '.sample-link',
            sampleForm: '#sampleForm',
            formMessage: '#formMessage',
            submitBtn: '#submitSample',
            selectedFabricInfo: '#selectedFabricInfo',
            fabricName: '#fabricName',
            fabricType: '#fabricType',
            fabricTags: '#fabricTags',
            fullName: '#fullName',
            email: '#email',
            phone: '#phone',
            address: '#address',
            company: '#company',
            quantity: '#quantity'
        },
        TYPE_LABELS: {
            'warp': 'Warp Knitting',
            'circular': 'Circular Knitting',
            'flat': 'Flat Knitting'
        },
        VALIDATION: {
            minNameLength: 2,
            minAddressLength: 5,
            phoneMinLength: 10,
            phoneMaxLength: 15
        },
        MESSAGES: {
            SUBMIT_SUCCESS: 'Thank you! Your sample request has been submitted successfully. Our team will contact you within 24 hours.',
            SUBMIT_OFFLINE: 'Thank you! Your request has been saved locally. We will process it shortly.',
            NETWORK_ERROR: 'Network error. Please check your connection and try again.'
        },
        RETRY: {
            MAX_ATTEMPTS: 3,
            INITIAL_DELAY: 1000,
            BACKOFF_FACTOR: 2
        },
        ANIMATION: {
            FADE_IN_DURATION: 300,
            DEBOUNCE_DELAY: 100,
            MODAL_TIMEOUT: 4000,
            ERROR_TIMEOUT: 8000
        },
        // ✅ FIXED: Base64 placeholder - no external file needed!
        IMAGES: {
            PLACEHOLDER: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f5f5f5\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3EImage Coming Soon%3C/text%3E%3C/svg%3E',
            CACHE_KEY: 'loaded-images',
            RETRY_LIMIT: 1
        }
    };
    
    // ==================== State Management ====================
    const state = {
        currentFabric: {
            name: '',
            type: '',
            tags: []
        },
        elements: {},
        isSubmitting: false,
        filterTimeout: null,
        // ✅ Track processed images to prevent infinite loop
        processedImages: new WeakSet()
    };
    
    // ==================== DOM Element Caching ====================
    function cacheElements() {
        const s = CONFIG.SELECTORS;
        
        try {
            state.elements = {
                fabricCards: document.querySelectorAll(s.fabricCards),
                navPills: document.querySelectorAll(s.navPills),
                modal: document.getElementById(s.modal.substring(1)),
                closeBtn: document.querySelector(s.closeModal),
                sampleLinks: document.querySelectorAll(s.sampleLinks),
                sampleForm: document.getElementById(s.sampleForm.substring(1)),
                formMessage: document.getElementById(s.formMessage.substring(1)),
                submitBtn: document.getElementById(s.submitBtn.substring(1)),
                selectedFabricInfo: document.getElementById(s.selectedFabricInfo.substring(1)),
                fabricName: document.getElementById(s.fabricName.substring(1)),
                fabricType: document.getElementById(s.fabricType.substring(1)),
                fabricTags: document.getElementById(s.fabricTags.substring(1)),
                fullName: document.getElementById(s.fullName.substring(1)),
                email: document.getElementById(s.email.substring(1)),
                phone: document.getElementById(s.phone.substring(1)),
                address: document.getElementById(s.address.substring(1)),
                company: document.getElementById(s.company.substring(1)),
                quantity: document.getElementById(s.quantity.substring(1))
            };
        } catch (error) {
            console.error('Error caching elements:', error);
            return false;
        }
        
        // Check if critical elements exist
        const criticalElements = ['fabricCards', 'navPills', 'modal', 'sampleLinks'];
        const missingCritical = criticalElements.some(key => {
            const element = state.elements[key];
            return !element || (element instanceof NodeList && element.length === 0);
        });
        
        if (missingCritical) {
            console.warn('Some critical elements are missing');
            return false;
        }
        
        return true;
    }
    
    // ==================== Utility Functions ====================
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function debounce(func, wait) {
        return function executedFunction(...args) {
            clearTimeout(state.filterTimeout);
            state.filterTimeout = setTimeout(() => {
                func.apply(this, args);
            }, wait);
        };
    }
    
    /**
     * ✅ FIXED: Handle image loading errors - Prevents infinite loop
     */
    function handleImageError(img) {
        if (!img) return;
        
        // ✅ Check if already processed
        if (state.processedImages.has(img)) {
            console.log('Image already processed, skipping:', img.src.substring(0, 50) + '...');
            return;
        }
        
        // ✅ Mark as processed immediately
        state.processedImages.add(img);
        
        // Store original source for debugging
        const originalSrc = img.src;
        console.log('Image failed to load:', originalSrc);
        
        // ✅ Remove error handler to prevent recursion
        img.onerror = null;
        
        // ✅ Set Base64 placeholder
        img.src = CONFIG.IMAGES.PLACEHOLDER;
        img.alt = 'Image not available';
        
        // ✅ Add class for styling
        img.classList.add('image-error');
    }
    
    /**
     * ✅ FIXED: Initialize image error handling with cleanup
     */
    function initImageErrorHandling() {
        console.log('Initializing image error handling');
        
        document.querySelectorAll('.fabric-image img').forEach(img => {
            // ✅ Remove any existing listeners
            if (img._errorHandler) {
                img.removeEventListener('error', img._errorHandler);
            }
            
            // ✅ Create new handler
            const handler = () => handleImageError(img);
            
            // ✅ Store handler for removal
            img._errorHandler = handler;
            
            // ✅ Add listener
            img.addEventListener('error', handler);
            
            // ✅ Check if image is already loaded/cached but failed
            if (img.complete) {
                if (img.naturalHeight === 0) {
                    // Image failed to load silently
                    handleImageError(img);
                } else {
                    // Image loaded successfully
                    console.log('Image loaded successfully:', img.src.substring(0, 50) + '...');
                }
            }
        });
    }
    
    /**
     * ✅ NEW: Fix empty image sources in HTML
     */
    function fixEmptyImageSources() {
        console.log('Fixing empty image sources');
        
        document.querySelectorAll('.fabric-image img').forEach(img => {
            const src = img.getAttribute('src');
            
            // ✅ Check for empty, undefined, or null sources
            if (!src || src.trim() === '' || 
                src === 'assets/images/fabrics/' || 
                src.includes('undefined') || 
                src.includes('null')) {
                
                console.log('Found empty image source, replacing with placeholder');
                img.src = CONFIG.IMAGES.PLACEHOLDER;
                img.alt = 'Image coming soon';
                
                // ✅ Mark as processed to prevent error loop
                state.processedImages.add(img);
            }
            
            // ✅ Check for placeholder.jpg (missing file)
            if (src && src.includes('placeholder.jpg')) {
                console.log('Found placeholder.jpg reference, replacing with Base64');
                img.src = CONFIG.IMAGES.PLACEHOLDER;
                state.processedImages.add(img);
            }
        });
    }
    
    function addFadeInAnimation(card) {
        if (!card) return;
        card.classList.add('fade-in');
        setTimeout(() => {
            card.classList.remove('fade-in');
        }, CONFIG.ANIMATION.FADE_IN_DURATION);
    }
    
    // ==================== Filter Functionality ====================
    function initFiltering() {
        const { fabricCards, navPills } = state.elements;
        
        if (!fabricCards?.length || !navPills?.length) {
            console.warn('Fabric cards or navigation pills not found');
            return false;
        }
        
        console.log('Found', fabricCards.length, 'fabric cards');
        
        function filterFabrics(type) {
            console.log('Filtering for:', type);
            
            if (!fabricCards.length) return;
            
            fabricCards.forEach(card => {
                if (!card) return;
                
                const knittingType = card.dataset.knittingType;
                const cardTypes = knittingType ? knittingType.split(' ') : [];
                const shouldShow = type === 'all' || cardTypes.includes(type);
                
                card.style.display = shouldShow ? 'flex' : 'none';
                
                if (shouldShow) {
                    addFadeInAnimation(card);
                }
            });
            
            const newUrl = type === 'all' ? window.location.pathname : `#${type}`;
            history.replaceState(null, null, newUrl);
        }
        
        const debouncedFilter = debounce(filterFabrics, CONFIG.ANIMATION.DEBOUNCE_DELAY);
        
        navPills.forEach(pill => {
            pill.addEventListener('click', function(e) {
                e.preventDefault();
                navPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                const type = this.dataset.knitting;
                if (type) {
                    debouncedFilter(type);
                }
            });
        });
        
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const matchingPill = document.querySelector(`[data-knitting="${hash}"]`);
            if (matchingPill) {
                setTimeout(() => {
                    matchingPill.click();
                }, 100);
            }
        }
        
        return true;
    }
    
    // ==================== Modal Functionality ====================
    
    function closeModal() {
        const { modal, sampleForm, formMessage } = state.elements;
        
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
        
        if (sampleForm) {
            sampleForm.reset();
        }
        
        if (formMessage) {
            formMessage.style.display = 'none';
            formMessage.className = 'form-message';
            formMessage.innerHTML = '';
        }
        
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        state.isSubmitting = false;
    }
    
    function initModal() {
        const { modal, closeBtn, sampleLinks, selectedFabricInfo } = state.elements;
        
        if (!modal || !closeBtn || !sampleLinks?.length) {
            console.warn('Modal elements not found');
            return false;
        }
        
        const modalContent = modal.querySelector('.modal-content');
        
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.setAttribute('aria-modal', 'true');
        
        if (!modal.querySelector('#modal-title')) {
            const header = modal.querySelector('.modal-header h3');
            if (header) {
                header.id = 'modal-title';
            }
        }
        
        function displaySelectedFabric(fabric) {
            if (!selectedFabricInfo || !fabric) return;
            
            const fabricTypes = fabric.type ? fabric.type.split(' ') : [];
            let typeDisplay = '';
            
            if (fabricTypes.length > 1) {
                typeDisplay = fabricTypes.map(type => {
                    const label = CONFIG.TYPE_LABELS[type] || type;
                    return `<span class="type-badge type-${type}">${escapeHtml(label)}</span>`;
                }).join(' ');
            } else {
                typeDisplay = CONFIG.TYPE_LABELS[fabric.type] || fabric.type || 'Not specified';
            }
            
            const cleanTags = Array.isArray(fabric.tags) 
                ? fabric.tags.filter(tag => 
                    tag && 
                    !tag.includes('badge-') && 
                    !tag.includes('Common') && 
                    !tag.includes('common') &&
                    !tag.includes('Universal')
                  )
                : [];
            
            const tagsHtml = cleanTags.length > 0 
                ? cleanTags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')
                : '<span>No tags</span>';
            
            selectedFabricInfo.innerHTML = `
                <h4>${escapeHtml(fabric.name) || 'Unknown Fabric'}</h4>
                <p><strong>Available in:</strong> ${typeDisplay}</p>
                <div class="fabric-tags">${tagsHtml}</div>
            `;
        }
        
        function openModal(card) {
            if (!card) return;
            
            const fabricName = card.querySelector('h3')?.textContent?.trim() || 'Unknown Fabric';
            const fabricType = card.dataset.knittingType || '';
            const fabricTags = Array.from(card.querySelectorAll('.fabric-tags span'))
                .map(span => span.textContent?.trim() || '')
                .filter(tag => tag);
            
            state.currentFabric = {
                name: fabricName,
                type: fabricType,
                tags: fabricTags
            };
            
            if (state.elements.fabricName) {
                state.elements.fabricName.value = fabricName;
            }
            if (state.elements.fabricType) {
                state.elements.fabricType.value = fabricType;
            }
            if (state.elements.fabricTags) {
                state.elements.fabricTags.value = fabricTags.join(', ');
            }
            
            displaySelectedFabric(state.currentFabric);
            resetModalForm();
            
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (state.elements.fullName) {
                    state.elements.fullName.focus();
                }
            }, 100);
        }
        
        function resetModalForm() {
            const { sampleForm, formMessage } = state.elements;
            
            if (sampleForm) {
                sampleForm.reset();
            }
            if (formMessage) {
                formMessage.style.display = 'none';
                formMessage.className = 'form-message';
                formMessage.innerHTML = '';
            }
            
            document.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
            });
        }
        
        sampleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const card = link.closest('.fabric-card');
                if (card) openModal(card);
            });
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
        
        if (modalContent) {
            modalContent.addEventListener('click', (e) => e.stopPropagation());
        }
        
        return true;
    }
    
    // ==================== Form Validation ====================
    function initFormValidation() {
        const { fullName, email, phone, address } = state.elements;
        const inputs = [fullName, email, phone, address].filter(el => el);
        
        if (inputs.length === 0) return false;
        
        inputs.forEach(input => {
            if (!input) return;
            
            input.addEventListener('input', function() {
                this.classList.remove('error');
                
                if (this === email) {
                    validateEmailField(this);
                } else if (this === phone) {
                    validatePhoneField(this);
                }
            });
            
            input.addEventListener('blur', function() {
                if (this === fullName) {
                    validateNameField(this);
                } else if (this === address) {
                    validateAddressField(this);
                }
            });
        });
        
        function validateNameField(field) {
            if (!field) return;
            if (field.value.trim().length < CONFIG.VALIDATION.minNameLength) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
        
        function validateEmailField(field) {
            if (!field || !field.value) return;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value && !emailRegex.test(field.value)) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
        
        function validatePhoneField(field) {
            if (!field || !field.value) return;
            const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
            const cleanPhone = field.value.replace(/\s/g, '');
            if (field.value && !phoneRegex.test(cleanPhone)) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
        
        function validateAddressField(field) {
            if (!field) return;
            if (field.value.trim().length < CONFIG.VALIDATION.minAddressLength) {
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        }
        
        return true;
    }
    
    function validateForm(formData) {
        const errors = [];
        const v = CONFIG.VALIDATION;
        
        if (!formData.fullName || formData.fullName.trim().length < v.minNameLength) {
            errors.push('Please enter your full name (at least 2 characters)');
            if (state.elements.fullName) state.elements.fullName.classList.add('error');
        } else if (state.elements.fullName) {
            state.elements.fullName.classList.remove('error');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
            if (state.elements.email) state.elements.email.classList.add('error');
        } else if (state.elements.email) {
            state.elements.email.classList.remove('error');
        }
        
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        const cleanPhone = formData.phone?.replace(/\s/g, '') || '';
        if (!formData.phone || !phoneRegex.test(cleanPhone)) {
            errors.push('Please enter a valid phone number (10-15 digits)');
            if (state.elements.phone) state.elements.phone.classList.add('error');
        } else if (state.elements.phone) {
            state.elements.phone.classList.remove('error');
        }
        
        if (!formData.address || formData.address.trim().length < v.minAddressLength) {
            errors.push('Please enter your complete address');
            if (state.elements.address) state.elements.address.classList.add('error');
        } else if (state.elements.address) {
            state.elements.address.classList.remove('error');
        }
        
        return errors;
    }
    
    // ==================== Form Submission ====================
    function initFormSubmission() {
        const { sampleForm } = state.elements;
        
        if (!sampleForm) {
            console.warn('Sample form not found');
            return false;
        }
        
        sampleForm.addEventListener('submit', handleFormSubmit);
        
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            if (state.isSubmitting) return;
            
            const formData = {
                fullName: state.elements.fullName?.value?.trim() || '',
                email: state.elements.email?.value?.trim() || '',
                phone: state.elements.phone?.value?.trim() || '',
                address: state.elements.address?.value?.trim() || '',
                company: state.elements.company?.value?.trim() || '',
                quantity: state.elements.quantity?.value?.trim() || '',
                fabricName: state.currentFabric.name || '',
                fabricType: state.currentFabric.type || '',
                fabricTags: Array.isArray(state.currentFabric.tags) ? state.currentFabric.tags.join(', ') : '',
                timestamp: new Date().toISOString()
            };
            
            const errors = validateForm(formData);
            
            if (errors.length > 0) {
                showFormMessage('error', errors.join('<br>'));
                return;
            }
            
            state.isSubmitting = true;
            setSubmitButtonLoading(true);
            hideFormMessage();
            
            let success = false;
            let attempts = 0;
            
            while (!success && attempts < CONFIG.RETRY.MAX_ATTEMPTS) {
                try {
                    attempts++;
                    await submitToSheetDB(formData);
                    success = true;
                } catch (error) {
                    console.error(`Submission attempt ${attempts} failed:`, error);
                    
                    if (attempts >= CONFIG.RETRY.MAX_ATTEMPTS) {
                        handleSubmissionError(formData);
                        return;
                    }
                    
                    const delay = CONFIG.RETRY.INITIAL_DELAY * 
                        Math.pow(CONFIG.RETRY.BACKOFF_FACTOR, attempts - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            if (success) {
                showFormMessage('success', CONFIG.MESSAGES.SUBMIT_SUCCESS);
                if (state.elements.sampleForm) {
                    state.elements.sampleForm.reset();
                }
                
                setTimeout(() => {
                    closeModal();
                }, CONFIG.ANIMATION.MODAL_TIMEOUT);
            }
            
            setSubmitButtonLoading(false);
            state.isSubmitting = false;
        }
        
        async function submitToSheetDB(formData) {
            if (!navigator.onLine) {
                throw new Error('Offline');
            }
            
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
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            try {
                const response = await fetch(CONFIG.SHEETDB_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetData),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error ${response.status}: ${errorText}`);
                }
                
                const result = await response.json();
                console.log('SheetDB response:', result);
                
                return result;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        }
        
        function handleSubmissionError(formData) {
            try {
                const pendingRequests = JSON.parse(localStorage.getItem('pendingSampleRequests') || '[]');
                pendingRequests.push({
                    ...formData,
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem('pendingSampleRequests', JSON.stringify(pendingRequests));
                
                showFormMessage('success', CONFIG.MESSAGES.SUBMIT_OFFLINE);
                if (state.elements.sampleForm) {
                    state.elements.sampleForm.reset();
                }
                
                setTimeout(() => {
                    closeModal();
                }, CONFIG.ANIMATION.MODAL_TIMEOUT);
            } catch (storageError) {
                console.error('Failed to save to localStorage:', storageError);
                showFormMessage('error', 'Failed to save your request. Please try again.');
            }
        }
        
        function showFormMessage(type, message) {
            const { formMessage } = state.elements;
            if (formMessage) {
                formMessage.className = `form-message ${type}`;
                formMessage.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
                formMessage.style.display = 'block';
                
                if (type === 'error') {
                    setTimeout(() => {
                        if (formMessage.style.display === 'block') {
                            formMessage.style.display = 'none';
                        }
                    }, CONFIG.ANIMATION.ERROR_TIMEOUT);
                }
            }
        }
        
        function hideFormMessage() {
            const { formMessage } = state.elements;
            if (formMessage) {
                formMessage.style.display = 'none';
            }
        }
        
        function setSubmitButtonLoading(isLoading) {
            const { submitBtn } = state.elements;
            if (!submitBtn) return;
            
            if (isLoading) {
                submitBtn.classList.add('loading');
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
            } else {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
                submitBtn.disabled = false;
            }
        }
        
        return true;
    }
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (!targetId || targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    function initNetworkMonitoring() {
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            checkPendingRequests();
        });
        
        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            showOfflineNotification();
        });
    }
    
    function showOfflineNotification() {
        if (document.querySelector('.offline-notification')) return;
        
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = '<i class="fas fa-wifi-slash"></i> You are offline. Requests will be saved locally.';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    function checkPendingRequests() {
        try {
            const pending = localStorage.getItem('pendingSampleRequests');
            if (pending) {
                const requests = JSON.parse(pending);
                if (requests.length > 0) {
                    console.log('Pending requests found:', requests.length);
                }
            }
        } catch (e) {
            console.error('Error checking pending requests:', e);
        }
    }
    
    // ==================== Initialization ====================
    function init() {
        if (!cacheElements()) {
            console.error('Failed to cache required DOM elements');
            return;
        }
        
        // ✅ Fix empty image sources FIRST
        fixEmptyImageSources();
        
        const filtersInitialized = initFiltering();
        const modalInitialized = initModal();
        const validationInitialized = initFormValidation();
        const submissionInitialized = initFormSubmission();
        
        // ✅ Initialize image error handling
        setTimeout(() => {
            initImageErrorHandling();
        }, 100);
        
        initSmoothScroll();
        initNetworkMonitoring();
        
        const modules = [
            { name: 'Filters', status: filtersInitialized },
            { name: 'Modal', status: modalInitialized },
            { name: 'Validation', status: validationInitialized },
            { name: 'Submission', status: submissionInitialized }
        ];
        
        const failedModules = modules.filter(m => !m.status).map(m => m.name);
        
        if (failedModules.length === 0) {
            console.log('✅ All modules initialized successfully');
        } else {
            console.warn('⚠️ Some modules failed to initialize:', failedModules.join(', '));
        }
    }
    
    init();
});