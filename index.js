/* ===== FIREBASE INIT ===== */
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const dbRef = ref(database, 'brt_data');

/* ===== APP STATE ===== */
let appState = {
    password: '9700224305',  // updated default password
    offerCredits: 10,
    offerName: 'FREE SIGNAL OFFER',
    offerDescription: 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!',
    brokers: [],
    users: [],
    verificationRequests: [],
    currentUser: null,
    logoClickCount: 2,
    socialMedia: [],
    tools: [],
    payments: [],
    upiId: 'binary@ruthless',
    paymentInstructions: 'Please transfer the amount to the UPI ID.',
    qrCodeBase64: '',
    creditPacks: [{ id: 'pack_1', credits: 50, price: 99 }, { id: 'pack_2', credits: 100, price: 199 }, { id: 'pack_3', credits: 250, price: 349 }, { id: 'pack_4', credits: 500, price: 599 }],
    chats: {},
    paymentApprovalMode: 'manual',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    creditsPerSignal: 1,
    logoBase64: ''
};

let isFirebaseConnected = false;

/* ===== LOGO HANDLING ===== */
function applyLogo(logoBase64) {
    const logoIcon = document.getElementById('logoIcon');
    const logoImg = document.getElementById('logoImage');
    if (logoBase64) {
        logoIcon.style.display = 'none';
        logoImg.src = logoBase64;
        logoImg.style.display = 'block';
        updateFavicon(logoBase64);
    } else {
        logoIcon.style.display = 'block';
        logoImg.style.display = 'none';
        updateFavicon(null);
    }
}

/* ===== FAVICON HANDLING ===== */
function updateFavicon(logoBase64) {
    const favicon = document.getElementById('dynamicFavicon');
    if (!favicon) return;
    
    if (logoBase64) {
        favicon.href = logoBase64;
    } else {
        favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>◆</text></svg>";
    }
}

/* ===== PASSWORD TOGGLE FUNCTIONS ===== */
window.toggleLoginAccountId = function() {
    const accountIdInput = document.getElementById('loginAccountId');
    const eyeIcon = document.getElementById('loginAccountEyeIcon');
    
    if (accountIdInput.type === 'password') {
        accountIdInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        accountIdInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
};

window.toggleAdminPassword = function() {
    const passwordInput = document.getElementById('adminPassInput');
    const eyeIcon = document.getElementById('adminEyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
};

/* ===== CURSOR GLOW ===== */
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.classList.add('active');
    });
    document.addEventListener('mouseleave', () => {
        glow.classList.remove('active');
    });
}

/* ===== SESSION CHECKS ===== */
function checkUserSession() {
    const userLoggedIn = localStorage.getItem('user_logged_in') === 'true';
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    const adminNavBar = document.getElementById('adminNavBar');
    if (userLoggedIn) {
        userLogoutBtn.classList.add('visible');
        adminNavBar.classList.remove('visible');
    } else {
        userLogoutBtn.classList.remove('visible');
    }
    return userLoggedIn;
}

document.getElementById('userLogoutBtn').addEventListener('click', function() {
    localStorage.removeItem('user_logged_in');
    appState.currentUser = null;
    saveLocalState();
    window.location.href = 'index.html';
});

function checkAdminSession() {
    const adminLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const navBar = document.getElementById('adminNavBar');
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    if (adminLoggedIn) {
        navBar.classList.add('visible');
        userLogoutBtn.classList.remove('visible');
    } else {
        navBar.classList.remove('visible');
        const userLoggedIn = localStorage.getItem('user_logged_in') === 'true';
        if (userLoggedIn) {
            userLogoutBtn.classList.add('visible');
        }
    }
    return adminLoggedIn;
}

document.getElementById('homeAdminLogoutBtn').addEventListener('click', function() {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('user_logged_in');
    appState.currentUser = null;
    saveLocalState();
    document.getElementById('adminNavBar').classList.remove('visible');
    document.getElementById('userLogoutBtn').classList.remove('visible');
    window.location.href = 'index.html';
});

/* ===== SOCIAL MEDIA RENDER ===== */
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

/* ===== OFFER BANNER UPDATE ===== */
function updateOfferBanner() {
    const credits = appState.offerCredits || 10;
    const name = appState.offerName || 'FREE SIGNAL OFFER';
    let description = appState.offerDescription || 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!';
    
    document.getElementById('offerTitle').textContent = name;
    
    const descContainer = document.getElementById('offerDescriptionText');
    
    const numberMatch = description.match(/\d+/);
    if (numberMatch) {
        let result = description.replace(/\d+/, `<span class="highlight" id="offerCreditsDisplay">${credits}</span>`);
        descContainer.innerHTML = result;
    } else {
        descContainer.innerHTML = `${description} <span class="highlight" id="offerCreditsDisplay">${credits}</span>`;
    }
}

/* ===== INFO POPUP ===== */
function showInfoPopup(icon, title, message, btnText, btnAction) {
    const popup = document.getElementById('infoPopup');
    document.getElementById('infoPopupIcon').textContent = icon || 'ℹ️';
    document.getElementById('infoPopupTitle').textContent = title || 'Info';
    document.getElementById('infoPopupMessage').textContent = message || 'Message here';
    const btn = document.getElementById('infoPopupBtn');
    if (btnText) {
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
    } else {
        btn.style.display = 'none';
    }
    popup.classList.add('active');
}

function closeInfoPopup() {
    document.getElementById('infoPopup').classList.remove('active');
}

document.getElementById('infoPopupClose').addEventListener('click', closeInfoPopup);

/* ===== VALIDATION ===== */
function isValidEmail(email) {
    return /^[^\s@]+@gmail\.com$/.test(email);
}

/* ===== FIREBASE DATA LISTENER ===== */
onValue(dbRef, (snapshot) => {
    isFirebaseConnected = true;
    document.getElementById('firebaseStatusDot').className = 'fb-status-dot green';
    const val = snapshot.val();
    if (val) {
        const currentUserEmail = appState.currentUser ? appState.currentUser.email : null;
        appState = { ...appState, ...val };
        if (val.logoClickCount !== undefined) appState.logoClickCount = val.logoClickCount;
        if (val.offerCredits !== undefined) appState.offerCredits = val.offerCredits;
        if (val.offerName !== undefined) appState.offerName = val.offerName;
        if (val.offerDescription !== undefined) appState.offerDescription = val.offerDescription;
        if (val.logoBase64 !== undefined && val.logoBase64 !== '') {
            appState.logoBase64 = val.logoBase64;
            applyLogo(val.logoBase64);
            localStorage.setItem('brt_logo', val.logoBase64);
        }
        if (val.socialMedia !== undefined) {
            appState.socialMedia = val.socialMedia;
            localStorage.setItem('brt_social', JSON.stringify(val.socialMedia));
            renderSocialMedia();
        }
        if (val.tools !== undefined) {
            appState.tools = val.tools;
            localStorage.setItem('brt_tools', JSON.stringify(val.tools));
        }
        if (val.brokers !== undefined) {
            appState.brokers = val.brokers;
            localStorage.setItem('brt_brokers', JSON.stringify(val.brokers));
        }
        if (val.creditPacks !== undefined) {
            appState.creditPacks = val.creditPacks;
            localStorage.setItem('brt_creditPacks', JSON.stringify(val.creditPacks));
        }
        if (currentUserEmail) {
            const found = appState.users.find(u => u.email === currentUserEmail);
            if (found) appState.currentUser = found;
            else appState.currentUser = null;
        }
        updateUI();
        updateOfferBanner();
        renderSocialMedia();
    }
}, (error) => {
    isFirebaseConnected = false;
    document.getElementById('firebaseStatusDot').className = 'fb-status-dot red';
    console.error('Firebase Error:', error);
});

/* ===== LOCAL STORAGE & STATE SYNC ===== */
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
    if (logoData) {
        appState.logoBase64 = logoData;
        applyLogo(logoData);
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
    updateUI();
    renderSocialMedia();
    updateOfferBanner();
    checkAdminSession();
    checkUserSession();
}

/* ===== UI UPDATES ===== */
function updateUI() {
    const brokerSelect = document.getElementById('signupBroker');
    brokerSelect.innerHTML = '<option value="">-- Select Broker --</option>';
    appState.brokers.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.name;
        opt.textContent = b.name;
        brokerSelect.appendChild(opt);
    });
    const verifyBroker = document.getElementById('verifyBroker');
    verifyBroker.innerHTML = '<option value="">-- Select Broker --</option>';
    appState.brokers.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.name;
        opt.textContent = b.name;
        verifyBroker.appendChild(opt);
    });
}

/* ===== MODAL HELPERS ===== */
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function openModal(id) { document.getElementById(id).classList.add('active'); }
window.closeModal = closeModal;
window.openModal = openModal;

/* ===== EVENT LISTENERS ===== */
document.getElementById('offerBanner').addEventListener('click', function() {
    const signupCard = document.getElementById('signupCard');
    signupCard.classList.remove('highlight');
    void signupCard.offsetWidth;
    signupCard.classList.add('highlight');
    setTimeout(() => { openModal('signupModal'); }, 500);
});

/* ===== AUTH HANDLERS ===== */
window.handleLogin = function() {
    const email = document.getElementById('loginEmail').value.trim();
    const accountId = document.getElementById('loginAccountId').value.trim();
    const errorEl = document.getElementById('loginError');
    
    if (!email || !accountId) {
        errorEl.textContent = '❌ Enter email and account ID';
        return;
    }

    if (!isValidEmail(email)) {
        errorEl.textContent = '❌ Please enter a valid Gmail address (example@gmail.com)';
        return;
    }
    
    const user = appState.users.find(u => u.email === email && u.accountId === accountId);
    
    if (!user) {
        showInfoPopup(
            '📝',
            'Account Not Found!',
            'No account found with these details. Please sign up first to get started.',
            'Sign Up Now',
            function() {
                closeModal('loginModal');
                openModal('signupModal');
            }
        );
        errorEl.textContent = '';
        return;
    }
    
    if (user.blocked) {
        errorEl.textContent = '🚫 Account blocked. Contact admin.';
        return;
    }
    
    if (!user.verified) {
        const pendingRequest = appState.verificationRequests?.find(
            req => req.userEmail === email && req.status === 'pending'
        );
        
        if (pendingRequest) {
            showInfoPopup(
                '⏳',
                'Verification Pending!',
                'Admin is currently reviewing your verification request. Please wait for approval. You will get access once verified.',
                null,
                null
            );
        } else {
            showInfoPopup(
                '✅',
                'Not Verified Yet!',
                'Please submit your verification request first. Admin will review and approve your account.',
                'Go to Verify',
                function() {
                    closeModal('loginModal');
                    openModal('verifyModal');
                }
            );
        }
        errorEl.textContent = '';
        return;
    }
    
    appState.currentUser = user;
    localStorage.setItem('user_logged_in', 'true');
    saveLocalState();
    closeModal('loginModal');
    errorEl.textContent = '';
    window.location.href = 'dashboard.html';
};

window.handleSignup = function() {
    const broker = document.getElementById('signupBroker').value;
    const email = document.getElementById('signupEmail').value.trim();
    const errorEl = document.getElementById('signupError');
    const successEl = document.getElementById('signupSuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (!broker) { errorEl.textContent = '❌ Select broker'; return; }
    if (!email) { errorEl.textContent = '❌ Enter email'; return; }

    if (!isValidEmail(email)) {
        errorEl.textContent = '❌ Please enter a valid Gmail address (example@gmail.com)';
        return;
    }

    const brokerData = appState.brokers.find(b => b.name === broker);
    if (!brokerData) { errorEl.textContent = '❌ Broker not found'; return; }
    if (appState.users.find(u => u.email === email)) { errorEl.textContent = '❌ User exists'; return; }
    
    const newUser = {
        email,
        accountId: '',
        name: email.split('@')[0],
        broker,
        verified: false,
        deposit: 0,
        requiredDeposit: brokerData.minDeposit,
        credits: 0,
        freeCredits: 0,
        signalsUsed: 0,
        todayUsed: 0,
        totalUsed: 0,
        blocked: false,
        registeredAt: new Date().toISOString()
    };
    appState.users.push(newUser);
    saveLocalState();
    updateUI();
    successEl.textContent = '✅ Account created! Please verify your ID. Opening broker...';
    setTimeout(() => { window.open(brokerData.link, '_blank'); }, 500);
    setTimeout(() => { closeModal('signupModal'); }, 1500);
};

document.getElementById('verifySubmitBtn').addEventListener('click', function() {
    window.handleVerify();
});

window.handleVerify = function() {
    const name = document.getElementById('verifyName').value.trim();
    const email = document.getElementById('verifyEmail').value.trim();
    const broker = document.getElementById('verifyBroker').value;
    const accountId = document.getElementById('verifyAccountId').value.trim();
    const errorEl = document.getElementById('verifyError');
    const successEl = document.getElementById('verifySuccess');
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (!name) { errorEl.textContent = '❌ Please enter your full name'; return; }
    if (!email) { errorEl.textContent = '❌ Please enter your email'; return; }

    if (!isValidEmail(email)) {
        errorEl.textContent = '❌ Please enter a valid Gmail address (example@gmail.com)';
        return;
    }

    if (!broker) { errorEl.textContent = '❌ Please select your broker'; return; }
    if (!accountId) { errorEl.textContent = '❌ Please enter your Account ID (Numbers only)'; return; }
    
    let user = appState.users.find(u => u.email === email);
    if (!user) {
        const brokerData = appState.brokers.find(b => b.name === broker);
        user = {
            email,
            accountId: accountId,
            name: name,
            broker: broker,
            verified: false,
            deposit: 0,
            requiredDeposit: brokerData ? brokerData.minDeposit : 0,
            credits: 0,
            freeCredits: 0,
            signalsUsed: 0,
            todayUsed: 0,
            totalUsed: 0,
            blocked: false,
            registeredAt: new Date().toISOString()
        };
        appState.users.push(user);
    }
    
    if (user.blocked) {
        errorEl.textContent = '🚫 Account blocked. Contact admin.';
        return;
    }
    
    if (user.verified) {
        errorEl.textContent = '✅ Already verified! You can login.';
        return;
    }
    
    const existingPending = appState.verificationRequests?.find(
        req => req.userEmail === email && req.status === 'pending'
    );
    if (existingPending) {
        errorEl.textContent = '⏳ Verification already pending. Wait for admin.';
        return;
    }
    
    const newRequest = {
        userName: name,
        userEmail: email,
        accountId: accountId,
        broker: broker,
        status: 'pending',
        date: new Date().toISOString(),
        freeCredits: appState.offerCredits || 10
    };
    
    if (!appState.verificationRequests) appState.verificationRequests = [];
    appState.verificationRequests.push(newRequest);
    
    user.name = name;
    user.accountId = accountId;
    
    saveLocalState();
    
    showInfoPopup(
        '✅',
        'Verification Submitted!',
        'Your verification request has been submitted successfully. Please wait for admin approval. You will be notified once verified.',
        null,
        null
    );
    
    document.getElementById('verifyName').value = '';
    document.getElementById('verifyEmail').value = '';
    document.getElementById('verifyAccountId').value = '';
    document.getElementById('verifyBroker').value = '';
    errorEl.textContent = '';
    successEl.textContent = '';
};

document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
document.getElementById('signupBtn').addEventListener('click', () => openModal('signupModal'));
document.getElementById('verifyBtn').addEventListener('click', () => openModal('verifyModal'));

document.getElementById('signupBroker').addEventListener('change', function() {
    const brokerName = this.value;
    const infoDiv = document.getElementById('brokerInfo');
    const broker = appState.brokers.find(b => b.name === brokerName);
    if (broker) {
        infoDiv.style.display = 'block';
        document.getElementById('brokerAffiliateLink').textContent = broker.link;
        document.getElementById('brokerMinDeposit').textContent = broker.minDeposit;
        document.getElementById('brokerRules').textContent = '📋 ' + broker.rules;
    } else {
        infoDiv.style.display = 'none';
    }
});

/* ===== LOGO CLICK ADMIN ACCESS (now shows password popup) ===== */
let logoClickCounter = 0;

function handleLogoClick() {
    // If admin already logged in, go directly
    if (localStorage.getItem('admin_logged_in') === 'true') {
        window.location.href = 'admin.html';
        return;
    }
    // Otherwise, increment counter and show password popup after threshold
    logoClickCounter++;
    const requiredClicks = appState.logoClickCount || 2;
    if (logoClickCounter >= requiredClicks) {
        logoClickCounter = 0;
        showPasswordPopup();
    }
}

document.getElementById('logoIcon').addEventListener('click', function(e) {
    e.preventDefault();
    handleLogoClick();
});
document.getElementById('logoImage').addEventListener('click', function(e) {
    e.preventDefault();
    handleLogoClick();
});
document.getElementById('brandSection').addEventListener('click', function(e) {
    if (e.target.closest('.logo-icon') || e.target.closest('.logo-img') || e.target.closest('.brand-name')) {
        handleLogoClick();
    }
});

/* ===== PASSWORD POPUP FUNCTIONS (moved from admin) ===== */
function showPasswordPopup() {
    document.getElementById('passwordOverlay').classList.add('active');
    document.getElementById('adminPassInput').value = '';
    document.getElementById('adminLoginBtn').disabled = true;
    document.getElementById('adminLoginBtn').classList.remove('enabled');
    document.getElementById('adminPassInput').classList.remove('correct', 'wrong');
    document.getElementById('adminPassError').textContent = '';
    const adminEyeIcon = document.getElementById('adminEyeIcon');
    if (adminEyeIcon) adminEyeIcon.className = 'fas fa-eye';
    setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
}

window.hidePasswordPopup = function() {
    document.getElementById('passwordOverlay').classList.remove('active');
};

window.checkAdminPassword = function() {
    const pass = document.getElementById('adminPassInput').value;
    const loginBtn = document.getElementById('adminLoginBtn');
    const errorEl = document.getElementById('adminPassError');
    if (pass === appState.password) {
        loginBtn.disabled = false;
        loginBtn.classList.add('enabled');
        document.getElementById('adminPassInput').classList.add('correct');
        document.getElementById('adminPassInput').classList.remove('wrong');
        errorEl.textContent = '';
    } else {
        loginBtn.disabled = true;
        loginBtn.classList.remove('enabled');
        document.getElementById('adminPassInput').classList.remove('correct');
        if (pass.length > 0) {
            document.getElementById('adminPassInput').classList.add('wrong');
            errorEl.textContent = '❌ Incorrect password';
        } else {
            document.getElementById('adminPassInput').classList.remove('wrong');
            errorEl.textContent = '';
        }
    }
};

window.adminLogin = function() {
    if (document.getElementById('adminPassInput').value === appState.password) {
        localStorage.setItem('admin_logged_in', 'true');
        hidePasswordPopup();
        window.location.href = 'admin.html';
    }
};

document.getElementById('adminPassInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !document.getElementById('adminLoginBtn').disabled) {
        adminLogin();
    }
});

/* ===== LOGO GLOW & ZOOM ANIMATIONS ===== */
const logoGlow = document.getElementById('logoGlow');

document.addEventListener('click', function(e) {
    if (e.target.closest('.overlay')) return;
    if (e.target.closest('.modal')) return;
    if (e.target.closest('.admin-nav-bar')) return;
    if (e.target.closest('.user-logout-btn')) return;
    if (e.target.closest('.info-popup-overlay')) return;
    if (e.target.closest('.password-overlay')) return;  // don't trigger glow on password popup click

    logoGlow.classList.remove('active');
    void logoGlow.offsetWidth;
    logoGlow.classList.add('active');
    setTimeout(() => {
        logoGlow.classList.remove('active');
    }, 800);

    const logoIcon = document.getElementById('logoIcon');
    const logoImg = document.getElementById('logoImage');
    const brandName = document.querySelector('.brand-name');

    if (logoIcon.style.display !== 'none') {
        logoIcon.style.animation = 'none';
        void logoIcon.offsetWidth;
        logoIcon.style.animation = 'zoomInSlow 0.7s ease forwards';
    }
    if (logoImg.style.display !== 'none') {
        logoImg.style.animation = 'none';
        void logoImg.offsetWidth;
        logoImg.style.animation = 'zoomInSlow 0.7s ease forwards';
    }
    brandName.style.animation = 'none';
    void brandName.offsetWidth;
    brandName.style.animation = 'zoomOutSlow 0.7s ease forwards';

    setTimeout(() => {
        if (logoIcon.style.display !== 'none') {
            logoIcon.style.animation = '';
        }
        if (logoImg.style.display !== 'none') {
            logoImg.style.animation = '';
        }
        brandName.style.animation = '';
    }, 800);
});

/* ===== INITIALIZATION ===== */
loadLocalState();
console.log('🏠 Home Page Loaded');
console.log('🔑 Admin Password: ' + appState.password);
console.log('📢 Offer: ' + appState.offerName + ' - ' + appState.offerCredits + ' credits');

/* ===== ESCAPE KEY & OVERLAY CLOSE ===== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.overlay.active').forEach(el => el.classList.remove('active'));
        closeInfoPopup();
        hidePasswordPopup();
    }
});

document.getElementById('infoPopup').addEventListener('click', function(e) {
    if (e.target === this) {
        closeInfoPopup();
    }
});

/* ===== EXPORT GLOBAL FUNCTIONS ===== */
window.showInfoPopup = showInfoPopup;
window.closeInfoPopup = closeInfoPopup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleVerify = handleVerify;
window.isValidEmail = isValidEmail;
window.showPasswordPopup = showPasswordPopup;
window.hidePasswordPopup = hidePasswordPopup;
window.checkAdminPassword = checkAdminPassword;
window.adminLogin = adminLogin;
window.toggleLoginAccountId = toggleLoginAccountId;
window.toggleAdminPassword = toggleAdminPassword;
