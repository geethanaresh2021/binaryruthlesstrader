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
        <h1 style="text-shadow: 0 0 20px var(--red); color: var(--red); text-transform: uppercase; font-family:'Orbitron'; letter-spacing:3px;">${moduleName}</h1>
        <p style="color: #555; font-family: 'Roboto Mono'; font-size: 10px; letter-spacing: 2px; font-weight:bold;">SYSTEM // RUTHLESS // TERMINAL</p>
    `;

    // Sidebar Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // --- 16 MODULES STYLISH ROUTING ---
    switch (moduleName) {
        case 'Views': renderAnalytics('TOTAL VISITS', '1,284', '#00ffcc'); break;
        case 'Revenue': renderAnalytics('MONTHLY REVENUE', '₹ 42,500', '#ff0033'); break;
        case 'ST Resize': renderStylishInput(moduleName, 'layout', 'FIXED WIDTH (e.g. 1280px)', 'text'); break;
        case 'Tools Manager': renderStylishInput(moduleName, 'tools', 'TOOL STATUS (ACTIVE/OFF)', 'text'); break;
        case 'Signal Connection': renderStylishInput(moduleName, 'sig_config', 'API ENDPOINT URL', 'text'); break;
        case 'Ads Network Verify': renderStylishInput(moduleName, 'ads_verify', 'VERIFICATION CODE', 'text'); break;
        case 'Ads Containers': renderLargeInput(moduleName, 'ads_code', 'PASTE AD SCRIPT CODE HERE...'); break;
        case 'Social Media': renderStylishInput(moduleName, 'social', 'TELEGRAM LINK', 'url'); break;
        case 'Brand Name': renderStylishInput(moduleName, 'branding', 'BRAND NAME (e.g. BINARY RUTHLESS)', 'text'); break;
        case 'Affiliate': renderStylishInput(moduleName, 'affiliate', 'REGISTRATION LINK', 'url'); break;
        case 'Warning Note': renderWarningModule(); break;
        case 'Join Section': renderStylishInput(moduleName, 'join', 'JOIN BUTTON URL', 'url'); break;
        case 'Giveaway Winner': renderGiveawayModule(); break;
        case 'Firebase': renderFirebaseModule(); break;
        case 'VPS': renderStylishInput(moduleName, 'vps', 'SERVER IP ADDRESS', 'text'); break;
        case 'Security': renderStylishInput(moduleName, 'security', 'FIREWALL KEY', 'password'); break;
        default:
            mainDisplay.innerHTML = `<div class="placeholder-card">[ ${moduleName.toUpperCase()} ENCRYPTED ]</div>`;
    }
}

// ==========================================
// STYLISH UI COMPONENTS
// ==========================================

// 1. Analytics Card (Views/Revenue)
function renderAnalytics(label, value, color) {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left: 4px solid ${color}; background:rgba(5,5,5,0.9); padding:30px; border-radius:4px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color:#444; font-size:11px; font-family:'Orbitron'; letter-spacing:2px; margin-bottom:15px;">${label}</h3>
            <div style="color:${color}; font-size:32px; font-family:'Roboto Mono'; font-weight:bold; text-shadow: 0 0 15px ${color};">${value}</div>
            <div style="width:100%; height:1px; background:#111; margin:20px 0;"></div>
            <p style="color:#222; font-size:9px;">REAL-TIME DATA SYNCED FROM CORE</p>
        </div>`;
}

// 2. Firebase Module (Stylish List)
function renderFirebaseModule() {
    let listHTML = firebaseList.map((proj, index) => {
        const active = String(activeIndex) === String(index);
        return `
        <div style="background:#000; border:1px solid ${active ? '#00ffcc' : '#111'}; padding:15px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; border-radius:2px;">
            <div>
                <div style="color:#fff; font-size:12px; font-family:'Orbitron'; font-weight:bold;">${proj.projectName}</div>
                <div style="font-size:9px; color:${active ? '#00ffcc' : '#ff4444'}; font-family:'Roboto Mono'; text-transform:uppercase;">${active ? '● ONLINE' : '○ OFFLINE'}</div>
            </div>
            <button onclick="editFirebase(${index})" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:8px 15px; cursor:pointer; font-family:'Orbitron'; font-size:10px; font-weight:bold; transition:0.3s;">MANAGE</button>
        </div>`;
    }).join('');

    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid var(--red); padding:20px; background:#050505;">
            <button onclick="showAddFirebaseForm()" style="width:100%; padding:18px; background:var(--red); color:#fff; border:none; font-family:'Orbitron'; font-weight:900; margin-bottom:25px; cursor:pointer; letter-spacing:1px; box-shadow: 0 0 15px rgba(255,0,51,0.3);">+ ADD NEW INSTANCE</button>
            <div id="fb-list">${listHTML || '<p style="color:#222; text-align:center; font-size:11px;">EMPTY REGISTRY</p>'}</div>
        </div>`;
}

// 3. Warning Module (Stylish Inputs)
function renderWarningModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid var(--red); padding:30px; background:#050505;">
            <h2 style="color:var(--red); font-size:14px; font-family:'Orbitron'; margin-bottom:25px;">WARNING OVERRIDE</h2>
            <input type="text" id="wTxt" class="fb-input" placeholder="ENTER SYSTEM MESSAGE...">
            <div style="display:flex; gap:15px; margin:20px 0;">
                <div style="flex:1;">
                    <label style="color:#333; font-size:9px; font-family:'Orbitron';">SPEED</label>
                    <input type="number" id="wSpd" class="fb-input" style="color:#00ffcc; font-weight:bold; font-size:18px;" placeholder="5">
                </div>
                <div style="flex:1;">
                    <label style="color:#333; font-size:9px; font-family:'Orbitron';">VISIBILITY</label>
                    <select id="wSts" class="fb-input"><option value="true">VISIBLE</option><option value="false">HIDDEN</option></select>
                </div>
            </div>
            <button id="btnWarn" class="join-btn" style="width:100%; padding:20px; background:var(--red); font-weight:900; letter-spacing:2px;">PUSH TO SERVER</button>
        </div>`;
    document.getElementById('btnWarn').onclick = () => syncTerminal('warning_note', {
        text: document.getElementById('wTxt').value,
        speed: parseInt(document.getElementById('wSpd').value) || 0,
        status: document.getElementById('wSts').value === "true"
    }, 'btnWarn');
}

// 4. Stylish Generic Input
function renderStylishInput(title, docId, placeholder, type) {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="border-left:4px solid var(--red); padding:30px; background:#050505;">
            <h2 style="color:var(--red); font-size:14px; font-family:'Orbitron'; margin-bottom:25px;">${title}</h2>
            <input type="${type}" id="univInp" class="fb-input" placeholder="${placeholder}" style="color:#00ffcc; font-weight:bold; font-size:16px;">
            <button id="btnSync" class="join-btn" style="width:100%; padding:20px; margin-top:25px; background:var(--red); font-weight:900;">SAVE CONFIGURATION</button>
        </div>`;
    document.getElementById('btnSync').onclick = () => syncTerminal(docId, { value: document.getElementById('univInp').value }, 'btnSync');
}

// ==========================================
// CORE SYNC & FIREBASE LOGIC
// ==========================================
async function syncTerminal(docId, data, btnId) {
    const btn = document.getElementById(btnId);
    const oldText = btn.innerText;
    btn.innerText = "SYNCING...";
    try {
        await setDoc(doc(db, "site_settings", docId), { ...data, timestamp: serverTimestamp() });
        alert("RUTHLESS TERMINAL: DATA SYNCED");
    } catch (e) { alert("SYNC ERROR: " + e.message); }
    btn.innerText = oldText;
}

// --- FIREBASE MANAGEMENT ---
window.showAddFirebaseForm = (index = null) => {
    const isEdit = index !== null;
    const data = isEdit ? firebaseList[index] : {projectName:'', apiKey:'', projectId:'', appId:''};
    document.getElementById('mainDisplay').innerHTML = `
        <div class="fb-card" style="padding:30px; background:#0a0a0a; border:1px solid #111;">
            <h2 style="color:var(--red); font-size:14px; font-family:'Orbitron'; margin-bottom:25px;">${isEdit ? 'EDIT' : 'NEW'} CONFIG</h2>
            <input type="text" id="fbName" class="fb-input" placeholder="PROJECT NAME" value="${data.projectName}" style="margin-bottom:15px;">
            <input type="text" id="fbKey" class="fb-input" placeholder="API KEY" value="${data.apiKey}" style="margin-bottom:15px;">
            <input type="text" id="fbId" class="fb-input" placeholder="PROJECT ID" value="${data.projectId}" style="margin-bottom:15px;">
            <input type="text" id="fbApp" class="fb-input" placeholder="APP ID" value="${data.appId}" style="margin-bottom:25px;">
            <button onclick="saveFirebase(${index})" style="width:100%; background:#00ffcc; color:#000; padding:18px; font-weight:bold; font-family:'Orbitron'; border:none; cursor:pointer;">SAVE TO LOCAL</button>
            ${isEdit ? `<button onclick="connectFirebase(${index})" style="width:100%; margin-top:10px; background:var(--red); color:#fff; padding:18px; font-weight:bold; font-family:'Orbitron'; border:none; cursor:pointer;">CONNECT & RELOAD</button>` : ''}
            <button onclick="renderFirebaseModule()" style="width:100%; margin-top:10px; background:none; color:#444; border:none; cursor:pointer; font-size:10px;">← BACK TO REGISTRY</button>
        </div>`;
}

window.saveFirebase = (index) => {
    const d = { projectName: document.getElementById('fbName').value, apiKey: document.getElementById('fbKey').value, projectId: document.getElementById('fbId').value, appId: document.getElementById('fbApp').value };
    if(index === null) firebaseList.push(d); else firebaseList[index] = d;
    localStorage.setItem('fb_projects', JSON.stringify(firebaseList));
    renderFirebaseModule();
}

window.connectFirebase = (index) => {
    activeIndex = index; localStorage.setItem('fb_active_index', index);
    alert("SYSTEM CONNECTED"); location.reload();
}

window.editFirebase = (index) => showAddFirebaseForm(index);

// --- INITIAL LOAD ---
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Views');
