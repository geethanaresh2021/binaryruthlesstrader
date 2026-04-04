/* BINARY RUTHLESS TRADER - ADMIN PANEL CORE
    Platform: MetaTrader 5 (MT5) Integration
    Aesthetic: Dark (#0a0a0a), Red (#ff0000), Orbitron & Roboto Mono
*/

// --- GLOBAL STATE ---
window.currentAdVisibility = true;
window.currentToolVisibility = true;

// --- GIVEAWAY MODULE ---
function renderGiveawayModule() {
    const display = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    header.innerText = "GIVEAWAY MANAGER";

    display.innerHTML = `
    <div class="settings-panel" style="padding: 20px; background: #050505; border: 1px solid #1a1a1a;">
        <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">WINNER NAME / DETAILS</label>
        <input type="text" id="giveawayWinner" oninput="updateGiveawayPreview()" placeholder="ENTER WINNER..." 
            style="width:100%; padding:15px; background:#000; border:1px solid #333; color:#fff; font-family:'Orbitron'; margin-bottom:20px;">

        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1;">
                <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">TEXT COLOR</label>
                <input type="color" id="giveawayColor" value="#ff0000" oninput="updateGiveawayPreview()" style="width:100%; height:45px; background:none; border:none; cursor:pointer;">
            </div>
            <div style="flex: 1;">
                <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">SCROLL SPEED (0=STILL)</label>
                <input type="number" id="giveawaySpeed" value="5" oninput="updateGiveawayPreview()" style="width:100%; padding:12px; background:#000; border:1px solid #333; color:#00ffcc; font-weight:bold;">
            </div>
        </div>

        <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">LIVE PREVIEW</label>
        <div id="giveawayPreviewContent" style="height: 60px; background: #000; border: 1px dashed #444; display: flex; align-items: center; overflow: hidden; margin-bottom: 20px; font-family: 'Orbitron'; font-weight: 900; font-size: 20px;">
            <span style="width:100%; text-align:center;">PREVIEW HERE</span>
        </div>

        <button onclick="publishGiveaway()" style="width: 100%; padding: 15px; background: var(--red); color: #fff; border: none; font-family: 'Orbitron'; font-weight: 900; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 15px rgba(255,0,0,0.3);">
            PUBLISH GIVEAWAY
        </button>
    </div>`;
}

function updateGiveawayPreview() {
    const txt = document.getElementById('giveawayWinner').value || "PREVIEW HERE";
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value) || 0;
    const content = document.getElementById('giveawayPreviewContent');
    content.style.color = clr;

    if (spd === 0) {
        content.style.display = "flex";
        content.style.justifyContent = "center";
        content.innerHTML = `<span style="width:100%; text-align:center;">${txt}</span>`;
    } else {
        content.style.display = "block";
        content.innerHTML = `<marquee scrollamount="${spd}" style="width:100%; line-height:60px;">${txt}</marquee>`;
    }
}

function publishGiveaway() {
    const txt = document.getElementById('giveawayWinner').value;
    const clr = document.getElementById('giveawayColor').value;
    const spd = parseInt(document.getElementById('giveawaySpeed').value);

    if (!txt) {
        Swal.fire({ icon: 'error', title: 'EMPTY', text: 'Enter winner details!', background: '#0a0a0a', color: '#fff' });
        return;
    }

    db.ref('site_settings/giveaway').set({
        winner: txt, color: clr, speed: spd
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'LIVE', text: 'Giveaway Updated!', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ff0000' });
    });
}

// --- ADS & VERIFICATION MODULES ---
function loadAdsContainers() {
    const display = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    header.innerText = "ADS CONTAINERS MANAGER";

    let adsListHtml = '';
    for (let i = 1; i <= 8; i++) {
        adsListHtml += `
            <button class="action-btn block-btn" onclick="openAdEditor('adSlot${i}', 'AD CONTAINER ${i}')" style="background:#0a0a0a; border:1px solid #1a1a1a; color:#fff; padding:15px; cursor:pointer; font-family:'Orbitron'; font-size:12px;">
                <i class="fas fa-box" style="color:var(--red); margin-right:10px;"></i> AD CONTAINER ${i}
            </button>`;
    }

    display.innerHTML = `
    <div class="ads-panel" style="padding: 10px;">
        <div id="adsList" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            ${adsListHtml}
        </div>

        <div id="adEditorPanel" class="settings-panel" style="display: none; border: 1px solid #222; padding: 20px; background: #050505; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            <h3 id="editingAdTitle" style="color: var(--red); margin-bottom: 15px; font-family: 'Orbitron'; letter-spacing:1px;"></h3>
            <input type="hidden" id="targetAdId">

            <div style="margin-bottom: 20px; display: flex; gap: 10px;">
                <button id="btnVisible" onclick="setAdVisibility(true)" class="action-btn" style="flex:1; border:1px solid #333; padding:10px; font-family:'Orbitron';">VISIBLE</button>
                <button id="btnHidden" onclick="setAdVisibility(false)" class="action-btn" style="flex:1; border:1px solid #333; padding:10px; font-family:'Orbitron';">HIDE</button>
            </div>

            <button onclick="toggleManageSection()" class="action-btn" style="width:100%; background:#111; margin-bottom:15px; border:1px dashed #444; color:#888; padding:10px;">
                <i class="fas fa-cog"></i> MANAGE AD DETAILS
            </button>

            <div id="manageSection" style="display: none; border-top: 1px solid #222; padding-top: 15px; margin-bottom:15px;">
                <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">EDIT CONTAINER NAME</label>
                <input type="text" id="adNickname" style="width:100%; padding:10px; background:#000; border:1px solid #333; color:#fff; margin-bottom:15px;">

                <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">AD SNIPPET (CODE)</label>
                <textarea id="adSnippet" rows="5" style="width:100%; padding:10px; background:#000; border:1px solid #333; color:#00ffcc; font-family:'Roboto Mono'; font-weight:bold; margin-bottom:15px;" placeholder="Paste Ad Code..."></textarea>

                <label style="color: #888; font-size: 10px; font-family: 'Orbitron';">SELECT SIZE</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 15px;">
                    <button class="action-btn" onclick="setPresetSize('320px','50px')" style="font-size:10px;">320x50</button>
                    <button class="action-btn" onclick="setPresetSize('320px','100px')" style="font-size:10px;">320x100</button>
                    <button class="action-btn" onclick="enableCustomSize()" style="font-size:10px;">CUSTOM</button>
                </div>

                <div id="customSizeInputs" style="display: none; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="customWidth" placeholder="W (e.g. 300px)" style="flex:1; padding:10px; background:#000; border:1px solid #333; color:#fff;">
                    <input type="text" id="customHeight" placeholder="H (e.g. 250px)" style="flex:1; padding:10px; background:#000; border:1px solid #333; color:#fff;">
                </div>
            </div>

            <button onclick="saveAdSettings()" class="publish-btn" style="width: 100%; padding: 15px; background: var(--red); border:none; color:#fff; font-family:'Orbitron'; font-weight:900; cursor:pointer; text-transform:uppercase;">
                SAVE & UPDATE HOME PAGE
            </button>
        </div>
    </div>`;
}

// --- SIGNAL CONNECTION LOGIC (RUTHLESS MT5) ---
function renderSignalManager() {
    const display = document.getElementById('mainDisplay');
    const header = document.querySelector('#panelHeader h1');
    header.innerText = "MT5 SIGNAL CONNECTION";

    display.innerHTML = `
    <div class="settings-panel" style="padding: 20px; background: #050505; border: 1px solid #1a1a1a;">
        <div style="background:#111; padding:15px; border-left:4px solid var(--red); margin-bottom:20px;">
            <h4 style="color:#fff; font-family:'Orbitron'; margin:0;">SIGNAL STATUS: <span id="sigStatus" style="color:#00ffcc;">LISTENING...</span></h4>
            <small style="color:#555; font-family:'Roboto Mono';">MT5 Lead Time: 10 Seconds</small>
        </div>

        <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">TELEGRAM BOT TOKEN</label>
        <input type="text" id="tgToken" placeholder="Enter Bot Token..." style="width:100%; padding:12px; background:#000; border:1px solid #333; color:#fff; font-family:'Roboto Mono'; margin-bottom:15px;">

        <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">TELEGRAM CHANNEL ID</label>
        <input type="text" id="tgChatId" placeholder="-100xxxxxxxxx" style="width:100%; padding:12px; background:#000; border:1px solid #333; color:#fff; font-family:'Roboto Mono'; margin-bottom:15px;">

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px;">
            <button onclick="saveSignalConfig()" class="action-btn" style="background:#00ffcc; color:#000; font-weight:bold; font-family:'Orbitron';">UPDATE CONFIG</button>
            <button onclick="testSignal()" class="action-btn" style="border:1px solid #444; font-family:'Orbitron';">SEND TEST</button>
        </div>

        <label style="color: #888; font-family: 'Orbitron'; font-size: 10px;">LIVE SIGNAL LOG (LAST 5 MINS)</label>
        <div id="signalLogs" style="height:150px; background:#000; border:1px solid #222; overflow-y:auto; padding:10px; font-family:'Roboto Mono'; font-size:11px; color:#00ffcc;">
            [SYSTEM] Awaiting next MT5 cycle...
        </div>
    </div>`;
    
    loadSignalLogs();
}

function saveSignalConfig() {
    const token = document.getElementById('tgToken').value;
    const chatId = document.getElementById('tgChatId').value;

    db.ref('site_settings/signals/config').set({
        botToken: token,
        chatId: chatId,
        leadTime: 10,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        Swal.fire({ icon: 'success', title: 'CONFIG SAVED', background: '#000', color: '#fff' });
    });
}

function loadSignalLogs() {
    db.ref('signals').limitToLast(10).on('value', (snap) => {
        const logBox = document.getElementById('signalLogs');
        if(!logBox) return;
        let logs = '';
        snap.forEach(child => {
            const sig = child.val();
            logs += `<div>[${sig.time}] ${sig.pair} - ${sig.direction} (MTG: ${sig.mtg})</div>`;
        });
        logBox.innerHTML = logs;
    });
}

// --- GLOBAL UTILITIES (ADS / TOOLS / VERIFY) ---

window.setAdVisibility = function(isVisible) {
    window.currentAdVisibility = isVisible;
    const vBtn = document.getElementById('btnVisible');
    const hBtn = document.getElementById('btnHidden');
    if(!vBtn) return;
    vBtn.style.background = isVisible ? "var(--red)" : "#0a0a0a";
    vBtn.style.boxShadow = isVisible ? "0 0 15px var(--red)" : "none";
    hBtn.style.background = !isVisible ? "var(--red)" : "#0a0a0a";
    hBtn.style.boxShadow = !isVisible ? "0 0 15px var(--red)" : "none";
};

window.openAdEditor = function(id, title) {
    const panel = document.getElementById('adEditorPanel');
    panel.style.display = 'block';
    document.getElementById('editingAdTitle').innerText = title;
    document.getElementById('targetAdId').value = id;

    db.ref('site_settings/ads/' + id).once('value', (snapshot) => {
        const data = snapshot.val() || {};
        document.getElementById('adNickname').value = data.name || title;
        document.getElementById('adSnippet').value = data.snippet || "";
        document.getElementById('customWidth').value = data.width || "320px";
        document.getElementById('customHeight').value = data.height || "50px";
        window.setAdVisibility(data.visible !== false);
    });
    panel.scrollIntoView({ behavior: 'smooth' });
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

function toggleManageSection() {
    const sec = document.getElementById('manageSection');
    sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}

function setPresetSize(w, h) {
    document.getElementById('customSizeInputs').style.display = 'none';
    document.getElementById('customWidth').value = w;
    document.getElementById('customHeight').value = h;
}

function enableCustomSize() {
    document.getElementById('customSizeInputs').style.display = 'flex';
}

// Initial Call to setup view
// window.onload = () => { loadAdsContainers(); };
