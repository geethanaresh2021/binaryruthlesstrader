import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        <p style="color: #444; font-family: 'Roboto Mono'; font-size: 10px; letter-spacing: 2px;">RUTHLESS // TERMINAL // ONLINE</p>
    `;

    // Sidebar Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // --- ROUTING LOGIC ---
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
        case 'Signals Connection':
            renderSignalsModule();
            break;
        default:
            mainDisplay.innerHTML = `
                <div class="placeholder-card" style="border: 1px dashed #111; padding: 40px; text-align: center; color: #222;">
                    <i class="fas fa-lock" style="font-size: 30px; margin-bottom: 15px;"></i><br>
                    [ ${moduleName.toUpperCase()} MODULE ENCRYPTED ]<br>
                    <small style="color:#444;">COMMING SOON IN NEXT UPDATE</small>
                </div>`;
    }
}

// ==========================================
// 1. FIREBASE MODULE (LIST & MANAGEMENT)
// ==========================================
function renderFirebaseModule() {
    let listHTML = firebaseList.map((proj, index) => {
        const isConnected = String(activeIndex) === String(index);
        return `
        <div style="background:#000; border:1px solid ${isConnected ? '#00ffcc' : '#111'}; padding:15px; margin-bottom:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="color:#fff; font-size:13px; font-family:'Orbitron'; font-weight:bold;">${proj.projectName || 'UNNAMED PROJECT'}</div>
                <div style="font-size:10px; margin-top:5px; font-family:'Roboto Mono'; font-weight:bold; color:${isConnected ? '#00ffcc' : '#ff4444'}; text-shadow: ${isConnected ? '0 0 5px #00ffcc' : 'none'};">
                    ${isConnected ? '● CONNECTED' : '○ NOT CONNECTED'}
                </div>
            </div>
            <button onclick="editFirebase(${index})" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:8px 15px; font-family:'Orbitron'; font-size:10px; cursor:pointer; font-weight:900;">MANAGE</button>
        </div>`;
    }).join('');

    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="background:#050505; border-left: 4px solid var(--red); padding:20px;">
            <button onclick="showAddFirebaseForm()" style="width:100%; padding:15px; background:var(--red); color:#fff; border:none; font-family:'Orbitron'; font-weight:900; margin-bottom:25px; cursor:pointer;">+ ADD NEW FIREBASE CONFIG</button>
            <h3 style="color:#333; font-size:10px; font-family:'Roboto Mono'; margin-bottom:15px;">ACTIVE DATABASE INSTANCES</h3>
            <div id="fb-list-container">${listHTML || '<p style="color:#222; font-size:11px; text-align:center;">NO CONFIGURATIONS FOUND</p>'}</div>
        </div>`;
}

window.showAddFirebaseForm = function(index = null) {
    const isEdit = index !== null;
    const data = isEdit ? firebaseList[index] : { projectName: '', apiKey: '', authDomain: '', projectId: '', appId: '' };
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border:1px solid #1a1a1a; padding:25px; background:#0a0a0a;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:25px;">${isEdit ? 'EDIT' : 'CONFIGURE NEW'} INSTANCE</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <input type="text" id="fbName" class="fb-input" placeholder="PROJECT NAME" value="${data.projectName}">
                <input type="text" id="fbKey" class="fb-input" placeholder="API KEY" value="${data.apiKey}">
                <input type="text" id="fbDomain" class="fb-input" placeholder="AUTH DOMAIN" value="${data.authDomain}">
                <input type="text" id="fbId" class="fb-input" placeholder="PROJECT ID" value="${data.projectId}">
                <input type="text" id="fbApp" class="fb-input" placeholder="APP ID" value="${data.appId}">
                <div style="display:flex; gap:12px; margin-top:15px;">
                    <button onclick="saveFirebase(${index})" style="flex:2; padding:15px; background:#00ffcc; color:#000; font-family:'Orbitron'; font-weight:900; border:none; cursor:pointer;">SAVE CONFIG</button>
                    ${isEdit ? `<button onclick="connectFirebase(${index})" style="flex:1; padding:15px; background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900; border:none; cursor:pointer;">CONNECT</button>` : ''}
                </div>
                ${isEdit ? `<button onclick="deleteFirebase(${index})" style="margin-top:10px; background:none; border:none; color:#444; font-size:10px; cursor:pointer; text-decoration:underline;">TERMINATE CONFIGURATION</button>` : ''}
                <button onclick="renderFirebaseModule()" style="background:none; border:none; color:#666; font-size:11px; margin-top:15px; cursor:pointer;">← BACK TO LIST</button>
            </div>
        </div>`;
}

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
    setTimeout(() => window.location.reload(), 500); // Reload for Firebase Initialization
}

window.deleteFirebase = function(index) {
    if(confirm("DELETE THIS CONFIG?")) {
        firebaseList.splice(index, 1);
        if(activeIndex == index) activeIndex = null;
        localStorage.setItem('fb_projects', JSON.stringify(firebaseList));
        localStorage.setItem('fb_active_index', activeIndex);
        renderFirebaseModule();
    }
}

window.editFirebase = function(index) { showAddFirebaseForm(index); }

// ==========================================
// 2. WARNING NOTE MODULE
// ==========================================
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">SYSTEM WARNING OVERRIDE</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <input type="text" id="warnText" class="fb-input" placeholder="ENTER LIVE ALERT...">
                <div style="display:flex; gap:10px;">
                    <input type="number" id="warnSpeed" class="fb-input" placeholder="SPEED (0-10)" style="flex:1; color:#00ffcc; font-weight:bold;">
                    <select id="warnStatus" class="fb-input" style="flex:1;">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                <button id="saveWarnBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900;">PUSH UPDATE</button>
            </div>
        </div>`;
    document.getElementById('saveWarnBtn').onclick = updateWarning;
}

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

// ==========================================
// 3. GIVEAWAY WINNER MODULE
// ==========================================
function renderGiveawayModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">GIVEAWAY BROADCAST</h2>
            <div style="display:flex; flex-direction:column; gap:20px;">
                <textarea id="giveContent" class="fb-input" placeholder="WINNER DETAILS..." style="height:100px; resize:none;"></textarea>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="giveSpeed" class="fb-input" placeholder="SPEED" style="flex:1; color:#00ffcc; font-weight:bold;">
                    <select id="giveStatus" class="fb-input" style="flex:1;">
                        <option value="true">VISIBLE</option>
                        <option value="false">HIDDEN</option>
                    </select>
                </div>
                <button id="saveGiveBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900;">ACTIVATE BROADCAST</button>
            </div>
        </div>`;
    document.getElementById('saveGiveBtn').onclick = updateGiveaway;
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

// ==========================================
// 4. SIGNALS MODULE (NEW)
// ==========================================
function renderSignalsModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">POST TRADING SIGNAL</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <input type="text" id="sigAsset" class="fb-input" placeholder="ASSET (e.g. EUR/USD OTC)">
                <div style="display:flex; gap:10px;">
                    <select id="sigDirection" class="fb-input" style="flex:1;">
                        <option value="CALL">CALL (UP)</option>
                        <option value="PUT">PUT (DOWN)</option>
                    </select>
                    <input type="text" id="sigTime" class="fb-input" placeholder="TIME (e.g. 15:30)" style="flex:1;">
                </div>
                <select id="sigPlatform" class="fb-input">
                    <option value="QUOTEX">QUOTEX</option>
                    <option value="TOXA">TOXA</option>
                </select>
                <button id="postSignalBtn" class="join-btn" style="width:100%; padding:18px; background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900;">POST SIGNAL NOW</button>
            </div>
        </div>`;
    document.getElementById('postSignalBtn').onclick = postSignal;
}

async function postSignal() {
    const btn = document.getElementById('postSignalBtn');
    btn.innerText = "POSTING...";
    try {
        await addDoc(collection(db, "signals"), {
            asset: document.getElementById('sigAsset').value,
            direction: document.getElementById('sigDirection').value,
            time: document.getElementById('sigTime').value,
            platform: document.getElementById('sigPlatform').value,
            timestamp: serverTimestamp()
        });
        alert("SIGNAL POSTED SUCCESSFULLY!");
    } catch (e) { alert("FAILED: " + e.message); }
    btn.innerText = "POST SIGNAL NOW";
}

// --- INITIAL LOAD ---
window.onload = () => {
    const lastModule = localStorage.getItem('activeModule') || 'Firebase';
    loadContent(lastModule);
};
