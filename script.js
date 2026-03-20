// TOP OF script.js
import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// --- Global Logic for Firebase & UI ---
function loadContent(moduleName) {
    localStorage.setItem('activeModule', moduleName);

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === moduleName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.getElementById('panelHeader').innerHTML = `
        <h1>${moduleName}</h1>
        <p>MANAGING ${moduleName.toUpperCase()} MODULE SETTINGS AND DATA.</p>
    `;

    const mainDisplay = document.getElementById('mainDisplay');

    switch (moduleName) {
        case 'Firebase':
            renderFirebaseModule();
            break;
            
        default:
            mainDisplay.innerHTML = `
                <div class="placeholder-card">
                    <i class="fas fa-sync fa-spin" style="color:var(--red); font-size:24px; margin-bottom:15px;"></i><br>
                    [ ${moduleName.toUpperCase()} MODULE LOADED ]<br>
                    <small style="color:#555; margin-top:10px; display:block;">READY TO SYNC WITH FIREBASE DATABASE.</small>
                </div>
            `;
    }
}

// --- Firebase Specific Logic ---
function renderFirebaseModule() {
    const savedConfigs = JSON.parse(localStorage.getItem('fb_configs') || '[]');
    const activeIndex = localStorage.getItem('fb_active_index');

    const fbStyle = `
        <style>
            .fb-container { display: flex; flex-direction: column; gap: 20px; }
            .fb-card { background: #000; border: 1px solid #1a1a1a; padding: 25px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
            .fb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .fb-input { 
                background: #080808; border: 1px solid #222; padding: 12px; 
                color: #00ffcc; font-family: 'Roboto Mono'; font-weight: bold; 
                font-size: 13px; border-radius: 4px; transition: 0.3s;
            }
            .fb-input:focus { border-color: var(--red); box-shadow: 0 0 10px rgba(255,0,0,0.2); }
            .status-btn { 
                padding: 6px 12px; font-size: 10px; border-radius: 20px; 
                font-family: 'Roboto Mono'; border: none; font-weight: 900;
            }
            .status-online { background: rgba(0,255,0,0.1); color: #00ff00; border: 1px solid #00ff00; box-shadow: 0 0 10px rgba(0,255,0,0.3); }
            .status-offline { background: rgba(255,0,0,0.1); color: #ff0000; border: 1px solid #ff0000; }
            .fb-list-item { 
                background: #0a0a0a; padding: 15px; border: 1px solid #111; 
                margin-bottom: 8px; display: flex; justify-content: space-between; 
                align-items: center; border-left: 4px solid #333;
            }
            .fb-list-item.active-item { border-left-color: var(--red); background: #110000; }
            .join-btn {
                background: var(--red); color: #fff; border: none; border-radius: 4px;
                font-family: 'Orbitron'; cursor: pointer; transition: 0.2s;
                width: 100%; height: 45px; font-size: 14px;
            }
        </style>
    `;

    let listHtml = savedConfigs.map((cfg, index) => `
        <div class="fb-list-item ${activeIndex == index ? 'active-item' : ''}">
            <div>
                <div style="font-size: 12px; color: #fff;">${cfg.projectId}</div>
                <div style="font-size: 10px; color: #444;">${cfg.authDomain}</div>
            </div>
            <div class="status-btn ${activeIndex == index ? 'status-online' : 'status-offline'}">
                ${activeIndex == index ? '● CONNECTED' : '○ NOT CONNECTED'}
            </div>
        </div>
    `).join('');

    document.getElementById('mainDisplay').innerHTML = fbStyle + `
        <div class="fb-container">
            <div class="fb-card">
                <h2 style="font-size: 14px; color: var(--red); margin-bottom: 20px; letter-spacing: 2px;">ADD NEW FIREBASE CONFIG</h2>
                <div class="fb-grid">
                    <input type="text" id="apiKey" class="fb-input" placeholder="apiKey">
                    <input type="text" id="authDomain" class="fb-input" placeholder="authDomain">
                    <input type="text" id="projectId" class="fb-input" placeholder="projectId">
                    <input type="text" id="storageBucket" class="fb-input" placeholder="storageBucket">
                    <input type="text" id="messagingSenderId" class="fb-input" placeholder="messagingSenderId">
                    <input type="text" id="appId" class="fb-input" placeholder="appId">
                </div>
                <button class="join-btn" onclick="saveFirebaseConfig()">CONNECT & SAVE</button>
            </div>
            <div class="fb-card">
                <h2 style="font-size: 14px; color: #fff; margin-bottom: 15px; letter-spacing: 2px;">SAVED CONNECTIONS</h2>
                <div id="fbList">${listHtml || '<p style="color:#222; text-align:center; font-size:12px;">NO DATABASE CONNECTED</p>'}</div>
            </div>
        </div>
    `;
}

function saveFirebaseConfig() {
    const fields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const config = {};
    let isComplete = true;

    fields.forEach(f => {
        const val = document.getElementById(f).value;
        if(!val) isComplete = false;
        config[f] = val;
    });

    if (!isComplete) {
        alert("Please fill all 6 Firebase fields!");
        return;
    }

    let configs = JSON.parse(localStorage.getItem('fb_configs') || '[]');
    configs.push(config);
    localStorage.setItem('fb_configs', JSON.stringify(configs));
    localStorage.setItem('fb_active_index', configs.length - 1);
    renderFirebaseModule();
}

window.onload = function() {
    const lastModule = localStorage.getItem('activeModule') || 'Views';
    loadContent(lastModule);
};
