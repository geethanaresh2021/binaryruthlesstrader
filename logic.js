// ================= ADMIN LOGIC =================

// Helper to get input by id
function getVal(id){ return document.getElementById(id)?.value || ""; }

// ================= VIEWS & REVENUE =================
function saveLogic(moduleName){
    console.log(`Saving module: ${moduleName}`);
    // Placeholder: Add specific logic if needed
}

// ================= ST RESIZE =================
function saveSTResize(){
    const width = getVal('screenWidth');
    const zoom = getVal('zoomDisable');
    window.updateCloudConfig('st_resize', { width, zoom });
    alert("✅ Screen & zoom saved!");
}

// ================= TOOLS MANAGER =================
function saveToolsManager(){
    const val = getVal('toolsManagerInput');
    window.updateCloudConfig('tools_manager', { val });
    alert("✅ Tools saved!");
}

// ================= SIGNAL CONNECTION =================
function saveSignalConn(){
    const url = getVal('sigUrl');
    const platform = getVal('sigPlat');
    window.updateCloudConfig('signal_connection', { url, platform });
    alert("✅ Signal connection saved!");
}

// ================= ADS NETWORK =================
function saveAdsNetwork(){
    const val = getVal('adsNetworkInput');
    window.updateCloudConfig('ads_network', { val });
    alert("✅ Ads network saved!");
}

// ================= ADS CONTAINERS =================
function saveAdsConfig(){
    const refresh = getVal('adRefresh');
    const script = getVal('adScript');
    window.updateCloudConfig('ads_containers', { refresh, script });
    alert("✅ Ads container saved!");
}

// ================= SOCIAL LINKS =================
function saveSocialLinks(){
    const tg = getVal('tgUrl');
    const yt = getVal('ytUrl');
    window.updateCloudConfig('social_links', { telegram: tg, youtube: yt });
    alert("✅ Social links saved!");
}

// ================= BRAND NAME =================
function saveBrandName(){
    const brand = getVal('brandTitle');
    window.updateCloudConfig('brand_name', { brand });
    alert("✅ Brand name saved!");
}

// ================= AFFILIATE =================
function saveAffiliate(){
    const val = getVal('affiliateInput');
    window.updateCloudConfig('affiliate', { val });
    alert("✅ Affiliate saved!");
}

// ================= WARNING NOTE =================
function saveWarningNoteToCloud(){
    const text = getVal('noteText');
    const speed = getVal('selectedNoteSpeed');
    window.updateCloudConfig('warning_note', { text, speed, status:true });
    alert("✅ Warning note saved!");
}

// ================= JOIN SECTION =================
function saveJoinSection(){
    const text = getVal('joinText');
    window.updateCloudConfig('join_section', { text });
    alert("✅ Join section saved!");
}

// ================= GIVEAWAY =================
function saveGiveawayToCloud(){
    const winner = getVal('winnerName');
    const speed = getVal('selectedSpeed');
    window.updateCloudConfig('giveaway', { content: winner, speed, status:true });
    alert("✅ Giveaway published!");
}
document.getElementById('hideBtn')?.addEventListener('click', ()=>{
    window.updateCloudConfig('giveaway', { status:false });
    alert("❌ Giveaway hidden!");
});

// ================= FIREBASE CONNECTION =================
function addNewFirebaseConfig(){
    const apiKey = getVal('apiKey');
    const authDomain = getVal('authDomain');
    const databaseURL = getVal('databaseURL');
    const projectId = getVal('projectId');

    window.updateCloudConfig('firebase_config', { apiKey, authDomain, databaseURL, projectId });
    alert("✅ Firebase config saved!");
}

// ================= VPS =================
function restartVPS(){
    saveLogic('VPS');
    alert("✅ VPS Restart triggered!");
}

// ================= SECURITY =================
function updateSecurity(){
    const pwd = getVal('securityInput');
    window.updateCloudConfig('security', { password: pwd });
    alert("✅ Security updated!");
}

// ================= EXPORT FUNCTIONS =================
window.saveSTResize = saveSTResize;
window.saveToolsManager = saveToolsManager;
window.saveSignalConn = saveSignalConn;
window.saveAdsNetwork = saveAdsNetwork;
window.saveAdsConfig = saveAdsConfig;
window.saveSocialLinks = saveSocialLinks;
window.saveBrandName = saveBrandName;
window.saveAffiliate = saveAffiliate;
window.saveWarningNoteToCloud = saveWarningNoteToCloud;
window.saveJoinSection = saveJoinSection;
window.saveGiveawayToCloud = saveGiveawayToCloud;
window.addNewFirebaseConfig = addNewFirebaseConfig;
window.restartVPS = restartVPS;
window.updateSecurity = updateSecurity;
