// js/component.js
function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    
    if (depth === 1) { // In root directory
        return '';
    } else if (depth > 1) { // In subdirectory
        return '../'.repeat(depth - 1);
    }
    return '';
}

async function loadComponent(elementId, componentPath) {
    try {
        const basePath = getBasePath();
        const fullPath = basePath + componentPath;
        
        console.log('Loading component from:', fullPath);
        const response = await fetch(fullPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        console.log('✅ Component loaded:', componentPath);
    } catch (error) {
        console.error('❌ Failed to load component:', error);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    loadComponent('tags-container', 'component/tags.html');
});