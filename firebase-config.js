// ============================================
// SECTION: FIREBASE CONFIGURATION
// FILE: firebase-config.js
// Contains: Firebase initialization + state
// ============================================

// ─── FIREBASE CONFIG ───
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

// ─── INITIALIZE FIREBASE ───
let firebaseApp = null;
let firebaseDatabase = null;
let firebaseDbRef = null;
let isFirebaseConnected = false;

try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseDatabase = getDatabase(firebaseApp);
    firebaseDbRef = ref(firebaseDatabase, 'brt_data');
    
    // Initialize Analytics if available
    if (typeof getAnalytics === 'function') {
        try {
            const analytics = getAnalytics(firebaseApp);
        } catch (e) {
            console.warn('Analytics not available');
        }
    }
    
    console.log('🔥 Firebase Initialized');
} catch (e) {
    console.error('Firebase Init Error:', e);
}

// ─── APP STATE ───
let appState = {
    password: 'admin123',
    offerCredits: 10,
    offerName: 'FREE SIGNAL OFFER',
    offerDescription: 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!',
    upiId: 'binary@ruthless',
    paymentInstructions: 'Please transfer the amount to the UPI ID.',
    qrCodeBase64: '',
    creditPacks: [
        { id: 'pack_1', credits: 50, price: 99 },
        { id: 'pack_2', credits: 100, price: 199 },
        { id: 'pack_3', credits: 250, price: 349 },
        { id: 'pack_4', credits: 500, price: 599 }
    ],
    brokers: [
        { id: 'broker_1', name: 'Quotex', link: 'https://quotex.io/ref/xyz', minDeposit: 1000, rules: 'Verify email, deposit ₹1000' },
        { id: 'broker_2', name: 'Binomo', link: 'https://binomo.com/ref/xyz', minDeposit: 500, rules: 'Verify phone, deposit ₹500' }
    ],
    users: [],
    payments: [],
    verificationRequests: [],
    tools: [],
    socialMedia: [
        { id: 'social_1', name: 'Telegram', url: 'https://t.me/binaryruthless', icon: 'fab fa-telegram-plane', visibility: 'visible' },
        { id: 'social_2', name: 'Instagram', url: 'https://instagram.com/binaryruthless', icon: 'fab fa-instagram', visibility: 'visible' },
        { id: 'social_3', name: 'YouTube', url: 'https://youtube.com/binaryruthless', icon: 'fab fa-youtube', visibility: 'visible' },
        { id: 'social_4', name: 'Twitter', url: 'https://twitter.com/binaryruthless', icon: 'fab fa-twitter', visibility: 'visible' }
    ],
    logoBase64: '',
    chats: {},
    logoClickCount: 2,
    paymentApprovalMode: 'manual',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    creditsPerSignal: 1,
    features: [
        { id: 'feat_1', icon: '🧠', name: 'AI Signal', desc: 'Real-time predictions', visibility: 'visible' },
        { id: 'feat_2', icon: '📈', name: 'Chart Analysis', desc: 'Pattern recognition', visibility: 'visible' },
        { id: 'feat_3', icon: '📓', name: 'Trading Journal', desc: 'Track every trade', visibility: 'visible' },
        { id: 'feat_4', icon: '💰', name: 'Money Mgmt', desc: 'Risk & position size', visibility: 'visible' },
        { id: 'feat_5', icon: '📊', name: 'Risk Manager', desc: 'Stop-loss tools', visibility: 'visible' },
        { id: 'feat_6', icon: '☁️', name: 'Cloud Sync', desc: 'All devices sync', visibility: 'visible' }
    ],
    currentUser: null
};

// ─── FIREBASE SYNC ───
if (firebaseDbRef) {
    onValue(firebaseDbRef, (snapshot) => {
        isFirebaseConnected = true;
        
        // Update status dot if it exists
        const statusDot = document.getElementById('firebaseStatusDot');
        if (statusDot) {
            statusDot.className = 'fb-status-dot green';
        }
        
        const val = snapshot.val();
        if (val) {
            const currentUserEmail = appState.currentUser ? appState.currentUser.email : null;
            
            // Merge Firebase data into appState
            appState = { ...appState, ...val };
            
            // Restore current user reference
            if (currentUserEmail) {
                const found = appState.users.find(u => u.email === currentUserEmail);
                if (found) {
                    appState.currentUser = found;
                } else {
                    appState.currentUser = null;
                    sessionStorage.removeItem('user_logged_in');
                }
            }
            
            // Save specific items to localStorage for offline access
            if (val.logoBase64 !== undefined && val.logoBase64 !== '') {
                localStorage.setItem('brt_logo', val.logoBase64);
            }
            if (val.socialMedia !== undefined) {
                localStorage.setItem('brt_social', JSON.stringify(val.socialMedia));
            }
            if (val.tools !== undefined) {
                localStorage.setItem('brt_tools', JSON.stringify(val.tools));
            }
            if (val.features !== undefined) {
                localStorage.setItem('brt_features', JSON.stringify(val.features));
            }
            if (val.brokers !== undefined) {
                localStorage.setItem('brt_brokers', JSON.stringify(val.brokers));
            }
            if (val.creditPacks !== undefined) {
                localStorage.setItem('brt_creditPacks', JSON.stringify(val.creditPacks));
            }
            
            // Trigger UI update if function exists
            if (typeof updateAllUI === 'function') {
                updateAllUI();
            }
            if (typeof updateOfferBanner === 'function') {
                updateOfferBanner();
            }
            if (typeof renderSocialMedia === 'function') {
                renderSocialMedia();
            }
            if (typeof renderFeatures === 'function') {
                renderFeatures();
            }
        }
    }, (error) => {
        isFirebaseConnected = false;
        
        const statusDot = document.getElementById('firebaseStatusDot');
        if (statusDot) {
            statusDot.className = 'fb-status-dot red';
        }
        
        console.error('Firebase Error:', error);
    });
}

// ─── SAVE LOCAL STATE ───
function saveLocalState() {
    // Save to localStorage
    localStorage.setItem('brt_data', JSON.stringify(appState));
    
    // Save to Firebase if connected
    if (isFirebaseConnected && firebaseDbRef) {
        set(firebaseDbRef, appState).catch(e => console.error('Firebase Save Error:', e));
    }
}

// ─── LOAD LOCAL STATE ───
function loadLocalState() {
    const local = localStorage.getItem('brt_data');
    if (local) {
        try {
            const parsed = JSON.parse(local);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error('Local State Parse Error:', e);
        }
    }
    
    // Load individual items from localStorage
    const logoData = localStorage.getItem('brt_logo');
    if (logoData) {
        appState.logoBase64 = logoData;
        if (typeof applyLogo === 'function') {
            applyLogo(logoData);
        }
    }
    
    const socialData = localStorage.getItem('brt_social');
    if (socialData) {
        try {
            const parsed = JSON.parse(socialData);
            if (parsed.length > 0) appState.socialMedia = parsed;
        } catch (e) {}
    }
    
    const toolsData = localStorage.getItem('brt_tools');
    if (toolsData) {
        try {
            const parsed = JSON.parse(toolsData);
            if (parsed.length > 0) appState.tools = parsed;
        } catch (e) {}
    }
    
    const featuresData = localStorage.getItem('brt_features');
    if (featuresData) {
        try {
            const parsed = JSON.parse(featuresData);
            if (parsed.length > 0) appState.features = parsed;
        } catch (e) {}
    }
    
    const brokersData = localStorage.getItem('brt_brokers');
    if (brokersData) {
        try {
            const parsed = JSON.parse(brokersData);
            if (parsed.length > 0) appState.brokers = parsed;
        } catch (e) {}
    }
    
    const creditPacksData = localStorage.getItem('brt_creditPacks');
    if (creditPacksData) {
        try {
            const parsed = JSON.parse(creditPacksData);
            if (parsed.length > 0) appState.creditPacks = parsed;
        } catch (e) {}
    }
    
    return appState;
}

// ─── EXPOSE GLOBALLY ───
window.appState = appState;
window.saveLocalState = saveLocalState;
window.loadLocalState = loadLocalState;
window.isFirebaseConnected = isFirebaseConnected;
window.firebaseDbRef = firebaseDbRef;
window.firebaseConfig = firebaseConfig;

console.log('📦 Firebase Config + AppState Loaded');
