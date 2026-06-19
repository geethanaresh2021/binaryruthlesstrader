import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    getDocs, deleteDoc, doc, setDoc, writeBatch, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STEP 1: Firebase Configuration ---
// Mee Firebase Console nundi vachina details ni ikkada update cheyyandi
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/** * LOGIC 1: Real-time Signal Sync (Latest 50 only)
 * Index page lo display kosam idi vaadutham.
 */
export function syncSignals(platform, updateUI) {
    if (!db) return;

    const q = query(
        collection(db, "signals"), 
        orderBy("timestamp", "desc"), 
        limit(50) 
    );

    return onSnapshot(q, (snapshot) => {
        const signals = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // User select chesina platform (Quotex/Toxa) signals mathrame filter chestham
            if(data.platform === platform) {
                signals.push({ id: doc.id, ...data });
            }
        });
        updateUI(signals); 
        
        // Data ekkuva avvakunda background cleanup trigger chestham
        processStorageCleanup("signals");
    });
}

/** * LOGIC 2: Ruthless Storage Cleanup (500 -> 100)
 * Database lo 500 records daatithe, paatha 400 ni okke saari delete chesthundhi.
 */
async function processStorageCleanup(collectionName) {
    try {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            console.log(`[RUTHLESS CLEANUP] Limit 500 reached. Purging 400 old records...`);
            
            const batch = writeBatch(db);
            // Slice the last 400 (oldest ones)
            const docsToDelete = snapshot.docs.slice(-400); 
            
            docsToDelete.forEach((oldDoc) => {
                batch.delete(oldDoc.ref);
            });

            await batch.commit();
            console.log(`[SUCCESS] Database optimized. 400 records purged.`);
        }
    } catch (error) {
        console.error("Cleanup Error: ", error);
    }
}

// Admin and Index scripts ki kavalsina tools ni export chesthunnam
export { db, serverTimestamp, doc, setDoc };
