import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let firebaseList = JSON.parse(localStorage.getItem('fb_projects') || '[]');
let activeIndex = localStorage.getItem('fb_active_index');

// --- MAIN LOADER ---
window.loadContent = function(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    const mainDisplay = document.getElementById('mainDisplay');
    
    // Header Style
    document.getElementById('panelHeader').innerHTML = `
        <h1 style="text-shadow: 0 0 15px var(--red); color: var(--red); text-transform: uppercase;">${moduleName}</h1>
        <p style="color: #444; font-family: 'Roboto Mono'; font-size: 10px; letter-spacing: 2px;">RUTHLESS // TERMINAL // v2.0</p>
    `;

    // Sidebar Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // Routing
    if (moduleName === 'Firebase') {
        renderFirebaseModule();
    } else if (moduleName === 'Warning Note') {
        renderWarningModule();
    } else if (moduleName === 'Giveaway Winner') {
        renderGiveawayModule();
    } else {
        mainDisplay.innerHTML = `<div class="placeholder-card" style="color:#222;">[ ${moduleName.toUpperCase()} MODULE LOCKED ]</div>`;
    }
}

// ==========================================
// 1. FIREBASE MODULE (LIST & MANAGEMENT)
// ==========================================
function renderFirebaseModule() {
    let listHTML = firebaseList.map((proj, index) => {
        const isConnected = activeIndex == index;
        return `
        <div style="background:#000; border:1px solid ${isConnected ? '#00ffcc' : '#111'}; padding:15px; margin-bottom:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; transition: 0.3s;">
            <div>
                <div style="color:#fff; font-size:13px; font-family:'Orbitron'; font-weight:bold; letter-spacing:1px;">${proj.projectName || 'UNNAMED PROJECT'}</div>
                <div style="font-size:10px; margin-top:5px; font-family:'Roboto Mono'; font-weight:bold; color:${isConnected ? '#00ffcc' : '#ff4444'}; text-shadow: ${isConnected ? '0 0 5px #00ffcc' : 'none'};">
                    ${isConnected ? '● CONNECTED' : '○ NOT CONNECTED'}
                </div>
            </div>
            <button onclick="editFirebase(${index})" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:8px 15px; font-family:'Orbitron'; font-size:10px; cursor:pointer; font-weight:900;">MANAGE</button>
        </div>
        `;
    }).join('');

    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="background:#050505; border-left: 4px solid var(--red); padding:20px;">
            <button onclick="showAddFirebaseForm()" style="width:100%; padding:15px; background:var(--red); color:#fff; border:none; font-family:'Orbitron'; font-weight:900; margin-bottom:25px; cursor:pointer; box-shadow: 0 0 10px rgba(255,0,0,0.3);">+ ADD NEW FIREBASE CONFIG</button>
            
            <h3 style="color:#333; font-size:10px; font-family:'Roboto Mono'; margin-bottom:15px; letter-spacing:1px;">ACTIVE DATABASE INSTANCES</h3>
            <div id="fb-list-container">
                ${listHTML || '<p style="color:#222; font-size:11px; text-align:center; padding:20px; border:1px dashed #111;">NO CONFIGURATIONS FOUND</p>'}
            </div>
        </div>
    `;
}

// --- FORM TO ADD/EDIT ---
window.showAddFirebaseForm = function(index = null) {
    const isEdit = index !== null;
    const data = isEdit ? firebaseList[index] : { projectName: '', apiKey: '', authDomain: '', projectId: '', appId: '' };

    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border:1px solid #1a1a1a; padding:25px; background:#0a0a0a; box-shadow: 0 0 20px rgba(0,0,0,1);">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:25px; letter-spacing:1px;">${isEdit ? 'EDIT' : 'CONFIGURE NEW'} INSTANCE</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <input type="text" id="fbName" class="fb-input" placeholder="PROJECT NAME (E.G. RUTHLESS MAIN)" value="${data.projectName}" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                <input type="text" id="fbKey" class="fb-input" placeholder="API KEY" value="${data.apiKey}" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                <input type="text" id="fbDomain" class="fb-input" placeholder="AUTH DOMAIN" value="${data.authDomain}" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                <input type="text" id="fbId" class="fb-input" placeholder="PROJECT ID" value="${data.projectId}" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                <input type="text" id="fbApp" class="fb-input" placeholder="APP ID" value="${data.appId}" style="width:100%; padding:12px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                
                <div style="display:flex; gap:12px; margin-top:15px;">
                    <button onclick="saveFirebase(${index})" style="flex:2; padding:15px; background:#00ffcc; color:#000; font-family:'Orbitron'; font-weight:900; border:none; cursor:pointer;">SAVE CONFIG</button>
                    ${isEdit ? `<button onclick="connectFirebase(${index})" style="flex:1; padding:15px; background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900; border:none; cursor:pointer; box-shadow: 0 0 10px var(--red);">CONNECT</button>` : ''}
                </div>
                
                ${isEdit ? `<button onclick="deleteFirebase(${index})" style="margin-top:10px; background:none; border:none; color:#444; font-size:10px; cursor:pointer; text-decoration:underline; font-family:'Roboto Mono';">TERMINATE CONFIGURATION</button>` : ''}
                
                <button onclick="renderFirebaseModule()" style="background:none; border:none; color:#666; font-size:11px; margin-top:15px; cursor:pointer; font-family:'Roboto Mono'; text-transform:uppercase;">← BACK TO LIST</button>
            </div>
        </div>
    `;
}

// --- LOGIC FUNCTIONS ---
window.saveFirebase = function(index) {
    const newProj = {
        projectName: document.getElementById('fbName').value,
        apiKey: document.getElementById('fbKey').value,
        authDomain: document.getElementById('fbDomain').value,
        projectId: document.getElementById('fbId').value,
        appId: document.getElementById('fbApp').value
    };

    if(index === null) firebaseList.push(newProj);
    else firebaseList[index] = newProj;

    localStorage.setItem('fb_projects', JSON.stringify(firebaseList));
    alert("SYSTEM DATA SAVED.");
    renderFirebaseModule();
}

window.connectFirebase = function(index) {
    activeIndex = index;
    localStorage.setItem('fb_active_index', index);
    alert("SYSTEM CONNECTED TO: " + firebaseList[index].projectName.toUpperCase());
    renderFirebaseModule();
}

window.deleteFirebase = function(index) {
    if(confirm("PERMANENTLY DELETE THIS CONFIGURATION?")) {
        firebaseList.splice(index, 1);
        if(activeIndex == index) activeIndex = null;
        localStorage.setItem('fb_projects', JSON.stringify(firebaseList));
        localStorage.setItem('fb_active_index', activeIndex);
        renderFirebaseModule();
    }
}

window.editFirebase = function(index) {
    showAddFirebaseForm(index);
}

// ==========================================
// 2. WARNING NOTE & GIVEAWAY MODULES
// ==========================================
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">SYSTEM WARNING OVERRIDE</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <input type="text" id="warnText" placeholder="ENTER LIVE ALERT..." style="width:100%; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                <div style="display:flex; gap:10px;">
                    <input type="number" id="warnSpeed" placeholder="SPEED" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#00ffcc; font-weight:bold; font-family:'Roboto Mono';">
                    <select id="warnStatus" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                <button id="saveWarnBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; box-shadow: 0 0 10px var(--red);">PUSH UPDATE</button>
            </div>
        </div>
    `;
    document.getElementById('saveWarnBtn').onclick = updateWarning;
}

function renderGiveawayModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">GIVEAWAY BROADCAST</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <textarea id="giveContent" placeholder="WINNER DETAILS..." style="width:100%; height:100px; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono'; resize:none;"></textarea>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="giveSpeed" placeholder="SPEED" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#00ffcc; font-weight:bold; font-family:'Roboto Mono';">
                    <select id="giveStatus" style="flex:1; padding:15px; background:#000; border:1px solid #222; color:#fff; font-family:'Roboto Mono';">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                <button id="saveGiveBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; border:none; cursor:pointer; font-family:'Orbitron'; font-weight:900; box-shadow: 0 0 10px var(--red);">ACTIVATE BROADCAST</button>
            </div>
        </div>
    `;
    document.getElementById('saveGiveBtn').onclick = updateGiveaway;
}

// ==========================================
// 3. FIREBASE SYNC ACTIONS
// ==========================================
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
        alert("RUTHLESS ALERT LIVE.");
    } catch (e) { alert("SYNC FAILED: " + e.message); }
    btn.innerText = "PUSH UPDATE";
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
        alert("BROADCAST ACTIVE.");
    } catch (e) { alert("SYNC FAILED: " + e.message); }
    btn.innerText = "ACTIVATE BROADCAST";
}

// ON LOAD
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Firebase');
