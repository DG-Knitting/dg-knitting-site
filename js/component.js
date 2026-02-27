// js/component.js - DEBUG VERSION
async function loadComponent(elementId, componentPath) {
    try {
        console.log('Attempting to load:', componentPath);
        const response = await fetch(componentPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('HTML received:', html.substring(0, 100) + '...'); // Show first 100 chars
        
        document.getElementById(elementId).innerHTML = html;
        console.log('✅ Successfully loaded tags');
    } catch (error) {
        console.error('❌ Failed to load component:', error);
        
        // Show where it's looking
        console.log('Current URL:', window.location.href);
        console.log('Tried to load:', new URL(componentPath, window.location.href).href);
    }
}

// Load tags when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting to load tags...');
    loadComponent('tags-container', '../component/tags.html');
});