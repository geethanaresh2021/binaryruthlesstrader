import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    getDocs, doc, writeBatch, setDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. CONFIG INITIALIZATION ---
// Admin లో మనం సేవ్ చేస్తున్న LocalStorage కీస్ తో మ్యాచ్ అవ్వాలి
const activeConfig = JSON.parse(localStorage.getItem('firebaseConfig'));
let db = null;

if (activeConfig) {
    try {
        const app = initializeApp(activeConfig);
        db = getFirestore(app);
        console.log(`[RUTHLESS] Connected to: ${activeConfig.projectId}`);
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
}

// --- 2. CLOUD UPDATE FUNCTIONS (For Admin.html) ---

// ఏదైనా సెట్టింగ్‌ని Firestore లో సేవ్ చేయడానికి
export async function updateCloudConfig(path, data) {
    if (!db) return console.error("Database not connected!");
    try {
        // path: "site_settings/giveaway" -> collection: "site_settings", document: "giveaway"
        const [col, document] = path.split('/');
        await setDoc(doc(db, col, document), data, { merge: true });
        console.log(`[CLOUD] Updated: ${path}`);
    } catch (e) {
        console.error("Cloud Update Error:", e);
    }
}

// Firebase కనెక్షన్ అప్డేట్ చేయడానికి (Admin.html calls this)
export function saveFirebaseSettings(config) {
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
    window.location.reload(); // కొత్త డేటాబేస్ తో కనెక్ట్ అవ్వడానికి రీలోడ్
}

// --- 3. LIVE GIVEAWAY SYNC (For Index.html) ---
export function syncGiveaway(updateUI) {
    if (!db) return;
    const docRef = doc(db, "site_settings", "giveaway");
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            updateUI(snap.data());
        }
    });
}

// --- 4. SIGNALS LOGIC (50 LIMIT) ---
export function syncSignals(platform, updateUI) {
    if (!db) return;

    const q = query(
        collection(db, platform), 
        orderBy("timestamp", "desc"), 
        limit(50) 
    );

    return onSnapshot(q, (snapshot) => {
        const signals = [];
        snapshot.forEach((doc) => {
            signals.push({ id: doc.id, ...doc.data() });
        });
        updateUI(signals); 
        processStorageCleanup(platform);
    });
}

// --- 5. STORAGE CLEANUP (500 -> DELETE 400) ---
async function processStorageCleanup(platform) {
    if (!db) return;
    try {
        const colRef = collection(db, platform);
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            console.log(`[PURGE] ${platform} limit reached. Deleting 400 old posts...`);
            const batch = writeBatch(db);
            // Firestore లో చివరి 400 డాక్యుమెంట్లను తీసుకుంటుంది
            const oldDocs = snapshot.docs.slice(100); 
            oldDocs.forEach((oldDoc) => {
                batch.delete(doc(db, platform, oldDoc.id));
            });
            await batch.commit();
        }
    } catch (error) {
        console.error("Cleanup Error: ", error);
    }
}

export { db };
