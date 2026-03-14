// js/footer-loader.js
// Footer Component Loader with Path Detection - OPTIMIZED VERSION

// Global flag to prevent duplicate initialization
window.footerInitialized = false;

function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    
    if (path.includes('index.html') || path === '/' || path === '') {
        return '';
    }
    
    // Return appropriate relative path based on file depth
    if (depth === 1) { // In root directory
        return '';
    } else if (depth > 1) { // In subdirectory
        return '../'.repeat(depth - 1);
    }
    return '';
}

async function loadFooter() {
    // Prevent multiple footer loads
    if (window.footerInitialized) {
        console.log('Footer already loaded, skipping...');
        return;
    }
    
    try {
        const basePath = getBasePath();
        console.log('Footer loader: Base path detected:', basePath);
        
        // Try multiple possible paths
        const possiblePaths = [
            basePath + 'component/footer.html',
            'component/footer.html',
            '../component/footer.html',
            'components/footer.html',
            'footer.html'
        ];
        
        let response = null;
        let usedPath = '';
        
        for (const path of possiblePaths) {
            try {
                console.log('Trying path:', path);
                const res = await fetch(path);
                if (res.ok) {
                    response = res;
                    usedPath = path;
                    break;
                }
            } catch (e) {
                // Continue to next path
            }
        }
        
        if (!response) {
            throw new Error('Footer file not found in any location');
        }
        
        console.log('✅ Footer found at:', usedPath);
        const html = await response.text();
        
        // Insert footer at the end of body
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Update image paths in footer
        updateFooterPaths(basePath);
        
        // Set flag to prevent duplicate initialization
        window.footerInitialized = true;
        
        // Initialize ONLY year functionality - NOT scroll listeners
        initFooterYear();
        
        // Connect back-to-top to existing handler in script.js
        connectBackToTop();
        
        console.log('✅ Footer loaded successfully');
    } catch (error) {
        console.error('❌ Footer loader error:', error);
        insertFallbackFooter();
    }
}

function updateFooterPaths(basePath) {
    if (!basePath) return;
    
    // Batch DOM operations with requestAnimationFrame
    requestAnimationFrame(() => {
        // Update image src paths in footer
        document.querySelectorAll('.footer-logo-img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                img.src = basePath + src;
            }
        });
        
        // Update href paths in footer links
        document.querySelectorAll('.footer-links a, .footer-contact-item a, .footer-bottom-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                link.href = basePath + href;
            }
        });
    });
}

function insertFallbackFooter() {
    console.warn('Using fallback footer');
    
    const fallbackFooter = `
    <footer class="footer-section">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <div class="footer-logo">
                        <img src="assets/images/logo.png" alt="DG Knitting" class="footer-logo-img">
                        <span class="footer-logo-text">Knitting</span>
                    </div>
                    <p class="footer-description">Premium knitted fabrics manufacturer serving India's finest fashion brands since 1998.</p>
                    <div class="footer-social">
                        <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h3 class="footer-title">Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="index.html#about">About</a></li>
                        <li><a href="index.html#fabrics">Fabrics</a></li>
                        <li><a href="strength.html">Strength</a></li>
                        <li><a href="quality.html">Quality</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3 class="footer-title">Products</h3>
                    <ul class="footer-links">
                        <li><a href="index.html#fabrics">Single Jersey</a></li>
                        <li><a href="index.html#fabrics">Rib Knit</a></li>
                        <li><a href="index.html#fabrics">Fleece</a></li>
                        <li><a href="index.html#fabrics">Lycra Jersey</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3 class="footer-title">Contact</h3>
                    <div class="footer-contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Mumbai, Maharashtra</span>
                    </div>
                    <div class="footer-contact-item">
                        <i class="fas fa-phone"></i>
                        <span>+91 22 1234 5678</span>
                    </div>
                    <div class="footer-contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>info@dgknitting.com</span>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <span id="currentYear"></span> DG Knitting. All rights reserved.</p>
            </div>
        </div>
        <div class="back-to-top" id="backToTop">
            <i class="fas fa-arrow-up"></i>
        </div>
    </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', fallbackFooter);
    window.footerInitialized = true;
    initFooterYear();
    connectBackToTop();
}

function initFooterYear() {
    // Set current year - simple DOM update, no event listeners
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function connectBackToTop() {
    // Instead of adding new scroll listener, just ensure the button exists
    // The actual scroll handling is done in script.js's initBackToTop()
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        // Remove any existing click listeners to prevent duplicates
        const newBackToTop = backToTop.cloneNode(true);
        backToTop.parentNode.replaceChild(newBackToTop, backToTop);
        
        // Add click listener that uses the same behavior as script.js
        newBackToTop.addEventListener('click', function(e) {
            e.preventDefault();
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }, { passive: false });
        
        // Set initial state based on current scroll position
        // This ensures the button shows correctly if page is already scrolled
        requestAnimationFrame(() => {
            if (window.scrollY > 500) {
                newBackToTop.classList.add('show');
            } else {
                newBackToTop.classList.remove('show');
            }
        });
        
        // DO NOT add scroll listener here - let script.js handle it
        // The button visibility will be managed by script.js's initBackToTop()
        console.log('✅ Back to top button connected');
    }
}

// Load footer when DOM is ready - only once
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Footer loader: Starting...');
        loadFooter();
    });
} else {
    // DOM already loaded, load footer immediately
    console.log('Footer loader: DOM already loaded, starting...');
    loadFooter();
}

// Add CSS for footer if not already present (to ensure styles exist)
(function ensureFooterStyles() {
    if (!document.getElementById('footer-base-styles')) {
        const style = document.createElement('style');
        style.id = 'footer-base-styles';
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--crimson, #df2229);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
                z-index: 99;
                border: none;
                box-shadow: 0 5px 15px rgba(223, 34, 41, 0.3);
                transform: translateZ(0);
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                pointer-events: auto;
            }
            
            .back-to-top.show {
                opacity: 1;
                visibility: visible;
            }
            
            .back-to-top:hover {
                background: var(--dark-main, #2e2d2c);
                transform: translateY(-3px) translateZ(0);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
            
            @media (max-width: 768px) {
                .back-to-top {
                    width: 40px;
                    height: 40px;
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();