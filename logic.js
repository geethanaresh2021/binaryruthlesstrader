// --- SAVE LOGIC HELPER ---
function showSuccess(msg = 'Updated!') {
    Swal.fire({
        icon: 'success',
        title: msg,
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ff0000'
    });
}

// --- SAVE FUNCTIONS ---
window.saveSTResize = function() {
    const data = { 
        width: document.getElementById('screenWidth').value,
        noZoom: document.getElementById('zoomDisable').value
    };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/layout', data);
    showSuccess('ST Resize Saved');
};

window.saveBrandName = function() {
    const title = document.getElementById('brandTitle').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/brand', { title });
    showSuccess('Brand Name Saved');
};

window.saveSocialLinks = function() {
    const data = {
        telegram: document.getElementById('tgUrl').value,
        youtube: document.getElementById('ytUrl').value
    };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/socials', data);
    showSuccess('Social Links Saved');
};

window.saveAdsConfig = function() {
    const data = {
        refresh: document.getElementById('adRefresh').value,
        script: document.getElementById('adScript').value
    };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/ads', data);
    showSuccess('Ads Config Saved');
};

window.saveSignalConn = function() {
    const data = {
        url: document.getElementById('sigUrl').value,
        platform: document.getElementById('sigPlat').value
    };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/signals', data);
    showSuccess('Signal Connection Saved');
};

window.saveJoinSection = function() {
    const text = document.getElementById('joinText').value;
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/join', { text });
    showSuccess('Join Section Saved');
};

window.saveWarningNoteToCloud = function() {
    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value);
    const status = true; // Always show on site for admin save
    const noteData = { text, speed, status, updatedAt: new Date().getTime() };

    localStorage.setItem('warningNoteData', JSON.stringify(noteData));

    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/warning_note', noteData);
    showSuccess('Warning Note Saved');
};

window.saveGiveawayToCloud = function() {
    const winner = document.getElementById('winnerName').value;
    const speed = parseInt(document.getElementById('selectedSpeed').value) || 0;
    const status = document.getElementById('hideBtn').innerText === 'SHOW';

    const data = { Content: winner, speed, status, updatedAt: new Date().getTime() };
    if(window.updateCloudConfig) window.updateCloudConfig('site_settings/giveaway', data);
    showSuccess('Giveaway Updated');
};

document.getElementById('hideBtn')?.addEventListener('click', () => {
    const btn = document.getElementById('hideBtn');
    btn.innerText = btn.innerText === 'HIDE' ? 'SHOW' : 'HIDE';
});

// --- GENERIC SAVE FOR OTHER MODULES ---
window.saveLogic = function(msg = 'Updated!') { showSuccess(msg); };

// --- FIREBASE CONFIG ---
window.addNewFirebaseConfig = function() {
    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value
    };

    if(!config.projectId || !config.apiKey || !config.databaseURL) {
        Swal.fire({ icon: 'error', title: 'MISSING DATA', text: 'ProjectID, APIKey, DatabaseURL required.', background:'#0a0a0a', color:'#fff'});
        return;
    }

    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList')||'[]');
    configs = configs.filter(c=>c.projectId!==config.projectId);
    configs.push(config);

    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
    activateConfig(config.projectId);
};

window.activateConfig = function(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList')||'[]');
    const target = configs.find(c=>c.projectId===pid);

    if(target) {
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));
        if(window.saveFirebaseSettings) window.saveFirebaseSettings(target);

        Swal.fire({
            icon:'success',
            title:'SYSTEM ONLINE',
            text:`Connected to ${pid}`,
            background:'#0a0a0a',
            color:'#fff',
            confirmButtonColor:'#ff0000'
        });
    }
};

window.deleteConfig = function(pid){
    Swal.fire({
        title:'DELETE DATABASE?',
        text:"Credentials will be removed",
        icon:'warning', showCancelButton:true,
        confirmButtonColor:'#ff0000', cancelButtonColor:'#333',
        background:'#050505', color:'#fff'
    }).then(res=>{
        if(res.isConfirmed){
            let configs = JSON.parse(localStorage.getItem('firebaseConfigsList')||'[]');
            configs = configs.filter(c=>c.projectId!==pid);
            localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
            if(localStorage.getItem('activeFirebaseId')===pid){
                localStorage.removeItem('activeFirebaseId');
                localStorage.removeItem('firebaseConfig');
            }
            showSuccess('Firebase Config Deleted');
        }
    });
};
