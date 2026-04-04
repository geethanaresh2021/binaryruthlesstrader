// ==========================================
// 1. GLOBAL CONFIGURATION & INITIALIZATION
// ==========================================
let db;
window.currentAdVisibility = true;
window.currentToolVisibility = true;

// Ruthless UI Constants
const RUTHLESS_RED = "#ff0000";
const RUTHLESS_BG = "#0a0a0a";
const RUTHLESS_NEON = "0 0 15px rgba(255, 0, 0, 0.5)";

// Auto-Reconnect Firebase on Load
window.addEventListener('DOMContentLoaded', () => {
    const savedConfig = JSON.parse(localStorage.getItem('firebaseConfig'));
    if (savedConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(savedConfig);
        }
        db = firebase.database();
        console.log("Ruthless System: Cloud Database Connected");
        
        // Initial Header Sync
        syncHeaderLinks();
        // Start Analytics Listener
        if(typeof listenToLiveStats === 'function') listenToLiveStats();
    }
});

// ==========================================
// 2. SIGNAL ENGINE MODULE (NEW)
// ==========================================
function renderSignalConnModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    if(header) header.innerText = "SIGNAL ENGINE CONNECT";

    mainDisplay.innerHTML = `
        <div class="module-card" style="border-top: 3px solid var(--red);">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px; font-family:'Orbitron';">VPS API CONFIGURATION</h2>
            
            <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-radius:4px;">
                <label class="input-label">SELECT TRADING PLATFORM (FROM HOME PAGE LIST)</label>
                <select id="signalPlatform" class="input-box" style="margin-bottom:20px; cursor:pointer;" onchange="loadExistingApi()">
                    <option value="" disabled selected>-- CHOOSE SOURCE --</option>
                    <option value="toxa">TOXA SIGNALS</option>
                    <option value="quotex">QUOTEX SIGNALS</option>
                </select>

                <div id="apiInputSection" style="display:none;">
                    <label class="input-label">VPS API ENDPOINT (ADDRESS)</label>
                    <input type="text" id="vpsApiUrl" class="input-box" 
                           style="color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold;"
                           placeholder="http://103.169.176.38:3000/api/get-signals/...">
                    
                    <p style="font-size:9px; color:#555; margin:10px 0; font-family:'Roboto Mono';">
                        <i class="fas fa-info-circle"></i> Once saved, home page signals will fetch directly from this VPS IP.
                    </p>

                    <button class="publish-btn" onclick="saveSignalConnection()" 
                            style="width:100%; padding:15px; background:var(--red); border:none; color:#fff; font-family:'Orbitron'; font-weight:900; cursor:pointer; margin-top:10px;">
                        ESTABLISH CONNECTION
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.loadExistingApi = function() {
    const platform = document.getElementById('signalPlatform').value;
    const inputSection = document.getElementById('apiInputSection');
    const urlInput = document.getElementById('vpsApiUrl');
    inputSection.style.display = 'block';

    if(db) {
        db.ref('site_settings/signal_connections/' + platform).once('value', (snap) => {
            const data = snap.val();
            urlInput.value = data ? data.url : "";
        });
    }
};

window.saveSignalConnection = function() {
    const platform = document.getElementById('signalPlatform').value;
    const apiUrl = document.getElementById('vpsApiUrl').value.trim();

    if(!apiUrl) {
        Swal.fire({ icon: 'error', title: 'EMPTY URL', text: 'Enter VPS Address!', background: '#0a0a0a', color: '#fff' });
        return;
    }

    db.ref('site_settings/signal_connections/' + platform).set({
        url: apiUrl,
        platform: platform,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'CONNECTED', text: 'API Linked Successfully!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
    });
};

// ==========================================
// 3. CLOUD SYNC & FIREBASE HELPERS
// ==========================================
function saveLogic() { console.log("Logic Saved to Cloud"); }

function saveWarningNote() {
    const noteText = document.getElementById('noteEditor').value.trim();
    if (!noteText) {
        Swal.fire({ icon: 'error', title: 'EMPTY NOTE', text: 'Enter some text!', background: '#0a0a0a', color: '#fff' });
        return;
    }
    if (db) {
        db.ref('site_settings/warning_note').set(noteText).then(() => {
            Swal.fire({ icon: 'success', title: 'PUBLISHED', text: 'Live on Site!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
        });
    }
}

// ==========================================
// 4. SOCIAL MEDIA MANAGEMENT
// ==========================================
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
                                <i class="fab fa-${plt.toLowerCase()}" style="color:var(--red); font-size:18px;"></i>
                                <span style="font-size:13px; font-weight:bold; letter-spacing:1px;">${plt.toUpperCase()}</span>
                            </div>
                            <i class="fas fa-chevron-down" style="font-size:12px; color:#444;"></i>
                        </div>
                        <div id="edit-${plt}" style="display:none; padding:15px; background:#050505; border-top:1px solid #111;">
                            <label class="input-label">${plt} Link</label>
                            <input type="text" id="link-${plt}" class="input-box" value="${savedLinks[plt] || ''}">
                            <button class="action-btn" onclick="saveSocialLink('${plt}')">SAVE ${plt.toUpperCase()} LINK</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleSocialEdit(plt) {
    const el = document.getElementById(`edit-${plt}`);
    document.querySelectorAll('[id^="edit-"]').forEach(item => { if(item.id !== `edit-${plt}`) item.style.display = 'none'; });
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

function saveSocialLink(plt) {
    const linkVal = document.getElementById(`link-${plt}`).value.trim();
    if(!linkVal || !db) return;
    db.ref('site_settings/socials').child(plt).set(linkVal).then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${plt} Updated`, showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
    });
}

function syncHeaderLinks() {
    const links = JSON.parse(localStorage.getItem('socialLinks') || '{}');
    document.querySelectorAll('.social-row a').forEach(a => {
        const icon = a.querySelector('i');
        if(icon.classList.contains('fa-telegram')) a.href = links['Telegram'] || '#';
        if(icon.classList.contains('fa-youtube')) a.href = links['YouTube'] || '#';
        a.setAttribute('target', '_blank');
    });
}

// ==========================================
// 5. REAL-TIME ANALYTICS (VIEWS)
// ==========================================
function renderViewsModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px;">REAL-TIME ANALYTICS</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                <div class="stat-box" style="border-top:3px solid #00ffcc;">
                    <label class="input-label" style="color:#00ffcc;">LIVE ONLINE</label>
                    <h1 id="count-online" style="color:#00ffcc; font-size:42px; font-weight:bold;">0</h1>
                </div>
                <div class="stat-box" style="border-top:3px solid var(--red);">
                    <label class="input-label">UNIQUE USERS</label>
                    <h1 id="count-unique" style="color:var(--text-main); font-size:42px; font-weight:bold;">0</h1>
                </div>
            </div>
            <div style="margin-top:20px; display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div class="stat-box" style="border-left:4px solid #00ffcc;">
                    <label class="input-label">QUOTEX POSTS</label>
                    <h2 id="count-quotex" style="font-family:'Roboto Mono'; font-size:24px; color:#00ffcc;">0</h2>
                </div>
                <div class="stat-box" style="border-left:4px solid var(--red);">
                    <label class="input-label">TOXA POSTS</label>
                    <h2 id="count-toxa" style="font-family:'Roboto Mono'; font-size:24px; color:var(--red);">0</h2>
                </div>
            </div>
        </div>
    `;
    listenToLiveStats();
}

window.listenToLiveStats = function() {
    if(!db) return;
    const today = new Date().toISOString().split('T')[0];
    db.ref('presence').on('value', (snap) => {
        const el = document.getElementById('count-online');
        if(el) el.innerText = snap.numChildren() || 0;
    });
    db.ref(`stats/${today}`).on('value', (snap) => {
        const data = snap.val() || { unique: 0, quotex: 0, toxa: 0 };
        if(document.getElementById('count-unique')) document.getElementById('count-unique').innerText = data.unique || 0;
        if(document.getElementById('count-quotex')) document.getElementById('count-quotex').innerText = data.quotex || 0;
        if(document.getElementById('count-toxa')) document.getElementById('count-toxa').innerText = data.toxa || 0;
    });
};

// ==========================================
// 6. GIVEAWAY MANAGER
// ==========================================
function loadGiveawayManager() {
    const display = document.getElementById('mainDisplay');
    document.querySelector('#panelHeader h1').innerText = "GIVEAWAY WINNER";

    display.innerHTML = `
    <div id="giveawaySection" class="settings-panel" style="display: block; padding: 20px; border: 1px solid #222;">
        <h3 style="color: var(--red); margin-bottom: 15px; font-family: 'Orbitron';">GIVEAWAY SETTINGS</h3>
        <input type="text" id="giveawayWinner" class="input-box" placeholder="Winner Name..." oninput="updateGiveawayPreview()">
        <div style="display: flex; gap: 10px; margin: 15px 0;">
            <div style="flex: 1;"><label class="input-label">COLOR</label><input type="color" id="giveawayColor" value="#ffffff" style="width:100%; height:40px;" oninput="updateGiveawayPreview()"></div>
            <div style="flex: 1;"><label class="input-label">SPEED</label>
                <select id="giveawaySpeed" class="input-box" onchange="updateGiveawayPreview()">
                    <option value="0">STILL</option><option value="2">SLOW</option><option value="4">FAST</option>
                </select>
            </div>
        </div>
        <div style="width: 100%; height: 40px; background: #000; border: 1px dashed var(--red); overflow: hidden;" id="giveawayPreviewBox">
            <div id="giveawayPreviewContent" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">PREVIEW</div>
        </div>
        <button onclick="publishGiveaway()" class="publish-btn" style="width:100%; margin-top:20px;">PUBLISH LIVE</button>
    </div>`;
}

function updateGiveawayPreview() {
    const txt = document.getElementById('giveawayWinner').value || "PREVIEW";
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value);
    const content = document.getElementById('giveawayPreviewContent');
    content.style.color = clr;
    if (spd === 0) {
        content.innerHTML = `<span style="width:100%; text-align:center;">${txt}</span>`;
    } else {
        content.innerHTML = `<marquee scrollamount="${spd}" style="width:100%;">${txt}</marquee>`;
    }
}

function publishGiveaway() {
    const txt = document.getElementById('giveawayWinner').value;
    if (!txt) return;
    db.ref('site_settings/giveaway').set({
        winner: txt,
        color: document.getElementById('giveawayColor').value,
        speed: parseInt(document.getElementById('giveawaySpeed').value)
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'LIVE', background: '#0a0a0a', color: '#fff' });
    });
}

// ==========================================
// 7. ADS MANAGER & VERIFICATION
// ==========================================
function loadAdsContainers() {
    const display = document.getElementById('mainDisplay');
    document.querySelector('#panelHeader h1').innerText = "ADS MANAGER";
    let adsListHtml = '';
    for (let i = 1; i <= 8; i++) {
        adsListHtml += `<button class="action-btn block-btn" onclick="openAdEditor('adSlot${i}', 'AD CONTAINER ${i}')">CONTAINER ${i}</button>`;
    }

    display.innerHTML = `
    <div class="ads-panel">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">${adsListHtml}</div>
        <div id="adEditorPanel" class="settings-panel" style="display: none; background: #050505; padding:20px;">
            <h3 id="editingAdTitle" style="color: var(--red); font-family:'Orbitron';"></h3>
            <input type="hidden" id="targetAdId">
            <div style="display:flex; gap:10px; margin:15px 0;">
                <button id="btnVisible" onclick="setAdVisibility(true)" class="action-btn" style="flex:1;">VISIBLE</button>
                <button id="btnHidden" onclick="setAdVisibility(false)" class="action-btn" style="flex:1;">HIDE</button>
            </div>
            <input type="text" id="adNickname" class="input-box" placeholder="Container Name">
            <textarea id="adSnippet" class="input-box" rows="5" placeholder="Ad Code Snippet"></textarea>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                <input type="text" id="customWidth" class="input-box" placeholder="Width (px)">
                <input type="text" id="customHeight" class="input-box" placeholder="Height (px)">
            </div>
            <button onclick="saveAdSettings()" class="publish-btn" style="width:100%; margin-top:15px;">UPDATE AD</button>
        </div>
    </div>`;
}

window.openAdEditor = function(id, title) {
    document.getElementById('adEditorPanel').style.display = 'block';
    document.getElementById('editingAdTitle').innerText = title;
    document.getElementById('targetAdId').value = id;
    db.ref('site_settings/ads/' + id).once('value', (snap) => {
        const data = snap.val() || {};
        document.getElementById('adNickname').value = data.name || title;
        document.getElementById('adSnippet').value = data.snippet || "";
        document.getElementById('customWidth').value = data.width || "320px";
        document.getElementById('customHeight').value = data.height || "50px";
        setAdVisibility(data.visible !== false);
    });
};

window.setAdVisibility = function(isVisible) {
    window.currentAdVisibility = isVisible;
    document.getElementById('btnVisible').style.background = isVisible ? "var(--red)" : "#0a0a0a";
    document.getElementById('btnHidden').style.background = !isVisible ? "var(--red)" : "#0a0a0a";
};

window.saveAdSettings = function() {
    const id = document.getElementById('targetAdId').value;
    const adData = {
        name: document.getElementById('adNickname').value,
        snippet: document.getElementById('adSnippet').value,
        width: document.getElementById('customWidth').value,
        height: document.getElementById('customHeight').value,
        visible: window.currentAdVisibility
    };
    db.ref('site_settings/ads/' + id).set(adData).then(() => {
        Swal.fire({ icon: 'success', title: 'AD UPDATED', background: '#0a0a0a', color: '#fff' });
    });
};

// ==========================================
// 8. TOOLS MANAGEMENT
// ==========================================
function renderToolsModule() {
    const display = document.getElementById('mainDisplay');
    display.innerHTML = `
        <div class="module-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="font-size:12px; color:var(--red); letter-spacing:1px;">TRADING TOOLS</h2>
                <button class="action-btn" onclick="openToolEditor('new')" style="padding:5px 15px;">+ NEW TOOL</button>
            </div>
            <div id="toolsListContainer" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
            <div id="toolEditorPanel" class="settings-panel" style="display:none; margin-top:20px; padding:20px; border:1px solid #333;">
                <h3 id="toolEditorTitle" style="color:var(--red);"></h3>
                <input type="hidden" id="targetToolId">
                <input type="text" id="toolName" class="input-box" placeholder="Tool Name">
                <textarea id="toolCode" class="input-box" rows="10" placeholder="Paste HTML/JS Code"></textarea>
                <div style="display:flex; gap:10px; margin:15px 0;">
                    <button id="toolBtnVisible" onclick="setToolVisibility(true)" class="action-btn" style="flex:1;">LIVE</button>
                    <button id="toolBtnHidden" onclick="setToolVisibility(false)" class="action-btn" style="flex:1;">HIDDEN</button>
                </div>
                <button onclick="saveToolSettings()" class="publish-btn" style="width:100%;">DEPLOY TOOL</button>
            </div>
        </div>`;
    loadToolsList();
}

window.loadToolsList = function() {
    const listGrid = document.getElementById('toolsListContainer');
    db.ref('site_settings/tools').on('value', (snapshot) => {
        let html = '';
        const data = snapshot.val();
        if(!data) { listGrid.innerHTML = '<p>No Tools.</p>'; return; }
        Object.keys(data).forEach(id => {
            const tool = data[id];
            html += `<button class="nav-btn" style="width:100%; flex-direction:column; align-items:flex-start;" onclick="openToolEditor('${id}')">
                        <span style="color:#fff;">${tool.name}</span>
                        <span style="font-size:8px; color:${tool.visible ? '#00ffcc' : '#555'}; uppercase;">${tool.visible ? 'ONLINE' : 'OFFLINE'}</span>
                     </button>`;
        });
        listGrid.innerHTML = html;
    });
};

window.setToolVisibility = function(isVisible) {
    window.currentToolVisibility = isVisible;
    document.getElementById('toolBtnVisible').style.background = isVisible ? "#00ffcc" : "#0a0a0a";
    document.getElementById('toolBtnHidden').style.background = !isVisible ? "var(--red)" : "#0a0a0a";
};

window.saveToolSettings = function() {
    const id = document.getElementById('targetToolId').value;
    const toolData = {
        name: document.getElementById('toolName').value,
        code: document.getElementById('toolCode').value,
        visible: window.currentToolVisibility
    };
    db.ref('site_settings/tools/' + id).set(toolData).then(() => {
        Swal.fire({ icon: 'success', title: 'DEPLOYED', background: '#000', color: '#fff' });
        document.getElementById('toolEditorPanel').style.display = 'none';
    });
};

// ==========================================
// 9. HELPER UI STYLES (REQUIRED)
// ==========================================
/* Note: Add these classes in your <style> tag if not already present
   .stat-box { background:#080808; padding:20px; border:1px solid #1a1a1a; text-align:center; }
   .input-label { color:#888; font-size:10px; font-family:'Orbitron'; display:block; margin-bottom:5px; }
   .input-box { width:100%; padding:12px; background:#000; border:1px solid #333; color:#fff; outline:none; }
   .publish-btn { background:var(--red); color:#fff; font-family:'Orbitron'; font-weight:900; border:none; cursor:pointer; }
*/
