// --- 1. CONFIGURATION ---
const SECRET_PATH = "9700224305";
const REDIRECT_URL = "about:blank"; // Redirect unauthorized or suspicious users here

// --- 2. SECRET PATH AUTHENTICATION ---
function checkSecretAccess() {
    // URL hash check (e.g., mysite.com/#9700224305)
    if (window.location.hash === `#${SECRET_PATH}` || sessionStorage.getItem('ruthless_session_active')) {
        const adminBtn = document.getElementById('admin-entry-btn');
        if (adminBtn) {
            adminBtn.style.display = 'block';
            sessionStorage.setItem('ruthless_session_active', 'true');
        }
    }
}

// --- 3. ANTI-INSPECT & ANTI-DEBUGGER ---
function enableShield() {
    // Disable Right Click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    document.onkeydown = function(e) {
        if (e.keyCode == 123 || 
           (e.ctrlKey && e.shiftKey && (e.key == 'I' || e.key == 'J' || e.key == 'C')) || 
           (e.ctrlKey && e.key == 'U')) {
            window.location.replace(REDIRECT_URL);
            return false;
        }
    };

    // Detect DevTools Opening
    let devtools = function() {};
    devtools.toString = function() {
        window.location.replace(REDIRECT_URL);
    }
    console.log('%c', devtools);
}

// --- 4. INITIALIZE SECURITY ---
document.addEventListener('DOMContentLoaded', () => {
    checkSecretAccess();
    enableShield();
});

// Run check on hash change (if user types the code without refreshing)
window.addEventListener('hashchange', checkSecretAccess);
