import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./firebase-config.js";

// ─── INITIALIZE FIREBASE ───
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const dbRef = ref(database, 'brt_data');

// ─── APP STATE ───
let appState = {
    password: 'admin123',
    offerCredits: 10,
    offerName: 'FREE SIGNAL OFFER',
    offerDescription: 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!',
    darkMode: true,
    brokers: [
        { name: 'Quotex', link: 'https://quotex.io/ref/xyz', minDeposit: 1000, rules: 'Verify email, deposit ₹1000' },
        { name: 'Binomo', link: 'https://binomo.com/ref/xyz', minDeposit: 500, rules: 'Verify phone, deposit ₹500' }
    ],
    users: [],
    verificationRequests: [],
    currentUser: null,
    logoClickCount: 2,
    socialMedia: [],
    tools: [],
    features: [
        { id: 'feat_1', icon: '🧠', name: 'AI Signal', desc: 'Real-time predictions', visibility: 'visible' },
        { id: 'feat_2', icon: '📈', name: 'Chart Analysis', desc: 'Pattern recognition', visibility: 'visible' },
        { id: 'feat_3', icon: '📓', name: 'Trading Journal', desc: 'Track every trade', visibility: 'visible' },
        { id: 'feat_4', icon: '💰', name: 'Money Mgmt', desc: 'Risk & position size', visibility: 'visible' },
        { id: 'feat_5', icon: '📊', name: 'Risk Manager', desc: 'Stop-loss tools', visibility: 'visible' },
        { id: 'feat_6', icon: '☁️', name: 'Cloud Sync', desc: 'All devices sync', visibility: 'visible' }
    ],
    payments: [],
    upiId: 'binary@ruthless',
    paymentInstructions: 'Please transfer the amount to the UPI ID.',
    qrCodeBase64: '',
    creditPacks: [
        { credits: 50, price: 99 },
        { credits: 100, price: 199 },
        { credits: 250, price: 349 },
        { credits: 500, price: 599 }
    ],
    chats: {}
};

let isFirebaseConnected = false;

// ─── SESSION MANAGEMENT ───
function getActiveSession() {
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    const userLoggedIn = sessionStorage.getItem('user_logged_in') === 'true';
    return { adminLoggedIn, userLoggedIn };
}

function checkUserSession() {
    const { userLoggedIn } = getActiveSession();
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    const adminNavBar = document.getElementById('adminNavBar');
    if (userLoggedIn) {
        if (userLogoutBtn) userLogoutBtn.classList.add('visible');
        if (adminNavBar) adminNavBar.classList.remove('visible');
    } else {
        if (userLogoutBtn) userLogoutBtn.classList.remove('visible');
    }
    return userLoggedIn;
}

function checkAdminSession() {
    const { adminLoggedIn } = getActiveSession();
    const navBar = document.getElementById('adminNavBar');
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    if (adminLoggedIn) {
        if (navBar) navBar.classList.add('visible');
        if (userLogoutBtn) userLogoutBtn.classList.remove('visible');
    } else {
        if (navBar) navBar.classList.remove('visible');
    }
    return adminLoggedIn;
}

function getCurrentUser() {
    return appState.currentUser;
}

function adminLogin(password) {
    if (password === appState.password) {
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.removeItem('user_logged_in');
        appState.currentUser = null;
        saveLocalState();
        return true;
    }
    return false;
}

function userLogout() {
    sessionStorage.removeItem('user_logged_in');
    appState.currentUser = null;
    saveLocalState();
    window.location.href = 'index.html';
}

function adminLogout() {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('user_logged_in');
    appState.currentUser = null;
    saveLocalState();
    if (document.getElementById('adminNavBar')) {
        document.getElementById('adminNavBar').classList.remove('visible');
    }
    if (document.getElementById('userLogoutBtn')) {
        document.getElementById('userLogoutBtn').classList.remove('visible');
    }
    window.location.href = 'index.html';
}

// ─── PREVENT COPY & RIGHT CLICK ───
function preventCopyAndRightClick() {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    });
}

// ─── SAVE & LOAD LOCAL STATE ───
function saveLocalState() {
    localStorage.setItem('brt_data', JSON.stringify(appState));
    if (isFirebaseConnected) set(dbRef, appState).catch(e => console.error(e));
}

function loadLocalState() {
    const local = localStorage.getItem('brt_data');
    if (local) {
        try {
            const parsed = JSON.parse(local);
            appState = { ...appState, ...parsed };
        } catch (e) { console.error(e); }
    }
    const logoData = localStorage.getItem('brt_logo');
    if (logoData) applyLogo(logoData);
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
    updateUI();
    renderSocialMedia();
    renderFeatures();
    updateOfferBanner();
    checkAdminSession();
    checkUserSession();
}

// ─── UPDATE UI ───
function updateUI() {
    if (appState.brokers) {
        const brokerSelect = document.getElementById('signupBroker');
        if (brokerSelect) {
            brokerSelect.innerHTML = '<option value="">-- Select Broker --</option>';
            appState.brokers.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.name;
                opt.textContent = b.name;
                brokerSelect.appendChild(opt);
            });
        }
        const verifyBroker = document.getElementById('verifyBroker');
        if (verifyBroker) {
            verifyBroker.innerHTML = '<option value="">-- Select Broker --</option>';
            appState.brokers.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.name;
                opt.textContent = b.name;
                verifyBroker.appendChild(opt);
            });
        }
    }
}

// ─── APPLY LOGO ───
function applyLogo(logoBase64) {
    const logoIcon = document.getElementById('logoIcon');
    const logoImg = document.getElementById('logoImage');
    if (logoBase64) {
        if (logoIcon) logoIcon.style.display = 'none';
        if (logoImg) {
            logoImg.src = logoBase64;
            logoImg.style.display = 'block';
        }
    } else {
        if (logoIcon) logoIcon.style.display = 'block';
        if (logoImg) logoImg.style.display = 'none';
    }
}

// ─── RENDER SOCIAL MEDIA ───
function renderSocialMedia() {
    const container = document.getElementById('socialIconsContainer');
    if (!container) return;
    let socials = appState.socialMedia || [];
    if (socials.length === 0) {
        const localSocial = localStorage.getItem('brt_social');
        if (localSocial) {
            try { socials = JSON.parse(localSocial); } catch (e) {}
        }
    }
    const visibleSocials = socials.filter(s => s.visibility === 'visible');
    if (visibleSocials.length === 0) {
        container.innerHTML = `
          <a href="#" class="telegram"><i class="fab fa-telegram-plane"></i></a>
          <a href="#" class="instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" class="youtube"><i class="fab fa-youtube"></i></a>
          <a href="#" class="twitter"><i class="fab fa-twitter"></i></a>
        `;
        container.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const platform = this.classList.contains('telegram') ? 'Telegram' :
                    this.classList.contains('instagram') ? 'Instagram' :
                    this.classList.contains('youtube') ? 'YouTube' : 'Twitter';
                alert('📱 ' + platform + ' - Configure in Admin');
            });
        });
        return;
    }
    container.innerHTML = '';
    visibleSocials.forEach(social => {
        const iconClass = social.icon || 'fas fa-link';
        const url = social.url || '#';
        const name = social.name || 'Link';
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.title = name;
        a.innerHTML = `<i class="${iconClass}"></i>`;
        if (name.toLowerCase().includes('telegram')) a.classList.add('telegram');
        else if (name.toLowerCase().includes('instagram')) a.classList.add('instagram');
        else if (name.toLowerCase().includes('youtube')) a.classList.add('youtube');
        else if (name.toLowerCase().includes('twitter')) a.classList.add('twitter');
        a.addEventListener('click', function(e) {
            if (url === '#') {
                e.preventDefault();
                alert('📱 ' + name + ' - Configure URL in Admin');
            }
        });
        container.appendChild(a);
    });
}

// ─── RENDER FEATURES ───
function renderFeatures() {
    const container = document.getElementById('featuresScroll');
    if (!container) return;
    const features = appState.features || [];
    const visible = features.filter(f => f.visibility !== 'hidden');
    if (visible.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = '';
    visible.forEach(f => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <span class="icon">${f.icon || '🧠'}</span>
            <h4>${f.name || 'Feature'}</h4>
            <p>${f.desc || ''}</p>
        `;
        container.appendChild(card);
    });
}

// ─── UPDATE OFFER BANNER ───
function updateOfferBanner() {
    const credits = appState.offerCredits || 10;
    const name = appState.offerName || 'FREE SIGNAL OFFER';
    let description = appState.offerDescription || 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!';
    
    const offerTitle = document.getElementById('offerTitle');
    if (offerTitle) offerTitle.textContent = name;
    
    const descContainer = document.getElementById('offerDescriptionText');
    if (descContainer) {
        const numberMatch = description.match(/\d+/);
        if (numberMatch) {
            let result = description.replace(/\d+/, `<span class="highlight" id="offerCreditsDisplay">${credits}</span>`);
            descContainer.innerHTML = result;
        } else {
            descContainer.innerHTML = `${description} <span class="highlight" id="offerCreditsDisplay">${credits}</span>`;
        }
    }
}

// ─── MODAL HELPERS ───
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

// ─── INFO POPUP FUNCTIONS ───
function showInfoPopup(icon, title, message, btnText, btnAction) {
    const popup = document.getElementById('infoPopup');
    if (!popup) return;
    const iconEl = document.getElementById('infoPopupIcon');
    const titleEl = document.getElementById('infoPopupTitle');
    const messageEl = document.getElementById('infoPopupMessage');
    const btn = document.getElementById('infoPopupBtn');
    
    if (iconEl) iconEl.textContent = icon || 'ℹ️';
    if (titleEl) titleEl.textContent = title || 'Info';
    if (messageEl) messageEl.textContent = message || 'Message here';
    
    if (btnText && btn) {
        btn.style.display = 'block';
        btn.textContent = btnText;
        btn.className = 'popup-btn center-btn';
        if (btnText.toLowerCase().includes('signup') || btnText.toLowerCase().includes('continue')) {
            btn.classList.add('btn-gold');
        } else {
            btn.classList.add('btn-white');
        }
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) {
            if (typeof btnAction === 'function') {
                btnAction();
            }
            closeInfoPopup();
        });
    } else if (btn) {
        btn.style.display = 'none';
    }
    popup.classList.add('active');
}

function closeInfoPopup() {
    const popup = document.getElementById('infoPopup');
    if (popup) popup.classList.remove('active');
}

// ─── EMAIL VALIDATION (GMAIL ONLY) ───
function isValidEmail(email) {
    return /^[^\s@]+@gmail\.com$/.test(email);
}

// ─── FIREBASE LISTENER ───
onValue(dbRef, (snapshot) => {
    isFirebaseConnected = true;
    const dot = document.getElementById('firebaseStatusDot');
    if (dot) dot.className = 'fb-status-dot green';
    const val = snapshot.val();
    if (val) {
        const currentUserEmail = appState.currentUser ? appState.currentUser.email : null;
        appState = { ...appState, ...val };
        if (val.logoClickCount !== undefined) appState.logoClickCount = val.logoClickCount;
        if (val.offerCredits !== undefined) appState.offerCredits = val.offerCredits;
        if (val.offerName !== undefined) appState.offerName = val.offerName;
        if (val.offerDescription !== undefined) appState.offerDescription = val.offerDescription;
        if (val.darkMode !== undefined) {
            appState.darkMode = true; // Force dark mode
        }
        if (val.logoBase64 !== undefined && val.logoBase64 !== '') applyLogo(val.logoBase64);
        if (val.socialMedia !== undefined) {
            appState.socialMedia = val.socialMedia;
            localStorage.setItem('brt_social', JSON.stringify(val.socialMedia));
            renderSocialMedia();
        }
        if (val.tools !== undefined) {
            appState.tools = val.tools;
            localStorage.setItem('brt_tools', JSON.stringify(val.tools));
        }
        if (val.features !== undefined) {
            appState.features = val.features;
            localStorage.setItem('brt_features', JSON.stringify(val.features));
            renderFeatures();
        }
        if (currentUserEmail) {
            const found = appState.users.find(u => u.email === currentUserEmail);
            if (found) appState.currentUser = found;
            else appState.currentUser = null;
        }
        updateUI();
        updateOfferBanner();
    }
}, (error) => {
    isFirebaseConnected = false;
    const dot = document.getElementById('firebaseStatusDot');
    if (dot) dot.className = 'fb-status-dot red';
    console.error('Firebase Error:', error);
});

// ─── EXPORTS ───
export {
    appState,
    isFirebaseConnected,
    database,
    dbRef,
    getActiveSession,
    checkUserSession,
    checkAdminSession,
    getCurrentUser,
    adminLogin,
    userLogout,
    adminLogout,
    preventCopyAndRightClick,
    saveLocalState,
    loadLocalState,
    applyLogo,
    renderSocialMedia,
    renderFeatures,
    updateOfferBanner,
    closeModal,
    openModal,
    showInfoPopup,
    closeInfoPopup,
    isValidEmail,
    updateUI
};
