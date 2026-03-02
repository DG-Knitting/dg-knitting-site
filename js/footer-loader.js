// js/footer-loader.js
// Footer Component Loader with Path Detection

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
        
        // Initialize footer functionality
        initFooterScripts();
        
        console.log('✅ Footer loaded successfully');
    } catch (error) {
        console.error('❌ Footer loader error:', error);
        insertFallbackFooter();
    }
}

function updateFooterPaths(basePath) {
    if (!basePath) return;
    
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
    initFooterScripts();
}

function initFooterScripts() {
    // Set current year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Footer loader: Starting...');
    loadFooter();
});