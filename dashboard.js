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
    offerCredits: 10, 
    upiId: 'binary@ruthless', 
    paymentInstructions: 'Please transfer the amount to the UPI ID below.',
    qrCodeBase64: '', 
    creditPrice: 2, 
    paymentApprovalMode: 'manual', 
    paymentGateway: 'none', 
    paymentEnvironment: 'test',
    creditPacks: [{ id: 'pack_1', credits: 50, price: 99 }, { id: 'pack_2', credits: 100, price: 199 }, { id: 'pack_3', credits: 250, price: 349 }, { id: 'pack_4', credits: 500, price: 599 }],
    users: [], 
    currentUser: null,
    logoBase64: '', 
    payments: [], 
    chats: {},
    tools: [], 
    socialMedia: [], 
    logoClickCount: 2,
    creditsPerSignal: 1
};

let isFirebaseConnected = false, selectedCreditPack = null;
let chatUnreadCount = 0;
let currentToolIndex = -1;
let openTools = [];
let recentTools = [];
let isToolMinimized = false;
let toolDataCache = {};
let isDeducting = false;

/* ===== LOGO HANDLING ===== */
function applyLogo(logoBase64) {
    const logoIcon = document.getElementById('logoIcon');
    const logoImg = document.getElementById('logoImage');
    if (logoBase64) {
        logoIcon.style.display = 'none';
        logoImg.src = logoBase64;
        logoImg.style.display = 'block';
    } else {
        logoIcon.style.display = 'block';
        logoImg.style.display = 'none';
    }
}

/* ===== SOCIAL MEDIA RENDER ===== */
function renderSocialMedia() {
    const container = document.getElementById('dashSocialIcons');
    if (!container) return;
    let socials = appState.socialMedia || [];
    if (socials.length === 0) {
        const localSocial = localStorage.getItem('brt_social');
        if (localSocial) { try { socials = JSON.parse(localSocial); } catch (e) {} }
    }
    const visibleSocials = socials.filter(s => s.visibility === 'visible');
    if (visibleSocials.length === 0) {
        container.innerHTML = `
            <a href="#"><i class="fab fa-telegram-plane"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-youtube"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>`;
        container.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) { e.preventDefault(); alert('📱 Configure in Admin'); });
        });
        return;
    }
    container.innerHTML = '';
    visibleSocials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.url || '#';
        a.target = '_blank';
        a.title = social.name || 'Link';
        a.innerHTML = `<i class="${social.icon || 'fas fa-link'}"></i>`;
        a.addEventListener('click', function(e) {
            if (social.url === '#') { e.preventDefault(); alert('📱 ' + social.name + ' - Configure URL in Admin'); }
        });
        container.appendChild(a);
    });
}

/* ===== SESSION MANAGEMENT ===== */
function getActiveSession() {
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    const userLoggedIn = sessionStorage.getItem('user_logged_in') === 'true';
    if (adminLoggedIn) return { type: 'admin', loggedIn: true };
    if (userLoggedIn) return { type: 'user', loggedIn: true };
    return { type: 'none', loggedIn: false };
}

function getCurrentUser() {
    const session = getActiveSession();
    if (session.type === 'admin') {
        const adminUser = appState.users.find(u => u.email && u.email.toLowerCase().includes('admin'));
        if (adminUser) return adminUser;
        const defaultAdmin = {
            email: 'admin@binaryruthless.com', accountId: 'ADMIN001', name: 'Admin',
            verified: true, adminAdded: true, deposit: 0, requiredDeposit: 0,
            credits: 999, signalsUsed: 0, todayUsed: 0, totalUsed: 0,
            blocked: false, registeredAt: new Date().toISOString()
        };
        const existing = appState.users.find(u => u.email === defaultAdmin.email);
        if (!existing) { appState.users.push(defaultAdmin); saveLocalState(); }
        return defaultAdmin;
    } else if (session.type === 'user') {
        return appState.currentUser;
    }
    return null;
}

function checkUserSession() {
    const session = getActiveSession();
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    const adminNavBar = document.getElementById('adminNavBar');
    if (session.type === 'admin') {
        adminNavBar.classList.add('visible');
        userLogoutBtn.classList.remove('visible');
        return true;
    } else if (session.type === 'user') {
        adminNavBar.classList.remove('visible');
        userLogoutBtn.classList.add('visible');
        return true;
    } else {
        adminNavBar.classList.remove('visible');
        userLogoutBtn.classList.remove('visible');
        window.location.href = 'index.html';
        return false;
    }
}

document.getElementById('userLogoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('user_logged_in');
    appState.currentUser = null;
    saveLocalState();
    window.location.href = 'index.html';
});

document.getElementById('dashAdminLogoutBtn').addEventListener('click', function() {
    sessionStorage.removeItem('admin_logged_in');
    const userLoggedIn = sessionStorage.getItem('user_logged_in') === 'true';
    if (userLoggedIn) { window.location.reload(); } else { window.location.href = 'index.html'; }
});

/* ===== TODAY USED RESET ===== */
function resetTodayUsed() {
    const now = new Date();
    const lastReset = localStorage.getItem('lastResetDate');
    const today = now.toDateString();
    if (lastReset !== today) {
        appState.users.forEach(u => { u.todayUsed = 0; });
        localStorage.setItem('lastResetDate', today);
        saveLocalState();
        updateUI();
    }
}

/* ===== FIREBASE DATA LISTENER ===== */
onValue(dbRef, (snapshot) => {
    isFirebaseConnected = true; document.getElementById('firebaseStatusDot').className = 'fb-status-dot green';
    const val = snapshot.val();
    if (val) {
        const currentUserEmail = appState.currentUser ? appState.currentUser.email : null;
        appState = { ...appState, ...val };
        if (val.tools !== undefined) { appState.tools = val.tools; renderTools(); localStorage.setItem('brt_tools', JSON.stringify(val.tools)); }
        if (val.logoBase64 !== undefined && val.logoBase64 !== '') { appState.logoBase64 = val.logoBase64; applyLogo(val.logoBase64); localStorage.setItem('brt_logo', val.logoBase64); }
        if (val.logoClickCount !== undefined) appState.logoClickCount = val.logoClickCount;
        if (val.socialMedia !== undefined) { appState.socialMedia = val.socialMedia; localStorage.setItem('brt_social', JSON.stringify(val.socialMedia)); renderSocialMedia(); }
        if (val.creditPacks !== undefined) { appState.creditPacks = val.creditPacks; renderCreditPacks(); }
        if (val.creditsPerSignal !== undefined) { appState.creditsPerSignal = val.creditsPerSignal; }
        if (val.qrCodeBase64 !== undefined) { appState.qrCodeBase64 = val.qrCodeBase64; loadQRPreview(); }
        if (val.paymentApprovalMode !== undefined) { appState.paymentApprovalMode = val.paymentApprovalMode; }
        if (val.upiId !== undefined) { appState.upiId = val.upiId; }
        if (val.paymentInstructions !== undefined) { appState.paymentInstructions = val.paymentInstructions; }
        
        const session = getActiveSession();
        if (session.type === 'user' && currentUserEmail) {
            const found = appState.users.find(u => u.email === currentUserEmail);
            if (found) appState.currentUser = found;
            else { appState.currentUser = null; sessionStorage.removeItem('user_logged_in'); }
        } else if (session.type === 'admin') {
            const adminUser = appState.users.find(u => u.email && u.email.toLowerCase().includes('admin'));
            if (adminUser) appState.currentUser = adminUser;
        }
        
        resetTodayUsed();
        updateUI(); renderPaymentHistory(); renderCreditPacks(); loadQRPreview(); updateChatBadge(); checkUserSession();
        if (document.getElementById('toolFullscreen').classList.contains('active')) { updateToolHeader(); updateSwitchButtons(); }
    }
}, (error) => { isFirebaseConnected = false; document.getElementById('firebaseStatusDot').className = 'fb-status-dot red'; console.error(error); });

/* ===== LOCAL STORAGE & STATE SYNC ===== */
function saveLocalState() { localStorage.setItem('brt_data', JSON.stringify(appState)); if (isFirebaseConnected) set(dbRef, appState).catch(e => console.error(e)); }

function loadLocalState() {
    const local = localStorage.getItem('brt_data');
    if (local) { try { const parsed = JSON.parse(local); appState = { ...appState, ...parsed }; } catch(e) { console.error(e); } }
    const toolsData = localStorage.getItem('brt_tools');
    if (toolsData) { try { const parsedTools = JSON.parse(toolsData); if (parsedTools.length > 0) appState.tools = parsedTools; } catch(e) {} }
    const logoData = localStorage.getItem('brt_logo'); 
    if (logoData) { appState.logoBase64 = logoData; applyLogo(logoData); }
    const socialData = localStorage.getItem('brt_social');
    if (socialData) { try { const parsed = JSON.parse(socialData); if (parsed.length > 0) appState.socialMedia = parsed; } catch(e) {} }
    const creditPacksData = localStorage.getItem('brt_creditPacks');
    if (creditPacksData) { try { const parsed = JSON.parse(creditPacksData); if (parsed.length > 0) appState.creditPacks = parsed; } catch(e) {} }
    const qrData = localStorage.getItem('brt_qr'); if (qrData) { appState.qrCodeBase64 = qrData; }
    const upiData = localStorage.getItem('brt_upi'); if (upiData) { appState.upiId = upiData; }
    const paymentInstructionsData = localStorage.getItem('brt_payment_instructions');
    if (paymentInstructionsData) { appState.paymentInstructions = paymentInstructionsData; }
    const paymentApprovalModeData = localStorage.getItem('brt_payment_approval_mode');
    if (paymentApprovalModeData) { appState.paymentApprovalMode = paymentApprovalModeData; }
    
    const savedCache = localStorage.getItem('brt_tool_cache');
    if (savedCache) { try { toolDataCache = JSON.parse(savedCache); } catch(e) {} }
    const savedRecent = localStorage.getItem('brt_recent_tools');
    if (savedRecent) { try { recentTools = JSON.parse(savedRecent); } catch(e) {} }
    const savedOpenTools = localStorage.getItem('brt_open_tools');
    if (savedOpenTools) { try { openTools = JSON.parse(savedOpenTools); } catch(e) {} }
    const savedCurrent = localStorage.getItem('brt_current_tool');
    if (savedCurrent !== null) { currentToolIndex = parseInt(savedCurrent); }
    
    const session = getActiveSession();
    if (session.type === 'admin') {
        const adminUser = appState.users.find(u => u.email && u.email.toLowerCase().includes('admin'));
        if (adminUser) appState.currentUser = adminUser;
        else {
            const defaultAdmin = {
                email: 'admin@binaryruthless.com', accountId: 'ADMIN001', name: 'Admin',
                verified: true, adminAdded: true, deposit: 0, requiredDeposit: 0,
                credits: 999, signalsUsed: 0, todayUsed: 0, totalUsed: 0,
                blocked: false, registeredAt: new Date().toISOString()
            };
            appState.users.push(defaultAdmin); appState.currentUser = defaultAdmin; saveLocalState();
        }
    } else if (session.type === 'user') {
        if (!appState.currentUser) { window.location.href = 'index.html'; return; }
        const key = getChatKey(appState.currentUser.email);
        const msgs = appState.chats && appState.chats[key] ? appState.chats[key] : [];
        const unread = msgs.filter(m => m.sender === 'admin' && !m.read).length;
        chatUnreadCount = unread;
    } else { window.location.href = 'index.html'; return; }
    resetTodayUsed();
    updateUI(); renderTools(); renderPaymentHistory(); renderCreditPacks(); loadQRPreview(); updateChatBadge(); checkUserSession();
    renderSocialMedia();
    
    const toolMinimized = sessionStorage.getItem('brt_tool_minimized') === 'true';
    if (toolMinimized && recentTools.length > 0) {
        document.getElementById('recentToolsMini').style.display = 'block';
        updateRecentToolsMini();
        isToolMinimized = true;
    }
    
    const wasToolOpen = sessionStorage.getItem('brt_tool_open') === 'true';
    if (wasToolOpen && openTools.length > 0 && currentToolIndex >= 0) {
        const tool = appState.tools[currentToolIndex];
        if (tool) {
            const overlay = document.getElementById('toolFullscreen');
            const iframe = document.getElementById('toolFullscreenIframe');
            overlay.classList.add('active');
            const cacheKey = 'tool_' + currentToolIndex;
            let htmlContent = tool.htmlCode || '<div style="text-align:center;padding:40px;color:#FF0033;font-family:Orbitron;"><h2>🎯 Tool</h2><p style="color:#888;font-size:0.8rem;">No HTML code provided.</p></div>';
            if (toolDataCache[cacheKey]) { htmlContent = toolDataCache[cacheKey]; }
            htmlContent = prepareToolHTML(currentToolIndex, htmlContent);
            iframe.srcdoc = htmlContent;
            updateToolHeader();
            updateSwitchButtons();
            document.getElementById('recentToolsMini').style.display = 'none';
            isToolMinimized = false;
        }
    } else { sessionStorage.removeItem('brt_tool_open'); }
}

/* ===== TOOL HTML PREPARATION ===== */
function prepareToolHTML(index, htmlContent) {
    const user = appState.currentUser;
    if (!user) return htmlContent;
    htmlContent = htmlContent.replace(/{{USER_EMAIL}}/g, user.email);
    htmlContent = htmlContent.replace(/{{USER_NAME}}/g, user.name || user.email.split('@')[0]);
    htmlContent = htmlContent.replace(/{{USER_CREDITS}}/g, user.credits || 0);
    
    const injectScript = `
    <script>
        let signalGenerated = false, signalSuccess = false, signalSent = false;
        const USER_EMAIL = '${user.email}';
        const USER_NAME = '${user.name || user.email.split('@')[0]}';
        const USER_CREDITS = ${user.credits || 0};
        document.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            const text = btn.textContent || '';
            const btnId = btn.id || '';
            if (text.includes('Signal') || text.includes('Get') || text.includes('Generate') || 
                text.includes('BUY') || text.includes('SELL') || text.includes('TRADE') ||
                text.toLowerCase().includes('signal') || text.toLowerCase().includes('get') || 
                btnId === 'generateSignalBtn' || btnId === 'btnSignal' || btnId === 'getSignalBtn') {
                signalGenerated = false; signalSuccess = false; signalSent = false;
                setTimeout(() => { watchForSignalResult(); }, 500);
            }
        });
        function watchForSignalResult() {
            const signalView = document.getElementById('signalView');
            const errorView = document.getElementById('errorView');
            const waitingView = document.getElementById('waitingView');
            const statusView = document.getElementById('statusView');
            let attempts = 0;
            const maxAttempts = 40;
            const checkInterval = setInterval(() => {
                attempts++;
                const isSuccess = (
                    (signalView && signalView.classList && signalView.classList.contains('active')) ||
                    (statusView && statusView.classList && statusView.classList.contains('active') && statusView.textContent && statusView.textContent.includes('✅')) ||
                    (document.querySelector('#signalView.active')) ||
                    (document.querySelector('[class*="signal"]') && document.querySelector('[class*="signal"]').textContent && document.querySelector('[class*="signal"]').textContent.includes('✅'))
                );
                if (isSuccess && !signalSent) {
                    clearInterval(checkInterval); signalSent = true; signalSuccess = true; signalGenerated = true;
                    window.parent.postMessage({ type: 'signalResult', success: true }, '*'); return;
                }
                const isFailure = (
                    (errorView && errorView.classList && errorView.classList.contains('active')) ||
                    (document.querySelector('#errorView.active')) ||
                    (document.querySelector('[class*="error"]') && document.querySelector('[class*="error"]').textContent && (document.querySelector('[class*="error"]').textContent.includes('❌') || document.querySelector('[class*="error"]').textContent.includes('Error')))
                );
                if (isFailure && !signalSent) {
                    clearInterval(checkInterval); signalSent = true; signalSuccess = false; signalGenerated = true;
                    window.parent.postMessage({ type: 'signalResult', success: false }, '*'); return;
                }
                if (waitingView && waitingView.classList && waitingView.classList.contains('active')) { return; }
                if (attempts >= maxAttempts && !signalSent) {
                    clearInterval(checkInterval); signalSent = true;
                    window.parent.postMessage({ type: 'signalResult', success: false }, '*');
                }
            }, 500);
        }
        if (typeof renderSignalResult === 'function') {
            const originalRender = renderSignalResult;
            window.renderSignalResult = function(data) {
                originalRender(data);
                if (!signalSent) { signalSent = true; window.parent.postMessage({ type: 'signalResult', success: true }, '*'); }
            };
        }
        if (typeof showError === 'function') {
            const originalShowError = showError;
            window.showError = function(msg) {
                originalShowError(msg);
                if (!signalSent) { signalSent = true; window.parent.postMessage({ type: 'signalResult', success: false }, '*'); }
            };
        }
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' || mutation.type === 'childList') {
                    const signalView = document.getElementById('signalView');
                    const errorView = document.getElementById('errorView');
                    if (signalView && signalView.classList && signalView.classList.contains('active') && !signalSent) {
                        signalSent = true; signalGenerated = true; signalSuccess = true;
                        window.parent.postMessage({ type: 'signalResult', success: true }, '*');
                    }
                    if (errorView && errorView.classList && errorView.classList.contains('active') && !signalSent) {
                        signalSent = true; signalGenerated = true; signalSuccess = false;
                        window.parent.postMessage({ type: 'signalResult', success: false }, '*');
                    }
                }
            });
        });
        setTimeout(() => {
            const targetNode = document.body;
            if (targetNode) { observer.observe(targetNode, { attributes: true, childList: true, subtree: true }); }
        }, 1000);
        console.log('✅ Signal detection injected');
    <\/script>`;
    
    return htmlContent + injectScript;
}

/* ===== TOOLS RENDERING ===== */
function renderTools() {
    const container = document.getElementById('toolsContainer');
    if (!container) return;
    container.innerHTML = '';
    const tools = appState.tools || [];
    const visibleTools = tools.filter(tool => tool.visibility === 'visible');
    if (visibleTools.length === 0) { container.innerHTML = ''; return; }
    visibleTools.forEach((tool, idx) => {
        const btn = document.createElement('button');
        btn.className = 'tool-btn';
        let toolNameHtml = tool.name || 'Untitled Tool';
        if (toolNameHtml.includes('RUTHLESS')) {
            toolNameHtml = toolNameHtml.replace(/RUTHLESS/g, '<span class="ruthless-in-tool">RUTHLESS</span>');
        }
        const showFire = tool.showFire !== undefined ? tool.showFire : true;
        btn.innerHTML = `
            <div class="tool-name">
                ${showFire ? '<span class="tool-fire">🔥</span>' : ''}
                ${toolNameHtml}
                ${showFire ? '<span class="tool-fire">🔥</span>' : ''}
            </div>
            ${tool.subName ? `<div class="tool-subname">${tool.subName}</div>` : ''}`;
        const globalIdx = appState.tools.indexOf(tool);
        btn.addEventListener('click', function() { openToolFullscreen(globalIdx); });
        container.appendChild(btn);
    });
}

/* ===== TOOL FULLSCREEN MANAGEMENT ===== */
function updateToolHeader() {
    const user = appState.currentUser;
    if (!user) return;
    document.getElementById('toolHeaderUserName').textContent = user.name || user.email.split('@')[0];
    document.getElementById('toolHeaderCredits').textContent = '💰 ' + user.credits;
    document.getElementById('toolHeaderTodayUsed').textContent = '📊 Today: ' + (user.todayUsed || 0);
}

function updateSwitchButtons() {
    const container = document.getElementById('toolSwitchContainer');
    if (!container) return;
    container.innerHTML = '';
    const tools = appState.tools || [];
    const displayTools = openTools.slice(0, 2);
    if (displayTools.length === 0) { return; }
    displayTools.forEach((toolIdx, slot) => {
        if (tools[toolIdx]) {
            const btn = document.createElement('button');
            btn.className = 'tool-switch-btn';
            btn.textContent = tools[toolIdx].name || 'Tool ' + (slot + 1);
            if (currentToolIndex === toolIdx) { btn.classList.add('active-tool'); }
            btn.addEventListener('click', function() { if (currentToolIndex !== toolIdx) { switchTool(toolIdx); } });
            container.appendChild(btn);
        }
    });
}

function switchTool(index) {
    if (!appState.tools[index]) return;
    if (index === currentToolIndex) return;
    saveCurrentToolData();
    currentToolIndex = index;
    localStorage.setItem('brt_current_tool', currentToolIndex);
    const tool = appState.tools[currentToolIndex];
    const iframe = document.getElementById('toolFullscreenIframe');
    const cacheKey = 'tool_' + currentToolIndex;
    let htmlContent = tool.htmlCode || '<div style="text-align:center;padding:40px;color:#FF0033;font-family:Orbitron;"><h2>🎯 Tool</h2><p style="color:#888;font-size:0.8rem;">No HTML code provided.</p></div>';
    if (toolDataCache[cacheKey]) { htmlContent = toolDataCache[cacheKey]; }
    htmlContent = prepareToolHTML(currentToolIndex, htmlContent);
    iframe.srcdoc = htmlContent;
    updateSwitchButtons();
    updateToolHeader();
}

function openToolFullscreen(index) {
    const user = appState.currentUser;
    if (!user) { alert('Please login first!'); return; }
    if (user.blocked) { alert('🚫 Account blocked'); return; }
    if (user.credits < 1) { openModal('noCreditsPopup'); return; }
    const tools = appState.tools || [];
    const tool = tools[index];
    if (!tool) return;
    sessionStorage.setItem('brt_tool_open', 'true');
    isToolMinimized = false;
    sessionStorage.setItem('brt_tool_minimized', 'false');
    document.getElementById('recentToolsMini').style.display = 'none';
    if (!openTools.includes(index)) {
        if (openTools.length >= 2) { openTools.shift(); }
        openTools.push(index);
        localStorage.setItem('brt_open_tools', JSON.stringify(openTools));
    }
    currentToolIndex = index;
    localStorage.setItem('brt_current_tool', currentToolIndex);
    updateToolHeader();
    const overlay = document.getElementById('toolFullscreen');
    const iframe = document.getElementById('toolFullscreenIframe');
    overlay.classList.add('active');
    const cacheKey = 'tool_' + index;
    let htmlContent = tool.htmlCode || '<div style="text-align:center;padding:40px;color:#FF0033;font-family:Orbitron;"><h2>🎯 Tool</h2><p style="color:#888;font-size:0.8rem;">No HTML code provided.</p></div>';
    if (toolDataCache[cacheKey]) { htmlContent = toolDataCache[cacheKey]; }
    htmlContent = prepareToolHTML(index, htmlContent);
    iframe.srcdoc = htmlContent;
    if (!recentTools.includes(index)) {
        recentTools.unshift(index);
        if (recentTools.length > 5) recentTools.pop();
        localStorage.setItem('brt_recent_tools', JSON.stringify(recentTools));
    }
    updateRecentToolsMini();
    updateSwitchButtons();
}

function saveCurrentToolData() {
    if (currentToolIndex === -1) return;
    try {
        const iframe = document.getElementById('toolFullscreenIframe');
        iframe.contentWindow.postMessage({ type: 'saveData', toolIndex: currentToolIndex }, '*');
    } catch(e) {}
}

/* ===== SIGNAL RESULT HANDLER (Credit Deduction) ===== */
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'signalResult') {
        if (isDeducting) { console.log('⚠️ Deduction already in progress'); return; }
        if (event.data.success === true) {
            const success = deductCredit();
            if (success) {
                document.getElementById('toolFullscreenIframe').contentWindow.postMessage({ type: 'signalResult', success: true, credits: appState.currentUser.credits }, '*');
            }
        } else {
            document.getElementById('toolFullscreenIframe').contentWindow.postMessage({ type: 'signalResult', success: false, error: event.data.error || 'Signal generation failed' }, '*');
        }
        return;
    }
    if (event.data && event.data.type === 'saveToolData') {
        const cacheKey = 'tool_' + event.data.toolIndex;
        toolDataCache[cacheKey] = event.data.htmlContent;
        localStorage.setItem('brt_tool_cache', JSON.stringify(toolDataCache));
    }
});

/* ===== RECENT TOOLS MINI ===== */
function updateRecentToolsMini() {
    const mini = document.getElementById('recentToolsMini');
    const sub = document.getElementById('recentToolsMiniSub');
    if (recentTools.length === 0) { mini.style.display = 'none'; return; }
    const tools = appState.tools || [];
    const names = recentTools.filter(i => tools[i]).map(i => tools[i].name).join(' • ');
    sub.textContent = names || 'Click to open';
}

document.getElementById('recentToolsMini').addEventListener('click', function() {
    if (recentTools.length === 0) return;
    const lastTool = recentTools[0];
    if (appState.tools && appState.tools[lastTool]) {
        const user = appState.currentUser;
        if (!user) { alert('Please login first!'); return; }
        if (user.blocked) { alert('🚫 Account blocked'); return; }
        if (user.credits < 1) { openModal('noCreditsPopup'); return; }
        openToolFullscreen(lastTool);
    }
});

document.getElementById('toolFullscreenClose').addEventListener('click', function() {
    saveCurrentToolData();
    document.getElementById('toolFullscreen').classList.remove('active');
    window._currentTool = null;
    isToolMinimized = true;
    sessionStorage.setItem('brt_tool_minimized', 'true');
    sessionStorage.removeItem('brt_tool_open');
    if (recentTools.length > 0) {
        document.getElementById('recentToolsMini').style.display = 'block';
        updateRecentToolsMini();
    }
});

/* ===== ACCOUNT DETAILS ===== */
window.openAccountModal = function() {
    const user = appState.currentUser;
    if (!user) return;
    const container = document.getElementById('accountDetailsContent');
    container.innerHTML = `
        <div class="account-detail-row"><span class="label">Name</span><span class="value">${user.name || 'N/A'}</span></div>
        <div class="account-detail-row"><span class="label">Email</span><span class="value">${user.email}</span></div>
        <div class="account-detail-row"><span class="label">Account ID</span><span class="value">${user.accountId || 'N/A'}</span></div>
        <div class="account-detail-row"><span class="label">Broker</span><span class="value">${user.broker || 'N/A'}</span></div>
        <div class="account-detail-row"><span class="label">Status</span><span class="value ${user.blocked ? 'red' : 'green'}">${user.blocked ? '🚫 Blocked' : '✅ Verified'}</span></div>
        <div class="account-detail-row"><span class="label">Available Credits</span><span class="value green">${user.credits || 0}</span></div>
        <div class="account-detail-row"><span class="label">Free Credits</span><span class="value">${user.freeCredits || 0}</span></div>
        <div class="account-detail-row"><span class="label">Today Used</span><span class="value">${user.todayUsed || 0}</span></div>
        <div class="account-detail-row"><span class="label">Registered</span><span class="value" style="font-size:0.6rem;">${user.registeredAt ? new Date(user.registeredAt).toLocaleString() : 'N/A'}</span></div>`;
    openModal('accountModal');
};

/* ===== CREDIT DEDUCTION ===== */
function deductCredit() {
    if (isDeducting) return false;
    isDeducting = true;
    try {
        const user = appState.currentUser;
        if (!user) return false;
        const creditsToDeduct = appState.creditsPerSignal || 1;
        if (user.credits < creditsToDeduct) { isDeducting = false; return false; }
        user.credits -= creditsToDeduct;
        user.signalsUsed = (user.signalsUsed || 0) + 1;
        user.todayUsed = (user.todayUsed || 0) + 1;
        user.totalUsed = (user.totalUsed || 0) + 1;
        saveLocalState();
        updateUI();
        updateToolHeader();
        isDeducting = false;
        return true;
    } catch(e) { isDeducting = false; return false; }
}

/* ===== UI UPDATES ===== */
function updateUI() {
    const user = appState.currentUser;
    if (user) { 
        document.getElementById('dashUserName').textContent = user.name || user.email.split('@')[0]; 
        document.getElementById('dashCredits').textContent = user.credits || 0; 
        document.getElementById('dashTodayUsed').textContent = user.todayUsed || 0;
    }
    updateToolHeader();
}

/* ===== CHAT ===== */
function getChatKey(userEmail) { return userEmail ? userEmail.replace(/[.#$\/\[\]]/g, '_') : ''; }

function updateChatBadge() {
    const badge = document.getElementById('chatBadge');
    if (!badge) return;
    if (chatUnreadCount > 0) {
        badge.classList.add('active', 'has-count');
        badge.textContent = chatUnreadCount > 9 ? '9+' : chatUnreadCount;
        badge.style.display = 'flex'; badge.style.width = 'auto'; badge.style.padding = '0 5px';
        badge.style.minWidth = '18px'; badge.style.height = '18px'; badge.style.fontSize = '0.45rem';
        badge.style.lineHeight = '18px'; badge.style.borderRadius = '10px';
    } else { badge.classList.remove('active', 'has-count'); badge.style.display = 'none'; }
}

function renderChatMessages() {
    const container = document.getElementById('chatContainer'); 
    if (!container || !appState.currentUser) return; 
    container.innerHTML = '';
    container.style.background = '#000000 !important';
    const key = getChatKey(appState.currentUser.email); 
    const msgs = appState.chats && appState.chats[key] ? appState.chats[key] : [];
    if (msgs.length === 0) { container.innerHTML = '<div style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:20px;">No messages yet</div>'; return; }
    msgs.forEach(c => { 
        const cls = c.sender === 'admin' ? 'admin' : 'user'; 
        const time = c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : ''; 
        container.innerHTML += `<div class="chat-message ${cls}">${c.message}<span class="time">${time}</span></div>`; 
        if (c.sender === 'admin' && !c.read) c.read = true; 
    });
    container.scrollTop = container.scrollHeight; 
    saveLocalState();
    chatUnreadCount = msgs.filter(m => m.sender === 'admin' && !m.read).length;
    updateChatBadge();
}

window.openChatModal = function() { if (!appState.currentUser) return; renderChatMessages(); openModal('chatModal'); };
window.sendChatMessage = function() {
    const input = document.getElementById('chatInput'); const msg = input.value.trim(); if (!msg || !appState.currentUser) return;
    const key = getChatKey(appState.currentUser.email); if (!appState.chats) appState.chats = {}; if (!appState.chats[key]) appState.chats[key] = [];
    appState.chats[key].push({ sender: 'user', message: msg, timestamp: new Date().toISOString(), read: false }); saveLocalState(); input.value = ''; renderChatMessages();
};

/* ===== PAYMENT HISTORY ===== */
function renderPaymentHistory() {
    const container = document.getElementById('paymentHistoryList'); if (!container) return; container.innerHTML = '';
    const payments = appState.payments || []; const userPayments = payments.filter(p => p.userEmail === appState.currentUser?.email);
    if (userPayments.length === 0) { container.innerHTML = '<div class="history-empty">No payment history</div>'; return; }
    userPayments.reverse().forEach(p => {
        const statusClass = p.status === 'success' ? 'status-success' : (p.status === 'failed' ? 'status-failed' : 'status-pending');
        const statusText = p.status === 'success' ? '✅ Success' : (p.status === 'failed' ? '❌ Failed' : '⏳ Pending');
        container.innerHTML += `<div class="history-item"><span class="${statusClass}">${statusText}</span><span class="amount">₹${p.amount}</span><span style="color:#888;">${p.credits}cr</span><span style="color:var(--text-muted);font-size:0.4rem;">${p.transactionId || 'N/A'}</span><span class="date">${p.date ? new Date(p.date).toLocaleString() : ''}</span></div>`;
    });
}
window.openPaymentHistoryModal = function() { if (!appState.currentUser) return; renderPaymentHistory(); openModal('paymentHistoryModal'); };

/* ===== CREDIT PACKS ===== */
function renderCreditPacks() {
    const container = document.getElementById('creditPacksList'); if (!container) return; container.innerHTML = '';
    const packs = appState.creditPacks || []; packs.forEach((pack, idx) => {
        const perCredit = (pack.price / pack.credits).toFixed(2);
        container.innerHTML += `<div class="credit-pack" onclick="window.selectCreditPack(${idx})" data-index="${idx}"><div class="credits">${pack.credits}</div><div class="price">₹${pack.price}</div><div class="per-credit">₹${perCredit}/credit</div></div>`;
    });
}
window.selectCreditPack = function(idx) {
    document.querySelectorAll('.credit-pack').forEach(p => p.classList.remove('selected')); document.querySelectorAll('.credit-pack')[idx].classList.add('selected');
    selectedCreditPack = appState.creditPacks[idx]; document.getElementById('selectedPackDisplay').classList.add('active');
    document.getElementById('selectedPackCredits').textContent = selectedCreditPack.credits; document.getElementById('selectedPackPrice').textContent = selectedCreditPack.price;
    document.getElementById('proceedToPayBtn').style.display = 'block'; document.getElementById('manualPaymentSection').style.display = 'none'; document.getElementById('razorpayPaymentSection').style.display = 'none';
    document.getElementById('addCreditsError').textContent = ''; document.getElementById('addCreditsSuccess').textContent = '';
};
window.openAddCreditsModal = function() { 
    if (!appState.currentUser) return; 
    selectedCreditPack = null; 
    document.getElementById('selectedPackDisplay').classList.remove('active'); 
    document.getElementById('proceedToPayBtn').style.display = 'none'; 
    document.getElementById('manualPaymentSection').style.display = 'none'; 
    document.getElementById('razorpayPaymentSection').style.display = 'none'; 
    document.getElementById('addCreditsError').textContent = ''; 
    document.getElementById('addCreditsSuccess').textContent = ''; 
    document.getElementById('utrInput').value = ''; 
    document.getElementById('transactionIdInput').value = ''; 
    renderCreditPacks(); 
    openModal('addCreditsModal'); 
};
window.showPaymentOptions = function() {
    if (!selectedCreditPack) { document.getElementById('addCreditsError').textContent = '❌ Please select a credit pack first!'; return; }
    document.getElementById('creditPacksContainer').style.display = 'none'; 
    document.getElementById('proceedToPayBtn').style.display = 'none';
    document.getElementById('selectedPackDisplay').classList.add('active'); 
    document.getElementById('addCreditsError').textContent = ''; 
    document.getElementById('addCreditsSuccess').textContent = '';
    const mode = appState.paymentApprovalMode || 'manual';
    if (mode === 'razorpay') {
        document.getElementById('manualPaymentSection').style.display = 'none';
        document.getElementById('razorpayPaymentSection').style.display = 'block';
    } else {
        document.getElementById('manualPaymentSection').style.display = 'block';
        document.getElementById('razorpayPaymentSection').style.display = 'none';
        document.getElementById('paymentUpiDisplay').textContent = appState.upiId || 'binary@ruthless';
        document.getElementById('paymentInstructionsText').textContent = appState.paymentInstructions || 'Please transfer the amount to the UPI ID below.';
        loadQRPreview();
    }
};
function loadQRPreview() { const container = document.getElementById('qrDisplayContent'); if (!container) return; if (appState.qrCodeBase64) { container.innerHTML = `<img src="${appState.qrCodeBase64}" alt="QR Code" style="max-width:160px;max-height:160px;border-radius:6px;" />`; } else { container.innerHTML = `<div class="qr-placeholder">No QR Code uploaded.</div>`; } }
window.submitManualPayment = function() {
    if (!selectedCreditPack) { document.getElementById('addCreditsError').textContent = '❌ Please select a credit pack first!'; return; }
    const utr = document.getElementById('utrInput').value.trim();
    const txId = document.getElementById('transactionIdInput').value.trim();
    if (!utr && !txId) { document.getElementById('addCreditsError').textContent = '❌ Please enter UTR Number or Transaction ID'; return; }
    if ((utr && utr.length < 6) || (txId && txId.length < 6)) { document.getElementById('addCreditsError').textContent = '❌ Enter at least 6 characters'; return; }
    const transactionId = utr || txId;
    const paymentRecord = { 
        userEmail: appState.currentUser.email, credits: selectedCreditPack.credits, amount: selectedCreditPack.price, 
        transactionId: transactionId, utr: utr, transactionIdField: txId,
        status: 'pending', paymentMode: 'manual', date: new Date().toISOString(), screenshot: 'none' 
    };
    if (!appState.payments) appState.payments = []; 
    appState.payments.push(paymentRecord); saveLocalState(); updateUI();
    document.getElementById('addCreditsSuccess').textContent = '✅ Payment submitted! Waiting for admin approval.'; 
    document.getElementById('addCreditsError').textContent = ''; 
    document.getElementById('utrInput').value = ''; document.getElementById('transactionIdInput').value = '';
    setTimeout(() => { closeModal('addCreditsModal'); alert('✅ Payment submitted successfully!'); }, 1500);
};
window.initRazorpayPayment = function() {
    alert('🚧 Razorpay payment will be integrated soon.');
};

/* ===== MODAL HELPERS ===== */
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
window.openModal = openModal; window.closeModal = closeModal;

/* ===== LOGO CLICK ADMIN ACCESS ===== */
let logoClickCounter = 0;
document.getElementById('logoIcon').addEventListener('click', function(e) {
    e.preventDefault();
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (adminLoggedIn) {
        logoClickCounter++;
        const requiredClicks = appState.logoClickCount || 2;
        if (logoClickCounter >= requiredClicks) { logoClickCounter = 0; window.location.href = 'admin.html'; }
    }
});
document.getElementById('logoImage').addEventListener('click', function(e) {
    e.preventDefault();
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (adminLoggedIn) {
        logoClickCounter++;
        const requiredClicks = appState.logoClickCount || 2;
        if (logoClickCounter >= requiredClicks) { logoClickCounter = 0; window.location.href = 'admin.html'; }
    }
});
document.getElementById('brandSection').addEventListener('click', function(e) {
    if (e.target.closest('.logo-icon') || e.target.closest('.logo-img') || e.target.closest('.brand-name')) {
        const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
        if (adminLoggedIn) {
            logoClickCounter++;
            const requiredClicks = appState.logoClickCount || 2;
            if (logoClickCounter >= requiredClicks) { logoClickCounter = 0; window.location.href = 'admin.html'; }
        }
    }
});

/* ===== LOGO GLOW & ZOOM ANIMATIONS ===== */
const logoGlowDash = document.getElementById('logoGlowDash');
document.addEventListener('click', function(e) {
    if (e.target.closest('.overlay')) return;
    if (e.target.closest('.modal')) return;
    if (e.target.closest('.admin-nav-bar')) return;
    if (e.target.closest('.user-logout-btn')) return;
    if (e.target.closest('.tool-btn')) return;
    if (e.target.closest('.btn-sm')) return;
    if (e.target.closest('.social-icons a')) return;
    if (e.target.closest('.tool-fullscreen-overlay')) return;
    logoGlowDash.classList.remove('active');
    void logoGlowDash.offsetWidth;
    logoGlowDash.classList.add('active');
    setTimeout(() => { logoGlowDash.classList.remove('active'); }, 800);
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
        if (logoIcon.style.display !== 'none') { logoIcon.style.animation = ''; }
        if (logoImg.style.display !== 'none') { logoImg.style.animation = ''; }
        brandName.style.animation = '';
    }, 800);
});

/* ===== ESCAPE KEY & OVERLAY CLOSE ===== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.overlay.active').forEach(el => el.classList.remove('active'));
        document.getElementById('toolFullscreen').classList.remove('active');
    }
});

/* ===== CURSOR GLOW ===== */
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; glow.classList.add('active'); });
    document.addEventListener('mouseleave', () => { glow.classList.remove('active'); });
}

/* ===== INITIALIZATION ===== */
loadLocalState();
console.log('📊 Dashboard Loaded');
console.log('👤 User: ' + (appState.currentUser?.email || 'None'));
console.log('🛠️ Tools: ' + (appState.tools?.length || 0) + ' tools loaded');
console.log('💬 Unread Chats: ' + chatUnreadCount);
