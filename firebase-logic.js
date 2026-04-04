import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    getDocs, deleteDoc, doc, setDoc, getDoc, writeBatch, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STEP 1: Firebase Configuration ---
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
            if(data.platform === platform) {
                signals.push({ id: doc.id, ...data });
            }
        });
        updateUI(signals); 
        processStorageCleanup("signals");
    });
}

/** * LOGIC 2: Ruthless Storage Cleanup (500 -> 100)
 */
async function processStorageCleanup(collectionName) {
    try {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            console.log(`[RUTHLESS CLEANUP] Limit 500 reached. Purging 400 old records...`);
            const batch = writeBatch(db);
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

/** * LOGIC 3: Admin VPS Connection Settings (NEW)
 * Admin page nundi VPS API URLs ni save cheyadaniki.
 */
export async function saveVpsUrl(provider, url) {
    try {
        // Firebase lo 'settings' collection lo 'signal_config' document lo save chestham
        await setDoc(doc(db, "settings", "signal_config"), {
            [provider]: url
        }, { merge: true });
        console.log(`[ADMIN] Saved ${provider} URL: ${url}`);
        return true;
    } catch (error) {
        console.error("Error saving VPS config:", error);
        return false;
    }
}

/** * LOGIC 4: Home Page Direct VPS Fetch (NEW)
 * Firebase nundi URL ni techi, direct ga VPS nundi signals ni load chestundi.
 */
export async function fetchDirectFromVps(provider, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // 1. Firebase settings nundi URL ni get cheyali
        const docRef = doc(db, "settings", "signal_config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data()[provider]) {
            const targetUrl = docSnap.data()[provider];
            
            container.innerHTML = `<p style="color: #00ffcc; font-family: 'Orbitron';">CONNECTING TO VPS...</p>`;

            // 2. Direct VPS API Request
            const response = await fetch(targetUrl);
            const signals = await response.json();

            // 3. UI Update (Ruthless Aesthetic)
            container.innerHTML = ''; // Clear container
            signals.forEach(sig => {
                const signalBox = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #1a1a1a; background: #050505; margin-bottom: 5px;">
                        <span style="font-family: 'Orbitron'; color: #fff; text-transform: uppercase; letter-spacing: 1px;">
                            ${sig.pair || sig.symbol}
                        </span>
                        <span style="font-family: 'Roboto Mono'; font-weight: bold; font-size: 32px; color: #00ffcc; text-shadow: 0 0 15px #00ffcc;">
                            ${sig.type || sig.direction}
                        </span>
                    </div>
                `;
                container.innerHTML += signalBox;
            });
        } else {
            container.innerHTML = `<p style="color: #ff0000; font-family: 'Orbitron';">NO CONFIGURATION FOUND IN ADMIN</p>`;
        }
    } catch (error) {
        console.error("VPS Connection Error:", error);
        container.innerHTML = `<p style="color: #ff0000; font-family: 'Orbitron';">VPS CONNECTION FAILED</p>`;
    }
}

// Exports for other files
export { db, serverTimestamp, doc, setDoc, getDoc };
