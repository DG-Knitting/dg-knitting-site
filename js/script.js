// ========== PERFORMANCE OPTIMIZATION ==========
// Throttle function using requestAnimationFrame
function throttleRAF(callback) {
    let ticking = false;
    return function() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    };
}

// Debounce function with requestAnimationFrame
function debounce(func, wait = 10) {
    let timeout;
    let rafId;
    
    return function() {
        const context = this;
        const args = arguments;
        
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            rafId = requestAnimationFrame(() => {
                func.apply(context, args);
            });
        }, wait);
    };
}

// Global initialization flag - PREVENTS DUPLICATE INITIALIZATION
window.scriptsInitialized = false;

// Main initialization - FIXED: Runs only once
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing scripts...');
    
    // Check if already initialized
    if (window.scriptsInitialized) {
        console.log('Scripts already initialized, skipping...');
        return;
    }
    
    // Single initialization path
    if (document.querySelector('.custom-navbar')) {
        initializeScripts();
    } else {
        // Wait for navbar if needed, but only once
        const checkInterval = setInterval(function() {
            if (document.querySelector('.custom-navbar')) {
                clearInterval(checkInterval);
                initializeScripts();
            }
        }, 50);
        
        // Timeout fallback
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!window.scriptsInitialized) {
                console.warn('Navbar not loaded, initializing anyway...');
                initializeScripts();
            }
        }, 1000);
    }
});

function initializeScripts() {
    // Prevent multiple initializations
    if (window.scriptsInitialized) {
        console.log('Scripts already initialized, skipping...');
        return;
    }
    
    console.log('Initializing all scripts...');
    
    // Initialize all functions - in optimal order
    initStickyNavbar();
    initScrollSpy();
    initMobileMenuClose();
    initSmoothScroll();
    initHeroCarousel();
    initCurrentYear();
    initBackToTop();
    initNavbarActiveState();
    initImageLoading();
    
    // Add loaded class to animations after a short delay
    setTimeout(() => {
        document.querySelectorAll('.thread-animate, .thread-line-animated').forEach(el => {
            el.classList.add('loaded');
        });
    }, 500);
    
    // Mark as initialized
    window.scriptsInitialized = true;
    console.log('✅ All scripts initialized');
}

// ========== STICKY NAVBAR - OPTIMIZED ==========
let navbarUpdateQueued = false;

function updateStickyNavbar() {
    if (navbarUpdateQueued) return;
    
    navbarUpdateQueued = true;
    window.requestAnimationFrame(() => {
        const navbar = document.querySelector('.custom-navbar');
        if (!navbar) return;
        
        if (window.scrollY > 50) {
            navbar.classList.add('sticky-navbar');
        } else {
            navbar.classList.remove('sticky-navbar');
        }
        navbarUpdateQueued = false;
    });
}

function initStickyNavbar() {
    const navbar = document.querySelector('.custom-navbar');
    if (!navbar) return;
    
    // Set initial padding once
    function setBodyPadding() {
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
    }
    
    setBodyPadding();
    
    // FIXED: Use EITHER ResizeObserver OR resize event, not both
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(setBodyPadding);
        });
        resizeObserver.observe(navbar);
        // Store for cleanup if needed
        window.navbarResizeObserver = resizeObserver;
    } else {
        // Use debounced resize event as fallback
        window.addEventListener('resize', debounce(setBodyPadding, 100), { passive: true });
    }
    
    // Use throttled scroll handler
    window.addEventListener('scroll', throttleRAF(updateStickyNavbar), { passive: true });
}

// ========== SCROLLSPY - OPTIMIZED ==========
function initScrollSpy() {
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname === '';
    
    if (!isIndexPage) return;
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    if (!sections.length || !navLinks.length) return;
    
    let sectionPositions = [];
    let ticking = false;
    let lastScrollY = window.scrollY;
    let lastActiveSection = '';
    
    // Cache visible sections for faster lookup
    function updatePositions() {
        sectionPositions = Array.from(sections).map(section => ({
            id: section.getAttribute('id'),
            top: section.offsetTop,
            bottom: section.offsetTop + section.offsetHeight
        }));
    }
    
    window.addEventListener('resize', () => {
        window.requestAnimationFrame(updatePositions);
    }, { passive: true });
    
    updatePositions();
    
    function scrollSpyHandler() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                // Only update if scroll changed significantly
                if (Math.abs(scrollY - lastScrollY) > 15) {
                    const scrollPosition = scrollY + 120;
                    let current = '';
                    
                    // FIXED: Early exit if we can determine current section quickly
                    // Start from last active section for faster lookup
                    if (lastActiveSection) {
                        const lastSection = sectionPositions.find(s => s.id === lastActiveSection);
                        if (lastSection && scrollPosition >= lastSection.top && scrollPosition < lastSection.bottom) {
                            current = lastActiveSection;
                        }
                    }
                    
                    // If not found in last section, loop through all
                    if (!current) {
                        for (let i = 0; i < sectionPositions.length; i++) {
                            const section = sectionPositions[i];
                            if (scrollPosition >= section.top && scrollPosition < section.bottom) {
                                current = section.id;
                                break;
                            }
                        }
                    }
                    
                    // Only update DOM if section changed
                    if (current !== lastActiveSection) {
                        // Batch DOM updates
                        requestAnimationFrame(() => {
                            navLinks.forEach(link => {
                                const href = link.getAttribute('href').replace('#', '');
                                if (href === current) {
                                    link.classList.add('active');
                                } else {
                                    link.classList.remove('active');
                                }
                            });
                        });
                        lastActiveSection = current;
                    }
                    
                    lastScrollY = scrollY;
                }
                
                ticking = false;
            });
            
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', scrollSpyHandler, { passive: true });
    setTimeout(scrollSpyHandler, 200);
}

// ========== MOBILE MENU CLOSE ==========
function initMobileMenuClose() {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.getElementById('mainNavbar');
    
    if (!toggler || !menu) return;
    
    const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    
    navLinks.forEach(link => {
        // Remove existing listeners to prevent duplicates
        link.removeEventListener('click', handleMobileMenuClick);
        link.addEventListener('click', handleMobileMenuClick, { passive: true });
    });
    
    function handleMobileMenuClick() {
        if (window.innerWidth < 992 && menu.classList.contains('show')) {
            const href = this.getAttribute('href');
            if (href && (href.startsWith('#') || href.includes('index.html#'))) {
                setTimeout(() => {
                    if (menu.classList.contains('show')) {
                        toggler.click();
                    }
                }, 300);
            } else {
                toggler.click();
            }
        }
    }
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    const hashLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href*="index.html#"]');
    
    hashLinks.forEach(anchor => {
        // Remove existing listeners to prevent duplicates
        anchor.removeEventListener('click', handleSmoothScroll);
        anchor.addEventListener('click', handleSmoothScroll, { passive: false });
    });
    
    function handleSmoothScroll(e) {
        let targetId = this.getAttribute('href');
        
        if (targetId.includes('index.html#')) {
            targetId = targetId.split('index.html')[1];
        }
        
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        
        if (target) {
            e.preventDefault();
            
            const navbarHeight = document.querySelector('.custom-navbar')?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

function initHeroCarousel() {
    const heroCarousel = document.getElementById('heroCarousel');
    
    if (!heroCarousel || typeof bootstrap === 'undefined') return;
    
    if (heroCarousel.dataset.carouselInitialized === 'true') return;
    
    try {
        const carousel = new bootstrap.Carousel(heroCarousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
        });
        
        carousel.cycle();
        heroCarousel.dataset.carouselInitialized = 'true';
        console.log('✅ Hero carousel initialized');
    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
}

function initCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    backToTop.removeEventListener('click', handleBackToTopClick);
    backToTop.addEventListener('click', handleBackToTopClick, { passive: false });
    
    function handleBackToTopClick(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    const handleScroll = throttleRAF(() => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

function initNavbarActiveState() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    requestAnimationFrame(() => {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            link.classList.remove('active');
            
            if (href === currentPage) {
                link.classList.add('active');
            }
            
            if (currentPage === 'index.html' || currentPage === '') {
                if (href.startsWith('#')) {
                    link.classList.remove('active');
                }
            }
            
            if (currentPage === '' && (href === 'index.html' || href === './')) {
                link.classList.add('active');
            }
        });
    });
}

let imagesInitialized = false;

function initImageLoading() {
    if (imagesInitialized) return;
    
    const allImages = document.querySelectorAll('img[loading="lazy"]');
    if (!allImages.length) return;
    
    imagesInitialized = true;

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.width && img.height && !img.style.aspectRatio) {
                        img.style.aspectRatio = `${img.width} / ${img.height}`;
                    }
                    
                    if (img.complete) {
                        requestAnimationFrame(() => {
                            img.classList.add('loaded');
                        });
                    } else {
                        img.addEventListener('load', () => {
                            requestAnimationFrame(() => {
                                img.classList.add('loaded');
                            });
                        }, { once: true, passive: true });
                        
                        img.addEventListener('error', () => {
                            requestAnimationFrame(() => {
                                img.classList.add('loaded');
                            });
                        }, { once: true, passive: true });
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {

            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        allImages.forEach((img, index) => {
      
            if (index > 20) {
                setTimeout(() => {
                    imageObserver.observe(img);
                }, Math.min(index * 10, 500));
            } else {
                imageObserver.observe(img);
            }
        });
        
        window.imageObserver = imageObserver;
    } else {

        const processImageBatch = (startIndex, batchSize) => {
            const batch = Array.from(allImages).slice(startIndex, startIndex + batchSize);
            batch.forEach(img => {
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load', function() {
                        this.classList.add('loaded');
                    }, { once: true, passive: true });
                    
                    img.addEventListener('error', function() {
                        this.classList.add('loaded');
                    }, { once: true, passive: true });
                }
            });
            
            if (startIndex + batchSize < allImages.length) {
                setTimeout(() => processImageBatch(startIndex + batchSize, batchSize), 100);
            }
        };
        
        processImageBatch(0, 10);
    }
}

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
                transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
                z-index: 99;
                border: none;
                box-shadow: 0 5px 15px rgba(223, 34, 41, 0.3);
                transform: translateZ(0);
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
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

window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
    console.log('✅ Page fully loaded');
}, { passive: true, once: true });

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
        updateStickyNavbar();
    }
}, { passive: true });

window.addEventListener('beforeunload', function() {

    if (window.imageObserver) {
        window.imageObserver.disconnect();
    }
    if (window.navbarResizeObserver) {
        window.navbarResizeObserver.disconnect();
    }
});