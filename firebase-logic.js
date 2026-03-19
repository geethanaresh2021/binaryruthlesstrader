import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    getDocs, doc, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. ADMIN CONFIG SYNC ---
const savedConfigs = JSON.parse(localStorage.getItem('fb_configs') || '[]');
const activeIndex = localStorage.getItem('fb_active_index');
const activeConfig = savedConfigs[activeIndex];

let db = null;

if (activeConfig) {
    const app = initializeApp(activeConfig);
    db = getFirestore(app);
    console.log(`[RUTHLESS] Connected to Admin Storage: ${activeConfig.projectId}`);
}

/** * --- 2. DISPLAY LOGIC (50 LIMIT) ---
 * వెబ్‌సైట్ స్క్రీన్ మీద కేవలం లేటెస్ట్ 50 మాత్రమే కనిపిస్తాయి.
 * 51వ పోస్ట్ రాగానే పాతది ఆటోమేటిక్‌గా రిమూవ్ అవుతుంది.
 */
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

/** * --- 3. STORAGE CLEANUP (500 -> DELETE 400) ---
 * డేటాబేస్ 500 కి చేరగానే పాత 400 ని పర్మనెంట్ గా డిలీట్ చేస్తుంది.
 */
async function processStorageCleanup(platform) {
    if (!db) return;
    try {
        const colRef = collection(db, platform);
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            console.log(`[PURGE] ${platform} limit reached. Deleting 400 old posts...`);
            const batch = writeBatch(db);
            const oldDocs = snapshot.docs.slice(-400); 
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
