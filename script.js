import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let firebaseList = JSON.parse(localStorage.getItem('fb_projects') || '[]');
let activeIndex = localStorage.getItem('fb_active_index');

// --- MAIN LOADER (ROUTING) ---
window.loadContent = function(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    const mainDisplay = document.getElementById('mainDisplay');
    
    // Header UI Update
    document.getElementById('panelHeader').innerHTML = `
        <h1 style="text-shadow: 0 0 15px var(--red); color: var(--red); text-transform: uppercase; font-family:'Orbitron';">${moduleName}</h1>
        <p style="color: #444; font-family: 'Roboto Mono'; font-size: 10px; letter-spacing: 2px;">BINARY RUTHLESS // TERMINAL // ONLINE</p>
    `;

    // Sidebar Active Class toggle
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // --- SWITCH CASE FOR ALL 16 BUTTONS ---
    switch (moduleName) {
        case 'Views': renderViews(); break;
        case 'Revenue': renderRevenue(); break;
        case 'ST Resize': renderSimpleInput(moduleName, 'layout_settings', 'Enter Resize Value (e.g. 1080px)'); break;
        case 'Tools Manager': renderSimpleInput(moduleName, 'tools', 'Tool Status (Active/Inactive)'); break;
        case 'Signal Connection': renderSignalConfig(); break;
        case 'Ads Network Verify': renderSimpleInput(moduleName, 'ads_verify', 'Verification Code'); break;
        case 'Ads Containers': renderAdsConfig(); break;
        case 'Social Media': renderSimpleInput(moduleName, 'social', 'Telegram/Instagram Link'); break;
        case 'Brand Name': renderSimpleInput(moduleName, 'branding', 'Enter Brand Display Name'); break;
        case 'Affiliate': renderSimpleInput(moduleName, 'affiliate', 'Affiliate Link'); break;
        case 'Warning Note': renderWarningNote(); break;
        case 'Join': renderSimpleInput(moduleName, 'join_settings', 'Join Button Link'); break;
        case 'Giveaway Winner': renderGiveawayWinner(); break;
        case 'Firebase': renderFirebase(); break;
        case 'VPS': renderSimpleInput(moduleName, 'vps_config', 'VPS IP Address'); break;
        case 'Security': renderSimpleInput(moduleName, 'security', 'Firewall Status'); break;
        default:
            mainDisplay.innerHTML = `<div class="placeholder-card">[ ${moduleName.toUpperCase()} LOCKED ]</div>`;
    }
}

// ==========================================
// 1. ANALYTICS MODULES
// ==========================================
function renderViews() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid var(--red); background:#050505; padding:20px;">
            <h2 style="color:var(--red); font-size:12px; font-family:'Orbitron';">LIVE TRAFFIC</h2>
            <div style="color:#00ffcc; font-size:42px; font-family:'Roboto Mono'; font-weight:bold; text-shadow: 0 0 15px #00ffcc; margin:15px 0;">1,284</div>
            <p style="color:#333; font-size:9px; letter-spacing:1px;">TOTAL REAL-TIME SESSIONS DETECTED</p>
        </div>`;
}

function renderRevenue() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid #00ffcc; background:#050505; padding:20px;">
            <h2 style="color:#00ffcc; font-size:12px; font-family:'Orbitron';">ESTIMATED REVENUE</h2>
            <div style="color:#fff; font-size:42px; font-family:'Roboto Mono'; font-weight:bold; margin:15px 0;">₹ 42,500</div>
            <p style="color:#333; font-size:9px; letter-spacing:1px;">MONTHLY PROJECTED EARNINGS (INR)</p>
        </div>`;
}

// ==========================================
// 2. CORE CONFIGURATION MODULES
// ==========================================
function renderFirebase() {
    let listHTML = firebaseList.map((proj, index) => {
        const isConnected = String(activeIndex) === String(index);
        return `
        <div style="background:#000; border:1px solid ${isConnected ? '#00ffcc' : '#111'}; padding:15px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="color:#fff; font-size:12px; font-family:'Orbitron';">${proj.projectName}</div>
                <div style="font-size:9px; color:${isConnected ? '#00ffcc' : '#ff4444'}; font-weight:bold;">${isConnected ? '● CONNECTED' : '○ DISCONNECTED'}</div>
            </div>
            <button onclick="editFirebase(${index})" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:5px 12px; cursor:pointer; font-family:'Orbitron'; font-size:10px;">MANAGE</button>
        </div>`;
    }).join('');

    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="background:#050505; border-left: 4px solid var(--red); padding:20px;">
            <button onclick="showAddFirebaseForm()" style="width:100%; padding:15px; background:var(--red); color:#fff; border:none; font-family:'Orbitron'; font-weight:900; margin-bottom:20px; cursor:pointer;">+ ADD NEW FIREBASE</button>
            <div id="fb-list-container">${listHTML || '<p style="color:#222; text-align:center;">NO PROJECTS ADDED</p>'}</div>
        </div>`;
}

function renderWarningNote() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">WARNING OVERRIDE</h2>
            <input type="text" id="wTxt" class="fb-input" placeholder="ALERT TEXT...">
            <div style="display:flex; gap:10px; margin:15px 0;">
                <input type="number" id="wSpd" class="fb-input" placeholder="SPEED" style="flex:1; color:#00ffcc; font-weight:bold;">
                <select id="wSts" class="fb-input" style="flex:1;"><option value="true">VISIBLE</option><option value="false">HIDDEN</option></select>
            </div>
            <button id="btnWarn" class="join-btn" style="width:100%; padding:18px; background:var(--red); font-weight:900;">PUSH LIVE UPDATE</button>
        </div>`;
    document.getElementById('btnWarn').onclick = () => syncData('warning_note', {
        text: document.getElementById('wTxt').value,
        speed: parseInt(document.getElementById('wSpd').value) || 0,
        status: document.getElementById('wSts').value === "true"
    }, 'btnWarn');
}

function renderGiveawayWinner() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">GIVEAWAY BROADCAST</h2>
            <textarea id="gCont" class="fb-input" style="height:80px; margin-bottom:15px;" placeholder="WINNER DETAILS..."></textarea>
            <button id="btnGive" class="join-btn" style="width:100%; padding:18px; background:var(--red); font-weight:900;">ACTIVATE BROADCAST</button>
        </div>`;
    document.getElementById('btnGive').onclick = () => syncData('giveaway', {
        content: document.getElementById('gCont').value,
        status: true
    }, 'btnGive');
}

// ==========================================
// 3. UTILITY RENDERING (FOR REMAINING BUTTONS)
// ==========================================
function renderSimpleInput(title, docId, placeholder) {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid var(--red); background:#050505; padding:25px;">
            <h2 style="color:var(--red); font-family:'Orbitron'; font-size:14px; margin-bottom:20px;">${title.toUpperCase()} CONFIG</h2>
            <input type="text" id="univInput" class="fb-input" placeholder="${placeholder}" style="width:100%; margin-bottom:20px;">
            <button id="btnUniv" class="join-btn" style="width:100%; padding:18px; background:var(--red); font-weight:900;">SAVE SETTINGS</button>
        </div>`;
    document.getElementById('btnUniv').onclick = () => syncData(docId, { value: document.getElementById('univInput').value }, 'btnUniv');
}

function renderAdsConfig() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid var(--red); padding:25px;">
            <h2 style="color:var(--red); font-size:14px; margin-bottom:20px;">AD CONTAINERS</h2>
            <textarea id="adCode" class="fb-input" style="height:100px; margin-bottom:15px;" placeholder="PASTE AD SCRIPT..."></textarea>
            <button id="btnAds" class="join-btn" style="width:100%; padding:18px; background:var(--red);">PUSH ADS</button>
        </div>`;
    document.getElementById('btnAds').onclick = () => syncData('ads', { script: document.getElementById('adCode').value }, 'btnAds');
}

function renderSignalConfig() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="padding:25px;">
            <h2 style="color:var(--red); font-size:14px; margin-bottom:20px;">SIGNAL API</h2>
            <input type="text" id="sigKey" class="fb-input" placeholder="API ENDPOINT URL">
            <button id="btnSig" class="join-btn" style="width:100%; margin-top:15px; background:var(--red);">CONNECT SIGNAL</button>
        </div>`;
}

// ==========================================
// 4. FIREBASE LOGIC (SAVE/EDIT/CONNECT)
// ==========================================
window.showAddFirebaseForm = (index = null) => {
    const isEdit = index !== null;
    const data = isEdit ? firebaseList[index] : {projectName:'', apiKey:'', projectId:'', appId:''};
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="padding:25px; background:#0a0a0a; border:1px solid #111;">
            <h2 style="color:var(--red); font-size:14px; margin-bottom:20px;">${isEdit ? 'EDIT' : 'NEW'} FIREBASE INSTANCE</h2>
            <input type="text" id="fbName" class="fb-input" placeholder="PROJECT NAME" value="${data.projectName}" style="width:100%; margin-bottom:10px;">
            <input type="text" id="fbKey" class="fb-input" placeholder="API KEY" value="${data.apiKey}" style="width:100%; margin-bottom:10px;">
            <input type="text" id="fbId" class="fb-input" placeholder="PROJECT ID" value="${data.projectId}" style="width:100%; margin-bottom:10px;">
            <input type="text" id="fbApp" class="fb-input" placeholder="APP ID" value="${data.appId}" style="width:100%; margin-bottom:20px;">
            <button onclick="saveFirebase(${index})" style="width:100%; background:#00ffcc; color:#000; padding:18px; font-weight:900; border:none; cursor:pointer;">SAVE CONFIG</button>
            ${isEdit ? `<button onclick="connectFirebase(${index})" style="width:100%; margin-top:10px; background:var(--red); color:#fff; padding:18px; font-weight:900; border:none; cursor:pointer;">ACTIVATE & CONNECT</button>` : ''}
            <button onclick="renderFirebase()" style="width:100%; margin-top:10px; background:none; color:#444; border:none; cursor:pointer; font-size:11px;">← CANCEL</button>
        </div>`;
}

window.saveFirebase = (index) => {
    const d = { projectName: document.getElementById('fbName').value, apiKey: document.getElementById('fbKey').value, projectId: document.getElementById('fbId').value, appId: document.getElementById('fbApp').value };
    if(index === null) firebaseList.push(d); else firebaseList[index] = d;
    localStorage.setItem('fb_projects', JSON.stringify(firebaseList));
    renderFirebase();
}

window.connectFirebase = (index) => {
    activeIndex = index; localStorage.setItem('fb_active_index', index);
    alert("DATABASE CONNECTED!"); location.reload();
}

window.editFirebase = (index) => showAddFirebaseForm(index);

// ==========================================
// 5. UNIVERSAL SYNC TOOL
// ==========================================
async function syncData(docId, data, btnId) {
    const btn = document.getElementById(btnId);
    const original = btn.innerText;
    btn.innerText = "SYNCING...";
    try {
        await setDoc(doc(db, "site_settings", docId), { ...data, timestamp: serverTimestamp() });
        alert("TERMINAL SYNC SUCCESSFUL!");
    } catch (e) { alert("SYNC FAILED: " + e.message); }
    btn.innerText = original;
}

// --- INITIAL LOAD ---
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Views');
