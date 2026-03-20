function showModule(id){
document.querySelectorAll('.module-section').forEach(e=>e.style.display='none');
document.getElementById(id).style.display='block';
}
function loadContent(m){showModule(m);localStorage.setItem('activeModule',m);}
window.onload=()=>showModule(localStorage.getItem('activeModule')||'Views');

function saveLogic(){alert("UPDATED");}

// ===== ALL FUNCTIONS =====
function saveSTResize(){
let d={width:screenWidth.value,zoom:zoomDisable.value};
localStorage.setItem('layout',JSON.stringify(d));
updateCloudConfig('site_settings/layout',d);
saveLogic();
}

function saveSignalConn(){
let d={url:sigUrl.value,platform:sigPlat.value};
updateCloudConfig('site_settings/signals',d);
saveLogic();
}

function saveAdsConfig(){
let d={refresh:adRefresh.value,script:adScript.value};
updateCloudConfig('site_settings/ads',d);
saveLogic();
}

function saveSocialLinks(){
let d={telegram:tgUrl.value,youtube:ytUrl.value};
updateCloudConfig('site_settings/socials',d);
saveLogic();
}

function saveBrandName(){
updateCloudConfig('site_settings/brand',{title:brandTitle.value});
saveLogic();
}

function saveJoinSection(){
updateCloudConfig('site_settings/join',{text:joinText.value});
saveLogic();
}

function saveGiveawayToCloud(){
let d={
content:winnerName.value,
speed:parseInt(selectedSpeed.value)||0,
status:hideBtn.innerText==="HIDE"
};
updateCloudConfig('site_settings/giveaway',d);
saveLogic();
}

function toggleGiveawayVisibility(){
hideBtn.innerText=hideBtn.innerText==="HIDE"?"SHOW":"HIDE";
}

function saveWarningNoteToCloud(){
let d={
text:noteText.value,
speed:parseInt(selectedNoteSpeed.value)||0,
status:true
};
updateCloudConfig('site_settings/warning_note',d);
saveLogic();
}

function addNewFirebaseConfig(){
let c={apiKey:apiKey.value,authDomain:authDomain.value,databaseURL:databaseURL.value,projectId:projectId.value};
localStorage.setItem('firebaseConfig',JSON.stringify(c));
alert("Saved Firebase");
}
