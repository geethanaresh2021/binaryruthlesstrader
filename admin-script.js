import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Main Load Function
window.loadContent = function(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    const mainDisplay = document.getElementById('mainDisplay');
    
    // Header UI Update
    document.getElementById('panelHeader').innerHTML = `
        <h1>${moduleName} <span style="color:var(--red); font-size:12px;">_SYS</span></h1>
        <p>ENCRYPTED TERMINAL // RUTHLESS TRADER</p>
    `;

    // Sidebar Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // Content Rendering
    if (moduleName === 'Views' || moduleName === 'Revenue') {
        renderStats(moduleName);
    } else if (moduleName === 'Warning Note') {
        renderWarningUI();
    } else {
        renderStandardUI(moduleName);
    }
}

function renderStats(type) {
    const val = type === 'Views' ? '1,284' : '₹ 42,500';
    const color = type === 'Views' ? '#00ffcc' : 'var(--red)';
    document.getElementById('mainDisplay').innerHTML = `
        <div class="ruthless-card">
            <p style="font-size:11px; color:#444;">TOTAL DATA SCAN</p>
            <h2 style="color:${color}; font-size:32px; font-family:'Roboto Mono'; text-shadow:0 0 15px ${color}; margin-top:10px;">${val}</h2>
            <p style="font-size:9px; color:#222; margin-top:15px;">REFRESHED IN REAL-TIME</p>
        </div>`;
}

function renderWarningUI() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="ruthless-card">
            <h3 style="font-size:14px; margin-bottom:15px;">WARNING OVERRIDE</h3>
            <input type="text" id="wTxt" class="ruthless-input" placeholder="ALERT MESSAGE...">
            <input type="number" id="wSpd" class="ruthless-input" placeholder="SCROLL SPEED (0-10)">
            <button class="save-btn" id="saveBtn">UPDATE SYSTEM</button>
        </div>`;
    document.getElementById('saveBtn').onclick = () => pushData('warning_note', {
        text: document.getElementById('wTxt').value,
        speed: parseInt(document.getElementById('wSpd').value) || 0,
        status: true
    });
}

function renderStandardUI(title) {
    const docId = title.toLowerCase().replace(/\s+/g, '_');
    document.getElementById('mainDisplay').innerHTML = `
        <div class="ruthless-card">
            <h3 style="font-size:14px; margin-bottom:15px;">${title} CONFIG</h3>
            <input type="text" id="univInp" class="ruthless-input" placeholder="ENTER VALUE...">
            <button class="save-btn" id="saveBtn">SAVE CONFIG</button>
        </div>`;
    document.getElementById('saveBtn').onclick = () => pushData(docId, { value: document.getElementById('univInp').value });
}

async function pushData(docId, data) {
    try {
        await setDoc(doc(db, "site_settings", docId), { ...data, timestamp: serverTimestamp() });
        alert("RUTHLESS CORE: DATA SYNCED");
    } catch (e) { alert("SYNC ERROR: " + e.message); }
}

// Initial Load
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Views');
