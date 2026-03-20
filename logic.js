// --- CORE LOGIC FUNCTIONS ---
function saveLogic() {
    Swal.fire({ icon:'success', title:'UPDATED', background:'#0a0a0a', color:'#fff' });
}

// ===== ST Resize =====
function saveSTResize() {
    const data = { width: document.getElementById('screenWidth').value, noZoom: document.getElementById('zoomDisable').value };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/layout', data);
    saveLogic();
}

// ===== Brand Name =====
function saveBrandName() {
    const title = document.getElementById('brandTitle').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/brand', { title });
    saveLogic();
}

// ===== Social Links =====
function saveSocialLinks() {
    const telegram = document.getElementById('tgUrl').value;
    const youtube = document.getElementById('ytUrl').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/socials', { telegram, youtube });
    saveLogic();
}

// ===== Ads Config =====
function saveAdsConfig() {
    const refresh = document.getElementById('adRefresh').value;
    const script = document.getElementById('adScript').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/ads', { refresh, script });
    saveLogic();
}

// ===== Signal Connection =====
function saveSignalConn() {
    const url = document.getElementById('sigUrl').value;
    const platform = document.getElementById('sigPlat').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/signals', { url, platform });
    saveLogic();
}

// ===== Join Section =====
function saveJoinSection() {
    const text = document.getElementById('joinText').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/join', { text });
    saveLogic();
}

// ===== Warning Note =====
function saveWarningNoteToCloud() {
    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value) || 2;
    const status = document.getElementById('noteStatusBtn')?.innerText.includes('HIDE') || true;
    const noteData = { text, speed, status, updatedAt: new Date().getTime() };
    localStorage.setItem('warningNoteData', JSON.stringify(noteData));
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/warning_note', noteData);
    Swal.fire({ icon:'success', title:'WARNING UPDATED', text:'Warning note is live!', background:'#0a0a0a', color:'#fff', confirmButtonColor:'#ff0000' });
}

// ===== Giveaway =====
function saveGiveawayToCloud() {
    const name = document.getElementById('winnerName').value;
    const speed = parseInt(document.getElementById('selectedSpeed').value) || 2;
    const status = document.getElementById('hideBtn').innerText === 'SHOW';
    const data = { name, speed, status, updatedAt: new Date().getTime() };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/giveaway', data);
    Swal.fire({ icon:'success', title:'GIVEAWAY PUBLISHED', background:'#0a0a0a', color:'#fff' });
}

// ===== Firebase Config =====
function addNewFirebaseConfig() {
    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value
    };

    if(!config.projectId || !config.apiKey || !config.databaseURL){
        Swal.fire({ icon:'error', title:'MISSING DATA', text:'Fill Project ID, API Key, DB URL', background:'#0a0a0a', color:'#fff' });
        return;
    }

    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    configs = configs.filter(c=>c.projectId!==config.projectId);
    configs.push(config);
    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
    activateConfig(config.projectId);
}

function activateConfig(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList')||'[]');
    const target = configs.find(c=>c.projectId===pid);
    if(target){
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));
        if(window.saveFirebaseSettings) window.saveFirebaseSettings(target);
        Swal.fire({ icon:'success', title:'SYSTEM ONLINE', text:`Connected to: ${pid}`, background:'#0a0a0a', color:'#fff', confirmButtonColor:'#ff0000' });
    }
}

function deleteConfig(pid){
    Swal.fire({
        title:'DELETE DATABASE?',
        text:"Credentials will be removed.",
        icon:'warning', showCancelButton:true,
        confirmButtonColor:'#ff0000', cancelButtonColor:'#333',
        background:'#050505', color:'#fff'
    }).then(result=>{
        if(result.isConfirmed){
            let configs = JSON.parse(localStorage.getItem('firebaseConfigsList')||'[]');
            configs = configs.filter(c=>c.projectId!==pid);
            localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
            if(localStorage.getItem('activeFirebaseId')===pid){
                localStorage.removeItem('activeFirebaseId');
                localStorage.removeItem('firebaseConfig');
            }
        }
    });
}
