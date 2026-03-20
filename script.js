import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.loadContent = function(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    
    // UI Update logic
    const mainDisplay = document.getElementById('mainDisplay');
    document.getElementById('panelHeader').innerHTML = `
        <h1 style="text-shadow: var(--neon);">${moduleName}</h1>
        <p style="color: #666; font-family: 'Roboto Mono'; font-size: 10px;">SYSTEM // CORE // ${moduleName.toUpperCase()}</p>
    `;

    switch (moduleName) {
        case 'Warning Note':
            renderWarningModule();
            break;
        case 'Giveaway Winner':
            renderGiveawayModule();
            break;
        default:
            mainDisplay.innerHTML = `<div class="placeholder-card">[ ${moduleName} MODULE READY ]</div>`;
    }
}

// --- WARNING MODULE UI ---
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border: 1px solid var(--red); box-shadow: var(--neon); padding: 25px; background: #0a0a0a;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:16px; margin-bottom:20px;">LIVE WARNING CONFIG</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">ALERT MESSAGE</label>
                    <input type="text" id="warnText" class="fb-input" placeholder="SYSTEM ALERT TEXT..." style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                </div>
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">SCROLL SPEED (0-10)</label>
                    <input type="number" id="warnSpeed" class="fb-input" value="5" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#00ffcc; font-weight:bold;">
                </div>
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">DISPLAY STATUS</label>
                    <select id="warnStatus" class="fb-input" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff;">
                        <option value="true">SYSTEM ONLINE (VISIBLE)</option>
                        <option value="false">SYSTEM OFFLINE (HIDDEN)</option>
                    </select>
                </div>
                <button id="saveWarnBtn" class="join-btn" style="width:100%; padding:15px; background:var(--red); color:white; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; box-shadow:0 0 10px var(--red);">UPDATE SYSTEM WARNING</button>
            </div>
        </div>
    `;
    // Click listener instead of onclick
    document.getElementById('saveWarnBtn').addEventListener('click', updateWarning);
}

// --- GIVEAWAY MODULE UI ---
function renderGiveawayModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border: 1px solid var(--red); box-shadow: var(--neon); padding: 25px; background: #0a0a0a;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:16px; margin-bottom:20px;">GIVEAWAY ANNOUNCEMENT</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">WINNER DATA / CONTENT</label>
                    <textarea id="giveContent" class="fb-input" style="width:100%; height:80px; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';"></textarea>
                </div>
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">ANIMATION SPEED</label>
                    <input type="number" id="giveSpeed" class="fb-input" value="7" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#00ffcc; font-weight:bold;">
                </div>
                <div class="input-group">
                    <label style="color:#444; font-size:10px; font-family:'Roboto Mono';">STATUS</label>
                    <select id="giveStatus" class="fb-input" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff;">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                <button id="saveGiveBtn" class="join-btn" style="width:100%; padding:15px; background:var(--red); color:white; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; box-shadow:0 0 10px var(--red);">PUSH LIVE UPDATE</button>
            </div>
        </div>
    `;
    document.getElementById('saveGiveBtn').addEventListener('click', updateGiveaway);
}

// --- FIREBASE SAVE FUNCTIONS ---
async function updateWarning() {
    const btn = document.getElementById('saveWarnBtn');
    btn.innerText = "SYNCING...";
    try {
        await setDoc(doc(db, "site_settings", "warning_note"), {
            text: document.getElementById('warnText').value,
            speed: parseInt(document.getElementById('warnSpeed').value) || 0,
            status: document.getElementById('warnStatus').value === "true",
            timestamp: serverTimestamp()
        });
        alert("RUTHLESS SYSTEM UPDATED!");
    } catch (e) { alert("ERROR: " + e.message); }
    btn.innerText = "UPDATE SYSTEM WARNING";
}

async function updateGiveaway() {
    const btn = document.getElementById('saveGiveBtn');
    btn.innerText = "SYNCING...";
    try {
        await setDoc(doc(db, "site_settings", "giveaway"), {
            content: document.getElementById('giveContent').value,
            speed: parseInt(document.getElementById('giveSpeed').value) || 0,
            status: document.getElementById('giveStatus').value === "true",
            timestamp: serverTimestamp()
        });
        alert("GIVEAWAY DATA PUSHED!");
    } catch (e) { alert("ERROR: " + e.message); }
    btn.innerText = "PUSH LIVE UPDATE";
}

window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Warning Note');
