// --- 1. DYNAMIC DROPDOWN CONFIGURATION ---
function updateSignalDropdown() {
    const signalInput = document.getElementById('sig-names'); // Admin Panel Input
    if (!signalInput) return;

    const names = signalInput.value.split(',').map(name => name.trim());
    const dropdown = document.getElementById('h-signal-dropdown'); // Home Page Dropdown

    if (dropdown) {
        dropdown.innerHTML = ''; // Clear old names
        names.forEach(name => {
            if (name !== "") {
                const option = document.createElement('option');
                option.value = name.toLowerCase();
                option.innerText = name.toUpperCase();
                dropdown.appendChild(option);
            }
        });
    }
}

// --- 2. EXTERNAL TOOL SNIPPET LOADER ---
function loadToolSnippet() {
    const toolSnippet = document.getElementById('tool-snippet-input'); // Admin Panel TextArea
    const toolContainer = document.getElementById('h-main-container-2'); // Home Page Tool Box

    if (toolSnippet && toolContainer) {
        // Injecting the HTML code (Clock/Calculator/TradingView Widget)
        toolContainer.innerHTML = toolSnippet.value;
    }
}

// --- 3. LIVE ACCURACY SIMULATOR ---
// Binary Ruthless aesthetic kosam accuracy numbers ni ala fluctuate cheyadam
function startAccuracySimulator() {
    const itmElement = document.getElementById('itm-rate');
    if (itmElement) {
        setInterval(() => {
            // 94% nundi 99% madhyalo numbers fluctuate avthayi
            const randomAccuracy = Math.floor(Math.random() * (99 - 94 + 1)) + 94;
            itmElement.innerText = randomAccuracy + "%";
        }, 5000); // Every 5 seconds update
    }
}

// --- 4. INITIALIZE SIGNALS ---
document.addEventListener('DOMContentLoaded', () => {
    startAccuracySimulator();
    
    // Sync buttons/inputs if Admin is active
    const saveBtn = document.getElementById('save-signals-btn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            updateSignalDropdown();
            loadToolSnippet();
            alert("RUTHLESS: Signals & Tools Updated!");
        };
    }
});
