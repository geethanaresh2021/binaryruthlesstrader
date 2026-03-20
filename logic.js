// ================= GLOBAL =================
function showModule(id) {
    document.querySelectorAll('.module-section').forEach(el => {
        el.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
}

// Sidebar loader
function loadContent(moduleName) {
    showModule(moduleName);
    localStorage.setItem('activeModule', moduleName);
}

// ================= INIT =================
window.onload = () => {
    const last = localStorage.getItem('activeModule') || 'Views';
    showModule(last);
};

// ================= SIMPLE ALERT =================
function saveLogic() {
    alert("UPDATED SUCCESSFULLY");
}

// ================= ST RESIZE =================
function saveSTResize() {
    const data = {
        width: document.getElementById('screenWidth').value,
        zoom: document.getElementById('zoomDisable').value
    };

    localStorage.setItem('stResize', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/layout', data);
    }

    saveLogic();
}

// ================= SIGNAL CONNECTION =================
function saveSignalConn() {
    const data = {
        url: document.getElementById('sigUrl').value,
        platform: document.getElementById('sigPlat').value
    };

    localStorage.setItem('signalConn', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/signals', data);
    }

    saveLogic();
}

// ================= ADS =================
function saveAdsConfig() {
    const data = {
        refresh: document.getElementById('adRefresh').value,
        script: document.getElementById('adScript').value
    };

    localStorage.setItem('adsConfig', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/ads', data);
    }

    saveLogic();
}

// ================= SOCIAL =================
function saveSocialLinks() {
    const data = {
        telegram: document.getElementById('tgUrl').value,
        youtube: document.getElementById('ytUrl').value
    };

    localStorage.setItem('socialLinks', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/socials', data);
    }

    saveLogic();
}

// ================= BRAND =================
function saveBrandName() {
    const data = {
        title: document.getElementById('brandTitle').value
    };

    localStorage.setItem('brandName', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/brand', data);
    }

    saveLogic();
}

// ================= JOIN =================
function saveJoinSection() {
    const data = {
        text: document.getElementById('joinText').value
    };

    localStorage.setItem('joinSection', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/join', data);
    }

    saveLogic();
}

// ================= GIVEAWAY =================
function saveGiveawayToCloud() {

    const text = document.getElementById('winnerName').value;
    const speed = parseInt(document.getElementById('selectedSpeed').value) || 0;

    const isVisible = document.getElementById('hideBtn').innerText.includes('HIDE');

    const data = {
        content: text,
        speed: speed,
        status: isVisible,
        timestamp: Date.now()
    };

    // local backup
    localStorage.setItem('giveawayData', JSON.stringify(data));

    // cloud
    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/giveaway', data);
    }

    saveLogic();
}

// ================= WARNING NOTE =================
function saveWarningNoteToCloud() {

    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value) || 0;

    const status = true; // always visible unless hidden later

    const data = {
        text: text,
        speed: speed,
        status: status,
        updatedAt: Date.now()
    };

    localStorage.setItem('warningNoteData', JSON.stringify(data));

    if (window.updateCloudConfig) {
        window.updateCloudConfig('site_settings/warning_note', data);
    }

    saveLogic();
}

// ================= FIREBASE CONFIG =================
function addNewFirebaseConfig() {

    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value
    };

    if (!config.projectId || !config.apiKey || !config.databaseURL) {
        alert("Fill required fields");
        return;
    }

    let list = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');

    list = list.filter(c => c.projectId !== config.projectId);
    list.push(config);

    localStorage.setItem('firebaseConfigsList', JSON.stringify(list));

    activateConfig(config.projectId);
}

// ================= ACTIVATE FIREBASE =================
function activateConfig(pid) {

    const list = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    const target = list.find(c => c.projectId === pid);

    if (target) {
        localStorage.setItem('activeFirebaseId', pid);
        localStorage.setItem('firebaseConfig', JSON.stringify(target));

        if (window.saveFirebaseSettings) {
            window.saveFirebaseSettings(target);
        }

        alert("CONNECTED: " + pid);
    }
}

// ================= DELETE CONFIG =================
function deleteConfig(pid) {

    let list = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
    list = list.filter(c => c.projectId !== pid);

    localStorage.setItem('firebaseConfigsList', JSON.stringify(list));

    if (localStorage.getItem('activeFirebaseId') === pid) {
        localStorage.removeItem('activeFirebaseId');
        localStorage.removeItem('firebaseConfig');
    }

    saveLogic();
}

// ================= BUTTON HELPERS =================
function setGiveawaySpeed(speed) {
    document.getElementById('selectedSpeed').value = speed;
}

function toggleGiveawayVisibility() {
    const btn = document.getElementById('hideBtn');

    if (btn.innerText === 'HIDE') {
        btn.innerText = 'SHOW';
    } else {
        btn.innerText = 'HIDE';
    }
}

function setNoteSpeed(speed) {
    document.getElementById('selectedNoteSpeed').value = speed;
}

function toggleNoteVisibility() {
    const btn = document.getElementById('noteStatusBtn');

    if (btn.innerText.includes('HIDE')) {
        btn.innerText = 'SHOW ON SITE';
    } else {
        btn.innerText = 'HIDE FROM SITE';
    }
}
