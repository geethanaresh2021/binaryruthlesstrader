// ================= GLOBAL LOAD =================
window.onload = () => {
    const lastModule = localStorage.getItem('activeModule') || 'Views';
    loadContent(lastModule);
};

// ================= NAVIGATION =================
function loadContent(moduleName) {
    localStorage.setItem('activeModule', moduleName);

    document.querySelectorAll('.module-section').forEach(sec => {
        sec.style.display = 'none';
    });

    const target = document.getElementById(moduleName.replace(/\s/g,''));
    if(target) target.style.display = 'block';
}

// ================= BASIC SUCCESS =================
function saveLogic() {
    Swal.fire({
        icon: 'success',
        title: 'UPDATED',
        background: '#0a0a0a',
        color: '#fff'
    });
}

// ================= ST RESIZE =================
function saveSTResize() {
    const data = {
        width: document.getElementById('screenWidth').value,
        noZoom: document.getElementById('zoomDisable').value
    };
    updateCloudConfigSafe('site_settings/layout', data);
}

// ================= BRAND =================
function saveBrandName() {
    updateCloudConfigSafe('site_settings/brand', {
        title: document.getElementById('brandTitle').value
    });
}

// ================= SOCIAL =================
function saveSocialLinks() {
    updateCloudConfigSafe('site_settings/socials', {
        telegram: document.getElementById('tgUrl').value,
        youtube: document.getElementById('ytUrl').value
    });
}

// ================= ADS =================
function saveAdsConfig() {
    updateCloudConfigSafe('site_settings/ads', {
        refresh: document.getElementById('adRefresh').value,
        script: document.getElementById('adScript').value
    });
}

// ================= SIGNAL =================
function saveSignalConn() {
    updateCloudConfigSafe('site_settings/signals', {
        url: document.getElementById('sigUrl').value,
        platform: document.getElementById('sigPlat').value
    });
}

// ================= JOIN =================
function saveJoinSection() {
    updateCloudConfigSafe('site_settings/join', {
        text: document.getElementById('joinText').value
    });
}

// ================= COMMON CLOUD HELPER =================
function updateCloudConfigSafe(path, data) {
    if (window.updateCloudConfig) {
        window.updateCloudConfig(path, data);
        saveLogic();
    } else {
        alert("Firebase not connected!");
    }
}

// ================= GIVEAWAY =================

// speed select
window.setGiveawaySpeed = function(speed) {
    document.getElementById('selectedSpeed').value = speed;

    for(let i=0;i<=5;i++){
        const btn = document.getElementById(`speedBtn${i}`);
        if(btn) btn.style.background = (i===speed)?'var(--red)':'#111';
    }

    updateGiveawayPreview();
};

// preview update
function updateGiveawayPreview() {
    const text = document.getElementById('winnerName').value;
    const speed = parseInt(document.getElementById('selectedSpeed')?.value || 0);
    const preview = document.getElementById('previewContent');

    if(!preview) return;

    if(speed === 0){
        preview.innerHTML = `<div style="text-align:center">${text}</div>`;
    } else {
        preview.innerHTML = `<marquee scrollamount="${speed}">${text}</marquee>`;
    }
}

// toggle visibility
function toggleGiveawayVisibility() {
    const btn = document.getElementById('hideBtn');
    const isHide = btn.innerText.includes('HIDE');

    btn.innerText = isHide ? 'SHOW ON SITE' : 'HIDE FROM SITE';
    btn.style.background = isHide ? '#444' : '#660000';
}

// save
function saveGiveawayToCloud() {
    const winnerText = document.getElementById('winnerName').value;
    const speed = parseInt(document.getElementById('selectedSpeed')?.value || 0);
    const status = document.getElementById('hideBtn')?.innerText.includes('HIDE');

    const data = {
        content: winnerText,
        speed: speed,
        status: status,
        timestamp: new Date().getTime()
    };

    localStorage.setItem('giveawayData', JSON.stringify(data));

    updateCloudConfigSafe('site_settings/giveaway', data);

    Swal.fire({
        icon:'success',
        title:'LIVE PUBLISHED',
        text:`Speed: ${speed}`,
        background:'#0a0a0a',
        color:'#fff'
    });
}

// ================= WARNING NOTE =================

// preview
window.updateNotePreview = function() {
    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value);
    const preview = document.getElementById('notePreviewText');

    if(!preview) return;

    if(speed === 0){
        preview.innerHTML = `<div style="text-align:center">${text}</div>`;
    } else {
        preview.innerHTML = `<marquee scrollamount="${speed}">${text}</marquee>`;
    }
};

// speed
window.setNoteSpeed = function(speed) {
    document.getElementById('selectedNoteSpeed').value = speed;

    for(let i=0;i<=5;i++){
        const btn = document.getElementById(`noteSpeedBtn${i}`);
        if(btn) btn.style.background = (i===speed)?'var(--red)':'#111';
    }

    updateNotePreview();
};

// toggle
window.toggleNoteVisibility = function() {
    const btn = document.getElementById('noteStatusBtn');
    const isHidden = btn.innerText.includes('HIDE');

    btn.innerText = isHidden ? 'SHOW ON SITE' : 'HIDE FROM SITE';
    btn.style.background = isHidden ? '#444' : '#660000';
};

// save
window.saveWarningNoteToCloud = function() {
    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value);
    const status = document.getElementById('noteStatusBtn').innerText.includes('HIDE');

    const data = {
        text: text,
        speed: speed,
        status: status,
        updatedAt: new Date().getTime()
    };

    localStorage.setItem('warningNoteData', JSON.stringify(data));

    updateCloudConfigSafe('site_settings/warning_note', data);

    Swal.fire({
        icon:'success',
        title:'WARNING UPDATED',
        background:'#0a0a0a',
        color:'#fff'
    });
};

// ================= FIREBASE =================

// add config
function addNewFirebaseConfig() {
    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value,
        storageBucket: document.getElementById('storageBucket')?.value,
        messagingSenderId: document.getElementById('messagingSenderId')?.value,
        appId: document.getElementById('appId')?.value,
        measurementId: document.getElementById('measurementId')?.value
    };

    if(!config.projectId || !config.apiKey || !config.databaseURL){
        Swal.fire({icon:'error',title:'Missing Data'});
        return;
    }

    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    configs = configs.filter(c=>c.projectId!==config.projectId);
    configs.push(config);

    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));

    activateConfig(config.projectId);
}

// activate
function activateConfig(pid) {
    const configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const target = configs.find(c=>c.projectId===pid);

    if(target){
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));

        Swal.fire({
            icon:'success',
            title:'SYSTEM ONLINE',
            text:`Connected: ${pid}`
        });
    }
}

// delete
function deleteConfig(pid) {
    let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    configs = configs.filter(c=>c.projectId!==pid);

    localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));

    if(localStorage.getItem('activeFirebaseId')===pid){
        localStorage.removeItem('activeFirebaseId');
        localStorage.removeItem('firebaseConfig');
    }

    saveLogic();
}
