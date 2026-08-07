// Security - Prevent Copy, Right Click, DevTools
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
});

// Prevent text selection
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

// Prevent drag
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});
