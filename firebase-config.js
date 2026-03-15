// --- 1. FIREBASE CONFIGURATION ---
// Meeru Firebase Console nundi vacche mee swantha keys ni ikkada paste cheyali
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// --- 2. INITIALIZE FIREBASE ---
// Firebase libraries Part 1 (index.html) lo add chesam kabatti ikkada direct ga initialize chesthunnam
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 3. SYNC DATA TO CLOUD ---
function syncToFirebase(path, data) {
    database.ref(path).set(data)
    .then(() => console.log(`Ruthless Sync Success: ${path}`))
    .catch((error) => console.error("Sync Error: ", error));
}

// --- 4. FETCH DATA FROM CLOUD ---
function fetchFromFirebase() {
    database.ref('ruthless_settings').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Layout Update
            if (data.layout) {
                applyRuthlessLayout(data.layout);
            }
            // Affiliate Link Update
            if (data.affLink) {
                localStorage.setItem('ruthless_aff_link', data.affLink);
                const affInput = document.getElementById('admin-aff-link');
                if (affInput) affInput.value = data.affLink;
            }
            console.log("Ruthless Cloud Data Synced Successfully.");
        }
    });
}

// Helper to apply layout from Firebase
function applyRuthlessLayout(layoutData) {
    Object.keys(layoutData).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const pos = layoutData[id];
            el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            el.setAttribute('data-x', pos.x);
            el.setAttribute('data-y', pos.y);
        }
    });
}

// Auto-fetch on load
document.addEventListener('DOMContentLoaded', fetchFromFirebase);
