// ============================================
// SECURITY & SESSION MANAGEMENT
// Binary Ruthless Trader
// ============================================

import { set } from "firebase/database";

let isFirebaseConnected = false;

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

// ─── SESSION MANAGEMENT ───
function getActiveSession() {
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    const userLoggedIn = sessionStorage.getItem('user_logged_in') === 'true';
    if (adminLoggedIn) return { type: 'admin', loggedIn: true };
    if (userLoggedIn) return { type: 'user', loggedIn: true };
    return { type: 'none', loggedIn: false };
}

function checkUserSession() {
    const session = getActiveSession();
    const userLogoutBtn = document.getElementById('userLogoutBtn');
    const adminNavBar = document.getElementById('adminNavBar');
    if (session.type === 'admin') {
        if (adminNavBar) adminNavBar.classList.add('visible');
        if (userLogoutBtn) userLogoutBtn.classList.remove('visible');
        return true;
    } else if (session.type === 'user') {
        if (adminNavBar) adminNavBar.classList.remove('visible');
        if (userLogoutBtn) userLogoutBtn.classList.add('visible');
        return true;
    } else {
        if (adminNavBar) adminNavBar.classList.remove('visible');
        if (userLogoutBtn) userLogoutBtn.classList.remove('visible');
        return false;
    }
}

function getCurrentUser(appState) {
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
        if (!existing) { appState.users.push(defaultAdmin); saveLocalState(appState, null); }
        return defaultAdmin;
    } else if (session.type === 'user') {
        return appState.currentUser;
    }
    return null;
}

function userLogout() { sessionStorage.removeItem('user_logged_in'); window.location.href = 'index.html'; }
function adminLogout() { sessionStorage.removeItem('admin_logged_in'); window.location.href = 'index.html'; }

function saveLocalState(appState, dbRef) {
    localStorage.setItem('brt_data', JSON.stringify(appState));
    if (isFirebaseConnected && dbRef) { set(dbRef, appState).catch(e => console.error(e)); }
}

function loadLocalState(appState, callback) {
    const local = localStorage.getItem('brt_data');
    if (local) { try { const parsed = JSON.parse(local); Object.assign(appState, parsed); } catch (e) { console.error(e); } }
    if (callback) callback();
}

function isValidEmail(email) { return /^[^\s@]+@gmail\.com$/.test(email); }
function getChatKey(userEmail) { return userEmail ? userEmail.replace(/[.#$\/\[\]]/g, '_') : ''; }

function resetTodayUsed(appState, saveCallback) {
    const now = new Date();
    const lastReset = localStorage.getItem('lastResetDate');
    const today = now.toDateString();
    if (lastReset !== today) {
        appState.users.forEach(u => { u.todayUsed = 0; });
        localStorage.setItem('lastResetDate', today);
        if (saveCallback) saveCallback();
    }
}

function openModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.add('active'); }
function closeModal(id) { const modal = document.getElementById(id); if (modal) modal.classList.remove('active'); }

function showInfoPopup(icon, title, message, btnText, btnAction) {
    const popup = document.getElementById('infoPopup'); if (!popup) return;
    document.getElementById('infoPopupIcon').textContent = icon || 'ℹ️';
    document.getElementById('infoPopupTitle').textContent = title || 'Info';
    document.getElementById('infoPopupMessage').textContent = message || 'Message here';
    const btn = document.getElementById('infoPopupBtn');
    if (btnText) {
        btn.style.display = 'block'; btn.textContent = btnText;
        btn.className = 'popup-btn center-btn';
        if (btnText.toLowerCase().includes('signup') || btnText.toLowerCase().includes('continue')) btn.classList.add('btn-gold');
        else btn.classList.add('btn-white');
        const newBtn = btn.cloneNode(true); btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) { if (typeof btnAction === 'function') btnAction(); closeInfoPopup(); });
    } else { btn.style.display = 'none'; }
    popup.classList.add('active');
}
function closeInfoPopup() { const popup = document.getElementById('infoPopup'); if (popup) popup.classList.remove('active'); }

preventCopyAndRightClick();

export { isFirebaseConnected, preventCopyAndRightClick, getActiveSession, checkUserSession, getCurrentUser, userLogout, adminLogout, saveLocalState, loadLocalState, isValidEmail, getChatKey, resetTodayUsed, openModal, closeModal, showInfoPopup, closeInfoPopup };
