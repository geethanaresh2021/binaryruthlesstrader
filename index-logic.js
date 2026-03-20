import { db, syncSignals, syncGiveaway } from './firebase-logic.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STATE MANAGEMENT ---
const sigSelect = document.getElementById('sigSelect');
const sigScreen = document.getElementById('sigScreen');

// --- 1. LIVE SIGNALS LOGIC (QUOTEX / TOXA) ---
const handleSignalSync = () => {
    const platform = sigSelect ? sigSelect.value : "QUOTEX";
    syncSignals(platform, (data) => {
        renderSignalUI(data);
    });
};

if (sigSelect) {
    sigSelect.addEventListener('change', handleSignalSync);
    handleSignalSync(); // Initial Load
}

function renderSignalUI(signals) {
    if (!sigScreen) return;
    if (!signals || signals.length === 0) {
        sigScreen.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#222; font-family:'Roboto Mono'; font-size:11px; letter-spacing:2px;">AWAITING RUTHLESS SIGNALS...</div>`;
        return;
    }
    
    sigScreen.innerHTML = signals.map(sig => {
        const isWin = sig.action === 'ITM' || sig.action === 'Sureshot';
        const accentColor = isWin ? '#00ffcc' : 'var(--red)';
        
        return `
        <div style="padding:18px; border-bottom:1px solid #0a0a0a; display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.3);">
            <div style="display:flex; flex-direction:column;">
                <span style="color:#fff; font-family:'Orbitron'; font-size:13px; letter-spacing:1px;">${sig.pair || 'EUR/USD'}</span>
                <span style="color:#444; font-size:9px; font-family:'Roboto Mono';">${sig.time || 'LIVE'}</span>
            </div>
            <span style="font-family:'Roboto Mono'; font-size:28px; font-weight:900; color:${accentColor}; text-shadow: 0 0 15px ${accentColor};">
                ${sig.action || 'PENDING'}
            </span>
        </div>`;
    }).join('');
}

// --- 2. LIVE GIVEAWAY SYNC (STYLISH BAR) ---
syncGiveaway((data) => {
    const bar = document.getElementById('giveaway-bar');
    if (!bar) return;

    if (data && (data.status === true || data.status === "VISIBLE")) {
        bar.style.display = 'block';
        bar.style.background = '#000';
        bar.style.borderBottom = '1px solid #111';
        
        const speed = parseInt(data.speed) || 0;
        const content = data.content || "AWAITING WINNER...";
        const textStyle = `color: #00ffcc; font-weight: 900; font-family: 'Roboto Mono'; text-transform: uppercase; text-shadow: 0 0 10px #00ffcc; font-size: 13px; letter-spacing:1px;`;

        if (speed === 0) {
            bar.style.display = 'flex';
            bar.style.justifyContent = 'center';
            bar.style.alignItems = 'center';
            bar.style.height = '40px';
            bar.innerHTML = `<span style="${textStyle}">${content}</span>`;
        } else {
            bar.style.height = '40px';
            bar.innerHTML = `<marquee id="giveaway-mq" scrollamount="${speed}" style="line-height:40px;"><span style="${textStyle}">${content}</span></marquee>`;
            setTimeout(() => { document.getElementById('giveaway-mq')?.start(); }, 150);
        }
    } else { bar.style.display = 'none'; }
});

// --- 3. WARNING NOTE SYNC (SYSTEM ALERTS) ---
onSnapshot(doc(db, "site_settings", "warning_note"), (snap) => {
    const data = snap.data();
    const wrapper = document.getElementById('warning-wrapper');
    const textArea = document.getElementById('live-warning-text');

    if (data && wrapper && textArea) {
        if (data.status === true) {
            wrapper.style.display = 'flex';
            wrapper.style.background = 'var(--red)';
            wrapper.style.color = '#fff';
            wrapper.style.fontWeight = 'bold';
            
            const content = `<i class="fas fa-exclamation-triangle" style="margin-right:10px;"></i> ${data.text}`;
            
            if (data.speed === 0) {
                textArea.innerHTML = `<div style="text-align:center; width:100%; font-family:'Orbitron'; font-size:12px;">${content}</div>`;
            } else {
                textArea.innerHTML = `<marquee id="warning-mq" scrollamount="${data.speed}" style="width:100%; font-family:'Orbitron'; font-size:12px;">${content}</marquee>`;
                setTimeout(() => { document.getElementById('warning-mq')?.start(); }, 150);
            }
        } else { wrapper.style.display = 'none'; }
    }
});

// --- 4. LAYOUT & BRANDING SYNC ---
onSnapshot(doc(db, "site_settings", "layout"), (snap) => {
    if (snap.exists()) {
        const width = snap.data().value || '100%';
        document.documentElement.style.setProperty('--container-width', width);
        // Fixed layout logic
        const mainCont = document.querySelector('.main-container');
        if(mainCont) mainCont.style.maxWidth = width;
    }
});

onSnapshot(doc(db, "site_settings", "branding"), (snap) => {
    const brandElement = document.getElementById('site-brand-name');
    if (snap.exists() && brandElement) {
        brandElement.innerText = snap.data().value || 'BINARY RUTHLESS';
    }
});

console.log("RUTHLESS ENGINE: ALL SYSTEMS OPERATIONAL");
