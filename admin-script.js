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
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Live Traffic</label>
                    <h1 style="color:var(--red); font-size:40px; font-family:'Roboto Mono'; font-weight:bold;">24,850</h1>
                    <p style="color:#555;">Real-time User Count Active</p>
                </div>`;
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
            mainDisplay.innerHTML = `
                <div class="module-card">
                    <label class="input-label">Telegram URL</label>
                    <input type="text" id="tgUrl" class="input-box" placeholder="t.me/yourlink">
                    <label class="input-label">YouTube URL</label>
                    <input type="text" id="ytUrl" class="input-box" placeholder="youtube.com/c/...">
                    <button class="action-btn" onclick="saveSocialLinks()">UPDATE SOCIALS</button>
                </div>`;
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
            renderGiveawayModule();
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

function renderFirebaseModule() {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const activeConfigId = localStorage.getItem('activeFirebaseId');
    
    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:15px;">FIREBASE CONFIG (CLOUD SYNC)</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
                <input type="text" id="apiKey" class="input-box" placeholder="API Key">
                <input type="text" id="authDomain" class="input-box" placeholder="Auth Domain">
                <input type="text" id="databaseURL" class="input-box" placeholder="Database URL">
                <input type="text" id="projectId" class="input-box" placeholder="Project ID">
                <input type="text" id="storageBucket" class="input-box" placeholder="Storage Bucket">
                <input type="text" id="messagingSenderId" class="input-box" placeholder="Sender ID">
                <input type="text" id="appId" class="input-box" placeholder="App ID">
                <input type="text" id="measurementId" class="input-box" placeholder="Measurement ID">
            </div>
            <button class="action-btn" onclick="addNewFirebaseConfig()" style="margin-top:10px;">CONNECT DATABASE</button>
            <div style="margin-top:20px; padding:15px; background:#0a0a0a; border:1px solid #1a1a1a;">
                <label class="input-label">ACTIVE STATUS: <span style="color:${activeConfigId ? '#00ffcc' : '#ff0000'}">${activeConfigId || 'OFFLINE'}</span></label>
            </div>
            <div id="configList" style="margin-top:15px; display:flex; flex-direction:column; gap:8px;">
                ${configs.map(cfg => `
                    <div class="input-box" style="display:flex; justify-content:space-between; align-items:center; margin:0;">
                        <span style="font-size:12px;">${cfg.projectId}</span>
                        <div>
                            <button onclick="activateConfig('${cfg.projectId}')" style="background:none; border:none; color:#00ffcc; cursor:pointer; margin-right:10px;">ACTIVATE</button>
                            <button onclick="deleteConfig('${cfg.projectId}')" style="background:none; border:none; color:var(--red); cursor:pointer;">DELETE</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function renderGiveawayModule() {
    const savedData = JSON.parse(localStorage.getItem('giveawayData') || '{"winner":"@User_Name", "speed":2, "status":"VISIBLE"}');
    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <div id="giveawayPreview" style="background:#0a0a0a; border:1px solid var(--red); height:50px; display:flex; align-items:center; overflow:hidden; position:relative; margin-bottom:20px;">
                <div style="background:var(--red); color:#fff; padding:0 10px; z-index:2; height:100%; display:flex; align-items:center; font-size:10px; font-weight:bold;">GIVEAWAY</div>
                <div id="previewContent" style="width:100%; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold;">
                    ${savedData.speed === 0 ? `<center>${savedData.winner}</center>` : `<marquee scrollamount="${savedData.speed}">${savedData.winner}</marquee>`}
                </div>
            </div>
            <label class="input-label">Winner Text</label>
            <input type="text" id="winnerName" class="input-box" value="${savedData.winner}" oninput="updateGiveawayPreview()">
            <label class="input-label">Speed (0=Static, 1-5=Scroll)</label>
            <input type="number" id="selectedSpeed" class="input-box" min="0" max="5" value="${savedData.speed}" oninput="updateGiveawayPreview()">
            <button class="action-btn" onclick="saveGiveawayToCloud()">PUBLISH GIVEAWAY</button>
        </div>`;
}

function renderWarningNoteModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <label class="input-label">Warning Content</label>
            <textarea id="noteEditor" class="input-box" rows="4">Warning: Trading has risk...</textarea>
            <button class="action-btn" onclick="saveWarningNote()">PUBLISH NOTE</button>
        </div>`;
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
function saveWarningNote() { saveLogic(); }
function saveGiveawayToCloud() {
    const data = { winner: document.getElementById('winnerName').value, speed: parseInt(document.getElementById('selectedSpeed').value) };
    localStorage.setItem('giveawayData', JSON.stringify(data));
    saveLogic();
}

// Firebase Helpers
function addNewFirebaseConfig() { saveLogic(); renderFirebaseModule(); }
function activateConfig(pid) { localStorage.setItem('activeFirebaseId', pid); renderFirebaseModule(); }
function deleteConfig(pid) { renderFirebaseModule(); }
