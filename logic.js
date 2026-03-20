// --- LOAD MODULE ---
function loadContent(moduleId) {
    const sections = document.querySelectorAll('.module-section');
    sections.forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(moduleId);
    if (target) target.style.display = 'block';
    localStorage.setItem('activeModule', moduleId);
}

// --- FIREBASE CONFIG MANAGEMENT ---
function addNewFirebaseConfig() {
    const config = {
        apiKey: document.getElementById('apiKey').value,
        authDomain: document.getElementById('authDomain').value,
        databaseURL: document.getElementById('databaseURL').value,
        projectId: document.getElementById('projectId').value
    };

    if (!config.projectId || !config.apiKey || !config.databaseURL) {
        Swal.fire({
            icon: 'error',
            title: 'MISSING DATA',
            text: 'Fill Project ID, API Key, and Database URL',
            background: '#0a0a0a',
            color: '#fff'
        });
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
    if (!target) return;

    localStorage.setItem('activeFirebaseId', pid);
    localStorage.setItem('firebaseConfig', JSON.stringify(target));

    if (window.saveFirebaseSettings) window.saveFirebaseSettings(target);

    Swal.fire({
        icon: 'success',
        title: 'SYSTEM ONLINE',
        text: `Connected to: ${pid}`,
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ff0000'
    });
}

// --- DELETE CONFIG ---
function deleteConfig(pid) {
    Swal.fire({
        title: 'DELETE DATABASE?',
        text: "Credentials will be removed from local memory.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff0000',
        cancelButtonColor: '#333',
        background: '#050505',
        color: '#fff'
    }).then(result => {
        if (result.isConfirmed) {
            let configs = JSON.parse(localStorage.getItem('firebaseConfigsList') || '[]');
            configs = configs.filter(c => c.projectId !== pid);
            localStorage.setItem('firebaseConfigsList', JSON.stringify(configs));
            if (localStorage.getItem('activeFirebaseId') === pid) {
                localStorage.removeItem('activeFirebaseId');
                localStorage.removeItem('firebaseConfig');
            }
        }
    });
}

// --- SAVE LOGIC PLACEHOLDERS ---
function saveLogic() {
    Swal.fire({ icon: 'success', title: 'UPDATED', background: '#0a0a0a', color: '#fff' });
}

function saveSTResize() {
    const data = {
        width: document.getElementById('screenWidth').value,
        noZoom: document.getElementById('zoomDisable').value
    };
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/layout', data);
    saveLogic();
}

function saveBrandName() {
    const title = document.getElementById('brandTitle').value;
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/brand', { title });
    saveLogic();
}

function saveSocialLinks() {
    const data = {
        telegram: document.getElementById('tgUrl').value,
        youtube: document.getElementById('ytUrl').value
    };
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/socials', data);
    saveLogic();
}

function saveAdsConfig() {
    const data = {
        refresh: document.getElementById('adRefresh').value,
        script: document.getElementById('adScript').value
    };
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/ads', data);
    saveLogic();
}

function saveSignalConn() {
    const data = {
        url: document.getElementById('sigUrl').value,
        platform: document.getElementById('sigPlat').value
    };
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/signals', data);
    saveLogic();
}

function saveJoinSection() {
    const text = document.getElementById('joinText').value;
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/join', { text });
    saveLogic();
}

// --- WARNING NOTE ---
function saveWarningNoteToCloud() {
    const text = document.getElementById('noteText').value;
    const speed = parseInt(document.getElementById('selectedNoteSpeed').value) || 0;
    const noteData = { text, speed, status: true, updatedAt: new Date().getTime() };

    localStorage.setItem('warningNoteData', JSON.stringify(noteData));
    if (window.updateCloudConfig) window.updateCloudConfig('site_settings/warning_note', noteData);

    Swal.fire({
        icon: 'success',
        title: 'WARNING UPDATED',
        text: 'Warning note is now live!',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#ff0000'
    });
}

// --- WINDOW ONLOAD MODULE MEMORY ---
window.onload = () => {
    const lastModule = localStorage.getItem('activeModule') || 'Views';
    loadContent(lastModule);
};
