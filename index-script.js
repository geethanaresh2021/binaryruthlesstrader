import { syncSignals, syncGiveaway, db } from './firebase-logic.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. LIVE SIGNALS SYNC ---
const sigSelect = document.getElementById('sigSelect');
const sigScreen = document.getElementById('sigScreen');

syncSignals("QUOTEX", (data) => { if(sigSelect.value === "QUOTEX") renderUI(data); });
syncSignals("TOXA", (data) => { if(sigSelect.value === "TOXA") renderUI(data); });

function renderUI(signals) {
    if (!signals || signals.length === 0) {
        sigScreen.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#444; font-family:'Roboto Mono'; font-size:11px;">AWAITING SIGNALS...</div>`;
        return;
    }
    sigScreen.innerHTML = signals.map(sig => `
        <div style="padding:15px; border-bottom:1px solid #111; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--red); font-weight:bold; font-size:14px;">${sig.pair || 'BTC/USD'}</span>
            <span style="font-family:'Roboto Mono'; font-size:32px; font-weight:bold; color:#00ffcc; text-shadow:0 0 10px #00ffcc;">${sig.action || 'ITM'}</span>
        </div>
    `).join('');
}

// --- 2. LIVE GIVEAWAY SYNC ---
syncGiveaway((data) => {
    const bar = document.getElementById('giveaway-bar');
    if (!bar) return;

    if (data && (data.status === true || data.status === "VISIBLE")) {
        bar.style.display = 'block'; 
        const speed = parseInt(data.speed) || 0;
        const content = data.content || "AWAITING RUTHLESS WINNER...";
        const textStyle = `color: #ffffff; font-weight: 900; font-family: 'Roboto Mono'; text-transform: uppercase; text-shadow: 0 0 10px #ff0000; font-size: 14px;`;

        if (speed === 0) {
            bar.style.display = 'flex';
            bar.style.justifyContent = 'center';
            bar.style.alignItems = 'center';
            bar.innerHTML = `<span style="${textStyle}">${content}</span>`;
        } else {
            bar.style.display = 'block';
            bar.innerHTML = `<marquee id="giveaway-mq" scrollamount="${speed}" behavior="scroll" direction="left" style="width:100%; height:35px; line-height:35px; display:block;"><span style="${textStyle}">${content}</span></marquee>`;
            setTimeout(() => { const mq = document.getElementById('giveaway-mq'); if(mq) mq.start(); }, 150);
        }
    } else { bar.style.display = 'none'; }
});

// --- 3. WARNING NOTE SYNC ---
onSnapshot(doc(db, "site_settings", "warning_note"), (snap) => {
    const data = snap.data();
    const wrapper = document.getElementById('warning-wrapper');
    const textArea = document.getElementById('live-warning-text');

    if (data && wrapper && textArea) {
        if (data.status === true) {
            wrapper.style.display = 'block';
            if (data.speed === 0) {
                textArea.innerHTML = `<div style="text-align:center; width:100%;"><i class="fas fa-exclamation-triangle"></i> ${data.text}</div>`;
            } else {
                textArea.innerHTML = `<marquee id="warning-mq" scrollamount="${data.speed}" style="display:block; width:100%;"><i class="fas fa-exclamation-triangle"></i> ${data.text}</marquee>`;
                setTimeout(() => { const wmq = document.getElementById('warning-mq'); if(wmq) wmq.start(); }, 150);
            }
        } else { wrapper.style.display = 'none'; }
    }
});
