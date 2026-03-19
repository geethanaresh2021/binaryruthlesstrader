<script type="module">
    import { syncSignals, syncGiveaway, db } from './firebase-logic.js';
    import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

    // --- 1. SIGNALS ---
    const sigSelect = document.getElementById('sigSelect');
    const sigScreen = document.getElementById('sigScreen');
    let currentSub = null;

    sigSelect.addEventListener('change', (e) => {
        if (currentSub) currentSub(); // పాత కనెక్షన్ ఆపేయడానికి
        sigScreen.innerHTML = '<div style="text-align:center; padding-top:180px; color:#444;">LOADING...</div>';
        
        currentSub = syncSignals(e.target.value, (signals) => {
            if (!signals.length) {
                sigScreen.innerHTML = `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#444;">NO SIGNALS</div>`;
                return;
            }
            sigScreen.innerHTML = signals.map(sig => `
                <div style="padding:15px; border-bottom:1px solid #111; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:red; font-weight:bold;">${sig.pair || '---'}</span>
                    <span style="font-family:'Roboto Mono'; font-size:32px; font-weight:bold; color:#00ffcc; text-shadow:0 0 10px #00ffcc;">${sig.action || 'ITM'}</span>
                </div>
            `).join('');
        });
    });

    // --- 2. GIVEAWAY ---
    syncGiveaway((data) => {
        const bar = document.getElementById('giveaway-bar');
        if (data && (data.status === true || data.statustrue === true || data.status === "VISIBLE")) {
            bar.style.display = 'block';
            const speed = parseInt(data.speed) || 0;
            const content = data.Content || data.content || "WINNER PENDING...";
            const style = "color:#fff; font-weight:900; font-family:'Roboto Mono'; text-transform:uppercase; text-shadow:0 0 10px red; font-size:14px;";

            if (speed === 0) {
                bar.innerHTML = `<div style="text-align:center; width:100%; line-height:35px; ${style}">${content}</div>`;
            } else {
                bar.innerHTML = `<marquee scrollamount="${speed}" style="line-height:35px; width:100%; display:block;"><span style="${style}">${content}</span></marquee>`;
            }
        } else { bar.style.display = 'none'; }
    });

    // --- 3. WARNING NOTE ---
    onSnapshot(doc(db, "site_settings", "warning_note"), (snap) => {
        const wrapper = document.getElementById('warning-wrapper');
        const textArea = document.getElementById('live-warning-text');
        if (snap.exists()) {
            const data = snap.data();
            if (data.status === true) {
                wrapper.style.display = 'block';
                const msg = data.text || "RUTHLESS SIGNALS LIVE!";
                textArea.innerHTML = `<marquee scrollamount="${data.speed || 5}" style="line-height:35px;">⚠️ ${msg}</marquee>`;
            } else { wrapper.style.display = 'none'; }
        }
    });
</script>
