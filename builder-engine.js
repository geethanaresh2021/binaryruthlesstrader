// --- 1. CONFIGURATION & STATE ---
let isMobileMode = false;
const savedLayoutKey = 'ruthless_master_layout';

// --- 2. DRAG & DROP INITIALIZATION (Interact.js) ---
interact('.element').draggable({
    // Enable dragging only when Admin Panel is open
    enabled: false, 
    listeners: {
        move(event) {
            const target = event.target;
            // Current coordinates
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // Apply transformation
            target.style.transform = `translate(${x}px, ${y}px)`;

            // Update attributes for saving
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }
    },
    modifiers: [
        interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
        })
    ]
});

// --- 3. CANVAS MODE SWITCHER ---
function setCanvasMode(mode) {
    const homeView = document.getElementById('home-view');
    if (mode === 'mobile') {
        homeView.classList.add('mobile-canvas-view');
        isMobileMode = true;
    } else {
        homeView.classList.remove('mobile-canvas-view');
        isMobileMode = false;
    }
    console.log(`Switching to ${mode} mode`);
}

// --- 4. LAYOUT PERSISTENCE (SAVE & LOAD) ---
function saveMasterLayout() {
    const elements = document.querySelectorAll('.element');
    const layoutData = {};

    elements.forEach(el => {
        layoutData[el.id] = {
            x: el.getAttribute('data-x') || 0,
            y: el.getAttribute('data-y') || 0
        };
    });

    // Save to LocalStorage (Later can be synced to Firebase)
    localStorage.setItem(savedLayoutKey, JSON.stringify(layoutData));
    
    // Save Affiliate Link
    const affLink = document.getElementById('admin-aff-link').value;
    localStorage.setItem('ruthless_aff_link', affLink);

    alert("RUTHLESS: Layout & Settings Saved Successfully!");
}

function loadLayout() {
    const savedData = localStorage.getItem(savedLayoutKey);
    if (savedData) {
        const layoutData = JSON.parse(savedData);
        Object.keys(layoutData).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const pos = layoutData[id];
                el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                el.setAttribute('data-x', pos.x);
                el.setAttribute('data-y', pos.y);
            }
        });
    }
}

// --- 5. ADMIN CONTROL FUNCTIONS ---
function openDashboard() {
    // Enable dragging when dashboard opens
    interact('.element').draggable({ enabled: true });
    document.getElementById('admin-view').style.display = 'block';
    document.getElementById('home-view').style.opacity = '0.5'; // Preview mode effect
}

function exitAdmin() {
    // Disable dragging on exit
    interact('.element').draggable({ enabled: false });
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('home-view').style.opacity = '1';
}

// Initialize layout on page load
window.onload = loadLayout;
