window.componentsLoaded = window.componentsLoaded || {};

function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    
    if (depth === 1) { 
        return '';
    } else if (depth > 1) { 
        return '../'.repeat(depth - 1);
    }
    return '';
}

async function loadComponent(elementId, componentPath, fallbackContent = '') {

    if (window.componentsLoaded[elementId]) {
        console.log(`Component ${elementId} already loaded, skipping...`);
        return;
    }
    
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element #${elementId} not found, cannot load component`);
        return;
    }
    
    element.style.opacity = '0.5';
    element.style.transition = 'opacity 0.2s ease';
    
    try {
        const basePath = getBasePath();
        
        const possiblePaths = [
            basePath + componentPath,
            componentPath,
            basePath + 'components/' + componentPath.split('/').pop(),
            'components/' + componentPath.split('/').pop(),
            basePath + 'component/' + componentPath.split('/').pop()
        ];
        
        let response = null;
        let usedPath = '';
        
        for (const path of possiblePaths) {
            try {
                console.log('Trying component path:', path);
                const res = await fetch(path, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html'
                    }
                });
                if (res.ok) {
                    response = res;
                    usedPath = path;
                    break;
                }
            } catch (e) {
  
                console.log(`Path failed: ${path}`);
            }
        }
        
        if (!response) {
            throw new Error(`Component ${componentPath} not found in any location`);
        }
        
        console.log(`✅ Component found at: ${usedPath}`);
        const html = await response.text();
        
        if (!html.trim()) {
            throw new Error('Component HTML is empty');
        }
        
        requestAnimationFrame(() => {
            element.innerHTML = html;
            element.style.opacity = '1';
            
            updateComponentPaths(element, basePath);
            
            window.componentsLoaded[elementId] = true;
            
            console.log(`✅ Component loaded: ${componentPath}`);
        });
        
    } catch (error) {
        console.error(`❌ Failed to load component ${componentPath}:`, error);
        
        requestAnimationFrame(() => {
            if (fallbackContent) {
                element.innerHTML = fallbackContent;
            } else {
    
                element.innerHTML = `<!-- ${componentPath} failed to load -->`;
            }
            element.style.opacity = '1';
        });
    }
}

function updateComponentPaths(container, basePath) {
    if (!basePath || !container) return;
    
    container.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
            img.src = basePath + src;
        }
    });
    
    container.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('/')) {
            link.href = basePath + href;
        }
    });
}

const tagsFallback = `
<div class="tags-container">
    <style>
        .tags-placeholder {
            display: none;
        }
    </style>
    <div class="tags-placeholder"></div>
</div>
`;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Component loader: Starting...');
        setTimeout(() => {
            loadComponent('tags-container', 'component/tags.html', tagsFallback);
        }, 100);
    });
} else {

    console.log('Component loader: DOM already loaded, starting...');
    setTimeout(() => {
        loadComponent('tags-container', 'component/tags.html', tagsFallback);
    }, 100);
}


window.loadComponent = loadComponent;