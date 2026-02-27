// ========== BLOG PAGE FUNCTIONALITY ==========

document.addEventListener('DOMContentLoaded', function() {
    // Category Filtering
    const filterBtns = document.querySelectorAll('.blog-filters .filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    if (filterBtns.length && blogCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const filterValue = this.dataset.filter;
                
                // Filter cards with animation
                blogCards.forEach((card, index) => {
                    if (filterValue === 'all' || card.dataset.category === filterValue) {
                        card.style.display = 'flex';
                        // Add staggered animation
                        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Pagination
    const pageNumbers = document.querySelectorAll('.page-number');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const blogGrid = document.getElementById('blogGrid');
    const allCards = document.querySelectorAll('.blog-card');
    const cardsPerPage = 9; // 3x3 grid
    
    if (pageNumbers.length && prevBtn && nextBtn) {
        let currentPage = 1;
        const totalPages = pageNumbers.length;
        
        // Function to show cards for current page
        function showPage(page) {
            const start = (page - 1) * cardsPerPage;
            const end = start + cardsPerPage;
            
            allCards.forEach((card, index) => {
                if (index >= start && index < end) {
                    card.style.display = 'flex';
                    card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update active page number
            pageNumbers.forEach((num, idx) => {
                if (idx + 1 === page) {
                    num.classList.add('active');
                } else {
                    num.classList.remove('active');
                }
            });
            
            // Update prev/next buttons
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
            
            currentPage = page;
        }
        
        // Page number click
        pageNumbers.forEach((num, index) => {
            num.addEventListener('click', function() {
                showPage(index + 1);
            });
        });
        
        // Prev button click
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                showPage(currentPage - 1);
            }
        });
        
        // Next button click
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                showPage(currentPage + 1);
            }
        });
        
        // Initialize first page
        showPage(1);
    }
    
    // Load More (Mobile)
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        let visibleCards = 3; // Show 3 cards initially on mobile
        const cards = document.querySelectorAll('.blog-card');
        
        // Initially hide cards beyond first 3 on mobile
        if (window.innerWidth <= 575) {
            cards.forEach((card, index) => {
                if (index >= visibleCards) {
                    card.style.display = 'none';
                }
            });
        }
        
        loadMoreBtn.addEventListener('click', function() {
            const hiddenCards = Array.from(cards).filter(card => card.style.display === 'none');
            
            if (hiddenCards.length > 0) {
                // Show next 3 cards
                for (let i = 0; i < Math.min(3, hiddenCards.length); i++) {
                    hiddenCards[i].style.display = 'flex';
                    hiddenCards[i].style.animation = 'fadeInUp 0.5s ease forwards';
                }
                
                // If no more hidden cards, change button text
                if (hiddenCards.length <= 3) {
                    loadMoreBtn.innerHTML = 'No More Articles <i class="fas fa-check"></i>';
                    loadMoreBtn.disabled = true;
                }
            }
        });
    }
    
    // Category hover effects
    const categoryBadges = document.querySelectorAll('.blog-category');
    categoryBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.background = 'var(--crimson)';
            this.style.color = 'white';
            this.style.borderColor = 'var(--crimson)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 255, 255, 0.95)';
            this.style.color = 'var(--crimson)';
            this.style.borderColor = 'rgba(223, 34, 41, 0.2)';
        });
    });
    
    // Search functionality (optional)
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            blogCards.forEach(card => {
                const title = card.querySelector('.blog-title').textContent.toLowerCase();
                const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Smooth scroll for read more links
    const readMoreLinks = document.querySelectorAll('.blog-read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real implementation, this would navigate to the single blog post
            // For now, just show a message or navigate
            console.log('Navigate to blog post');
            
            // Optional: Add a subtle animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // Lazy loading for images (optional)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('.blog-image img').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Reset load more button on resize
            if (window.innerWidth > 575) {
                const loadMoreContainer = document.querySelector('.load-more-container');
                if (loadMoreContainer) {
                    loadMoreContainer.style.display = 'none';
                }
                
                // Show all cards on desktop
                document.querySelectorAll('.blog-card').forEach(card => {
                    card.style.display = 'flex';
                });
            } else {
                const loadMoreContainer = document.querySelector('.load-more-container');
                if (loadMoreContainer) {
                    loadMoreContainer.style.display = 'block';
                }
                
                // Reset to showing only first 3 cards on mobile
                const cards = document.querySelectorAll('.blog-card');
                cards.forEach((card, index) => {
                    if (index >= 3) {
                        card.style.display = 'none';
                    } else {
                        card.style.display = 'flex';
                    }
                });
            }
        }, 250);
    });
    
    // Add touch support for mobile
    if ('ontouchstart' in window) {
        document.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    console.log('Blog page loaded with 3x3 grid and animated pagination');
});