// script.js
// Main JavaScript for DG Knitting website

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing scripts...');
    
    // Check if navbar exists (it might be loaded dynamically)
    if (document.querySelector('.custom-navbar')) {
        // Navbar already exists
        initializeScripts();
    } else {
        // Wait for navbar to be loaded by navbar-loader.js
        console.log('Waiting for navbar to load...');
        const checkNavbarInterval = setInterval(function() {
            if (document.querySelector('.custom-navbar')) {
                clearInterval(checkNavbarInterval);
                console.log('Navbar found, initializing scripts...');
                initializeScripts();
            }
        }, 50);
        
        // Timeout after 3 seconds
        setTimeout(function() {
            clearInterval(checkNavbarInterval);
            if (!document.querySelector('.custom-navbar')) {
                console.warn('Navbar not loaded after 3 seconds, initializing anyway...');
                initializeScripts();
            }
        }, 3000);
    }
});

// Main initialization function
function initializeScripts() {
    console.log('Initializing all scripts...');
    
    // ===== STICKY NAVBAR =====
    initStickyNavbar();
    
    // ===== ACTIVE NAV LINK ON SCROLL (INDEX PAGE ONLY) =====
    initScrollSpy();
    
    // ===== MOBILE MENU CLOSE ON LINK CLICK =====
    initMobileMenuClose();
    
    // ===== SMOOTH SCROLL FOR HASH LINKS =====
    initSmoothScroll();
    
    // ===== HERO CAROUSEL =====
    initHeroCarousel();
    
    // ===== CURRENT YEAR IN FOOTER =====
    initCurrentYear();
    
    // ===== BACK TO TOP BUTTON =====
    initBackToTop();
    
    // ===== NAVBAR ACTIVE STATE BASED ON CURRENT PAGE =====
    initNavbarActiveState();
    
    console.log('✅ All scripts initialized');
}

// ===== 1. STICKY NAVBAR =====
function initStickyNavbar() {
    const navbar = document.querySelector('.custom-navbar');
    if (!navbar) {
        console.warn('Navbar not found for sticky effect');
        return;
    }
    
    // Check on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('sticky-navbar');
        } else {
            navbar.classList.remove('sticky-navbar');
        }
    });
    
    // Check initial position
    if (window.scrollY > 50) {
        navbar.classList.add('sticky-navbar');
    }
}

// ===== 2. ACTIVE NAV LINK ON SCROLL (ONLY ON INDEX PAGE) =====
function initScrollSpy() {
    // Only run on index page or home page
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname === '';
    
    if (!isIndexPage) {
        console.log('Not on index page, skipping scroll spy');
        return;
    }
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) {
        console.warn('No sections or nav links found for scroll spy');
        return;
    }
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 120; // Offset for navbar
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').replace('#', '');
            if (href === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Trigger once on load
    setTimeout(function() {
        window.dispatchEvent(new Event('scroll'));
    }, 200);
}

// ===== 3. MOBILE MENU CLOSE ON LINK CLICK =====
function initMobileMenuClose() {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.getElementById('mainNavbar');
    
    if (!toggler || !menu) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Get all nav links including dropdown items
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if mobile menu is open (window width < 992)
            if (window.innerWidth < 992 && menu.classList.contains('show')) {
                // Check if it's a hash link (smooth scroll on same page)
                const href = this.getAttribute('href');
                if (href && (href.startsWith('#') || href.includes('index.html#'))) {
                    // For hash links, close menu after a small delay
                    setTimeout(function() {
                        if (menu.classList.contains('show')) {
                            toggler.click();
                        }
                    }, 300);
                } else {
                    // For page navigation, close menu immediately
                    toggler.click();
                }
            }
        });
    });
}

// ===== 4. SMOOTH SCROLL FOR HASH LINKS =====
function initSmoothScroll() {
    // Select all hash links (including those pointing to current page)
    const hashLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href*="index.html#"]');
    
    hashLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            let targetId = this.getAttribute('href');
            
            // Handle links like "index.html#about"
            if (targetId.includes('index.html#')) {
                targetId = targetId.split('index.html')[1];
            }
            
            // Skip if it's just "#"
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            
            if (target) {
                e.preventDefault();
                
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.custom-navbar')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== 5. HERO CAROUSEL =====
function initHeroCarousel() {
    const heroCarousel = document.getElementById('heroCarousel');
    
    if (!heroCarousel) {
        // Not on index page or carousel not present
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        console.warn('Bootstrap not loaded, carousel will not work');
        return;
    }
    
    try {
        const carousel = new bootstrap.Carousel(heroCarousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
        });
        
        // Start cycling
        carousel.cycle();
        
        // Pause on hover (Bootstrap handles this with pause: 'hover')
        console.log('✅ Hero carousel initialized');
    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
}

// ===== 6. CURRENT YEAR IN FOOTER =====
function initCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===== 7. BACK TO TOP BUTTON =====
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) {
        return;
    }
    
    // Add CSS class for hidden state if not already present
    if (!backToTop.classList.contains('show') && window.scrollY <= 500) {
        backToTop.classList.remove('show');
    }
    
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

// ===== 8. NAVBAR ACTIVE STATE BASED ON CURRENT PAGE =====
function initNavbarActiveState() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (navLinks.length === 0) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip empty links
        if (!href) return;
        
        // Remove existing active class
        link.classList.remove('active');
        
        // Handle current page
        if (href === currentPage) {
            link.classList.add('active');
        }
        
        // Handle index page with hash links
        if (currentPage === 'index.html' || currentPage === '') {
            if (href.startsWith('#')) {
                // Don't mark hash links as active on load - scroll spy will handle
                link.classList.remove('active');
            }
        }
        
        // Handle root path
        if (currentPage === '' && (href === 'index.html' || href === './')) {
            link.classList.add('active');
        }
    });
}

// ===== 9. LAZY LOAD IMAGES (Optional Enhancement) =====
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== 10. PRELOADER (If needed) =====
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

// ===== RE-RUN INITIALIZATION AFTER DYNAMIC CONTENT LOADS =====
// This helps if components are loaded after the initial DOMContentLoaded

// Create a mutation observer to watch for navbar changes
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if navbar was added
            if (document.querySelector('.custom-navbar') && !window.navbarInitialized) {
                window.navbarInitialized = true;
                console.log('Navbar detected via observer, re-initializing...');
                
                // Re-initialize navbar-related functions
                initStickyNavbar();
                initMobileMenuClose();
                initSmoothScroll();
                initNavbarActiveState();
                
                // Also re-run scroll spy if on index page
                const isIndexPage = window.location.pathname.endsWith('index.html') || 
                                    window.location.pathname === '/' || 
                                    window.location.pathname === '';
                if (isIndexPage) {
                    initScrollSpy();
                }
            }
        }
    });
});

// Start observing once DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Add CSS for back to top button if not in stylesheet
(function addBackToTopStyles() {
    if (!document.getElementById('back-to-top-styles')) {
        const style = document.createElement('style');
        style.id = 'back-to-top-styles';
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
                transition: all 0.3s ease;
                z-index: 99;
                border: none;
                box-shadow: 0 5px 15px rgba(223, 34, 41, 0.3);
            }
            
            .back-to-top.show {
                opacity: 1;
                visibility: visible;
            }
            
            .back-to-top:hover {
                background: var(--dark-main, #2e2d2c);
                transform: translateY(-3px);
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