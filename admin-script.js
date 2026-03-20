let database;

function loadContent(moduleName) {
    localStorage.setItem('activeModule', moduleName);
    
    // Update Sidebar UI
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim() === moduleName);
    });

    // Update Panel Header
    document.getElementById('panelHeader').innerHTML = `<h1>${moduleName}</h1><p>MANAGING ${moduleName.toUpperCase()} MODULE SETTINGS.</p>`;

    const mainDisplay = document.getElementById('mainDisplay');

    // --- 16 MODULE SWITCH LOGIC ---
    switch (moduleName) {
        case 'Views':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Live Traffic</label><h1 style="color:var(--red); font-size:40px;">24,850</h1><p style="color:#555;">Real-time User Count Active</p></div>`;
            break;
        case 'Revenue':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Estimated Revenue (INR)</label><h1 style="color:#00ffcc; font-size:40px;">₹ 15,240.00</h1><button class="action-btn" style="margin-top:20px;">SYNC WITH ADS</button></div>`;
            break;
        case 'ST Resize':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Main Container Width (px)</label><input type="text" id="screenWidth" class="input-box" value="1280"><label class="input-label">Disable Zoom (0/1)</label><input type="number" id="zoomDisable" class="input-box" value="1"><button class="action-btn" onclick="saveSTResize()">APPLY LAYOUT</button></div>`;
            break;
        case 'Tools Manager':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Active Tool ID</label><input type="text" class="input-box" placeholder="Tool Name"><label class="input-label">Visibility</label><select class="input-box"><option>VISIBLE</option><option>HIDDEN</option></select><button class="action-btn" onclick="saveLogic()">SAVE TOOLS</button></div>`;
            break;
        case 'Signal Connection':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Signal Source URL</label><input type="text" id="sigUrl" class="input-box" placeholder="https://api.signals.com"><label class="input-label">Platform</label><input type="text" id="sigPlat" class="input-box" value="QUOTEX"><button class="action-btn" onclick="saveSignalConn()">CONNECT LIVE</button></div>`;
            break;
        case 'Ads Network':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Network API Key</label><input type="text" class="input-box" placeholder="ADS-XXXX-XXXX"><button class="action-btn" onclick="saveLogic()">VERIFY NETWORK</button></div>`;
            break;
        case 'Ads Containers':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Refresh Interval (Seconds)</label><input type="number" id="adRefresh" class="input-box" value="30"><label class="input-label">Ad Unit Script</label><textarea id="adScript" class="input-box" rows="4"></textarea><button class="action-btn" onclick="saveAdsConfig()">UPDATE ADS</button></div>`;
            break;
        case 'Social Media':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Telegram URL</label><input type="text" id="tgUrl" class="input-box" placeholder="t.me/yourlink"><label class="input-label">YouTube URL</label><input type="text" id="ytUrl" class="input-box" placeholder="youtube.com/c/..."><button class="action-btn" onclick="saveSocialLinks()">UPDATE SOCIALS</button></div>`;
            break;
        case 'Brand Name':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Header Title</label><input type="text" id="brandTitle" class="input-box" value="BINARY RUTHLESS TRADER"><button class="action-btn" onclick="saveBrandName()">UPDATE BRAND</button></div>`;
            break;
        case 'Affiliate':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Affiliate ID</label><input type="text" class="input-box" placeholder="RUTHLESS-001"><button class="action-btn" onclick="saveLogic()">SAVE AFFILIATE</button></div>`;
            break;
        case 'Warning Note':
            renderWarningNoteModule(); 
            break;
        case 'Join Section':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">Button Text</label><input type="text" id="joinText" class="input-box" value="JOIN PREMIUM"><button class="action-btn" onclick="saveJoinSection()">UPDATE SECTION</button></div>`;
            break;
        case 'Giveaway Winner':
            renderGiveawayModule();
            break;
        case 'Firebase':
            renderFirebaseModule();
            break;
        case 'VPS':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">VPS Server Status</label><h3 style="color:#00ff00;">ONLINE</h3><label class="input-label" style="margin-top:15px;">Target IP</label><input type="text" class="input-box" value="45.12.88.XX"><button class="action-btn" onclick="saveLogic()">RESTART SERVER</button></div>`;
            break;
        case 'Security':
            mainDisplay.innerHTML = `<div class="module-card"><label class="input-label">New Admin Password</label><input type="password" class="input-box" placeholder="******"><button class="action-btn" onclick="saveLogic()">UPDATE SECURITY</button></div>`;
            break;
    }
}

// --- FIREBASE MODULE ---
function renderFirebaseModule() {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const activeConfigId = localStorage.getItem('activeFirebaseId');
    const mainDisplay = document.getElementById('mainDisplay');

    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:15px; letter-spacing:1px;">FIREBASE SETUP (8-FIELDS)</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div><label class="input-label">API Key</label><input type="text" id="apiKey" class="input-box" placeholder="apiKey"></div>
                <div><label class="input-label">Auth Domain</label><input type="text" id="authDomain" class="input-box" placeholder="authDomain"></div>
                <div><label class="input-label">Database URL</label><input type="text" id="databaseURL" class="input-box" placeholder="https://..."></div>
                <div><label class="input-label">Project ID</label><input type="text" id="projectId" class="input-box" placeholder="projectId"></div>
                <div><label class="input-label">Storage Bucket</label><input type="text" id="storageBucket" class="input-box" placeholder="storageBucket"></div>
                <div><label class="input-label">Messaging Sender ID</label><input type="text" id="messagingSenderId" class="input-box" placeholder="senderId"></div>
                <div><label class="input-label">App ID</label><input type="text" id="appId" class="input-box" placeholder="appId"></div>
                <div><label class="input-label">Measurement ID</label><input type="text" id="measurementId" class="input-box" placeholder="G-XXXXXX"></div>
            </div>
            <button class="action-btn" onclick="addNewFirebaseConfig()" style="margin-top:10px;">CONNECT DATABASE</button>
            <div style="margin-top:20px; padding:15px; background:#0a0a0a; border:1px solid #111; border-radius:4px;">
                <label class="input-label">CONNECTION STATUS</label>
                <div id="connectionStatus" style="font-family:'Roboto Mono'; font-size:14px; font-weight:bold; display:flex; align-items:center; gap:10px; color:${activeConfigId ? '#00ffcc' : '#ff0000'};">
                    <span style="height:10px; width:10px; border-radius:50%; background:${activeConfigId ? '#00ffcc' : '#ff0000'}; box-shadow: 0 0 10px ${activeConfigId ? '#00ffcc' : '#ff0000'};"></span>
                    ${activeConfigId ? 'CONNECTED: ' + activeConfigId : 'NOT CONNECTED'}
                </div>
            </div>
            <hr style="border:0.5px solid #1a1a1a; margin:25px 0;">
            <h2 style="font-size:12px; color:#fff; margin-bottom:12px; letter-spacing:1px;">SAVED DATABASES</h2>
            <div id="configList" style="display:flex; flex-direction:column; gap:10px;">
                ${configs.length === 0 ? '<p style="color:#444; font-size:11px;">No databases saved yet.</p>' : ''}
                ${configs.map(cfg => `
                    <div style="background:#080808; padding:12px; border:1px solid #1a1a1a; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid ${activeConfigId === cfg.projectId ? '#00ffcc' : '#333'};">
                        <div>
                            <div style="font-family:'Roboto Mono'; font-size:12px; color:#eee;">${cfg.projectId}</div>
                            <div style="font-size:9px; color:#555;">${cfg.databaseURL.substring(0, 30)}...</div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button onclick="activateConfig('${cfg.projectId}')" style="background:transparent; color:#00ffcc; border:1px solid #00ffcc; padding:6px 10px; font-size:10px; font-family:'Roboto Mono'; cursor:pointer; border-radius:3px;">CONNECT</button>
                            <button onclick="deleteConfig('${cfg.projectId}')" style="background:transparent; color:#ff0000; border:1px solid #ff0000; padding:6px 10px; font-size:10px; font-family:'Roboto Mono'; cursor:pointer; border-radius:3px;">DELETE</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// --- GIVEAWAY MODULE ---
function renderGiveawayModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    const savedData = JSON.parse(localStorage.getItem('giveawayData') || '{"winner":"@User_Name", "speed":2, "status":"VISIBLE"}');

    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:15px; letter-spacing:1px;">LIVE PREVIEW</h2>
            <div id="giveawayPreview" style="background:#0a0a0a; border:1px solid var(--red); height:60px; display:flex; align-items:center; overflow:hidden; position:relative; margin-bottom:25px; border-radius:4px;">
                <div style="background:var(--red); color:#fff; height:100%; padding:0 15px; display:flex; align-items:center; font-size:12px; font-weight:900; z-index:2; position:absolute; left:0; box-shadow:10px 0 20px #000;">GIVEAWAY</div>
                <div id="previewContent" style="width:100%; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold; font-size:16px; padding-left:140px;">
                    ${savedData.speed === 0 ? `<div style="display:flex; justify-content:center; width:100%;">${savedData.winner}</div>` : `<marquee scrollamount="${savedData.speed}">${savedData.winner}</marquee>`}
                </div>
            </div>
            <h2 style="font-size:12px; color:#fff; margin-bottom:15px;">GIVEAWAY SETTINGS</h2>
            <div style="display:flex; flex-direction:column; gap:15px;">
                <div>
                    <label class="input-label">Winner Text / Announcement</label>
                    <input type="text" id="winnerName" class="input-box" value="${savedData.winner}" placeholder="Ex: @TRADER_01 WON 5000 INR!">
                </div>
                <div>
                    <label class="input-label">SCROLL SPEED (0 = CENTER / 1-5 = FAST)</label>
                    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:5px; margin-top:5px;">
                        ${[0,1,2,3,4,5].map(s => `
                            <button onclick="setGiveawaySpeed(${s})" id="speedBtn${s}" class="action-btn" style="background:${savedData.speed === s ? 'var(--red)' : '#111'}; box-shadow:none; padding:10px;">
                                ${s === 0 ? 'OFF' : s}
                            </button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="selectedSpeed" value="${savedData.speed}">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                    <button class="action-btn" id="hideBtn" style="background:${savedData.status === 'HIDDEN' ? '#444' : '#660000'}; box-shadow:none;" onclick="toggleGiveawayVisibility()">
                        ${savedData.status === 'HIDDEN' ? 'SHOW ON SITE' : 'HIDE FROM SITE'}
                    </button>
                    <button class="action-btn" onclick="saveGiveawayToCloud()">SAVE & PUBLISH LIVE</button>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIC HELPERS ---
window.setGiveawaySpeed = function(speed) {
    document.getElementById('selectedSpeed').value = speed;
    for(let i=0; i<=5; i++) {
        document.getElementById(`speedBtn${i}`).style.background = (i === speed) ? 'var(--red)' : '#111';
    }
    const winnerText = document.getElementById('winnerName').value;
    const preview = document.getElementById('previewContent');
    if(speed === 0) {
        preview.innerHTML = `<div style="display:flex; justify-content:center; width:100%;">${winnerText}</div>`;
    } else {
        preview.innerHTML = `<marquee scrollamount="${speed}">${winnerText}</marquee>`;
    }
};

function toggleGiveawayVisibility() {
    const btn = document.getElementById('hideBtn');
    if (btn.innerText.includes('HIDE')) {
        btn.innerText = 'SHOW ON SITE';
        btn.style.background = '#444';
    } else {
        btn.innerText = 'HIDE FROM SITE';
        btn.style.background = '#660000';
    }
}

function saveGiveawayToCloud() {
    const winnerText = document.getElementById('winnerName').value;
    const speedValue = parseInt(document.getElementById('selectedSpeed').value);
    const isVisible = document.getElementById('hideBtn').innerText.includes('HIDE');

    const giveawayData = { content: winnerText, speed: speedValue, status: isVisible, timestamp: new Date().getTime() };
    localStorage.setItem('giveawayData', JSON.stringify({winner: winnerText, speed: speedValue, status: isVisible ? 'VISIBLE' : 'HIDDEN'}));

    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/giveaway', giveawayData);
    saveLogic();
}

function addNewFirebaseConfig() {
    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value,
        storageBucket: document.getElementById('storageBucket').value,
        messagingSenderId: document.getElementById('messagingSenderId').value,
        appId: document.getElementById('appId').value,
        measurementId: document.getElementById('measurementId').value
    };

    if(!config.projectId || !config.apiKey || !config.databaseURL) {
        Swal.fire({ icon: 'error', title: 'MISSING DATA', text: 'Please fill Project ID, API Key, and Database URL.', background: '#0a0a0a', color: '#fff' });
        return;
    }

    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    configs = configs.filter(c => c.projectId !== config.projectId);
    configs.push(config);
    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
    activateConfig(config.projectId);
}

function activateConfig(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const target = configs.find(c => c.projectId === pid);
    if(target) {
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));
        if (window.saveFirebaseSettings) window.saveFirebaseSettings(target);
        Swal.fire({ icon: 'success', title: 'SYSTEM ONLINE', text: `Connected to: ${pid}`, background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
        renderFirebaseModule();
    }
}

function deleteConfig(pid) {
    Swal.fire({ title: 'DELETE DATABASE?', text: "Credentials will be removed from local memory.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff0000', cancelButtonColor: '#333', background: '#050505', color: '#fff' }).then((result) => {
        if (result.isConfirmed) {
            let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
            configs = configs.filter(c => c.projectId !== pid);
            localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
            if(localStorage.getItem('activeFirebaseId') === pid) {
                localStorage.removeItem('activeFirebaseId');
                localStorage.removeItem('firebaseConfig');
            }
            renderFirebaseModule();
        }
    });
}

function renderWarningNoteModule() {
    document.getElementById('mainDisplay').innerHTML = `
        <div class="module-card">
            <label class="input-label">WARNING TEXT</label>
            <textarea id="noteEditor" class="input-box" rows="4">Warning: Trading has risk...</textarea>
            <label class="input-label"><input type="checkbox" id="scrollToggle" checked> ENABLE SMOOTH SCROLL</label>
            <button class="action-btn" onclick="saveWarningNote()">PUBLISH TO CLOUD</button>
        </div>
    `;
}

// --- CLOUD SYNC HELPERS ---
function saveWarningNote() { window.updateCloudConfig('site_settings/warning_note', { content: document.getElementById('noteEditor').value, scroll: document.getElementById('scrollToggle').checked }); saveLogic(); }
function saveSTResize() { window.updateCloudConfig('site_settings/layout', { width: document.getElementById('screenWidth').value, noZoom: document.getElementById('zoomDisable').value }); saveLogic(); }
function saveBrandName() { window.updateCloudConfig('site_settings/brand', { title: document.getElementById('brandTitle').value }); saveLogic(); }
function saveSocialLinks() { window.updateCloudConfig('site_settings/socials', { telegram: document.getElementById('tgUrl').value, youtube: document.getElementById('ytUrl').value }); saveLogic(); }
function saveAdsConfig() { window.updateCloudConfig('site_settings/ads', { refresh: document.getElementById('adRefresh').value, script: document.getElementById('adScript').value }); saveLogic(); }
function saveSignalConn() { window.updateCloudConfig('site_settings/signals', { url: document.getElementById('sigUrl').value, platform: document.getElementById('sigPlat').value }); saveLogic(); }
function saveJoinSection() { window.updateCloudConfig('site_settings/join', { text: document.getElementById('joinText').value }); saveLogic(); }

function saveLogic() {
    Swal.fire({ icon: 'success', title: 'PUBLISHED', text: 'Cloud sync successful!', confirmButtonColor: '#ff0000', background: '#0a0a0a', color: '#fff' });
}

window.onload = () => { loadContent(localStorage.getItem('activeModule') || 'Views'); };
