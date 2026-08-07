// ============================================
// SECTION: SECURITY
// FILE: security.js
// Contains: Security functions only
// ============================================

// ─── PREVENT RIGHT CLICK ───
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// ─── PREVENT KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', function(e) {
    // Prevent Ctrl+C, Ctrl+U, Ctrl+S
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
    // Prevent F12 (DevTools)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    // Prevent Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        return false;
    }
    // Prevent Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        return false;
    }
});

// ─── PREVENT DRAG ───
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});

// ─── PREVENT SELECTION ───
document.addEventListener('selectstart', function(e) {
    // Allow selection only in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// ─── DETECT DEVTOOLS OPEN ───
(function() {
    let devtoolsOpen = false;
    const threshold = 160;
    
    const checkDevTools = setInterval(function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                console.clear();
                console.log('%c⚠️ Warning: Developer Tools Detected', 'color: red; font-size: 20px;');
                console.log('%cThis is a protected application.', 'color: yellow; font-size: 14px;');
            }
        } else {
            devtoolsOpen = false;
        }
    }, 1000);
})();

// ─── CONSOLE PROTECTION ───
(function() {
    // Clear console periodically
    setInterval(function() {
        console.clear();
    }, 3000);
    
    // Override console methods to show warning
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        clear: console.clear
    };
    
    console.log = function() {
        originalConsole.log('%c🔒 BRT Security Active', 'color: #FF0033; font-size: 16px; font-weight: bold;');
        originalConsole.log('%cProtected Application - Unauthorized access prohibited', 'color: #FFD700; font-size: 12px;');
    };
    
    console.warn = function() {
        originalConsole.warn('%c⚠️ Warning: This is a protected console', 'color: orange; font-size: 14px;');
    };
    
    console.error = function() {
        originalConsole.error('%c❌ Error logging disabled for security', 'color: red; font-size: 14px;');
    };
    
    console.info = function() {
        originalConsole.log('%c🔒 BRT Security Active', 'color: #FF0033; font-size: 16px; font-weight: bold;');
    };
})();

// ─── PREVENT IFRAME EMBEDDING ───
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

// ─── DISABLE VIEW SOURCE ───
document.addEventListener('keydown', function(e) {
    // Prevent Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
    }
});

console.log('🛡️ Security Module Loaded');
