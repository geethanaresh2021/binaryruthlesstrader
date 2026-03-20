import { db } from './firebase-logic.js';
import { doc, onSnapshot, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Live Warning & Brand Sync
onSnapshot(doc(db, "site_settings", "warning_note"), (snap) => {
    const data = snap.data();
    const wrap = document.getElementById('warning-wrapper');
    if (data && data.status) {
        wrap.style.display = 'block';
        document.getElementById('live-warning-text').innerHTML = 
            data.speed > 0 ? `<marquee scrollamount="${data.speed}">${data.text}</marquee>` : data.text;
    } else { wrap.style.display = 'none'; }
});

// 2. Giveaway Sync
onSnapshot(doc(db, "site_settings", "giveaway_winner"), (snap) => {
    const data = snap.data();
    const bar = document.getElementById('giveaway-bar');
    if (data && data.status) {
        bar.style.display = 'block';
        bar.innerText = `LATEST GIVEAWAY: ${data.content}`;
    } else { bar.style.display = 'none'; }
});

// 3. Signals Real-time Sync
const sigScreen = document.getElementById('sigScreen');
const platformSelect = document.getElementById('platformSelect');

function syncSignals() {
    const q = query(collection(db, "signals"), orderBy("timestamp", "desc"), limit(12));
    onSnapshot(q, (snapshot) => {
        const platform = platformSelect.value;
        sigScreen.innerHTML = "";
        
        snapshot.forEach((doc) => {
            const sig = doc.data();
            if (sig.platform === platform) {
                sigScreen.innerHTML += `
                    <div class="sig-card">
                        <div class="sig-info">
                            <span class="sig-pair">${sig.pair}</span>
                            <div style="font-size:10px; color:#333;">${new Date(sig.timestamp?.toDate()).toLocaleTimeString()}</div>
                        </div>
                        <span class="sig-action">${sig.action}</span>
                    </div>
                `;
            }
        });
        if(sigScreen.innerHTML === "") sigScreen.innerHTML = '<div class="wait-msg">NO ACTIVE SIGNALS</div>';
    });
}

// 4. Ads Script Loader (Placeholder for 6 slots)
function loadAds() {
    for(let i=1; i<=6; i++) {
        onSnapshot(doc(db, "site_settings", `ad_slot_${i}`), (snap) => {
            const data = snap.data();
            if (data && data.value) {
                document.getElementById(`ad-${i}`).innerHTML = data.value;
            }
        });
    }
}

platformSelect.addEventListener('change', syncSignals);
window.onload = () => {
    syncSignals();
    loadAds();
};
