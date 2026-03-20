// Firebase SDK Imports (Compatibility Version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy, limit, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. DEFAULT CONFIG (Leda localStorage nundi load avthundi)
// Meeru Admin panel lo "Connect" kottినప్పుడు ee details automatic ga update avthayi.
const savedConfigs = JSON.parse(localStorage.getItem('fb_configs') || '[]');
const activeIndex = localStorage.getItem('fb_active_index') || 0;

const firebaseConfig = savedConfigs.length > 0 ? savedConfigs[activeIndex] : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- 3. SYNC SIGNALS FUNCTION ---
// Meeru select chesina platform (QUOTEX/TOXA) batti signals testundi
export function syncSignals(platform, callback) {
    const q = query(
        collection(db, "signals"), 
        orderBy("timestamp", "desc"), 
        limit(10)
    );

    return onSnapshot(q, (snapshot) => {
        const allSignals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Platform batti filter chesthunnam (Quotex/Toxa)
        const filtered = allSignals.filter(s => s.platform === platform);
        callback(filtered);
    }, (error) => {
        console.error("Signal Sync Error:", error);
    });
}

// --- 4. SYNC GIVEAWAY FUNCTION ---
// Giveaway winner details and speed sync chestundi
export function syncGiveaway(callback) {
    const giveawayDoc = doc(db, "site_settings", "giveaway");
    
    return onSnapshot(giveawayDoc, (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Giveaway Sync Error:", error);
    });
}

// --- 5. SYNC WARNING NOTE ---
// Warning message visibility and text sync chestundi
export function syncWarning(callback) {
    const warningDoc = doc(db, "site_settings", "warning_note");
    
    return onSnapshot(warningDoc, (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback(null);
        }
    });
}
