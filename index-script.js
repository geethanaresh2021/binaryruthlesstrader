import { db, doc, onSnapshot } from './firebase-logic.js';

// 1. Load Warnings & Winners
onSnapshot(doc(db, "site_settings", "warning_note"), (snap) => {
    const data = snap.data();
    if(data && data.status) {
        document.getElementById('warning-text').innerText = data.text;
        document.getElementById('warning-bar').style.display = 'flex';
    }
});

onSnapshot(doc(db, "site_settings", "giveaway_winner"), (snap) => {
    const data = snap.data();
    if(data && data.status) {
        document.getElementById('winner-text').innerText = `TODAY'S WINNER: ${data.content}`;
        document.getElementById('winner-bar').style.display = 'flex';
    }
});

// 2. Load Ads into 6 Slots
function syncAds() {
    for(let i=1; i<=6; i++) {
        onSnapshot(doc(db, "site_settings", `ad_slot_${i}`), (snap) => {
            const data = snap.data();
            const slot = document.getElementById(`ad-${i}`);
            if(data && data.value && slot) {
                slot.innerHTML = data.value;
                slot.style.border = "none"; // Ad content vachaka border teeyali
            }
        });
    }
}

// 3. Admin Login Logic
window.adminLogin = () => {
    // Mee login logic ikkada pettu thammudu
};

window.onload = syncAds;
