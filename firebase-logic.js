// ================= IMPORT FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, query,
    orderBy, limit, doc, writeBatch, serverTimestamp,
    onSnapshot, setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
    getAuth, signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ================= CONFIG =================
const firebaseConfig = {
    apiKey: "AIzaSyA2ILDlxtYs2CT-2mJItRV1NApSIaH4t3g",
    authDomain: "binary-ruthless-trader-26654.firebaseapp.com",
    projectId: "binary-ruthless-trader-26654",
    storageBucket: "binary-ruthless-trader-26654.firebasestorage.app",
    messagingSenderId: "533209261799",
    appId: "1:533209261799:web:a398ab21b0f913683ea442"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ✅ AUTH FIX (IMPORTANT)
export const auth = getAuth(app);

// auto login
signInAnonymously(auth).catch(err => {
    console.error("❌ Auth Error:", err);
});

// ================= ADMIN SAVE (CRITICAL FIX) =================
// 👉 ఇప్పుడు ఇది site_settings కి direct save అవుతుంది (index sync correct)
window.updateCloudConfig = async function (path, data) {
    try {
        await setDoc(doc(db, path.split('/')[0], path.split('/')[1]), {
            ...data,
            updatedAt: serverTimestamp()
        });

        console.log("✅ Saved to:", path);
    } catch (error) {
        console.error("❌ Save Error:", error);
    }
};

// ================= AUTO CLEANUP =================
export async function ruthlessAutoCleanup(platform) {
    try {
        const colRef = collection(db, platform);
        const q = query(colRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            console.log(`⚠ Cleanup Triggered: ${platform}`);

            const batch = writeBatch(db);
            const docsToDelete = snapshot.docs.slice(0, 400);

            docsToDelete.forEach((d) => {
                batch.delete(doc(db, platform, d.id));
            });

            await batch.commit();
            console.log("🔥 400 old signals deleted");
        }
    } catch (error) {
        console.error("Cleanup Error:", error);
    }
}

// ================= POST SIGNAL =================
export async function postSignal(platform, pair, action) {
    try {
        await addDoc(collection(db, platform), {
            pair: pair.toUpperCase(),
            action: action,
            timestamp: serverTimestamp()
        });

        ruthlessAutoCleanup(platform);
        return true;
    } catch (error) {
        console.error("Post Error:", error);
        return false;
    }
}

// ================= LIVE SYNC =================
export function syncSignals(platform, callback) {
    const q = query(
        collection(db, platform),
        orderBy("timestamp", "desc"),
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const signals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(signals);
    });
}
