// ============================================
// FILE: firebase-config.js (ES Module)
// LOAD AS: <script type="module" src="firebase-config.js">
// ============================================

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database, 'brt_data');
let isFirebaseConnected = false;

const appState = {
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
    currentUser: null,
    firebaseConfig: firebaseConfig
};

function saveLocalState() {
    localStorage.setItem('brt_data', JSON.stringify(appState));
    if (isFirebaseConnected) {
        set(dbRef, appState).catch(e => console.error('Firebase Save Error:', e));
    }
}

function loadLocalState() {
    const local = localStorage.getItem('brt_data');
    if (local) {
        try { const parsed = JSON.parse(local); Object.assign(appState, parsed); } catch (e) {}
    }
    const socialData = localStorage.getItem('brt_social');
    if (socialData) { try { const p = JSON.parse(socialData); if (p.length > 0) appState.socialMedia = p; } catch(e) {} }
    const toolsData = localStorage.getItem('brt_tools');
    if (toolsData) { try { const p = JSON.parse(toolsData); if (p.length > 0) appState.tools = p; } catch(e) {} }
    const logoData = localStorage.getItem('brt_logo');
    if (logoData) { appState.logoBase64 = logoData; }
    const brokersData = localStorage.getItem('brt_brokers');
    if (brokersData) { try { const p = JSON.parse(brokersData); if (p.length > 0) appState.brokers = p; } catch(e) {} }
    const creditPacksData = localStorage.getItem('brt_creditPacks');
    if (creditPacksData) { try { const p = JSON.parse(creditPacksData); if (p.length > 0) appState.creditPacks = p; } catch(e) {} }
    const featuresData = localStorage.getItem('brt_features');
    if (featuresData) { try { const p = JSON.parse(featuresData); if (p.length > 0) appState.features = p; } catch(e) {} }
    const cps = localStorage.getItem('brt_credits_per_signal');
    if (cps) { const v = parseInt(cps); if (!isNaN(v) && v > 0) appState.creditsPerSignal = v; }
    return appState;
}

onValue(dbRef, (snapshot) => {
    isFirebaseConnected = true;
    const statusDot = document.getElementById('firebaseStatusDot');
    if (statusDot) statusDot.className = 'fb-status-dot green';
    const adminStatusDot = document.getElementById('adminStatusDot');
    if (adminStatusDot) adminStatusDot.className = 'fb-status-dot-sm green';
    const val = snapshot.val();
    if (val) {
        const currentUserEmail = appState.currentUser ? appState.currentUser.email : null;
        Object.assign(appState, val);
        if (currentUserEmail) {
            const found = appState.users.find(u => u.email === currentUserEmail);
            if (found) appState.currentUser = found;
            else { appState.currentUser = null; sessionStorage.removeItem('user_logged_in'); }
        }
        if (val.logoBase64) { localStorage.setItem('brt_logo', val.logoBase64); if (typeof applyLogo === 'function') applyLogo(val.logoBase64); if (typeof applyAdminLogo === 'function') applyAdminLogo(val.logoBase64); }
        if (val.socialMedia) localStorage.setItem('brt_social', JSON.stringify(val.socialMedia));
        if (val.tools) localStorage.setItem('brt_tools', JSON.stringify(val.tools));
        if (val.brokers) localStorage.setItem('brt_brokers', JSON.stringify(val.brokers));
        if (val.creditPacks) localStorage.setItem('brt_creditPacks', JSON.stringify(val.creditPacks));
        if (val.features) localStorage.setItem('brt_features', JSON.stringify(val.features));
        if (typeof renderSocialMedia === 'function') renderSocialMedia();
        if (typeof renderAdminSocialMedia === 'function') renderAdminSocialMedia();
        if (typeof renderFeatures === 'function') renderFeatures();
        if (typeof renderFeaturesList === 'function') renderFeaturesList();
        if (typeof updateOfferBanner === 'function') updateOfferBanner();
        if (typeof updatePendingCounts === 'function') updatePendingCounts();
        if (typeof renderRevenueStats === 'function') renderRevenueStats();
        if (typeof renderCreditPacks === 'function') renderCreditPacks();
        if (typeof renderCreditPackList === 'function') renderCreditPackList();
        if (typeof renderTools === 'function') renderTools();
        if (typeof renderToolsList === 'function') renderToolsList();
        if (typeof renderBrokerList === 'function') renderBrokerList();
        if (typeof renderSocialList === 'function') renderSocialList();
        if (typeof renderPendingPayments === 'function') renderPendingPayments();
        if (typeof renderPendingVerifications === 'function') renderPendingVerifications();
    }
}, (error) => {
    isFirebaseConnected = false;
    const statusDot = document.getElementById('firebaseStatusDot');
    if (statusDot) statusDot.className = 'fb-status-dot red';
    const adminStatusDot = document.getElementById('adminStatusDot');
    if (adminStatusDot) adminStatusDot.className = 'fb-status-dot-sm red';
});

window.appState = appState;
window.saveLocalState = saveLocalState;
window.loadLocalState = loadLocalState;
window.isFirebaseConnected = isFirebaseConnected;

console.log('🔥 Firebase Config + AppState Loaded');
