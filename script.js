import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- MAIN LOADER ---
window.loadContent = function(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    
    const mainDisplay = document.getElementById('mainDisplay');
    document.getElementById('panelHeader').innerHTML = `
        <h1 style="text-shadow: 0 0 10px var(--red); color: var(--red);">${moduleName}</h1>
        <p style="color: #444; font-family: 'Roboto Mono'; font-size: 10px; letter-spacing: 2px;">SECURE ACCESS // RUTHLESS TERMINAL</p>
    `;

    // Sidebar active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

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
            mainDisplay.innerHTML = `<div class="placeholder-card" style="color:#222; border:1px dashed #222; padding:50px;">[ ${moduleName.toUpperCase()} MODULE ENCRYPTED ]</div>`;
    }
}

// --- 1. FIREBASE CONFIG MODULE ---
function renderFirebaseModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border: 1px solid #111; background: #050505; padding: 25px; border-left: 4px solid var(--red);">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">FIREBASE CORE CONNECTIVITY</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <p style="color:#00ffcc; font-family:'Roboto Mono'; font-size:11px; padding:10px; background:rgba(0,255,204,0.05); border:1px solid #004433;">
                    STATUS: SYSTEM LINKED TO CLOUD FIRESTORE
                </p>
                <div style="color:#555; font-size:11px; font-family:'Roboto Mono'; line-height:1.6;">
                    NOTE: Keys are managed via firebase-logic.js for security. Ensure your Firebase Rules allow Read/Write access.
                </div>
            </div>
        </div>
    `;
}

// --- 2. WARNING NOTE MODULE ---
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border: 1px solid #111; background: #050505; padding: 25px; border-left: 4px solid var(--red); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">SYSTEM WARNING OVERRIDE</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <input type="text" id="warnText" placeholder="ENTER LIVE ALERT MESSAGE..." style="width:100%; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono'; border-radius:4px;">
                
                <div style="display:flex; gap:10px;">
                    <input type="number" id="warnSpeed" placeholder="SPEED (0-10)" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold;">
                    <select id="warnStatus" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                
                <button id="saveWarnBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; letter-spacing:1px; margin-top:10px;">PUSH WARNING UPDATE</button>
            </div>
        </div>
    `;
    document.getElementById('saveWarnBtn').onclick = updateWarning;
}

// --- 3. GIVEAWAY WINNER MODULE ---
function renderGiveawayModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border: 1px solid #111; background: #050505; padding: 25px; border-left: 4px solid var(--red); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">GIVEAWAY BROADCAST</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <textarea id="giveContent" placeholder="WINNER NAME & PRIZE DETAILS..." style="width:100%; height:100px; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono'; border-radius:4px; resize:none;"></textarea>
                
                <div style="display:flex; gap:10px;">
                    <input type="number" id="giveSpeed" placeholder="SCROLL SPEED" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold;">
                    <select id="giveStatus" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                
                <button id="saveGiveBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; letter-spacing:1px; margin-top:10px;">ACTIVATE ANNOUNCEMENT</button>
            </div>
        </div>
    `;
    document.getElementById('saveGiveBtn').onclick = updateGiveaway;
}

// --- FIREBASE LOGIC ---
async function updateWarning() {
    const btn = document.getElementById('saveWarnBtn');
    btn.innerText = "SYNCING SYSTEM...";
    try {
        await setDoc(doc(db, "site_settings", "warning_note"), {
            text: document.getElementById('warnText').value,
            speed: parseInt(document.getElementById('warnSpeed').value) || 0,
            status: document.getElementById('warnStatus').value === "true",
            timestamp: serverTimestamp()
        });
        alert("RUTHLESS WARNING UPDATED!");
    } catch (e) { alert("SYNC FAILED: " + e.message); }
    btn.innerText = "PUSH WARNING UPDATE";
}

async function updateGiveaway() {
    const btn = document.getElementById('saveGiveBtn');
    btn.innerText = "SYNCING SYSTEM...";
    try {
        await setDoc(doc(db, "site_settings", "giveaway"), {
            content: document.getElementById('giveContent').value,
            speed: parseInt(document.getElementById('giveSpeed').value) || 0,
            status: document.getElementById('giveStatus').value === "true",
            timestamp: serverTimestamp()
        });
        alert("GIVEAWAY BROADCAST LIVE!");
    } catch (e) { alert("SYNC FAILED: " + e.message); }
    btn.innerText = "ACTIVATE ANNOUNCEMENT";
}

// Default Load
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Firebase');
