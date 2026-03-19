import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    getDocs, doc, writeBatch, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. CONFIG SYNC ---
const savedConfigs = JSON.parse(localStorage.getItem('fb_configs') || '[]');
const activeIndex = localStorage.getItem('fb_active_index');
const activeConfig = savedConfigs[activeIndex];

let db = null;

if (activeConfig) {
    const app = initializeApp(activeConfig);
    db = getFirestore(app);
    console.log(`[RUTHLESS] Connected: ${activeConfig.projectId}`);
}

/** * --- 2. GET ACTIVE PLATFORMS (ADMIN LABELS) ---
 * Admin lo meeru add chesina 'Visible' platforms ni techhi dropdown lo chupisthundi.
 */
export function getSignalsList(updateDropdown) {
    if (!db) return;
    const q = query(collection(db, "admin_labels"), where("status", "==", "visible"));
    
    return onSnapshot(q, (snapshot) => {
        const labels = [];
        snapshot.forEach((doc) => {
            labels.push({ id: doc.id, ...doc.data() });
        });
        updateDropdown(labels);
    });
}

/** * --- 3. SIGNAL SYNC (50 LIMIT) ---
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

/** * --- 4. STORAGE CLEANUP ---
 */
async function processStorageCleanup(platform) {
    if (!db || !platform) return;
    try {
        const colRef = collection(db, platform);
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            const batch = writeBatch(db);
            const oldDocs = snapshot.docs.slice(100); // 100 unchi migilina 400 delete
            oldDocs.forEach((oldDoc) => {
                batch.delete(doc(db, platform, oldDoc.id));
            });
            await batch.commit();
        }
    } catch (error) { console.error("Cleanup Error: ", error); }
}

export { db };
