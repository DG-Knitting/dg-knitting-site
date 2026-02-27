// navbar.js - Fixed path and error handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navbar loader: Starting to load navbar...');
    
    // Load navbar component - correct path based on your structure
    fetch('components/navbar.html')  // Note: components/ folder, not component/
        .then(response => {
            if (!response.ok) {
                console.error('Navbar loader: HTTP error', response.status);
                throw new Error(`Failed to load navbar (${response.status})`);
            }
            return response.text();
        })
        .then(html => {
            console.log('Navbar loader: HTML received, inserting...');
            // Insert navbar at the beginning of body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // Dispatch event that navbar is loaded
            document.dispatchEvent(new Event('navbarLoaded'));
            
            console.log('✅ Navbar loaded successfully');
        })
        .catch(error => {
            console.error('❌ Navbar loader error:', error);
            
            // Fallback - insert a basic navbar if file not found
            insertFallbackNavbar();
        });
});

// Fallback function in case navbar.html is missing
function insertFallbackNavbar() {
    console.warn('Using fallback navbar');
    
    const fallbackNavbar = `
    <nav class="navbar navbar-expand-lg custom-navbar">
        <div class="container">
            <a class="navbar-brand logo-container" href="index.html">
                <img src="assets/images/logo.png" alt="DG Knitting Logo" class="logo-img">
                <span class="logo-text">Knitting</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                <i class="fas fa-bars"></i>
            </button>
            <div class="collapse navbar-collapse" id="mainNavbar">
                <ul class="navbar-nav ms-auto align-items-lg-center">
                    <li class="nav-item"><a class="nav-link" href="index.html#hero">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.html#about">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.html#fabrics">Fabrics</a></li>
                    <li class="nav-item"><a class="nav-link" href="strength.html">Strength</a></li>
                    <li class="nav-item"><a class="nav-link" href="process.html">Process</a></li>
                    <li class="nav-item"><a class="nav-link" href="quality.html">Quality</a></li>
                    <li class="nav-item"><a class="nav-link" href="industries.html">Industries</a></li>
                    <li class="nav-item"><a class="nav-link" href="export.html">Export</a></li>
                    <li class="nav-item"><a class="nav-link" href="blog.html">Blogs</a></li>
                    <li class="nav-item"><a class="btn contact-btn" href="contact.html">Contact</a></li>
                </ul>
            </div>
        </div>
        <div class="thread-line"></div>
    </nav>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', fallbackNavbar);
    document.dispatchEvent(new Event('navbarLoaded'));
}