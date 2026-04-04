// ==========================================
// 1. CORE SYSTEM & FIREBASE INIT
// ==========================================
let db;
window.currentAdVisibility = true;
window.currentToolVisibility = true;
let currentVisibility = true; // Global for Ads

// Page load ayina ventane database ni re-connect chestundi
window.addEventListener('DOMContentLoaded', () => {
    const savedConfig = JSON.parse(localStorage.getItem('firebaseConfig'));
    if (savedConfig) {
        if (!firebase.apps.length) {
            firebase.initializeApp(savedConfig);
        }
        db = firebase.database();
        console.log("Firebase Auto-Reconnected");
        syncHeaderLinks();
    }
});

// ==========================================
// 2. SIGNAL CONNECTION ENGINE (NEW)
// ==========================================
function renderSignalConnModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    header.innerText = "SIGNAL ENGINE CONNECT";

    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px; font-family:'Orbitron';">VPS API CONFIGURATION</h2>
            <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-radius:4px;">
                <label class="input-label">SELECT TRADING PLATFORM</label>
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
    document.getElementById('apiInputSection').style.display = 'block';
    if(typeof db !== 'undefined') {
        db.ref('site_settings/signal_connections/' + platform).once('value', (snap) => {
            const data = snap.val();
            document.getElementById('vpsApiUrl').value = data ? data.url : "";
        });
    }
};

window.saveSignalConnection = function() {
    const platform = document.getElementById('signalPlatform').value;
    const apiUrl = document.getElementById('vpsApiUrl').value.trim();
    if(!apiUrl) return;
    db.ref('site_settings/signal_connections/' + platform).set({
        url: apiUrl,
        platform: platform,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'CONNECTED', text: 'Live on Site!', background: '#0a0a0a', color: '#fff' });
    });
};

// ==========================================
// 3. CLOUD SYNC FUNCTIONS
// ==========================================
function saveSTResize() { saveLogic(); }
function saveSignalConn() { saveLogic(); }
function saveAdsConfig() { saveLogic(); }
function saveSocialLinks() { saveLogic(); }
function saveBrandName() { saveLogic(); }
function saveJoinSection() { saveLogic(); }
function saveLogic() { console.log("System Synced"); }

function saveWarningNote() {
    const noteText = document.getElementById('noteEditor').value.trim();
    if (!noteText) {
        Swal.fire({ icon: 'error', title: 'EMPTY NOTE', text: 'Please enter some text!', background: '#0a0a0a', color: '#fff' });
        return;
    }
    if (typeof db !== 'undefined') {
        db.ref('site_settings/warning_note').set(noteText).then(() => {
            Swal.fire({ icon: 'success', title: 'PUBLISHED', text: 'Updated on Home Page!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
        });
    }
}

// ==========================================
// 4. ANALYTICS & VIEWS
// ==========================================
function renderViewsModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    mainDisplay.innerHTML = `
        <div class="module-card">
            <h2 style="font-size:12px; color:var(--red); margin-bottom:20px; letter-spacing:1px;">REAL-TIME ANALYTICS</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px;">
                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid #00ffcc; text-align:center;">
                    <label class="input-label" style="color:#00ffcc;">LIVE ONLINE</label>
                    <h1 id="count-online" style="color:#00ffcc; font-size:42px; margin:10px 0;">0</h1>
                </div>
                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid var(--red); text-align:center;">
                    <label class="input-label">UNIQUE USERS</label>
                    <h1 id="count-unique" style="color:var(--text-main); font-size:42px; margin:10px 0;">0</h1>
                </div>
                <div style="background:#080808; padding:20px; border:1px solid #1a1a1a; border-top:3px solid #fff; text-align:center;">
                    <label class="input-label">WEBSITE VISITS</label>
                    <h1 id="count-visits" style="color:#fff; font-size:42px; margin:10px 0;">0</h1>
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
        </div>`;
    listenToLiveStats();
}

window.listenToLiveStats = function() {
    if(typeof db === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    db.ref('presence').on('value', (snap) => {
        const count = snap.numChildren() || 0;
        if(document.getElementById('count-online')) document.getElementById('count-online').innerText = count;
    });
    db.ref(`stats/${today}`).on('value', (snap) => {
        const data = snap.val() || { unique: 0, visits: 0, quotex: 0, toxa: 0 };
        if(document.getElementById('count-unique')) document.getElementById('count-unique').innerText = data.unique || 0;
        if(document.getElementById('count-visits')) document.getElementById('count-visits').innerText = data.visits || 0;
        if(document.getElementById('count-quotex')) document.getElementById('count-quotex').innerText = data.quotex || 0;
        if(document.getElementById('count-toxa')) document.getElementById('count-toxa').innerText = data.toxa || 0;
    });
};

// ==========================================
// 5. SOCIAL MEDIA MODULE
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
                                <i class="fab fa-${plt.toLowerCase()}" style="color:var(--red); font-size:18px; width:20px; text-align:center;"></i>
                                <span style="font-size:13px; font-weight:bold; letter-spacing:1px;">${plt.toUpperCase()}</span>
                            </div>
                            <i class="fas fa-chevron-down" style="font-size:12px; color:#444;"></i>
                        </div>
                        <div id="edit-${plt}" style="display:none; padding:15px; background:#050505; border-top:1px solid #111;">
                            <label class="input-label">${plt} Link</label>
                            <input type="text" id="link-${plt}" class="input-box" value="${savedLinks[plt] || ''}">
                            <button class="action-btn" style="padding:10px; font-size:11px;" onclick="saveSocialLink('${plt}')">SAVE ${plt.toUpperCase()} LINK</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
}

function toggleSocialEdit(plt) {
    const el = document.getElementById(`edit-${plt}`);
    document.querySelectorAll('[id^="edit-"]').forEach(item => { if(item.id !== `edit-${plt}`) item.style.display = 'none'; });
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

function saveSocialLink(plt) {
    const linkVal = document.getElementById(`link-${plt}`).value.trim();
    if(!linkVal || typeof db === 'undefined') return;
    db.ref('site_settings/socials').child(plt).set(linkVal).then(() => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${plt} Link Updated`, showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' });
    });
}

function syncHeaderLinks() {
    const links = JSON.parse(localStorage.getItem('socialLinks') || '{}');
    document.querySelectorAll('.social-row a').forEach(a => {
        const icon = a.querySelector('i');
        if(icon.classList.contains('fa-telegram')) a.href = links['Telegram'] || '#';
        if(icon.classList.contains('fa-youtube')) a.href = links['YouTube'] || '#';
        if(icon.classList.contains('fa-facebook')) a.href = links['Facebook'] || '#';
        if(icon.classList.contains('fa-instagram')) a.href = links['Instagram'] || '#';
        a.setAttribute('target', '_blank');
    });
}

// ==========================================
// 6. GIVEAWAY MANAGER
// ==========================================
function loadGiveawayManager() {
    const display = document.getElementById('mainDisplay');
    document.querySelector('#panelHeader h1').innerText = "GIVEAWAY WINNER";
    display.innerHTML = `
    <div id="giveawaySection" class="settings-panel" style="display: block; padding: 20px; border: 1px solid #222; margin-top: 10px;">
        <h3 style="color: var(--red); margin-bottom: 15px; font-family: 'Orbitron';">GIVEAWAY SETTINGS</h3>
        <label class="input-label">WINNER MESSAGE</label>
        <input type="text" id="giveawayWinner" class="input-box" style="color: #00ffcc;" oninput="updateGiveawayPreview()">
        <div style="display: flex; gap: 10px; margin-top:15px;">
            <div style="flex: 1;"><label class="input-label">TEXT COLOR</label><input type="color" id="giveawayColor" value="#ffffff" style="width:100%; height:40px; cursor:pointer;" oninput="updateGiveawayPreview()"></div>
            <div style="flex: 1;"><label class="input-label">SCROLL SPEED</label>
                <select id="giveawaySpeed" class="input-box" onchange="updateGiveawayPreview()">
                    <option value="0">0 - STILL</option><option value="1">1 - VERY SLOW</option><option value="2">2 - SLOW</option><option value="3">3 - MEDIUM</option><option value="4">4 - FAST</option><option value="5">5 - RUTHLESS FAST</option>
                </select>
            </div>
        </div>
        <label class="input-label" style="margin-top:15px;">LIVE PREVIEW</label>
        <div style="width: 100%; height: 40px; background: #000; border: 1px dashed var(--red); overflow: hidden;" id="giveawayPreviewBox">
            <div id="giveawayPreviewContent" style="width: 100%; height: 100%; font-family: 'Roboto Mono'; display: flex; align-items: center;">PREVIEW HERE</div>
        </div>
        <button onclick="publishGiveaway()" class="publish-btn" style="width:100%; margin-top:15px; padding:15px;">PUBLISH GIVEAWAY</button>
    </div>`;
}

function updateGiveawayPreview() {
    const txt = document.getElementById('giveawayWinner').value || "PREVIEW HERE";
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value) || 0;
    const content = document.getElementById('giveawayPreviewContent');
    content.style.color = clr;
    if (spd === 0) {
        content.style.display = "flex"; content.style.justifyContent = "center";
        content.innerHTML = `<span style="width:100%; text-align:center;">${txt}</span>`;
    } else {
        content.style.display = "block";
        content.innerHTML = `<marquee scrollamount="${spd}" style="width:100%; line-height:40px;">${txt}</marquee>`;
    }
}

function publishGiveaway() {
    const txt = document.getElementById('giveawayWinner').value;
    if (!txt) return;
    db.ref('site_settings/giveaway').set({ winner: txt, color: document.getElementById('giveawayColor').value, speed: parseInt(document.getElementById('giveawaySpeed').value) })
    .then(() => { Swal.fire({ icon: 'success', title: 'LIVE', text: 'Giveaway Updated!', background: '#0a0a0a', color: '#fff' }); });
}

// ==========================================
// 7. ADS MANAGER & VERIFICATION
// ==========================================
function loadAdsContainers() {
    const display = document.getElementById('mainDisplay');
    document.querySelector('#panelHeader h1').innerText = "ADS CONTAINERS MANAGER";
    let adsListHtml = '';
    for (let i = 1; i <= 8; i++) {
        adsListHtml += `<button class="action-btn block-btn" onclick="openAdEditor('adSlot${i}', 'AD CONTAINER ${i}')"><i class="fas fa-box"></i> AD CONTAINER ${i}</button>`;
    }
    display.innerHTML = `
    <div class="ads-panel" style="padding: 10px;">
        <div id="adsList" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">${adsListHtml}</div>
        <div id="adEditorPanel" class="settings-panel" style="display: none; border: 1px solid #222; padding: 20px; background: #050505;">
            <h3 id="editingAdTitle" style="color: var(--red); margin-bottom: 15px; font-family: 'Orbitron';"></h3>
            <input type="hidden" id="targetAdId">
            <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                <button id="btnVisible" onclick="setAdVisibility(true)" class="action-btn" style="flex:1;">VISIBLE</button>
                <button id="btnHidden" onclick="setAdVisibility(false)" class="action-btn" style="flex:1;">HIDE</button>
            </div>
            <label class="input-label">CONTAINER NAME</label>
            <input type="text" id="adNickname" class="input-box" style="margin-bottom:15px;">
            <label class="input-label">AD SNIPPET (CODE)</label>
            <textarea id="adSnippet" rows="5" class="input-box" style="color:#00ffcc; font-family:'Roboto Mono'; margin-bottom:15px;"></textarea>
            <div id="customSizeInputs" style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="customWidth" placeholder="Width" class="input-box">
                <input type="text" id="customHeight" placeholder="Height" class="input-box">
            </div>
            <button onclick="saveAdSettings()" class="publish-btn" style="width: 100%; padding: 15px;">SAVE & UPDATE HOME PAGE</button>
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
    document.getElementById('adEditorPanel').scrollIntoView({ behavior: 'smooth' });
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
        Swal.fire({ icon: 'success', title: 'SYSTEM UPDATED', background: '#0a0a0a', color: '#fff' });
    });
};

// --- VERIFICATION MODULE ---
function renderAdsVerificationModule() {
    const mainDisplay = document.getElementById('mainDisplay');
    document.querySelector('#panelHeader h1').innerText = "ADS NETWORK VERIFICATION";
    const methods = [
        { id: 'meta', name: 'META TAG VERIFICATION', icon: 'fa-code' },
        { id: 'adstxt', name: 'ADS.TXT FILE VERIFICATION', icon: 'fa-file-alt' },
        { id: 'htmlfile', name: 'HTML FILE UPLOAD', icon: 'fa-upload' },
        { id: 'dns', name: 'DNS (DOMAIN) VERIFICATION', icon: 'fa-globe' },
        { id: 'gsc', name: 'GOOGLE SEARCH CONSOLE LINK', icon: 'fa-search' }
    ];
    mainDisplay.innerHTML = `
    <div class="verify-panel" style="padding: 10px;">
        <div id="methodsList">${methods.map(m => `
            <button class="action-btn block-btn" onclick="openVerifyEditor('${m.id}', '${m.name}')" style="width:100%; text-align:left; margin-bottom:10px; display:flex; align-items:center; gap:15px;">
                <i class="fas ${m.icon}" style="color:var(--red); width:20px;"></i> <span>${m.name}</span>
            </button>`).join('')}
        </div>
        <div id="verifyEditor" class="settings-panel" style="display: none; border: 1px solid #222; padding: 20px; background: #050505; margin-top:20px;">
            <h3 id="verifyMethodTitle" style="color: var(--red); font-family: 'Orbitron';"></h3>
            <input type="hidden" id="targetMethodId">
            <label id="verifyLabel" class="input-label">ENTER DETAILS</label>
            <textarea id="verifyDetails" rows="8" class="input-box" style="color:#00ffcc; font-family:'Roboto Mono';"></textarea>
            <button onclick="saveVerification()" class="publish-btn" style="width: 100%; padding: 15px; margin-top:20px;">VERIFY & SAVE DATA</button>
        </div>
    </div>`;
}

window.openVerifyEditor = function(id, title) {
    document.getElementById('verifyEditor').style.display = 'block';
    document.getElementById('verifyMethodTitle').innerText = title;
    document.getElementById('targetMethodId').value = id;
    if(id === 'meta') document.getElementById('verifyLabel').innerText = "PASTE <META> TAG";
    else if(id === 'adstxt') document.getElementById('verifyLabel').innerText = "PASTE ADS.TXT CONTENT";
    db.ref('site_settings/verification/' + id).once('value', (snap) => {
        document.getElementById('verifyDetails').value = snap.exists() ? snap.val().data : "";
    });
};

window.saveVerification = function() {
    const id = document.getElementById('targetMethodId').value;
    const data = document.getElementById('verifyDetails').value.trim();
    db.ref('site_settings/verification/' + id).set({ data: data, method: id, updatedAt: firebase.database.ServerValue.TIMESTAMP })
    .then(() => { Swal.fire({ icon: 'success', title: 'VERIFICATION SAVED', background: '#0a0a0a', color: '#fff' }); });
};

// ==========================================
// 8. TOOLS MANAGEMENT
// ==========================================
window.loadToolsList = function() {
    const listGrid = document.getElementById('toolsListContainer');
    if(!listGrid) return;
    db.ref('site_settings/tools').on('value', (snapshot) => {
        let html = '';
        const data = snapshot.val();
        if(!data) { listGrid.innerHTML = '<p style="color:#444;">No tools added yet.</p>'; return; }
        Object.keys(data).forEach(id => {
            const tool = data[id];
            html += `<button class="nav-btn" style="width:100%; border:1px solid #1a1a1a; flex-direction:column; align-items:flex-start; padding:12px;" onclick="window.openToolEditor('${id}')">
                <span style="font-size:13px; color:#fff; margin-bottom:5px;">${tool.name}</span>
                <span style="font-size:9px; color:${tool.visible ? '#00ffcc' : '#555'}; letter-spacing:1px;"><i class="fas fa-circle"></i> ${tool.visible ? 'LIVE' : 'HIDDEN'}</span>
            </button>`;
        });
        listGrid.innerHTML = html;
    });
};

window.openToolEditor = function(id) {
    const panel = document.getElementById('toolEditorPanel');
    panel.style.display = 'block';
    if(id === 'new') {
        document.getElementById('toolEditorTitle').innerText = "ADD NEW TOOL";
        document.getElementById('targetToolId').value = "tool_" + Date.now();
        document.getElementById('toolName').value = ""; document.getElementById('toolCode').value = "";
        window.setToolVisibility(true);
    } else {
        document.getElementById('toolEditorTitle').innerText = "EDIT TOOL";
        document.getElementById('targetToolId').value = id;
        db.ref('site_settings/tools/' + id).once('value', (snap) => {
            const tool = snap.val();
            document.getElementById('toolName').value = tool.name;
            document.getElementById('toolCode').value = tool.code;
            window.setToolVisibility(tool.visible);
        });
    }
};

window.setToolVisibility = function(isVisible) {
    window.currentToolVisibility = isVisible;
    document.getElementById('toolBtnVisible').style.background = isVisible ? "#00ffcc" : "#0a0a0a";
    document.getElementById('toolBtnHidden').style.background = !isVisible ? "var(--red)" : "#0a0a0a";
};

window.saveToolSettings = function() {
    const id = document.getElementById('targetToolId').value;
    const toolData = { name: document.getElementById('toolName').value, code: document.getElementById('toolCode').value, visible: window.currentToolVisibility, updatedAt: firebase.database.ServerValue.TIMESTAMP };
    db.ref('site_settings/tools/' + id).set(toolData).then(() => {
        Swal.fire({ icon: 'success', title: 'TOOL DEPLOYED', background: '#000', color: '#fff' });
        document.getElementById('toolEditorPanel').style.display = 'none';
    });
};
