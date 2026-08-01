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
// ఈ ఫంక్షన్ను పిలిస్తే Firebase initialized అవుతుంది
export function initFirebase() {
    // Firebase SDKలు ఇప్పటికే import చేయబడి ఉండాలి
    // ఇక్కడ Firebase init చేయడానికి ఉపయోగిస్తారు
}

// ─── DATABASE REFERENCE ───
// డేటాబేస్ రెఫరెన్స్ పొందడానికి
export function getDbRef(database) {
    return database.ref('brt_data');
}

// ─── DEFAULT APP STATE ───
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
