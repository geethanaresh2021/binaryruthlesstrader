// ============================================================
// FIREBASE CONFIG - SINGLE SOURCE OF TRUTH
// ఈ ఫైల్ను అన్ని HTML ఫైళ్లలో import చేయండి
// ============================================================

// ─── FIREBASE CONFIG ───
export const firebaseConfig = {
    apiKey: "AIzaSyA2ILDlxtYs2CT-2mJItRV1NApSIaH4t3g",
    authDomain: "binary-ruthless-trader-26654.firebaseapp.com",
    databaseURL: "https://binary-ruthless-trader-26654-default-rtdb.firebaseio.com",
    projectId: "binary-ruthless-trader-26654",
    storageBucket: "binary-ruthless-trader-26654.firebasestorage.app",
    messagingSenderId: "533209261799",
    appId: "1:533209261799:web:a398ab21b0f913683ea442",
    measurementId: "G-WQCXCMV5PR"
};

// ─── FIREBASE INITIALIZATION ───
export function initFirebase() {
    // Firebase SDKలు ఇప్పటికే import చేయబడి ఉండాలి
    // ఇక్కడ Firebase init చేయడానికి ఉపయోగిస్తారు
}

// ─── DATABASE REFERENCE ───
export function getDbRef(database) {
    return database.ref('brt_data');
}

// ================================
// PERFORMANCE UTILITIES
// ================================

// ─── DEBOUNCE ───
// Multiple calls ని ఒకే call లో merge చేస్తుంది
// Example: search input, save operations
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ─── THROTTLE ───
// Function ని fixed interval లో మాత్రమే call అయ్యేలా చేస్తుంది
// Example: scroll events, resize events
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ─── DEEP COMPARE ───
// Two objects ని compare చేసి equal కాదో చెప్తుంది
export function deepEqual(obj1, obj2) {
    // If both are same reference
    if (obj1 === obj2) return true;
    
    // If either is null or undefined
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    // If types are different
    if (typeof obj1 !== typeof obj2) return false;
    
    // If not objects, compare directly
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    // If arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) return false;
        }
        return true;
    }
    
    // If objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
}

// ─── GET CHANGED KEYS ───
// Two objects మధ్య ఏ keys changed అయ్యాయో చెప్తుంది
export function getChangedKeys(oldObj, newObj) {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    
    allKeys.forEach(key => {
        const oldVal = oldObj?.[key];
        const newVal = newObj?.[key];
        
        // Skip if both are undefined or null
        if (oldVal === undefined && newVal === undefined) return;
        if (oldVal === null && newVal === null) return;
        
        // Check if values are different
        if (!deepEqual(oldVal, newVal)) {
            changes.push(key);
        }
    });
    
    return changes;
}

// ─── DEEP CLONE ───
// Object ని deep copy చేస్తుంది
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// ─── MERGE WITH SELECTIVE UPDATE ───
// Only changed fields merge చేస్తుంది
export function mergeWithSelectiveUpdate(oldState, newState) {
    const changedKeys = getChangedKeys(oldState, newState);
    const result = { ...oldState };
    changedKeys.forEach(key => {
        result[key] = deepClone(newState[key]);
    });
    return result;
}

// ================================
// DEFAULT APP STATE
// ================================
export const defaultAppState = {
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
        { id: 'broker_1', name: 'Quotex', link: 'https://quotex.io/ref/xyz', minDeposit: 1000, rules: 'Verify email' },
        { id: 'broker_2', name: 'Binomo', link: 'https://binomo.com/ref/xyz', minDeposit: 500, rules: 'Verify phone' }
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
    ]
};
