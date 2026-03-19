import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, query, orderBy, limit, onSnapshot, 
    doc, setDoc, getDocs, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA2ILDlxtYs2CT-2mJItRV1NApSIaH4t3g",
  authDomain: "binary-ruthless-trader-26654.firebaseapp.com",
  databaseURL: "https://binary-ruthless-trader-26654-default-rtdb.firebaseio.com",
  projectId: "binary-ruthless-trader-26654",
  storageBucket: "binary-ruthless-trader-26654.firebasestorage.app",
  messagingSenderId: "533209261799",
  appId: "1:533209261799:web:a398ab21b0f913683ea442",
  measurementId: "G-WQCXCMV5PR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 2. AUTHENTICATION (For Mobile/Guest Users) ---
// మొబైల్ యూజర్లకి డేటా కనెక్షన్ రావాలంటే ఇది తప్పనిసరి
signInAnonymously(auth).catch((error) => {
    console.error("Firebase Auth Error:", error.message);
});

// --- 3. CLOUD UPDATE FUNCTIONS (Admin.html కోసం) ---
export async function updateCloudConfig(path, data) {
    if (!db) return;
    try {
        const [col, documentName] = path.split('/');
        await setDoc(doc(db, col, documentName), data, { merge: true });
        console.log(`[CLOUD] Successfully Updated: ${path}`);
    } catch (e) {
        console.error("Update Error:", e);
    }
}

// --- 4. LIVE GIVEAWAY SYNC (Index.html కోసం) ---
export function syncGiveaway(updateUI) {
    if (!db) return;
    const docRef = doc(db, "site_settings", "giveaway");
    return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
            updateUI(snap.data());
        }
    });
}

// --- 5. SIGNALS SYNC (50 LIMIT) ---
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
        // ఆటోమేటిక్ క్లీనప్ 
        processStorageCleanup(platform);
    });
}

// --- 6. STORAGE CLEANUP (Data 500 దాటితే పాతవి డిలీట్ అవుతాయి) ---
async function processStorageCleanup(platform) {
    try {
        const colRef = collection(db, platform);
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.size >= 500) {
            const batch = writeBatch(db);
            const oldDocs = snapshot.docs.slice(100); 
            oldDocs.forEach((oldDoc) => {
                batch.delete(doc(db, platform, oldDoc.id));
            });
            await batch.commit();
            console.log(`[RUTHLESS PURGE] Cleaned up ${platform}`);
        }
    } catch (error) {
        console.error("Cleanup Fail:", error);
    }
}

export { db, auth };
