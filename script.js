// 1. IMPORT FIREBASE UTILITIES
import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. MAIN CONTENT LOADER
window.loadContent = function(moduleName) {
    // LocalStorage lo save chesthunnam refresh ayina gurtuundataniki
    localStorage.setItem('activeModule', moduleName);

    // Sidebar buttons active style update
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.innerText.trim().includes(moduleName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Header Title Update
    document.getElementById('panelHeader').innerHTML = `
        <h1>${moduleName}</h1>
        <p>MANAGING ${moduleName.toUpperCase()} MODULE SETTINGS AND DATA.</p>
    `;

    const mainDisplay = document.getElementById('mainDisplay');

    // 3. MODULE ROUTING (Ikkade mistake jaragakunda chusukovali)
    switch (moduleName) {
        case 'Firebase':
            renderFirebaseModule();
            break;
            
        case 'Warning Note':
            renderWarningModule();
            break;

        case 'Giveaway Winner':
            renderGiveawayModule();
            break;

        default:
            // Vere buttons inka ready avvaledu kabatti placeholder chupisthundi
            mainDisplay.innerHTML = `
                <div class="placeholder-card">
                    <i class="fas fa-sync fa-spin" style="color:var(--red); font-size:24px; margin-bottom:15px;"></i><br>
                    [ ${moduleName.toUpperCase()} MODULE LOADED ]<br>
                    <small style="color:#555; margin-top:10px; display:block;">READY TO SYNC WITH FIREBASE DATABASE.</small>
                </div>
            `;
    }
}

// --- MODULE 1: FIREBASE ---
function renderFirebaseModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card">
            <h2 style="color:var(--red); margin-bottom:15px; font-size:14px;">FIREBASE STATUS</h2>
            <div style="background:#0a0a0a; padding:15px; border:1px solid #1a1a1a; color:#00ffcc; font-family:'Roboto Mono'; font-size:12px;">
                CONNECTED TO ACTIVE DATABASE: SUCCESS
            </div>
            <p style="font-size:10px; color:#444; margin-top:10px;">Note: API keys are loaded from firebase-logic.js</p>
        </div>
    `;
}

// --- MODULE 2: WARNING NOTE ---
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card">
            <h2 style="color:var(--red); margin-bottom:20px; font-size:14px;">WARNING NOTE CONFIG</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <label style="font-size:10px; color:#555;">MESSAGE TEXT</label>
                <input type="text" id="warnText" class="fb-input" placeholder="Example: USE LOW STAKES TODAY...">
                
                <label style="font-size:10px; color:#555;">SCROLL SPEED (0 = NO SCROLL)</label>
                <input type="number" id="warnSpeed" class="fb-input" placeholder="Speed (e.g. 5)">
                
                <label style="font-size:10px; color:#555;">STATUS</label>
                <select id="warnStatus" class="fb-input" style="background:#000;">
                    <option value="true">VISIBLE</option>
                    <option value="false">HIDDEN</option>
                </select>
                
                <button class="join-btn" onclick="updateWarning()" style="margin-top:10px;">UPDATE WARNING LIVE</button>
            </div>
        </div>
    `;
}

// --- MODULE 3: GIVEAWAY WINNER ---
function renderGiveawayModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card">
            <h2 style="color:var(--red); margin-bottom:20px; font-size:14px;">GIVEAWAY WINNER CONFIG</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <label style="font-size:10px; color:#555;">WINNER CONTENT</label>
                <textarea id="giveContent" class="fb-input" style="height:80px;" placeholder="Winner details here..."></textarea>
                
                <label style="font-size:10px; color:#555;">SCROLL SPEED</label>
                <input type="number" id="giveSpeed" class="fb-input" placeholder="Speed (e.g. 7)">
                
                <label style="font-size:10px; color:#555;">STATUS</label>
                <select id="giveStatus" class="fb-input" style="background:#000;">
                    <option value="true">VISIBLE</option>
                    <option value="false">HIDDEN</option>
                </select>
                
                <button class="join-btn" onclick="updateGiveaway()" style="margin-top:10px;">UPDATE GIVEAWAY LIVE</button>
            </div>
        </div>
    `;
}

// --- FIREBASE WRITE FUNCTIONS ---
// Window object ki attach chesthunnam buttons ki dorakalani
window.updateWarning = async function() {
    const text = document.getElementById('warnText').value;
    const speed = parseInt(document.getElementById('warnSpeed').value) || 0;
    const status = document.getElementById('warnStatus').value === "true";

    try {
        await setDoc(doc(db, "site_settings", "warning_note"), {
            text, speed, status, timestamp: serverTimestamp()
        });
        alert("Warning Note Updated on Live Site!");
    } catch (e) { alert("Error: " + e.message); }
}

window.updateGiveaway = async function() {
    const content = document.getElementById('giveContent').value;
    const speed = parseInt(document.getElementById('giveSpeed').value) || 0;
    const status = document.getElementById('giveStatus').value === "true";

    try {
        await setDoc(doc(db, "site_settings", "giveaway"), {
            content, speed, status, timestamp: serverTimestamp()
        });
        alert("Giveaway Updated on Live Site!");
    } catch (e) { alert("Error: " + e.message); }
}

// 4. ON PAGE LOAD
window.onload = function() {
    const lastModule = localStorage.getItem('activeModule') || 'Views';
    loadContent(lastModule);
};
