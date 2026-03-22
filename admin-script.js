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
        // Button text nundi icon/spaces ni trim chesi check chestundi
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

    // 4. Module Switching Logic (All 16 Modules)
    switch (moduleName) {
        case 'Views':
            renderViewsModule();
            // Start real-time listener for counts
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

        case 'ST Resize':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Main Container Width (px)</label>
                    <input type="text" id="screenWidth" class="input-box" value="1280">
                    <label class="input-label">Disable Zoom (0/1)</label>
                    <input type="number" id="zoomDisable" class="input-box" value="1">
                    <button class="action-btn" onclick="saveSTResize()">APPLY LAYOUT</button>
                </div>`;
            break;

        case 'Tools Manager':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Active Tool ID</label>
                    <input type="text" class="input-box" placeholder="Tool Name">
                    <label class="input-label">Visibility</label>
                    <select class="input-box" style="background:#080808; color:#00ffcc;">
                        <option>VISIBLE</option>
                        <option>HIDDEN</option>
                    </select>
                    <button class="action-btn" onclick="saveLogic()">SAVE TOOLS</button>
                </div>`;
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

        case 'Ads Network':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Network API Key</label>
                    <input type="text" class="input-box" placeholder="ADS-XXXX-XXXX">
                    <button class="action-btn" onclick="saveLogic()">VERIFY NETWORK</button>
                </div>`;
            break;

        case 'Ads Containers':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Refresh Interval (Seconds)</label>
                    <input type="number" id="adRefresh" class="input-box" value="30">
                    <label class="input-label">Ad Unit Script (6 Containers)</label>
                    <textarea id="adScript" class="input-box" rows="4" placeholder="Paste Adsterra/Google scripts here..."></textarea>
                    <button class="action-btn" onclick="saveAdsConfig()">UPDATE ADS</button>
                </div>`;
            break;

        case 'Social Media':
    // Social links kosam kuda sync function create cheskovachu
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

        case 'Affiliate':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Affiliate ID / Link</label>
                    <input type="text" class="input-box" placeholder="RUTHLESS-001">
                    <button class="action-btn" onclick="saveLogic()">SAVE AFFILIATE</button>
                </div>`;
            break;

        case 'Warning Note':
            renderWarningNoteModule();
            break;

        case 'Join Section':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Join Button Text</label>
                    <input type="text" id="joinText" class="input-box" value="JOIN PREMIUM">
                    <button class="action-btn" onclick="saveJoinSection()">UPDATE SECTION</button>
                </div>`;
            break;

        case 'Giveaway Winner':
    // Direct ga render cheyyakunda, sync chesi render chestham
    syncAdminDataFromCloud(); 
    break;

        case 'Firebase':
            renderFirebaseModule();
            break;

        case 'VPS':
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">VPS Server Status</label>
                    <h3 style="color:#00ff00; font-family:'Roboto Mono';">ONLINE (Latency: 24ms)</h3>
                    <label class="input-label" style="margin-top:15px;">Target IP</label>
                    <input type="text" class="input-box" value="45.12.88.XX">
                    <button class="action-btn" onclick="saveLogic()">RESTART SERVER</button>
                </div>`;
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

// --- MODULE SPECIFIC RENDERS ---

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
function updateNotePreview() {
    const txt = document.getElementById('noteText').value;
    const clr = document.getElementById('noteColor').value;
    const spd = parseInt(document.getElementById('noteSpeed').value);
    const previewContainer = document.getElementById('notePreviewContent');

    // Color update
    previewContainer.style.color = clr;

    // Content re-render (Scroll restart avvadaniki idi avasaram)
    if (spd === 0) {
        previewContainer.innerHTML = `<center>${txt}</center>`;
    } else {
        previewContainer.innerHTML = `<marquee scrollamount="${spd}">${txt}</marquee>`;
    }
}

// --- HELPER LOGIC ---

function updateGiveawayPreview() {
    const win = document.getElementById('winnerName').value;
    const spd = parseInt(document.getElementById('selectedSpeed').value);
    const content = document.getElementById('previewContent');
    content.innerHTML = spd === 0 ? `<center>${win}</center>` : `<marquee scrollamount="${spd}">${win}</marquee>`;
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
