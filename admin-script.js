// --- GLOBAL STORAGE & INITIALIZATION ---
let activeModule = localStorage.getItem('activeModule') || 'Views';

// Page load avvagane last open chesina module ni chupistundi
window.onload = () => {
    loadContent(activeModule);
};

// --- CORE NAVIGATION LOGIC ---
function loadContent(moduleName) {
    if (!moduleName) return;

    // 1. Save to LocalStorage (Persistence for Refresh)
    localStorage.setItem('activeModule', moduleName);
    activeModule = moduleName;

    // 2. Update Sidebar UI (Active State)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const btnText = btn.innerText.trim();
        if (btnText === moduleName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 3. Update Panel Header
    const panelHeader = document.getElementById('panelHeader');
    if (panelHeader) {
        panelHeader.innerHTML = `<h1>${moduleName}</h1><p>MANAGING ${moduleName.toUpperCase()} MODULE SETTINGS.</p>`;
    }

    const mainDisplay = document.getElementById('mainDisplay');
    if (!mainDisplay) return;

    // 4. Module Switching Logic
    switch (moduleName) {
        case 'Views':
            renderViewsModule();
            if(window.listenToLiveStats) window.listenToLiveStats();
            break;

        case 'Revenue':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Estimated Revenue (INR)</label>
                    <h1 style="color:#00ffcc; font-size:40px; font-family:'Roboto Mono'; font-weight:bold; text-shadow: 0 0 10px #00ffcc66;">₹ 15,240.00</h1>
                    <button class="action-btn" style="margin-top:20px;" onclick="saveLogic()">SYNC WITH ADS</button>
                </div>`;
            break;

        case 'Tools Manager':
    mainDisplay.innerHTML = `
        <div class="module-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #1a1a1a; pb:15px;">
                <h2 style="color:var(--red); font-family:'Orbitron'; font-size:16px;">TOOLS INVENTORY</h2>
                <button class="action-btn" onclick="window.openToolEditor('new')" style="width:auto; padding:8px 20px; font-size:12px; background:#00ffcc; color:#000;">
                    <i class="fas fa-plus"></i> ADD NEW TOOL
                </button>
            </div>

            <div id="toolsListContainer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom:25px;">
                <p style="color:#444; font-size:12px;">Loading tools...</p>
            </div>

            <div id="toolEditorPanel" style="display:none; border: 1px solid #222; padding: 25px; background: #050505; border-radius: 8px; box-shadow: 0 10px-40px rgba(0,0,0,0.8);">
                <h3 id="toolEditorTitle" style="color:var(--red); font-family:'Orbitron'; font-size:16px; margin-bottom:20px; text-align:center;">ADD NEW TOOL</h3>
                <input type="hidden" id="targetToolId">

                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <button id="toolBtnVisible" onclick="window.setToolVisibility(true)" class="action-btn" style="flex:1;">VISIBLE</button>
                    <button id="toolBtnHidden" onclick="window.setToolVisibility(false)" class="action-btn" style="flex:1;">HIDE</button>
                </div>

                <label class="input-label">TOOL NAME (DISPLAYED IN DROPDOWN)</label>
                <input type="text" id="toolName" class="input-box" placeholder="e.g. Money Management Calculator">

                <label class="input-label">TOOL CODE (HTML / CSS / JS)</label>
                <textarea id="toolCode" class="input-box" rows="12" style="color:#00ffcc; font-family:'Roboto Mono'; font-size:11px;" placeholder="Paste your trading tool HTML code here..."></textarea>

                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="action-btn" onclick="document.getElementById('toolEditorPanel').style.display='none'" style="flex:1; background:#111;">CANCEL</button>
                    <button class="publish-btn" onclick="window.saveToolSettings()" style="flex:2; background:var(--red);">SAVE & DEPLOY TOOL</button>
                </div>
            </div>
        </div>`;
    
    // Switch case load avvagane tools list ni refresh chestundi
    window.loadToolsList();
    break;

        case 'Signal Connection':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Signal Source URL</label>
                    <input type="text" id="sigUrl" class="input-box" placeholder="https://api.signals.com">
                    <label class="input-label">Platform</label>
                    <input type="text" id="sigPlat" class="input-box" value="QUOTEX">
                    <button class="action-btn" onclick="saveSignalConn()">CONNECT LIVE</button>
                </div>`;
            break;

        case 'Ads Containers':
            // 8 Containers List Generation
            let adsListHtml = '';
            for (let i = 1; i <= 8; i++) {
                adsListHtml += `
                    <button class="nav-btn" style="width:100%; margin-bottom:8px; justify-content: space-between; border:1px solid #1a1a1a;" onclick="window.openAdEditor('adSlot${i}', 'AD CONTAINER ${i}')">
                        <span><i class="fas fa-box-open" style="color:var(--red);"></i> &nbsp; AD CONTAINER ${i}</span>
                        <i class="fas fa-chevron-right" style="font-size:12px; opacity:0.5;"></i>
                    </button>`;
            }

            mainDisplay.innerHTML = `
                <div class="module-card">
                    <div id="adsListGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px;">
                        ${adsListHtml}
                    </div>

                    <div id="adEditorPanel" style="display:none; border: 1px solid #222; padding: 20px; background: #050505; border-radius: 8px;">
                        <h3 id="editingAdTitle" style="color:var(--red); font-family:'Orbitron'; font-size:16px; margin-bottom:20px; text-align:center;"></h3>
                        <input type="hidden" id="targetAdId">

                        <div style="display:flex; gap:10px; margin-bottom:25px;">
                            <button id="btnVisible" onclick="window.setAdVisibility(true)" class="action-btn" style="flex:1; font-weight:bold;">VISIBLE</button>
                            <button id="btnHidden" onclick="window.setAdVisibility(false)" class="action-btn" style="flex:1; font-weight:bold;">HIDE</button>
                        </div>

                        <div id="manageSection">
                            <label class="input-label">AD NAME (INTERNAL)</label>
                            <input type="text" id="adNickname" class="input-box" placeholder="e.g. Header Banner">

                            <label class="input-label">AD SNIPPET (PASTE SCRIPT CODE)</label>
                            <textarea id="adSnippet" class="input-box" rows="6" style="color:#00ffcc; font-family:'Roboto Mono'; font-size:12px;" placeholder="Paste Adsterra/Google script here..."></textarea>

                            <label class="input-label">CHOOSE SIZE</label>
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom:20px;">
                                <button class="action-btn" style="font-size:11px;" onclick="window.setPresetSize('320px','50px')">320x50</button>
                                <button class="action-btn" style="font-size:11px;" onclick="window.setPresetSize('320px','100px')">320x100</button>
                                <button class="action-btn" style="font-size:11px;" onclick="window.enableCustomSize()">CUSTOM</button>
                            </div>

                            <div id="customSizeInputs" style="display:none; gap:10px; margin-bottom:20px;">
                                <input type="text" id="customWidth" class="input-box" placeholder="Width">
                                <input type="text" id="customHeight" class="input-box" placeholder="Height">
                            </div>

                            <button class="publish-btn" onclick="window.saveAdSettings()" style="width:100%; padding:18px; background:var(--red); font-family:'Orbitron'; font-weight:900; box-shadow: 0 0 20px rgba(255,0,0,0.2);">SAVE & RUN ADS</button>
                        </div>
                    </div>
                </div>`;
            break;

        case 'Social Media':
            renderSocialMediaModule();
            break;

        case 'Brand Name':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Header Title</label>
                    <input type="text" id="brandTitle" class="input-box" value="BINARY RUTHLESS TRADER">
                    <button class="action-btn" onclick="saveBrandName()">UPDATE BRAND</button>
                </div>`;
            break;

        case 'Warning Note':
            renderWarningNoteModule();
            break;

        case 'Giveaway Winner':
            syncAdminDataFromCloud(); 
            break;

        case 'Firebase':
            renderFirebaseModule();
            break;

        case 'Security':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Admin Access Key</label>
                    <input type="password" class="input-box" placeholder="Enter New Key">
                    <button class="action-btn" onclick="saveLogic()">UPDATE SECURITY</button>
                </div>`;
            break;
    }
}
// --- 1. FIREBASE MODULE RENDERING ---
async function syncAdminDataFromCloud() {
    if (typeof db === 'undefined') return;

    // Database nundi giveaway data okkasari techi UI refresh chestham
    const snap = await db.ref('site_settings/giveaway').once('value');
    if (snap.exists() && activeModule === 'Giveaway Winner') {
        renderGiveawayModule(snap.val());
    }
}


function renderFirebaseModule() {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const activeConfigId = localStorage.getItem('activeFirebaseId');
    const mainDisplay = document.getElementById('mainDisplay');

    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:15px; letter-spacing:1px;">FIREBASE SETUP</h2>
            <div id="firebaseInputs" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:10px;">
                <input type="text" id="apiKey" class="input-box" placeholder="API Key">
                <input type="text" id="authDomain" class="input-box" placeholder="Auth Domain">
                <input type="text" id="databaseURL" class="input-box" placeholder="Database URL">
                <input type="text" id="projectId" class="input-box" placeholder="Project ID">
                <input type="text" id="storageBucket" class="input-box" placeholder="Storage Bucket">
                <input type="text" id="messagingSenderId" class="input-box" placeholder="Messaging Sender ID">
                <input type="text" id="appId" class="input-box" placeholder="App ID">
                <input type="text" id="measurementId" class="input-box" placeholder="Measurement ID">
            </div>
            
            <button class="action-btn" id="saveDbBtn" onclick="validateAndSaveFirebase()" style="margin-top:10px;">SAVE DATABASE</button>

            <div style="margin-top:20px; padding:15px; background:#0a0a0a; border:1px solid #1a1a1a; border-radius:4px;">
                <label class="input-label">CONNECTION STATUS</label>
                <div id="connectionStatus" style="font-family:'Roboto Mono'; font-size:14px; font-weight:bold; display:flex; align-items:center; gap:10px; color:${activeConfigId ? '#00ffcc' : '#ff0000'};">
                    <span style="height:10px; width:10px; border-radius:50%; background:${activeConfigId ? '#00ffcc' : '#ff0000'}; box-shadow: 0 0 10px ${activeConfigId ? '#00ffcc' : '#ff0000'};"></span>
                    ${activeConfigId ? 'CONNECTED: ' + activeConfigId : 'NOT CONNECTED'}
                </div>
            </div>

            <hr style="border:0.5px solid #1a1a1a; margin:25px 0;">
            <h2 style="font-size:12px; color:#fff; margin-bottom:15px;">SAVED DATABASES</h2>
            <div id="configList" style="display:flex; flex-direction:column; gap:12px;">
                ${configs.length === 0 ? '<p style="color:#444; font-size:11px;">No databases saved yet.</p>' : ''}
                ${configs.map(cfg => `
                    <div style="background:#080808; padding:15px; border:1px solid #1a1a1a; border-left: 4px solid ${activeConfigId === cfg.projectId ? '#00ffcc' : '#333'};">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-family:'Roboto Mono'; font-size:13px; color:#eee;">${cfg.projectId}</div>
                                <div style="font-size:10px; color:#555;">${cfg.databaseURL}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button onclick="activateFirebase('${cfg.projectId}')" style="background:#111; color:#00ffcc; border:1px solid #00ffcc; padding:6px 12px; font-size:10px; cursor:pointer; border-radius:3px;">CONNECT</button>
                                <button onclick="showManageOptions('${cfg.projectId}')" style="background:#111; color:#fff; border:1px solid #444; padding:6px 12px; font-size:10px; cursor:pointer; border-radius:3px;">MANAGE</button>
                            </div>
                        </div>
                        <div id="manage-${cfg.projectId}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px dashed #222; gap:10px;">
                            <button onclick="editFirebase('${cfg.projectId}')" style="flex:1; background:transparent; color:#ffaa00; border:1px solid #ffaa00; padding:8px; font-size:10px; cursor:pointer;">EDIT DETAILS</button>
                            <button onclick="deleteFirebase('${cfg.projectId}')" style="flex:1; background:transparent; color:#ff0000; border:1px solid #ff0000; padding:8px; font-size:10px; cursor:pointer;">DELETE</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// --- 2. VALIDATION & SAVING ---
function validateAndSaveFirebase() {
    const fields = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];
    const config = {};
    let isComplete = true;

    fields.forEach(f => {
        config[f] = document.getElementById(f).value.trim();
        if (!config[f]) isComplete = false;
    });

    if (!isComplete) {
        Swal.fire({ icon: 'error', title: 'INVALID DETAILS', text: 'Please enter all correct details!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
        return;
    }

    // Save to list
    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    configs = configs.filter(c => c.projectId !== config.projectId);
    configs.push(config);
    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
    
    // Auto Connect after save
    activateFirebase(config.projectId);
}

// --- 3. CONNECTION LOGIC (PERSISTENT) ---
// Global variable to hold database instance
let db; 

function activateFirebase(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const target = configs.find(c => c.projectId === pid);

    if (target) {
        // 1. Initialize Firebase for this session
        if (!firebase.apps.length) {
            firebase.initializeApp(target);
        } else {
            // Delete old app and re-init if switching databases
            firebase.app().delete().then(() => {
                firebase.initializeApp(target);
            });
        }
        
        // 2. Assign to global 'db' variable
        db = firebase.database();

        // 3. Save to LocalStorage for Persistence
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));
        
        Swal.fire({ 
            icon: 'success', 
            title: 'CONNECTED', 
            text: `System linked to: ${pid}`, 
            background: '#0a0a0a', 
            color: '#fff', 
            confirmButtonColor: '#00ffcc' 
        });
        
        renderFirebaseModule();
    }
}


// --- 4. MANAGE OPTIONS (EDIT/DELETE) ---
function showManageOptions(pid) {
    const div = document.getElementById(`manage-${pid}`);
    div.style.display = (div.style.display === 'none' || div.style.display === '') ? 'flex' : 'none';
}

function editFirebase(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const cfg = configs.find(c => c.projectId === pid);
    if (cfg) {
        document.getElementById('apiKey').value = cfg.apiKey;
        document.getElementById('authDomain').value = cfg.authDomain;
        document.getElementById('databaseURL').value = cfg.databaseURL;
        document.getElementById('projectId').value = cfg.projectId;
        document.getElementById('storageBucket').value = cfg.storageBucket;
        document.getElementById('messagingSenderId').value = cfg.messagingSenderId;
        document.getElementById('appId').value = cfg.appId;
        document.getElementById('measurementId').value = cfg.measurementId;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Swal.fire({ toast: true, position: 'top-end', title: 'Details loaded for edit', background: '#111', color: '#fff', showConfirmButton: false, timer: 2000 });
    }
}

function deleteFirebase(pid) {
    Swal.fire({
        title: 'DELETE DATABASE?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff0000',
        cancelButtonColor: '#333',
        background: '#050505', 
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
            configs = configs.filter(c => c.projectId !== pid);
            localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
            
            if (localStorage.getItem('activeFirebaseId') === pid) {
                localStorage.removeItem('activeFirebaseId');
                localStorage.removeItem('firebaseConfig');
            }
            renderFirebaseModule();
        }
    });
}

function renderGiveawayModule(cloudData = null) {
    // Local storage badulu direct ga cloud data ni vaadutham
    const data = cloudData || { winner: "@User_Name", speed: 2 }; 

    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <div id="giveawayPreview" style="background:#0a0a0a; border:1px solid var(--red); height:50px; display:flex; align-items:center; overflow:hidden; position:relative; margin-bottom:20px;">
                <div style="background:var(--red); color:#fff; padding:0 10px; z-index:2; height:100%; display:flex; align-items:center; font-size:10px; font-weight:bold;">GIVEAWAY</div>
                <div id="previewContent" style="width:100%; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold;">
                    ${data.speed === 0 ? `<center>${data.winner}</center>` : `<marquee scrollamount="${data.speed}">${data.winner}</marquee>`}
                </div>
            </div>
            <label class="input-label">Winner Text</label>
            <input type="text" id="winnerName" class="input-box" value="${data.winner}" oninput="updateGiveawayPreview()">
            <label class="input-label">Speed (0=Static, 1-5=Scroll)</label>
            <input type="number" id="selectedSpeed" class="input-box" min="0" max="5" value="${data.speed}" oninput="updateGiveawayPreview()">
            <button class="action-btn" onclick="saveGiveawayToCloud()">PUBLISH GIVEAWAY</button>
        </div>`;
}

function renderWarningNoteModule() {
    // Firebase nundi current settings techukoni default ga chupistundi
    const savedNote = JSON.parse(localStorage.getItem('warning_data') || '{"text":"Warning: Trading is Risk", "color":"#ff0000", "speed":2}');

    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px;">WARNING NOTE MANAGEMENT</h2>
            
            <div id="notePreviewBox" style="background:#0a0a0a; border:1px solid #222; height:50px; display:flex; align-items:center; overflow:hidden; position:relative; margin-bottom:20px;">
                <div id="notePreviewContent" style="width:100%; color:${savedNote.color}; font-family:'Roboto Mono'; font-weight:bold; font-size:12px;">
                    ${savedNote.speed == 0 ? `<center>${savedNote.text}</center>` : `<marquee scrollamount="${savedNote.speed}">${savedNote.text}</marquee>`}
                </div>
            </div>

            <label class="input-label">Warning Text</label>
            <textarea id="noteText" class="input-box" rows="2" oninput="updateNotePreview()">${savedNote.text}</textarea>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:10px;">
                <div>
                    <label class="input-label">Text Color</label>
                    <input type="color" id="noteColor" class="input-box" value="${savedNote.color}" style="height:45px; padding:5px;" oninput="updateNotePreview()">
                </div>
                <div>
                    <label class="input-label">Scroll Speed (0-5)</label>
                    <input type="number" id="noteSpeed" class="input-box" min="0" max="5" value="${savedNote.speed}" oninput="updateNotePreview()">
                </div>
            </div>

            <button class="action-btn" style="margin-top:20px;" onclick="publishWarningToCloud()">PUBLISH NOTE</button>
        </div>`;
}

function publishWarningToCloud() {
    // 1. Get values from UI
    const textVal = document.getElementById('noteText').value;
    const colorVal = document.getElementById('noteColor').value;
    const speedVal = document.getElementById('noteSpeed').value;

    const data = {
        text: textVal,
        color: colorVal,
        speed: parseInt(speedVal)
    };

    console.log("Publishing Data:", data); // Check in F12 Console

    if (typeof db !== 'undefined') {
        // Path should be EXACT: site_settings/warning_note
        db.ref('site_settings/warning_note').set(data)
        .then(() => {
            console.log("Cloud Save Success!");
            localStorage.setItem('warning_data', JSON.stringify(data));
            
            // SWAL Success Popup
            Swal.fire({ 
                icon: 'success', 
                title: 'LIVE NOW', 
                text: 'Warning Note updated successfully!', 
                background: '#0a0a0a', 
                color: '#fff', 
                confirmButtonColor: '#ff0000' 
            });
        })
        .catch(err => {
            console.error("Firebase Set Error:", err);
            alert("Error: " + err.message);
        });
    } else {
        alert("Database not connected! Check your Firebase config.");
    }
}

// Preview ni instant ga update chese logic
// Admin Script lo Preview logic ni update cheyyi
function updateNotePreview() {
    const txt = document.getElementById('noteText').value; // Pure text
    const clr = document.getElementById('noteColor').value;
    const spd = parseInt(document.getElementById('noteSpeed').value) || 0;
    const previewContainer = document.getElementById('notePreviewContent');

    previewContainer.style.color = clr;

    if (spd === 0) {
        // SPEED 0: Center Logic
        previewContainer.style.textAlign = "center";
        previewContainer.innerHTML = `<div style="width:100%; display:flex; justify-content:center; align-items:center; height:100%;">${txt}</div>`;
    } else {
        // SPEED > 0: Scroll Logic
        // 'key' add cheyadam valla browser marquee ni restart chestundi
        const key = Math.random(); 
        previewContainer.style.textAlign = "left";
        previewContainer.innerHTML = `<marquee key="${key}" scrollamount="${spd}" style="width:100%; display:block;">${txt}</marquee>`;
    }
}
// --- HELPER LOGIC ---

function updateGiveawayPreview() {
    const winner = document.getElementById('giveawayWinner').value; // Pure text
    const spd = parseInt(document.getElementById('giveawaySpeed').value) || 0;
    const previewContainer = document.getElementById('giveawayPreviewContent');

    // Speed 0 unte Center, lekunte Scroll
    if (spd === 0) {
        previewContainer.style.textAlign = "center";
        previewContainer.style.display = "flex";
        previewContainer.style.justifyContent = "center";
        previewContainer.style.alignItems = "center";
        previewContainer.innerHTML = `<span>${winner}</span>`;
    } else {
        const key = Math.random(); // Force refresh for scroll
        previewContainer.style.textAlign = "left";
        previewContainer.style.display = "block";
        previewContainer.innerHTML = `<marquee key="${key}" scrollamount="${spd}" style="width:100%; display:block;">${winner}</marquee>`;
    }
}

function saveLogic() {
    Swal.fire({ icon: 'success', title: 'SUCCESS', text: 'Settings Saved Locally & Cloud Synced!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
}

// Cloud Sync Functions (As requested, keeping options consistent)
function saveSTResize() { saveLogic(); }
function saveSignalConn() { saveLogic(); }
function saveAdsConfig() { saveLogic(); }
function saveSocialLinks() { saveLogic(); }
function saveBrandName() { saveLogic(); }
function saveJoinSection() { saveLogic(); }
function saveWarningNote() {
    const noteText = document.getElementById('noteEditor').value.trim();
    
    if (!noteText) {
        Swal.fire({ icon: 'error', title: 'EMPTY NOTE', text: 'Please enter some text!', background: '#0a0a0a', color: '#fff' });
        return;
    }

    if (typeof db !== 'undefined') {
        // Firebase database lo 'warning_note' node ki data pampistunnam
        db.ref('site_settings/warning_note').set(noteText)
        .then(() => {
            Swal.fire({ 
                icon: 'success', 
                title: 'PUBLISHED', 
                text: 'Warning Note updated on Home Page!', 
                background: '#0a0a0a', 
                color: '#fff', 
                confirmButtonColor: '#ff0000' 
            });
        })
        .catch(err => {
            console.error("Firebase Error:", err);
            Swal.fire({ icon: 'error', title: 'CLOUD ERROR', text: err.message });
        });
    } else {
        Swal.fire({ icon: 'error', title: 'CONNECTION ERROR', text: 'Firebase is not initialized!' });
    }
}
function saveGiveawayToCloud() {
    const win = document.getElementById('winnerName').value;
    const spd = parseInt(document.getElementById('selectedSpeed').value);
    
    if (typeof db !== 'undefined') {
        db.ref('site_settings/giveaway').set({
            winner: win,
            speed: spd
        }).then(() => {
            Swal.fire({ icon: 'success', title: 'CLOUD SYNCED', text: 'Live on Site!', background: '#0a0a0a', color: '#fff' });
        });
    } else {
        Swal.fire({ icon: 'error', title: 'OFFLINE', text: 'Firebase not connected!' });
    }
}

// Firebase Helpers
function addNewFirebaseConfig() { saveLogic(); renderFirebaseModule(); }
function activateConfig(pid) { localStorage.setItem('activeFirebaseId', pid); renderFirebaseModule(); }
function deleteConfig(pid) { renderFirebaseModule(); }
// --- SOCIAL MEDIA MODULE RENDERING ---
function renderSocialMediaModule() {
    const platforms = ['Telegram', 'YouTube', 'Facebook', 'Instagram'];
    const savedLinks = JSON.parse(localStorage.getItem('socialLinks') || '{}');
    const mainDisplay = document.getElementById('mainDisplay');

    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px;">SOCIAL MEDIA MANAGEMENT</h2>
            <div id="socialList" style="display:flex; flex-direction:column; gap:12px;">
                ${platforms.map(plt => `
                    <div style="background:#080808; border:1px solid #1a1a1a; border-radius:4px; overflow:hidden;">
                        <div onclick="toggleSocialEdit('${plt}')" style="padding:15px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; border-left:3px solid var(--red);">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <i class="fab fa-${plt.toLowerCase()}" style="color:var(--red); font-size:18px; width:20px; text-align:center;"></i>
                                <span style="font-size:13px; font-weight:bold; letter-spacing:1px;">${plt.toUpperCase()}</span>
                            </div>
                            <i class="fas fa-chevron-down" style="font-size:12px; color:#444;"></i>
                        </div>
                        
                        <div id="edit-${plt}" style="display:none; padding:15px; background:#050505; border-top:1px solid #111;">
                            <label class="input-label">${plt} Profile/Channel Link</label>
                            <input type="text" id="link-${plt}" class="input-box" placeholder="https://..." value="${savedLinks[plt] || ''}">
                            <button class="action-btn" style="padding:10px; font-size:11px;" onclick="saveSocialLink('${plt}')">SAVE ${plt.toUpperCase()} LINK</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
// --- TOGGLE ACCORDION ---
function toggleSocialEdit(plt) {
    const el = document.getElementById(`edit-${plt}`);
    const all = document.querySelectorAll('[id^="edit-"]');
    all.forEach(item => { if(item.id !== `edit-${plt}`) item.style.display = 'none'; }); // Close others
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

// --- SAVE & SYNC LOGIC ---
function saveSocialLink(plt) {
    const linkVal = document.getElementById(`link-${plt}`).value.trim();
    if(!linkVal || typeof db === 'undefined') return;

    db.ref('site_settings/socials').child(plt).set(linkVal)
    .then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${plt} Link Updated`, showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
    });
}
// --- SYNC HEADER LINKS ---
function syncHeaderLinks() {
    const links = JSON.parse(localStorage.getItem('socialLinks') || '{}');
    const headerIcons = document.querySelectorAll('.social-row a');
    
    headerIcons.forEach(a => {
        const icon = a.querySelector('i');
        if(icon.classList.contains('fa-telegram')) a.href = links['Telegram'] || '#';
        if(icon.classList.contains('fa-youtube')) a.href = links['YouTube'] || '#';
        if(icon.classList.contains('fa-facebook')) a.href = links['Facebook'] || '#';
        if(icon.classList.contains('fa-instagram')) a.href = links['Instagram'] || '#';
        
        // Target blank so it opens in new tab
        a.setAttribute('target', '_blank');
    });
}

// Update header on page load
window.addEventListener('DOMContentLoaded', syncHeaderLinks);
// --- VIEWS MODULE RENDERING ---
function renderViewsModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    
    // Stats structure with Ruthless aesthetic
    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px;">REAL-TIME ANALYTICS</h2>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid #00ffcc; text-align:center;">
                    <label class="input-label" style="color:#00ffcc;">LIVE ONLINE</label>
                    <h1 id="count-online" style="color:#00ffcc; font-size:42px; margin:10px 0;">0</h1>
                    <p style="font-size:9px; color:#444;">ACTIVE USERS RIGHT NOW</p>
                </div>

                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid var(--red); text-align:center;">
                    <label class="input-label">UNIQUE USERS</label>
                    <h1 id="count-unique" style="color:var(--text-main); font-size:42px; margin:10px 0;">0</h1>
                    <p style="font-size:9px; color:#444;">SINGLE USERS TODAY</p>
                </div>

                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid #fff; text-align:center;">
                    <label class="input-label">WEBSITE VISITS</label>
                    <h1 id="count-visits" style="color:#fff; font-size:42px; margin:10px 0;">0</h1>
                    <p style="font-size:9px; color:#444;">TOTAL SESSIONS TODAY</p>
                </div>
            </div>

            <div style="margin-top:20px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div style="background:#0a0a0a; padding:15px; border:1px solid #1a1a1a; border-left:4px solid #00ffcc;">
                    <label class="input-label">QUOTEX POSTS</label>
                    <h2 id="count-quotex" style="font-family:'Roboto Mono'; font-size:24px; color:#00ffcc;">0</h2>
                </div>
                <div style="background:#0a0a0a; padding:15px; border:1px solid #1a1a1a; border-left:4px solid var(--red);">
                    <label class="input-label">TOXA POSTS</label>
                    <h2 id="count-toxa" style="font-family:'Roboto Mono'; font-size:24px; color:var(--red);">0</h2>
                </div>
            </div>

            <p style="margin-top:20px; font-size:10px; color:#555; text-align:center; font-family:'Roboto Mono';">
                <i class="fas fa-history"></i> ALL STATS RESET AUTOMATICALLY AT 12:00 AM IST
            </p>
        </div>
    `;
}

// --- REAL-TIME DATA LISTENER (FIREBASE) ---
window.listenToLiveStats = function() {
    // Note: Deeniki Firebase properly connect ayi undali
    if(typeof db === 'undefined') return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for daily tracking

    // Listen to Online Count
    db.ref('presence').on('value', (snap) => {
        const count = snap.numChildren() || 0;
        const el = document.getElementById('count-online');
        if(el) el.innerText = count;
    });

    // Listen to Daily Stats
    db.ref(`stats/${today}`).on('value', (snap) => {
        const data = snap.val() || { unique: 0, visits: 0, quotex: 0, toxa: 0 };
        if(document.getElementById('count-unique')) document.getElementById('count-unique').innerText = data.unique || 0;
        if(document.getElementById('count-visits')) document.getElementById('count-visits').innerText = data.visits || 0;
        if(document.getElementById('count-quotex')) document.getElementById('count-quotex').innerText = data.quotex || 0;
        if(document.getElementById('count-toxa')) document.getElementById('count-toxa').innerText = data.toxa || 0;
    });
};
// Page refresh ayina ventane database ni re-connect chestundi
window.addEventListener('DOMContentLoaded', () => {
    const savedConfig = JSON.parse(localStorage.getItem('firebaseConfig'));
    if (savedConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(savedConfig);
        }
        db = firebase.database();
        console.log("Firebase Auto-Reconnected");
    }
});
// --- GIVEAWAY MANAGER WITH COLOR & SPEED ---
function loadGiveawayManager() {
    const display = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    header.innerText = "GIVEAWAY WINNER";

    display.innerHTML = `
    <div id="giveawaySection" class="settings-panel" style="display: block; padding: 20px; border: 1px solid #222; margin-top: 10px;">
        <h3 style="color: var(--red); margin-bottom: 15px; font-family: 'Orbitron';">GIVEAWAY SETTINGS</h3>
        
        <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">WINNER MESSAGE / TEXT</label>
        <input type="text" id="giveawayWinner" placeholder="Enter Winner Name or Message..." 
               style="width: 100%; padding: 12px; background: #000; border: 1px solid #333; color: #00ffcc; font-family: 'Roboto Mono'; font-weight: bold; margin-bottom: 15px;"
               oninput="updateGiveawayPreview()">

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <div style="flex: 1;">
                <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">TEXT COLOR</label>
                <input type="color" id="giveawayColor" value="#ffffff" 
                       style="width: 100%; height: 40px; background: #000; border: 1px solid #333; cursor: pointer;"
                       oninput="updateGiveawayPreview()">
            </div>
            <div style="flex: 1;">
                <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">SCROLL SPEED</label>
                <select id="giveawaySpeed" style="width: 100%; padding: 10px; background: #0a0a0a; border: 1px solid #333; color: #fff; height: 40px;" 
                        onchange="updateGiveawayPreview()">
                    <option value="0">0 - CENTER (STILL)</option>
                    <option value="1">1 - VERY SLOW</option>
                    <option value="2">2 - SLOW</option>
                    <option value="3">3 - MEDIUM</option>
                    <option value="4">4 - FAST</option>
                    <option value="5">5 - RUTHLESS FAST</option>
                </select>
            </div>
        </div>

        <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">LIVE PREVIEW</label>
        <div style="width: 100%; height: 40px; background: #000; border: 1px dashed var(--red); margin-bottom: 15px; overflow: hidden;" id="giveawayPreviewBox">
            <div id="giveawayPreviewContent" style="width: 100%; height: 100%; font-family: 'Roboto Mono'; font-size: 11px; text-transform: uppercase; display: flex; align-items: center;">
                PREVIEW HERE
            </div>
        </div>

        <button onclick="publishGiveaway()" style="width: 100%; padding: 15px; background: var(--red); color: #fff; border: none; font-family: 'Orbitron'; font-weight: 900; cursor: pointer; text-transform: uppercase;">
            PUBLISH GIVEAWAY
        </button>
    </div>`;
}

// --- PREVIEW RENDERER WITH COLOR SUPPORT ---
function updateGiveawayPreview() {
    const txt = document.getElementById('giveawayWinner').value || "PREVIEW HERE";
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value) || 0;
    const content = document.getElementById('giveawayPreviewContent');

    content.style.color = clr; // Set chosen color

    if (spd === 0) {
        content.style.display = "flex";
        content.style.justifyContent = "center";
        content.innerHTML = `<span style="width:100%; text-align:center;">${txt}</span>`;
    } else {
        content.style.display = "block";
        const key = Date.now();
        content.innerHTML = `<marquee key="${key}" scrollamount="${spd}" style="width:100%; line-height:40px;">${txt}</marquee>`;
    }
}

// --- UPDATED PUBLISH (Saves Color too) ---
function publishGiveaway() {
    const txt = document.getElementById('giveawayWinner').value;
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value);

    if (!txt) {
        Swal.fire({ icon: 'error', title: 'EMPTY', text: 'Enter winner details!', background: '#0a0a0a', color: '#fff' });
        return;
    }

    db.ref('site_settings/giveaway').set({
        winner: txt,
        color: clr,
        speed: spd
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'LIVE', text: 'Giveaway Updated!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
    });
}
// --- ADS MANAGER MAIN INTERFACE ---
/* --- ADS CONTAINERS MANAGEMENT LOGIC --- */

// 1. Home page lo unna 8 slots list chupinchadam kosam
function loadAdsContainers() {
    const display = document.getElementById('mainDisplay');
    document.getElementById('panelHeader').innerHTML = `<h1>Ads Containers</h1><p>MANAGE 8 STRATEGIC AD SLOTS</p>`;
    
    let html = `<div class="module-card" style="max-width: 600px; margin: 0 auto;">`;
    for (let i = 1; i <= 8; i++) {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #111; background: #080808; margin-bottom: 8px; border-radius: 4px; border: 1px solid #1a1a1a;">
                <span style="font-family: 'Roboto Mono'; color: #eee; font-size: 14px;">AD SLOT ${i}</span>
                <button class="action-btn" style="width: auto; padding: 6px 20px; font-size: 11px;" onclick="manageAdSlot(${i})">MANAGE</button>
            </div>`;
    }
    html += `</div>`;
    display.innerHTML = html;
}

// 2. Manage button click chesinappudu Edit/Hide/Visible options
async function manageAdSlot(slotId) {
    const snap = await db.ref(`site_settings/ads/adSlot${slotId}`).once('value');
    const adData = snap.val() || { visible: true, snippet: '', width: '100%', height: '55px' };

    Swal.fire({
        title: `MANAGE AD SLOT ${slotId}`,
        background: '#0a0a0a',
        color: '#fff',
        html: `
            <div style="text-align: left; font-family: 'Roboto Mono'; font-size: 12px; padding: 10px;">
                <label class="input-label">STATUS (HIDE OR VISIBLE)</label>
                <select id="adStatus" class="input-box">
                    <option value="true" ${adData.visible ? 'selected' : ''}>VISIBLE</option>
                    <option value="false" ${!adData.visible ? 'selected' : ''}>HIDE</option>
                </select>

                <label class="input-label">AD SNIPPET (ADS NETWORK CODE)</label>
                <textarea id="adSnippet" class="input-box" style="height: 120px; font-size: 10px; color: #00ffcc;">${adData.snippet || ''}</textarea>

                <label class="input-label">SIZE SETTINGS</label>
                <select id="adSize" class="input-box" onchange="document.getElementById('customBox').style.display = (this.value === 'custom') ? 'flex' : 'none'">
                    <option value="100%|55px" ${adData.width === '100%' && adData.height === '55px' ? 'selected' : ''}>320*50 (DEFAULT)</option>
                    <option value="320px|100px" ${adData.width === '320px' && adData.height === '100px' ? 'selected' : ''}>320*100 (DEFAULT)</option>
                    <option value="custom" ${adData.width !== '100%' && adData.width !== '320px' ? 'selected' : ''}>CUSTOM SIZE</option>
                </select>

                <div id="customBox" style="display: ${adData.width !== '100%' && adData.width !== '320px' ? 'flex' : 'none'}; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="custW" class="input-box" placeholder="WIDTH (e.g. 300px)" style="width: 50%;" value="${adData.width}">
                    <input type="text" id="custH" class="input-box" placeholder="HEIGHT (e.g. 250px)" style="width: 50%;" value="${adData.height}">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'SAVE SETTINGS',
        confirmButtonColor: '#ff0000',
        cancelButtonColor: '#333',
        preConfirm: () => {
            const sizeVal = document.getElementById('adSize').value;
            let finalW, finalH;
            if (sizeVal === 'custom') {
                finalW = document.getElementById('custW').value;
                finalH = document.getElementById('custH').value;
            } else {
                [finalW, finalH] = sizeVal.split('|');
            }
            return {
                visible: document.getElementById('adStatus').value === 'true',
                snippet: document.getElementById('adSnippet').value,
                width: finalW,
                height: finalH
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            db.ref(`site_settings/ads/adSlot${slotId}`).set(result.value)
              .then(() => {
                  Swal.fire({ icon: 'success', title: 'SETTINGS SAVED', background: '#0a0a0a', color: '#fff', timer: 1500, showConfirmButton: false });
              });
        }
    });
}
// Global variable to track visibility in UI
let currentVisibility = true;

function openAdEditor(id, defaultName) {
    document.getElementById('adEditor').style.display = 'block';
    document.getElementById('editingAdName').innerText = defaultName;
    document.getElementById('targetAdId').value = id;

    // Fetch existing data from Firebase
    db.ref('site_settings/ads/' + id).once('value', (snapshot) => {
        const data = snapshot.val() || {};
        document.getElementById('adNickname').value = data.name || defaultName;
        document.getElementById('adSnippet').value = data.snippet || "";
        document.getElementById('customWidth').value = data.width || "320px";
        document.getElementById('customHeight').value = data.height || "50px";
        setAdVisibility(data.visible !== false);
    });
}

function setAdVisibility(isVisible) {
    currentVisibility = isVisible;
    document.getElementById('btnVisible').style.borderColor = isVisible ? "var(--red)" : "#222";
    document.getElementById('btnHidden').style.borderColor = !isVisible ? "var(--red)" : "#222";
}

function setPresetSize(w, h) {
    document.getElementById('customSizeInputs').style.display = 'none';
    document.getElementById('customWidth').value = w;
    document.getElementById('customHeight').value = h;
}

function enableCustomSize() {
    document.getElementById('customSizeInputs').style.display = 'flex';
}

function saveAdSettings() {
    const id = document.getElementById('targetAdId').value;
    const adData = {
        name: document.getElementById('adNickname').value,
        snippet: document.getElementById('adSnippet').value,
        width: document.getElementById('customWidth').value,
        height: document.getElementById('customHeight').value,
        visible: currentVisibility
    };

    db.ref('site_settings/ads/' + id).set(adData).then(() => {
        Swal.fire({ icon: 'success', title: 'AD UPDATED', text: 'Live on Home Page!', background: '#0a0a0a', color: '#fff' });
    });
}
let currentAdVisibility = true;

function openAdEditor(id, title) {
    document.getElementById('adEditorPanel').style.display = 'block';
    document.getElementById('editingAdTitle').innerText = title;
    document.getElementById('targetAdId').value = id;

    // Firebase nundi data load chestundi
    db.ref('site_settings/ads/' + id).once('value', (snapshot) => {
        const data = snapshot.val() || {};
        document.getElementById('adNickname').value = data.name || title;
        document.getElementById('adSnippet').value = data.snippet || "";
        document.getElementById('customWidth').value = data.width || "320px";
        document.getElementById('customHeight').value = data.height || "50px";
        setAdVisibility(data.visible !== false);
    });
    
    // Smooth scroll to editor
    document.getElementById('adEditorPanel').scrollIntoView({ behavior: 'smooth' });
}

function setAdVisibility(isVisible) {
    currentAdVisibility = isVisible;
    document.getElementById('btnVisible').style.background = isVisible ? "var(--red)" : "#0a0a0a";
    document.getElementById('btnHidden').style.background = !isVisible ? "var(--red)" : "#0a0a0a";
}

function setPresetSize(w, h) {
    document.getElementById('customSizeInputs').style.display = 'none';
    document.getElementById('customWidth').value = w;
    document.getElementById('customHeight').value = h;
}

function enableCustomSize() {
    document.getElementById('customSizeInputs').style.display = 'flex';
}

function saveAdSettings() {
    const id = document.getElementById('targetAdId').value;
    const adData = {
        name: document.getElementById('adNickname').value,
        snippet: document.getElementById('adSnippet').value,
        width: document.getElementById('customWidth').value,
        height: document.getElementById('customHeight').value,
        visible: currentAdVisibility
    };

    db.ref('site_settings/ads/' + id).set(adData).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'SYSTEM UPDATED',
            text: 'Ad is now live and layout adjusted!',
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ff0000'
        });
    });
}
// ==========================================
// --- ADS MANAGEMENT FUNCTIONS (GLOBAL) ---
// ==========================================

window.currentAdVisibility = true;

// 1. Open Editor when Container is clicked
window.openAdEditor = function(id, title) {
    console.log("Ruthless Editor Opening for:", id);
    const panel = document.getElementById('adEditorPanel');
    const titleEl = document.getElementById('editingAdTitle');
    const idInput = document.getElementById('targetAdId');

    if(!panel) {
        console.error("Editor Panel not found in the current module!");
        return;
    }

    // Show panel and set titles
    panel.style.display = 'block';
    titleEl.innerText = title;
    idInput.value = id;

    // Firebase nundi existing data ni techi fields lo nimpali
    if(typeof db !== 'undefined') {
        db.ref('site_settings/ads/' + id).once('value', (snapshot) => {
            const data = snapshot.val() || {};
            document.getElementById('adNickname').value = data.name || title;
            document.getElementById('adSnippet').value = data.snippet || "";
            document.getElementById('customWidth').value = data.width || "320px";
            document.getElementById('customHeight').value = data.height || "50px";
            
            // Visibility state set cheyyadam
            window.setAdVisibility(data.visible !== false);
        });
    }

    // Smooth scroll to editor
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 2. Visibility Toggle Logic
window.setAdVisibility = function(isVisible) {
    window.currentAdVisibility = isVisible;
    const vBtn = document.getElementById('btnVisible');
    const hBtn = document.getElementById('btnHidden');

    if(!vBtn || !hBtn) return;

    if(isVisible) {
        vBtn.style.background = "var(--red)";
        vBtn.style.boxShadow = "var(--neon)";
        hBtn.style.background = "#0a0a0a";
        hBtn.style.boxShadow = "none";
    } else {
        hBtn.style.background = "var(--red)";
        hBtn.style.boxShadow = "var(--neon)";
        vBtn.style.background = "#0a0a0a";
        vBtn.style.boxShadow = "none";
    }
};

// 3. Size Presets
window.setPresetSize = function(w, h) {
    const customInputs = document.getElementById('customSizeInputs');
    if(customInputs) customInputs.style.display = 'none';
    document.getElementById('customWidth').value = w;
    document.getElementById('customHeight').value = h;
};

// 4. Custom Size Toggle
window.enableCustomSize = function() {
    const customInputs = document.getElementById('customSizeInputs');
    if(customInputs) customInputs.style.display = 'flex';
};

// 5. Final Save & Run Logic
window.saveAdSettings = function() {
    const id = document.getElementById('targetAdId').value;
    if(!id || typeof db === 'undefined') {
        alert("System Error: ID or DB missing!");
        return;
    }

    const adData = {
        name: document.getElementById('adNickname').value,
        snippet: document.getElementById('adSnippet').value,
        width: document.getElementById('customWidth').value,
        height: document.getElementById('customHeight').value,
        visible: window.currentAdVisibility
    };

    db.ref('site_settings/ads/' + id).set(adData).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'SYSTEM UPDATED',
            text: 'Ad is now live on Home Page!',
            background: '#0a0a0a',
            color: '#fff',
            confirmButtonColor: '#ff0000'
        });
    }).catch(err => {
        console.error("Save Error:", err);
        Swal.fire({ icon: 'error', title: 'SAVE FAILED', text: err.message });
    });
};
// --- TOOLS MANAGEMENT GLOBAL FUNCTIONS ---
window.currentToolVisibility = true;

// 1. Firebase nundi tools list techi display cheyadam
window.loadToolsList = function() {
    const listGrid = document.getElementById('toolsListContainer');
    if(!listGrid || typeof db === 'undefined') return;

    db.ref('site_settings/tools').on('value', (snapshot) => {
        let html = '';
        const data = snapshot.val();
        if(!data) {
            listGrid.innerHTML = '<p style="color:#444;">No tools added yet.</p>';
            return;
        }

        Object.keys(data).forEach(id => {
            const tool = data[id];
            const statusColor = tool.visible ? '#00ffcc' : '#555';
            html += `
                <button class="nav-btn" style="width:100%; border:1px solid #1a1a1a; flex-direction:column; align-items:flex-start; padding:12px;" onclick="window.openToolEditor('${id}')">
                    <span style="font-size:13px; color:#fff; margin-bottom:5px;">${tool.name}</span>
                    <span style="font-size:9px; color:${statusColor}; letter-spacing:1px;">
                        <i class="fas fa-circle" style="font-size:7px;"></i> ${tool.visible ? 'LIVE ON SITE' : 'HIDDEN'}
                    </span>
                </button>`;
        });
        listGrid.innerHTML = html;
    });
};

// 2. Editor Open (New tool ki or Edit tool ki)
window.openToolEditor = function(id) {
    const panel = document.getElementById('toolEditorPanel');
    const title = document.getElementById('toolEditorTitle');
    const idInput = document.getElementById('targetToolId');
    
    panel.style.display = 'block';
    
    if(id === 'new') {
        title.innerText = "ADD NEW TOOL";
        idInput.value = "tool_" + Date.now(); // Unique ID generate chestundi
        document.getElementById('toolName').value = "";
        document.getElementById('toolCode').value = "";
        window.setToolVisibility(true);
    } else {
        title.innerText = "EDIT TOOL SETTINGS";
        idInput.value = id;
        db.ref('site_settings/tools/' + id).once('value', (snap) => {
            const tool = snap.val();
            document.getElementById('toolName').value = tool.name;
            document.getElementById('toolCode').value = tool.code;
            window.setToolVisibility(tool.visible);
        });
    }
    panel.scrollIntoView({ behavior: 'smooth' });
};

// 3. Visibility Toggle
window.setToolVisibility = function(isVisible) {
    window.currentToolVisibility = isVisible;
    const vBtn = document.getElementById('toolBtnVisible');
    const hBtn = document.getElementById('toolBtnHidden');
    if(isVisible) {
        vBtn.style.background = "#00ffcc"; vBtn.style.color = "#000";
        hBtn.style.background = "#0a0a0a"; hBtn.style.color = "#fff";
    } else {
        hBtn.style.background = "var(--red)"; hBtn.style.color = "#fff";
        vBtn.style.background = "#0a0a0a"; vBtn.style.color = "#fff";
    }
};

// 4. Save to Firebase
window.saveToolSettings = function() {
    const id = document.getElementById('targetToolId').value;
    const name = document.getElementById('toolName').value;
    const code = document.getElementById('toolCode').value;

    if(!name || !code) {
        alert("Please fill Name and Code!");
        return;
    }

    const toolData = {
        name: name,
        code: code,
        visible: window.currentToolVisibility,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('site_settings/tools/' + id).set(toolData).then(() => {
        Swal.fire({ icon: 'success', title: 'TOOL DEPLOYED', background: '#000', color: '#fff' });
        document.getElementById('toolEditorPanel').style.display = 'none';
    });
};
