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
    password: '9700224305', 
    offerCredits: 10,
    offerName: 'FREE SIGNAL OFFER',
    offerDescription: 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!',
    upiId: 'binary@ruthless',
    paymentInstructions: 'Please transfer the amount to the UPI ID.',
    qrCodeBase64: '', 
    creditPacks: [{ id: 'pack_1', credits: 50, price: 99 }, { id: 'pack_2', credits: 100, price: 199 }, { id: 'pack_3', credits: 250, price: 349 }, { id: 'pack_4', credits: 500, price: 599 }],
    brokers: [{ id: 'broker_1', name: 'Quotex', link: 'https://quotex.io/ref/xyz', minDeposit: 1000, rules: 'Verify email' }, { id: 'broker_2', name: 'Binomo', link: 'https://binomo.com/ref/xyz', minDeposit: 500, rules: 'Verify phone' }],
    users: [], 
    payments: [], 
    verificationRequests: [],
    tools: [],
    socialMedia: [{ id: 'social_1', name: 'Telegram', url: 'https://t.me/binaryruthless', icon: 'fab fa-telegram-plane', visibility: 'visible' }, { id: 'social_2', name: 'Instagram', url: 'https://instagram.com/binaryruthless', icon: 'fab fa-instagram', visibility: 'visible' }, { id: 'social_3', name: 'YouTube', url: 'https://youtube.com/binaryruthless', icon: 'fab fa-youtube', visibility: 'visible' }, { id: 'social_4', name: 'Twitter', url: 'https://twitter.com/binaryruthless', icon: 'fab fa-twitter', visibility: 'visible' }],
    logoBase64: '', 
    chats: {}, 
    logoClickCount: 2, 
    paymentApprovalMode: 'manual', 
    razorpayKeyId: '',
    razorpayKeySecret: '',
    creditsPerSignal: 1
};

let isFirebaseConnected = false, adminLoggedIn = false, selectedUserDetail = null, chatSelectedUser = null;

/* ===== ADMIN LOGO ===== */
function applyAdminLogo(logoBase64) {
    const icon = document.getElementById('adminLogoIcon');
    const img = document.getElementById('adminLogoImage');
    if (logoBase64 && logoBase64 !== '') {
        icon.style.display = 'none';
        img.src = logoBase64;
        img.style.display = 'block';
    } else {
        icon.style.display = 'block';
        img.style.display = 'none';
    }
}

/* ===== SOCIAL MEDIA (HEADER) ===== */
function renderAdminSocialMedia() {
    const container = document.getElementById('adminSocialIcons');
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
            <a href="#"><i class="fab fa-telegram-plane"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-youtube"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
        `;
        container.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('📱 Configure in Admin');
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
        a.addEventListener('click', function(e) {
            if (url === '#') {
                e.preventDefault();
                alert('📱 ' + name + ' - Configure URL in Admin');
            }
        });
        container.appendChild(a);
    });
}

/* ===== PENDING COUNTS ===== */
function updatePendingCounts() {
    const payments = appState.payments || [];
    const pendingPayments = payments.filter(p => p.status === 'pending');
    document.getElementById('pendingPaymentsCount').textContent = pendingPayments.length;
    document.getElementById('pendingPaymentsCount').className = 'count ' + (pendingPayments.length > 0 ? 'red' : 'green');
    
    const requests = appState.verificationRequests || [];
    const pendingVerifications = requests.filter(r => r.status === 'pending');
    document.getElementById('pendingVerificationsCount').textContent = pendingVerifications.length;
    document.getElementById('pendingVerificationsCount').className = 'count ' + (pendingVerifications.length > 0 ? 'red' : 'green');
    
    const verifiedUsers = appState.users.filter(u => u.verified === true);
    document.getElementById('verifiedUsersCount').textContent = verifiedUsers.length;
    document.getElementById('verifiedUsersCount').className = 'count gold';

    // Total Revenue
    const successfulPayments = payments.filter(p => p.status === 'success');
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('totalRevenueCount').textContent = '₹' + totalRevenue;
    document.getElementById('totalRevenueCount').className = 'count gold';
}

/* ===== CHAT KEY HELPER ===== */
function getChatKey(userEmail) { 
    return userEmail ? userEmail.replace(/[.#$\/\[\]]/g, '_') : ''; 
}

/* ===== PAYMENT TOGGLE ===== */
window.togglePaymentFields = function(mode) {
    const manualDiv = document.getElementById('manualPaymentFields');
    const razorpayDiv = document.getElementById('razorpayPaymentFields');
    if (mode === 'manual') {
        manualDiv.style.display = 'block';
        razorpayDiv.style.display = 'none';
    } else if (mode === 'razorpay') {
        manualDiv.style.display = 'none';
        razorpayDiv.style.display = 'block';
    }
};

/* ===== LOAD PAYMENT SETTINGS ===== */
function loadPaymentSettings() { 
    const mode = appState.paymentApprovalMode || 'manual';
    document.getElementById('paymentApprovalMode').value = mode;
    togglePaymentFields(mode);
    document.getElementById('upiIdInput').value = appState.upiId || 'binary@ruthless';
    document.getElementById('paymentInstructionsInput').value = appState.paymentInstructions || '';
    document.getElementById('razorpayKeyIdInput').value = appState.razorpayKeyId || '';
    document.getElementById('razorpayKeySecretInput').value = appState.razorpayKeySecret || '';
    loadQRPreview();
}

/* ===== SAVE PAYMENT SETTINGS ===== */
window.adminSavePaymentSettings = function() {
    const mode = document.getElementById('paymentApprovalMode').value;
    appState.paymentApprovalMode = mode;
    if (mode === 'manual') {
        appState.upiId = document.getElementById('upiIdInput').value.trim() || 'binary@ruthless';
        appState.paymentInstructions = document.getElementById('paymentInstructionsInput').value.trim();
        
        const fileInput = document.getElementById('qrUploadInput'); 
        if (fileInput.files && fileInput.files[0]) { 
            const reader = new FileReader(); 
            reader.onload = function(e) { 
                appState.qrCodeBase64 = e.target.result; 
                saveLocalState(); 
                loadQRPreview(); 
                disableEditFields(document.querySelector('.admin-section')); 
            }; 
            reader.readAsDataURL(fileInput.files[0]); 
        } else { 
            saveLocalState(); 
            loadQRPreview(); 
            disableEditFields(document.querySelector('.admin-section')); 
        }
    } else if (mode === 'razorpay') {
        appState.razorpayKeyId = document.getElementById('razorpayKeyIdInput').value.trim();
        appState.razorpayKeySecret = document.getElementById('razorpayKeySecretInput').value.trim();
        saveLocalState();
        disableEditFields(document.querySelector('.admin-section'));
    }
    const btn = document.getElementById('paymentApprovalMode').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
};

/* ===== QR CODE PREVIEW ===== */
function loadQRPreview() { 
    const container = document.getElementById('qrPreviewContainer'); 
    if (!container) return; 
    if (appState.qrCodeBase64) { 
        container.innerHTML = `<img src="${appState.qrCodeBase64}" class="qr-preview" alt="QR" />`; 
    } else { 
        container.innerHTML = ''; 
    } 
}

function previewQRImage(event) { 
    const file = event.target.files[0]; 
    if (file) { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
            document.getElementById('qrPreviewContainer').innerHTML = `<img src="${e.target.result}" class="qr-preview" alt="QR Preview" />`; 
        }; 
        reader.readAsDataURL(file); 
    } 
}

/* ===== CREDIT PACKS ===== */
function renderCreditPackList() {
    const list = document.getElementById('creditPackList'); 
    if (!list) return; 
    list.innerHTML = '';
    const packs = appState.creditPacks || []; 
    if (packs.length === 0) { 
        list.innerHTML = '<div style="color:var(--text-muted);font-size:0.45rem;text-align:center;padding:4px;">No packs</div>'; 
        return; 
    }
    const section = list.closest('.admin-section');
    const isEditable = section && section.classList.contains('editable');
    
    packs.forEach((p) => { 
        let actions = '';
        if (isEditable) {
            actions = `
                <div class="list-actions" style="display:flex;gap:4px;">
                    <button class="edit-btn" onclick="window.adminEditCreditPack('${p.id}')">✏️</button>
                    <button class="del-btn" onclick="window.adminDeleteCreditPack('${p.id}')">✕</button>
                </div>
            `;
        }
        list.innerHTML += `<div class="list-item"><span class="name">${p.credits} credits</span><span class="detail">₹${p.price}</span>${actions}</div>`; 
    });
}

window.adminAddCreditPack = function() {
    const credits = parseInt(document.getElementById('packCredits').value); 
    const price = parseInt(document.getElementById('packPrice').value);
    if (!credits || credits <= 0 || !price || price <= 0) { alert('Enter valid credits and price'); return; }
    if (!appState.creditPacks) appState.creditPacks = []; 
    const newPack = { id: 'pack_' + Date.now(), credits, price };
    appState.creditPacks.push(newPack); 
    saveLocalState(); 
    renderCreditPackList(); 
    document.getElementById('packCredits').value = ''; 
    document.getElementById('packPrice').value = ''; 
    disableEditFields(document.querySelector('.admin-section'));
    const btn = document.getElementById('packCredits').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Add Pack'; }, 2000);
};

window.adminDeleteCreditPack = function(id) { 
    if (confirm('Delete this pack?')) { 
        appState.creditPacks = appState.creditPacks.filter(p => p.id !== id); 
        saveLocalState(); 
        renderCreditPackList(); 
    } 
};

window.adminEditCreditPack = function(id) {
    const pack = appState.creditPacks.find(p => p.id === id);
    if (!pack) return;
    document.getElementById('packCredits').value = pack.credits;
    document.getElementById('packPrice').value = pack.price;
    const saveBtn = document.getElementById('packCredits').closest('.admin-section').querySelector('.btn-save');
    saveBtn.textContent = '🔄 Update Pack';
    saveBtn.onclick = function() { adminUpdateCreditPack(id); };
};

window.adminUpdateCreditPack = function(id) {
    const credits = parseInt(document.getElementById('packCredits').value); 
    const price = parseInt(document.getElementById('packPrice').value);
    if (!credits || credits <= 0 || !price || price <= 0) { alert('Enter valid credits and price'); return; }
    const index = appState.creditPacks.findIndex(p => p.id === id);
    if (index === -1) return;
    appState.creditPacks[index] = { ...appState.creditPacks[index], credits, price };
    saveLocalState();
    renderCreditPackList();
    document.getElementById('packCredits').value = '';
    document.getElementById('packPrice').value = '';
    disableEditFields(document.querySelector('.admin-section'));
    const saveBtn = document.getElementById('packCredits').closest('.admin-section').querySelector('.btn-save');
    saveBtn.textContent = '✅ Saved';
    setTimeout(() => { saveBtn.textContent = '💾 Add Pack'; saveBtn.onclick = adminAddCreditPack; }, 2000);
};

/* ===== BROKER MANAGER ===== */
function renderBrokerList() {
    const list = document.getElementById('brokerList'); 
    if (!list) return; 
    list.innerHTML = '';
    const section = list.closest('.admin-section');
    const isEditable = section && section.classList.contains('editable');
    
    appState.brokers.forEach((b) => { 
        let actions = '';
        if (isEditable) {
            actions = `
                <div class="list-actions" style="display:flex;gap:4px;">
                    <button class="edit-btn" onclick="window.adminEditBroker('${b.id}')">✏️</button>
                    <button class="del-btn" onclick="window.adminDeleteBroker('${b.id}')">✕</button>
                </div>
            `;
        }
        list.innerHTML += `<div class="list-item"><span class="name">${b.name}</span><span class="detail">₹${b.minDeposit || 0}</span>${actions}</div>`; 
    });
}

window.adminAddBroker = function() {
    const name = document.getElementById('adminBrokerName').value.trim(); 
    const link = document.getElementById('adminBrokerLink').value.trim(); 
    const minDeposit = parseInt(document.getElementById('adminBrokerMinDeposit').value) || 0; 
    const rules = document.getElementById('adminBrokerRules').value.trim();
    if (!name || !link) { alert('Enter name and link'); return; }
    const newBroker = { id: 'broker_' + Date.now(), name, link, minDeposit, rules };
    appState.brokers.push(newBroker); 
    saveLocalState(); 
    renderBrokerList(); 
    document.getElementById('adminBrokerName').value = '';
    document.getElementById('adminBrokerLink').value = '';
    document.getElementById('adminBrokerMinDeposit').value = '';
    document.getElementById('adminBrokerRules').value = '';
    disableEditFields(document.querySelector('.admin-section'));
    const btn = document.getElementById('adminBrokerName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Add'; }, 2000);
};

window.adminDeleteBroker = function(id) { 
    if (confirm('Delete this broker?')) { 
        appState.brokers = appState.brokers.filter(b => b.id !== id); 
        saveLocalState(); 
        renderBrokerList(); 
    } 
};

window.adminEditBroker = function(id) {
    const broker = appState.brokers.find(b => b.id === id);
    if (!broker) return;
    document.getElementById('adminBrokerName').value = broker.name;
    document.getElementById('adminBrokerLink').value = broker.link;
    document.getElementById('adminBrokerMinDeposit').value = broker.minDeposit || '';
    document.getElementById('adminBrokerRules').value = broker.rules || '';
    const saveBtn = document.getElementById('adminBrokerName').closest('.admin-section').querySelector('.btn-save');
    saveBtn.textContent = '🔄 Update Broker';
    saveBtn.onclick = function() { adminUpdateBroker(id); };
};

window.adminUpdateBroker = function(id) {
    const name = document.getElementById('adminBrokerName').value.trim(); 
    const link = document.getElementById('adminBrokerLink').value.trim(); 
    const minDeposit = parseInt(document.getElementById('adminBrokerMinDeposit').value) || 0; 
    const rules = document.getElementById('adminBrokerRules').value.trim();
    if (!name || !link) { alert('Enter name and link'); return; }
    const index = appState.brokers.findIndex(b => b.id === id);
    if (index === -1) return;
    appState.brokers[index] = { ...appState.brokers[index], name, link, minDeposit, rules };
    saveLocalState();
    renderBrokerList();
    document.getElementById('adminBrokerName').value = '';
    document.getElementById('adminBrokerLink').value = '';
    document.getElementById('adminBrokerMinDeposit').value = '';
    document.getElementById('adminBrokerRules').value = '';
    disableEditFields(document.querySelector('.admin-section'));
    const saveBtn = document.getElementById('adminBrokerName').closest('.admin-section').querySelector('.btn-save');
    saveBtn.textContent = '✅ Saved';
    setTimeout(() => { saveBtn.textContent = '💾 Add'; saveBtn.onclick = adminAddBroker; }, 2000);
};

/* ===== TOOLS MANAGER ===== */
function renderToolsList() {
    const container = document.getElementById('toolsList'); if (!container) return; container.innerHTML = '';
    const tools = appState.tools || [];
    if (tools.length === 0) { 
        container.innerHTML = '<div style="color:var(--text-muted);font-size:0.45rem;text-align:center;padding:8px;">No tools added yet</div>'; 
        return; 
    }
    const section = container.closest('.admin-section');
    const isEditable = section && section.classList.contains('editable');
    
    tools.forEach((tool, idx) => {
        const statusText = tool.visibility === 'visible' ? '🟢 Visible' : '🔴 Hidden';
        const fireStatus = tool.showFire !== undefined ? tool.showFire : true;
        const fireBtnText = fireStatus ? '🔥 ON' : '🔥 OFF';
        const fireBtnClass = fireStatus ? '' : 'off';
        const triggerText = tool.triggers && tool.triggers.length > 0 ? '🎯 ' + tool.triggers.join(', ') : '🎯 Default (Signal, Get, Generate, BUY, SELL)';
        let actions = '';
        if (isEditable) {
            actions = `
                <div class="tool-actions">
                    <button class="btn-fire-toggle ${fireBtnClass}" onclick="toggleToolFire(${idx})">${fireBtnText}</button>
                    <button class="btn-edit-tool" onclick="editTool(${idx})">✏️ Edit</button>
                    <button class="btn-toggle-tool" onclick="toggleToolVisibility(${idx})">${tool.visibility === 'visible' ? '🙈 Hide' : '👁️ Show'}</button>
                    <button class="btn-delete-tool" onclick="deleteTool(${idx})">🗑️ Delete</button>
                </div>
            `;
        }
        container.innerHTML += `
            <div class="tool-item">
                <div class="tool-info">
                    <div class="tool-name"><span style="margin-right:4px;">${tool.sticker || '🎯'}</span> ${tool.name || 'Untitled'}</div>
                    ${tool.subName ? `<div class="tool-subname">${tool.subName}</div>` : ''}
                    <div class="tool-status">${statusText} | Fire: ${fireStatus ? '✅' : '❌'}</div>
                    <div style="font-size:0.4rem;color:var(--text-secondary);">${triggerText}</div>
                </div>
                ${actions}
            </div>
        `;
    });
}

window.toggleToolFire = function(idx) {
    const tool = appState.tools[idx];
    if (!tool) return;
    tool.showFire = tool.showFire !== undefined ? !tool.showFire : false;
    saveLocalState();
    localStorage.setItem('brt_tools', JSON.stringify(appState.tools));
    renderToolsList();
};

window.editTool = function(idx) {
    const tool = appState.tools[idx]; if (!tool) return; window.editingToolIndex = idx;
    document.getElementById('editToolIndex').value = idx;
    document.getElementById('editToolName').value = tool.name || '';
    document.getElementById('editToolSubName').value = tool.subName || '';
    document.getElementById('editToolHtml').value = tool.htmlCode || '';
    document.getElementById('editToolStatus').value = tool.visibility || 'visible';
    document.getElementById('editToolFire').value = tool.showFire !== undefined ? (tool.showFire ? 'true' : 'false') : 'true';
    document.getElementById('editToolTriggers').value = (tool.triggers || []).join(', ');
    document.getElementById('editToolForm').style.display = 'block';
    document.getElementById('addToolForm').style.display = 'none';
};

window.adminUpdateTool = function() {
    const idx = parseInt(document.getElementById('editToolIndex').value);
    const name = document.getElementById('editToolName').value.trim();
    const subName = document.getElementById('editToolSubName').value.trim();
    const htmlCode = document.getElementById('editToolHtml').value.trim();
    const visibility = document.getElementById('editToolStatus').value;
    const showFire = document.getElementById('editToolFire').value === 'true';
    const triggersInput = document.getElementById('editToolTriggers').value.trim();
    let triggers = [];
    if (triggersInput) {
        triggers = triggersInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (!name) { alert('Please enter tool name'); return; }
    if (!htmlCode) { alert('Please enter HTML code'); return; }
    const sticker = name.match(/^[^\w\s]|^[🚀🎯🔥⭐💎🎮📊💰📈🎁🎯🧠💡⚡📱💻🖥️⌨️🖱️🎮🎯🏆🥇🥈🥉🏅🎖️💎📀💿🖼️🖌️🖍️✏️📝📋📌📎📏📐📊📈📉💹📉📊📈💹💰💵💴💶💷💳💲🪙🧾🧮📊📈📉💹📊📈📉]/) ? name.charAt(0) : '🎯';
    appState.tools[idx] = { ...appState.tools[idx], name, subName, sticker, htmlCode, visibility, showFire, triggers };
    saveLocalState();
    localStorage.setItem('brt_tools', JSON.stringify(appState.tools));
    renderToolsList();
    document.getElementById('editToolForm').style.display = 'none';
    const btn = document.getElementById('editToolName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Update Tool'; }, 2000);
};

window.toggleToolVisibility = function(idx) { const tool = appState.tools[idx]; if (!tool) return; tool.visibility = tool.visibility === 'visible' ? 'hidden' : 'visible'; saveLocalState(); localStorage.setItem('brt_tools', JSON.stringify(appState.tools)); renderToolsList(); };
window.deleteTool = function(idx) { 
    if (confirm('Delete this tool?')) { 
        appState.tools.splice(idx, 1); 
        saveLocalState(); 
        localStorage.setItem('brt_tools', JSON.stringify(appState.tools)); 
        renderToolsList(); 
    } 
};
window.showAddToolForm = function() { document.getElementById('addToolForm').style.display = 'block'; document.getElementById('editToolForm').style.display = 'none'; document.getElementById('newToolName').value = ''; document.getElementById('newToolSubName').value = ''; document.getElementById('newToolHtml').value = ''; document.getElementById('newToolStatus').value = 'visible'; document.getElementById('newToolFire').value = 'true'; document.getElementById('newToolTriggers').value = ''; };

window.adminAddTool = function() {
    const name = document.getElementById('newToolName').value.trim();
    const subName = document.getElementById('newToolSubName').value.trim();
    const htmlCode = document.getElementById('newToolHtml').value.trim();
    const visibility = document.getElementById('newToolStatus').value;
    const showFire = document.getElementById('newToolFire').value === 'true';
    const triggersInput = document.getElementById('newToolTriggers').value.trim();
    let triggers = [];
    if (triggersInput) {
        triggers = triggersInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (!name) { alert('Please enter tool name'); return; }
    if (!htmlCode) { alert('Please enter HTML code'); return; }
    const sticker = name.match(/^[^\w\s]|^[🚀🎯🔥⭐💎🎮📊💰📈🎁🎯🧠💡⚡📱💻🖥️⌨️🖱️🎮🎯🏆🥇🥈🥉🏅🎖️💎📀💿🖼️🖌️🖍️✏️📝📋📌📎📏📐📊📈📉💹📉📊📈💹💰💵💴💶💷💳💲🪙🧾🧮📊📈📉💹📊📈📉]/) ? name.charAt(0) : '🎯';
    if (!appState.tools) appState.tools = [];
    appState.tools.push({ id: 'tool_' + Date.now(), name, subName, sticker, htmlCode, visibility, showFire, triggers });
    saveLocalState();
    localStorage.setItem('brt_tools', JSON.stringify(appState.tools));
    renderToolsList();
    document.getElementById('addToolForm').style.display = 'none';
    const btn = document.getElementById('newToolName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save Tool'; }, 2000);
};

/* ===== SOCIAL LIST ===== */
function renderSocialList() {
    const container = document.getElementById('socialList'); if (!container) return; container.innerHTML = '';
    const socials = appState.socialMedia || [];
    if (socials.length === 0) { container.innerHTML = '<div style="color:var(--text-muted);font-size:0.45rem;text-align:center;padding:8px;">No social media added yet</div>'; return; }
    socials.forEach((s, idx) => {
        const statusText = s.visibility === 'visible' ? '🟢 Visible' : '🔴 Hidden';
        container.innerHTML += `<div class="social-item"><div class="social-info"><div class="social-name"><i class="${s.icon || 'fas fa-link'}"></i> ${s.name}</div><div class="social-url">${s.url}</div><div style="font-size:0.4rem;color:var(--text-secondary);">${statusText}</div></div><div class="social-actions"><button class="btn-edit-social" onclick="editSocial(${idx})">✏️ Edit</button><button class="btn-toggle-social" onclick="toggleSocialVisibility(${idx})">${s.visibility === 'visible' ? '🙈 Hide' : '👁️ Show'}</button><button class="btn-delete-social" onclick="deleteSocial(${idx})">🗑️ Delete</button></div></div>`;
    });
}
window.editSocial = function(idx) {
    const social = appState.socialMedia[idx]; if (!social) return; window.editingSocialIndex = idx;
    document.getElementById('editSocialIndex').value = idx; document.getElementById('editSocialName').value = social.name || ''; document.getElementById('editSocialUrl').value = social.url || ''; document.getElementById('editSocialIcon').value = social.icon || ''; document.getElementById('editSocialStatus').value = social.visibility || 'visible';
    document.getElementById('editSocialForm').style.display = 'block'; document.getElementById('addSocialForm').style.display = 'none';
};
window.adminUpdateSocial = function() {
    const idx = parseInt(document.getElementById('editSocialIndex').value); const name = document.getElementById('editSocialName').value.trim(); const url = document.getElementById('editSocialUrl').value.trim(); const icon = document.getElementById('editSocialIcon').value.trim(); const visibility = document.getElementById('editSocialStatus').value;
    if (!name || !url) { alert('Please enter name and URL'); return; }
    appState.socialMedia[idx] = { ...appState.socialMedia[idx], name, url, icon, visibility }; saveLocalState(); localStorage.setItem('brt_social', JSON.stringify(appState.socialMedia)); renderSocialList(); renderAdminSocialMedia(); document.getElementById('editSocialForm').style.display = 'none';
    const btn = document.getElementById('editSocialName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Update Social'; }, 2000);
};
window.toggleSocialVisibility = function(idx) { const social = appState.socialMedia[idx]; if (!social) return; social.visibility = social.visibility === 'visible' ? 'hidden' : 'visible'; saveLocalState(); localStorage.setItem('brt_social', JSON.stringify(appState.socialMedia)); renderSocialList(); renderAdminSocialMedia(); };
window.deleteSocial = function(idx) { if (confirm('Delete this social media?')) { appState.socialMedia.splice(idx, 1); saveLocalState(); localStorage.setItem('brt_social', JSON.stringify(appState.socialMedia)); renderSocialList(); renderAdminSocialMedia(); } };
window.showAddSocialForm = function() { document.getElementById('addSocialForm').style.display = 'block'; document.getElementById('editSocialForm').style.display = 'none'; document.getElementById('newSocialName').value = ''; document.getElementById('newSocialUrl').value = ''; document.getElementById('newSocialIcon').value = ''; document.getElementById('newSocialStatus').value = 'visible'; };
window.adminAddSocial = function() {
    const name = document.getElementById('newSocialName').value.trim(); const url = document.getElementById('newSocialUrl').value.trim(); const icon = document.getElementById('newSocialIcon').value.trim() || 'fas fa-link'; const visibility = document.getElementById('newSocialStatus').value;
    if (!name || !url) { alert('Please enter name and URL'); return; }
    if (!appState.socialMedia) appState.socialMedia = []; appState.socialMedia.push({ id: 'social_' + Date.now(), name, url, icon, visibility }); saveLocalState(); localStorage.setItem('brt_social', JSON.stringify(appState.socialMedia)); renderSocialList(); renderAdminSocialMedia(); document.getElementById('addSocialForm').style.display = 'none';
    const btn = document.getElementById('newSocialName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save Social'; }, 2000);
};

/* ===== OFFER SAVE ===== */
window.adminSaveOffer = function() {
    const name = document.getElementById('offerName').value.trim() || 'FREE SIGNAL OFFER';
    const description = document.getElementById('offerDescription').value.trim() || 'Get 10 FREE signals for Quotex, Binomo, Pocket Option when you deposit via our affiliate links!';
    const numberMatch = description.match(/\d+/);
    if (numberMatch) {
        const credits = parseInt(numberMatch[0]);
        if (!isNaN(credits) && credits > 0) appState.offerCredits = credits;
        else appState.offerCredits = 10;
    } else {
        appState.offerCredits = 10;
    }
    appState.offerName = name;
    appState.offerDescription = description;
    saveLocalState();
    updateUI();
    localStorage.setItem('brt_offer_credits', appState.offerCredits);
    disableEditFields(document.querySelector('.admin-section'));
    const btn = document.getElementById('offerName').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
};

/* ===== LOGO SAVE ===== */
window.adminSaveLogo = function() {
    const file = document.getElementById('logoUpload').files[0];
    if (file) { const reader = new FileReader(); reader.onload = (e) => { 
        const logoData = e.target.result;
        appState.logoBase64 = logoData; 
        localStorage.setItem('brt_logo', logoData);
        applyAdminLogo(logoData);
        saveLocalState(); 
        disableEditFields(document.querySelector('.admin-section')); 
        const btn = document.getElementById('logoUpload').closest('.admin-section').querySelector('.btn-save'); 
        btn.textContent = '✅ Saved'; 
        setTimeout(() => { btn.textContent = '💾 Save'; }, 2000); 
    }; reader.readAsDataURL(file); } else { alert('Select an image!'); }
};

/* ===== ADMIN SETTINGS SAVE ===== */
window.saveAdminSettings = function() {
    appState.logoClickCount = parseInt(document.getElementById('logoClickCount').value) || 2;
    saveLocalState(); 
    localStorage.setItem('brt_logo_click_count', appState.logoClickCount); 
    disableEditFields(document.querySelector('.admin-section'));
    const btn = document.getElementById('logoClickCount').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
};

/* ===== CREDITS PER SIGNAL SAVE ===== */
window.saveCreditsPerSignal = function() {
    const input = document.getElementById('creditsPerSignalInput');
    const value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        alert('Please enter a valid number (minimum 1)');
        return;
    }
    appState.creditsPerSignal = value;
    localStorage.setItem('brt_credits_per_signal', value);
    saveLocalState();
    disableEditFields(document.querySelector('.admin-section'));
    const btn = document.getElementById('creditsPerSignalInput').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
    alert('✅ Credits Per Signal saved: ' + value);
};

/* ===== EDIT/SAVE FUNCTIONS ===== */
function enableEdit(btn) { 
    const section = btn.closest('.admin-section'); 
    if (!section) return; 
    section.querySelectorAll('input, select, textarea').forEach(i => i.disabled = false); 
    section.querySelectorAll('.btn-save').forEach(b => b.classList.add('show')); 
    btn.style.display = 'none';
    section.classList.add('editable');
    const lists = section.querySelectorAll('.item-list');
    lists.forEach(list => {
        if (list.id === 'creditPackList') renderCreditPackList();
        else if (list.id === 'brokerList') renderBrokerList();
    });
    const toolsList = section.querySelector('.tools-list');
    if (toolsList) renderToolsList();
}

function disableEditFields(section) { 
    if (!section) return; 
    section.querySelectorAll('input, select, textarea').forEach(i => i.disabled = true); 
    section.querySelectorAll('.btn-save').forEach(b => b.classList.remove('show')); 
    section.querySelectorAll('.btn-edit').forEach(b => { 
        b.style.display = 'block'; 
        b.textContent = '✏️ Edit'; 
    }); 
    section.classList.remove('editable');
    const lists = section.querySelectorAll('.item-list');
    lists.forEach(list => {
        if (list.id === 'creditPackList') renderCreditPackList();
        else if (list.id === 'brokerList') renderBrokerList();
    });
    const toolsList = section.querySelector('.tools-list');
    if (toolsList) renderToolsList();
}

/* ===== FIREBASE SYNC ===== */
onValue(dbRef, (snapshot) => {
    isFirebaseConnected = true; document.getElementById('adminStatusDot').className = 'fb-status-dot-sm green';
    const val = snapshot.val();
    if (val) {
        appState = { ...appState, ...val };
        updateUI();
        renderUsersList();
        renderBrokerList();
        renderPendingPayments();
        renderPendingVerifications();
        renderCreditPackList();
        loadPaymentSettings();
        loadQRPreview();
        renderToolsList();
        renderSocialList();
        renderAdminSocialMedia();
        updateChatNotification();
        updatePendingCounts();
        if (val.logoBase64 !== undefined && val.logoBase64 !== '') {
            applyAdminLogo(val.logoBase64);
            localStorage.setItem('brt_logo', val.logoBase64);
        }
        if (val.offerCredits !== undefined) localStorage.setItem('brt_offer_credits', val.offerCredits);
        if (val.tools !== undefined) localStorage.setItem('brt_tools', JSON.stringify(val.tools));
        if (val.socialMedia !== undefined) localStorage.setItem('brt_social', JSON.stringify(val.socialMedia));
        if (val.brokers !== undefined) localStorage.setItem('brt_brokers', JSON.stringify(val.brokers));
        if (val.creditPacks !== undefined) localStorage.setItem('brt_creditPacks', JSON.stringify(val.creditPacks));
        if (val.offerName !== undefined) document.getElementById('offerName').value = val.offerName;
        if (val.offerDescription !== undefined) document.getElementById('offerDescription').value = val.offerDescription;
        if (val.creditsPerSignal !== undefined) {
            appState.creditsPerSignal = val.creditsPerSignal;
            document.getElementById('creditsPerSignalInput').value = val.creditsPerSignal;
        }
        if (val.razorpayKeyId !== undefined) document.getElementById('razorpayKeyIdInput').value = val.razorpayKeyId || '';
        if (val.razorpayKeySecret !== undefined) document.getElementById('razorpayKeySecretInput').value = val.razorpayKeySecret || '';
    }
}, (error) => { isFirebaseConnected = false; document.getElementById('adminStatusDot').className = 'fb-status-dot-sm red'; console.error(error); });

/* ===== LOCAL STORAGE SYNC ===== */
function saveLocalState() { localStorage.setItem('brt_data', JSON.stringify(appState)); if (isFirebaseConnected) set(dbRef, appState).catch(e => console.error(e)); }

function loadLocalState() {
    const local = localStorage.getItem('brt_data');
    if (local) { try { const parsed = JSON.parse(local); appState = { ...appState, ...parsed }; } catch(e) { console.error(e); } }
    const socialData = localStorage.getItem('brt_social');
    if (socialData) { try { const parsed = JSON.parse(socialData); if (parsed.length > 0) appState.socialMedia = parsed; } catch(e) {} }
    const toolsData = localStorage.getItem('brt_tools');
    if (toolsData) { try { const parsed = JSON.parse(toolsData); if (parsed.length > 0) appState.tools = parsed; } catch(e) {} }
    const logoData = localStorage.getItem('brt_logo'); 
    if (logoData) {
        appState.logoBase64 = logoData;
        applyAdminLogo(logoData);
    }
    const brokersData = localStorage.getItem('brt_brokers');
    if (brokersData) { try { const parsed = JSON.parse(brokersData); if (parsed.length > 0) appState.brokers = parsed; } catch(e) {} }
    const creditPacksData = localStorage.getItem('brt_creditPacks');
    if (creditPacksData) { try { const parsed = JSON.parse(creditPacksData); if (parsed.length > 0) appState.creditPacks = parsed; } catch(e) {} }
    const creditsPerSignalData = localStorage.getItem('brt_credits_per_signal');
    if (creditsPerSignalData) {
        const val = parseInt(creditsPerSignalData);
        if (!isNaN(val) && val > 0) {
            appState.creditsPerSignal = val;
        }
    }
    const razorpayKeyIdData = localStorage.getItem('brt_razorpay_key_id');
    if (razorpayKeyIdData) appState.razorpayKeyId = razorpayKeyIdData;
    const razorpayKeySecretData = localStorage.getItem('brt_razorpay_key_secret');
    if (razorpayKeySecretData) appState.razorpayKeySecret = razorpayKeySecretData;
    const upiData = localStorage.getItem('brt_upi');
    if (upiData) appState.upiId = upiData;
    const paymentInstructionsData = localStorage.getItem('brt_payment_instructions');
    if (paymentInstructionsData) appState.paymentInstructions = paymentInstructionsData;
    const paymentApprovalModeData = localStorage.getItem('brt_payment_approval_mode');
    if (paymentApprovalModeData) appState.paymentApprovalMode = paymentApprovalModeData;
    
    if (appState.offerName) document.getElementById('offerName').value = appState.offerName;
    if (appState.offerDescription) document.getElementById('offerDescription').value = appState.offerDescription;
    if (appState.creditsPerSignal) {
        document.getElementById('creditsPerSignalInput').value = appState.creditsPerSignal;
    }
    updateUI(); 
    renderUsersList(); 
    renderBrokerList(); 
    renderPendingPayments(); 
    renderPendingVerifications(); 
    renderCreditPackList(); 
    loadPaymentSettings(); 
    loadQRPreview(); 
    renderToolsList(); 
    renderSocialList(); 
    renderAdminSocialMedia();
    updateChatNotification();
    updatePendingCounts();
}

/* ===== UI UPDATES ===== */
function updateUI() {
    document.getElementById('logoClickCount').value = appState.logoClickCount || 2;
    if (appState.offerName) document.getElementById('offerName').value = appState.offerName;
    if (appState.offerDescription) document.getElementById('offerDescription').value = appState.offerDescription;
    if (appState.creditsPerSignal) {
        document.getElementById('creditsPerSignalInput').value = appState.creditsPerSignal;
    }
}

/* ===== PENDING PAYMENTS ===== */
function renderPendingPayments() {
    const container = document.getElementById('pendingPaymentsList'); 
    if (!container) return; 
    container.innerHTML = '';
    const payments = appState.payments || []; 
    const pending = payments.filter(p => p.status === 'pending');
    if (pending.length === 0) { 
        document.getElementById('noPendingPayments').style.display = 'block'; 
        return; 
    }
    document.getElementById('noPendingPayments').style.display = 'none';
    pending.forEach((p, idx) => {
        const actualIdx = appState.payments.indexOf(p);
        const user = appState.users.find(u => u.email === p.userEmail);
        const userName = user ? user.name || user.email : p.userEmail;
        const accountId = user ? user.accountId || 'N/A' : 'N/A';
        
        container.innerHTML += `
            <div style="background:rgba(255,215,0,0.03);border:1px solid rgba(255,215,0,0.08);border-radius:8px;padding:14px 16px;margin-bottom:10px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Name:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${userName}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Account ID:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${accountId}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Amount:</span>
                        <span style="color:#00FF66;font-weight:700;font-size:0.8rem;">₹${p.amount}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Credits:</span>
                        <span style="color:#FFD700;font-weight:700;font-size:0.8rem;">${p.credits}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Txn ID / UTR:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${p.transactionId || 'N/A'}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Date:</span>
                        <span style="color:var(--text-secondary);font-size:0.6rem;">${p.date ? new Date(p.date).toLocaleString() : 'N/A'}</span>
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-top:8px;">
                    <button onclick="window.adminApprovePayment(${actualIdx})" 
                        style="flex:1;padding:8px 12px;border-radius:6px;border:none;font-weight:700;cursor:pointer;font-size:0.6rem;text-transform:uppercase;background:#00FF66;color:#000;letter-spacing:1px;">
                        ✅ Approve
                    </button>
                    <button onclick="window.adminRejectPayment(${actualIdx})" 
                        style="flex:1;padding:8px 12px;border-radius:6px;border:none;font-weight:700;cursor:pointer;font-size:0.6rem;text-transform:uppercase;background:#FF0033;color:#fff;letter-spacing:1px;">
                        ❌ Reject
                    </button>
                </div>
            </div>
        `;
    });
}

window.adminApprovePayment = function(idx) { 
    const payment = appState.payments[idx]; 
    if (!payment || payment.status !== 'pending') return; 
    if (confirm('Approve payment?')) { 
        payment.status = 'success'; 
        const user = appState.users.find(u => u.email === payment.userEmail); 
        if (user) user.credits = (user.credits || 0) + payment.credits; 
        saveLocalState(); 
        renderPendingPayments(); 
        renderUsersList(); 
        updatePendingCounts();
    } 
};

window.adminRejectPayment = function(idx) { 
    const payment = appState.payments[idx]; 
    if (!payment || payment.status !== 'pending') return; 
    if (confirm('Reject payment?')) { 
        payment.status = 'failed'; 
        saveLocalState(); 
        renderPendingPayments(); 
        renderUsersList();
        updatePendingCounts();
    } 
};

/* ===== PENDING VERIFICATIONS ===== */
function renderPendingVerifications() {
    const container = document.getElementById('pendingVerificationsList'); 
    if (!container) return; 
    container.innerHTML = '';
    const requests = appState.verificationRequests || []; 
    const pending = requests.filter(r => r.status === 'pending');
    if (pending.length === 0) { 
        document.getElementById('noPendingVerifications').style.display = 'block'; 
        return; 
    }
    document.getElementById('noPendingVerifications').style.display = 'none';
    pending.forEach((req, idx) => {
        const actualIdx = appState.verificationRequests.indexOf(req);
        container.innerHTML += `
            <div style="background:rgba(255,215,0,0.03);border:1px solid rgba(255,215,0,0.08);border-radius:8px;padding:14px 16px;margin-bottom:10px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Name:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${req.userName || 'N/A'}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Gmail:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${req.userEmail}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Account ID:</span>
                        <span style="color:#ffffff;font-weight:700;font-size:0.75rem;">${req.accountId || 'N/A'}</span>
                    </div>
                    <div style="font-size:0.7rem;color:var(--text-secondary);padding:2px 0;font-weight:600;display:flex;justify-content:space-between;">
                        <span style="color:var(--text-muted);">Broker:</span>
                        <span style="color:#FFD700;font-weight:700;font-size:0.75rem;">${req.broker || 'N/A'}</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap;">
                    <span style="font-size:0.55rem;color:var(--text-muted);font-weight:600;">Free Credits:</span>
                    <input type="number" id="verifyFreeCredits_${idx}" value="${req.freeCredits || appState.offerCredits || 10}" 
                        style="width:100px;padding:5px 8px;background:var(--input-bg);border:1px solid rgba(255,0,51,0.1);border-radius:4px;color:var(--text-primary);font-size:0.6rem;text-align:center;font-weight:600;">
                    <button onclick="window.adminApproveVerification(${actualIdx})" 
                        style="flex:1;padding:8px 14px;border-radius:6px;border:none;font-weight:700;cursor:pointer;font-size:0.6rem;text-transform:uppercase;background:#00FF66;color:#000;letter-spacing:1px;min-width:100px;">
                        ✅ Approve
                    </button>
                    <button onclick="window.adminRejectVerification(${actualIdx})" 
                        style="flex:1;padding:8px 14px;border-radius:6px;border:none;font-weight:700;cursor:pointer;font-size:0.6rem;text-transform:uppercase;background:#FF0033;color:#fff;letter-spacing:1px;min-width:100px;">
                        ❌ Reject
                    </button>
                </div>
            </div>
        `;
    });
}

window.adminApproveVerification = function(idx) {
    const request = appState.verificationRequests[idx];
    if (!request || request.status !== 'pending') return;
    const inputField = document.getElementById('verifyFreeCredits_' + idx);
    let freeCredits = appState.offerCredits || 10;
    if (inputField) {
        const val = parseInt(inputField.value);
        if (!isNaN(val)) freeCredits = val;
    }
    if (confirm('Approve verification for ' + request.userEmail + ' with ' + freeCredits + ' free credits?')) {
        request.status = 'approved';
        const user = appState.users.find(u => u.email === request.userEmail);
        if (user) {
            user.verified = true;
            user.accountId = request.accountId;
            user.name = request.userName || user.name;
            user.freeCredits = freeCredits;
            user.credits = (user.credits || 0) + freeCredits;
        }
        saveLocalState();
        renderPendingVerifications();
        renderUsersList();
        updatePendingCounts();
    }
};

window.adminRejectVerification = function(idx) { 
    const request = appState.verificationRequests[idx]; 
    if (!request || request.status !== 'pending') return; 
    if (confirm('Reject verification for ' + request.userEmail + '?')) { 
        request.status = 'rejected'; 
        saveLocalState(); 
        renderPendingVerifications(); 
        renderUsersList();
        updatePendingCounts();
    } 
};

/* ===== USERS LIST ===== */
function renderUsersList() {
    // placeholder
}

function showVerifiedUsers() { 
    const container = document.getElementById('usersContent'); 
    container.innerHTML = `<input class="search-input" id="userSearchInput" placeholder="Search by name, email, broker..." oninput="searchUsersInPopup()">
    <div class="user-list-scroll" id="verifiedUsersList"></div>`; 
    renderVerifiedUsersList(); 
}

function renderVerifiedUsersList(filter = '') {
    const container = document.getElementById('verifiedUsersList'); 
    if (!container) return; 
    container.innerHTML = '';
    const users = appState.users.filter(u => u.verified === true);
    const filtered = users.filter(u => 
        (u.name || '').toLowerCase().includes(filter) || 
        (u.email || '').toLowerCase().includes(filter) || 
        (u.broker || '').toLowerCase().includes(filter) || 
        (u.accountId || '').toLowerCase().includes(filter)
    );
    if (filtered.length === 0) { 
        container.innerHTML = '<div style="color:var(--text-muted);font-size:0.6rem;text-align:center;padding:20px;">No verified users found</div>'; 
        return; 
    }
    filtered.forEach((u, idx) => { 
        const actualIdx = appState.users.indexOf(u);
        const statusText = u.adminAdded ? 'Admin' : 'Verified';
        const statusClass = u.adminAdded ? 'status-admin' : 'status-verified';
        container.innerHTML += `
            <div class="user-list-item" onclick="window.openUserDetailPopup(${actualIdx})">
                <span class="user-name-display">${u.name || u.email}</span>
                <span class="user-credits-display">${u.credits || 0} cr</span>
                <span class="${statusClass}">${statusText}</span>
            </div>
        `;
    });
}

window.searchUsersInPopup = function() { 
    const query = document.getElementById('userSearchInput')?.value?.toLowerCase().trim() || ''; 
    renderVerifiedUsersList(query); 
};

function showAddUserForm() {
    const container = document.getElementById('usersContent');
    container.innerHTML = `
        <label>User Name</label><input type="text" id="addUserName">
        <label>Email</label><input type="email" id="addUserEmail">
        <label>Account ID</label><input type="text" id="addUserAccountId">
        <label>Broker</label><select id="addUserBroker">${appState.brokers.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}</select>
        <label>Free Credits</label><input type="number" id="addUserFreeCredits" value="0">
        <button class="btn-submit btn-success" onclick="adminAddUserFromPopup()">💾 Save User</button>
        <div class="error-msg" id="addUserError"></div><div class="success-msg" id="addUserSuccess"></div>
    `;
}

window.adminAddUserFromPopup = function() {
    const name = document.getElementById('addUserName').value.trim(); 
    const email = document.getElementById('addUserEmail').value.trim(); 
    const accountId = document.getElementById('addUserAccountId').value.trim(); 
    const broker = document.getElementById('addUserBroker').value; 
    const credits = parseInt(document.getElementById('addUserFreeCredits').value) || 0;
    const errorEl = document.getElementById('addUserError'); 
    const successEl = document.getElementById('addUserSuccess'); 
    errorEl.textContent = ''; 
    successEl.textContent = '';
    if (!name || !email || !accountId) { errorEl.textContent = '❌ Please fill all required fields'; return; }
    if (appState.users.find(u => u.email === email)) { errorEl.textContent = '❌ User exists!'; return; }
    const brokerData = appState.brokers.find(b => b.name === broker);
    const newUser = { 
        name, email, accountId, broker: broker || 'Manual', 
        verified: true, adminAdded: true, deposit: 0, 
        requiredDeposit: brokerData ? brokerData.minDeposit : 0, 
        credits, freeCredits: credits, 
        signalsUsed: 0, todayUsed: 0, totalUsed: 0,
        blocked: false, 
        registeredAt: new Date().toISOString() 
    };
    appState.users.push(newUser); 
    saveLocalState(); 
    renderUsersList(); 
    updatePendingCounts(); 
    successEl.textContent = '✅ User added successfully!';
    setTimeout(() => { showVerifiedUsers(); successEl.textContent = ''; }, 1500);
};

/* ===== USER DETAIL POPUP ===== */
window.openUserDetailPopup = function(idx) {
    const user = appState.users[idx]; 
    if (!user) return; 
    selectedUserDetail = user;
    document.getElementById('userDetailTitle').textContent = '👤 ' + (user.name || user.email);
    
    const userPayments = (appState.payments || []).filter(p => p.userEmail === user.email);
    let paymentDetails = '';
    if (userPayments.length > 0) {
        let totalPaid = 0;
        let successCount = 0;
        userPayments.forEach(p => {
            if (p.status === 'success') {
                totalPaid += p.amount;
                successCount++;
            }
        });
        paymentDetails = `
            <div class="user-detail-row"><span class="label">Total Payments:</span><span class="value">${userPayments.length}</span></div>
            <div class="user-detail-row"><span class="label">Successful Payments:</span><span class="value green">${successCount}</span></div>
            <div class="user-detail-row"><span class="label">Total Amount Paid:</span><span class="value green">₹${totalPaid}</span></div>
        `;
    } else {
        paymentDetails = `<div class="user-detail-row"><span class="label">Payments:</span><span class="value" style="color:var(--text-muted);">No payment history</span></div>`;
    }
    
    const chatKey = user.email.replace(/[.#$\/\[\]]/g, '_');
    const chatMsgs = appState.chats && appState.chats[chatKey] ? appState.chats[chatKey] : [];
    const chatCount = chatMsgs.length;
    
    document.getElementById('userDetailContent').innerHTML = `
        <div class="user-detail-row"><span class="label">Name:</span><span class="value">${user.name || 'N/A'}</span></div>
        <div class="user-detail-row"><span class="label">Email:</span><span class="value">${user.email}</span></div>
        <div class="user-detail-row"><span class="label">Account ID:</span><span class="value">${user.accountId || 'N/A'}</span></div>
        <div class="user-detail-row"><span class="label">Broker:</span><span class="value">${user.broker || 'N/A'}</span></div>
        <div class="user-detail-row"><span class="label">Status:</span><span class="value ${user.blocked ? 'red' : 'green'}">${user.blocked ? '🚫 Blocked' : (user.adminAdded ? '✅ Admin' : '✅ Verified')}</span></div>
        <div class="user-detail-row"><span class="label">Free Credits:</span><span class="value">${user.freeCredits || 0}</span></div>
        <div class="user-detail-row"><span class="label">Available Credits:</span><span class="value green">${user.credits || 0}</span></div>
        <div class="user-detail-row"><span class="label">Today Used:</span><span class="value">${user.todayUsed || 0}</span></div>
        <div class="user-detail-row"><span class="label">Chat Messages:</span><span class="value">${chatCount}</span></div>
        ${paymentDetails}
        <div class="user-detail-row"><span class="label">Registered:</span><span class="value" style="font-size:0.55rem;">${user.registeredAt ? new Date(user.registeredAt).toLocaleString() : 'N/A'}</span></div>
    `;
    document.getElementById('detailFreeCreditsInput').value = '';
    openModal('userDetailPopup');
};

window.giveFreeCredits = function() { 
    if (!selectedUserDetail) return; 
    const credits = parseInt(document.getElementById('detailFreeCreditsInput').value); 
    if (isNaN(credits) || credits <= 0) { alert('Enter valid amount'); return; } 
    selectedUserDetail.freeCredits = (selectedUserDetail.freeCredits || 0) + credits; 
    selectedUserDetail.credits = (selectedUserDetail.credits || 0) + credits; 
    saveLocalState(); 
    renderUsersList(); 
    updatePendingCounts(); 
    document.getElementById('detailFreeCreditsInput').value = ''; 
    const idx = appState.users.indexOf(selectedUserDetail); 
    if (idx !== -1) openUserDetailPopup(idx); 
};

window.blockUser = function() { 
    if (!selectedUserDetail) return; 
    const action = selectedUserDetail.blocked ? 'Unblock' : 'Block'; 
    if (confirm(action + ' user ' + selectedUserDetail.email + '?')) { 
        selectedUserDetail.blocked = !selectedUserDetail.blocked; 
        saveLocalState(); 
        renderUsersList(); 
        updatePendingCounts(); 
        const idx = appState.users.indexOf(selectedUserDetail); 
        if (idx !== -1) openUserDetailPopup(idx); 
    } 
};

window.removeUser = function() { 
    if (!selectedUserDetail) return; 
    if (confirm('Remove user ' + selectedUserDetail.email + ' permanently?')) { 
        const idx = appState.users.indexOf(selectedUserDetail); 
        if (idx !== -1) { 
            appState.users.splice(idx, 1); 
            selectedUserDetail = null; 
            closeModal('userDetailPopup'); 
            saveLocalState(); 
            renderUsersList(); 
            updatePendingCounts(); 
        } 
    } 
};

window.chatWithUser = function() { 
    if (!selectedUserDetail) return; 
    closeModal('userDetailPopup'); 
    openChatPopup(); 
    setTimeout(() => { 
        chatSelectedUser = selectedUserDetail.email; 
        updateChatUserList(); 
        loadChatMessages(); 
    }, 300); 
};

/* ===== CHAT ===== */
function openChatPopup() { 
    openModal('chatPopup'); 
    updateChatUserList(); 
    updateChatNotification(); 
}

window.filterChatUsers = function() { 
    updateChatUserList(document.getElementById('chatSearchInput').value.toLowerCase().trim()); 
};

function updateChatUserList(filter = '') {
    const container = document.getElementById('chatUserList'); 
    if (!container) return; 
    container.innerHTML = '';
    container.style.background = '#000000 !important';
    
    const chatUsers = []; 
    const chatKeys = Object.keys(appState.chats || {});
    chatKeys.forEach(key => { 
        const email = key.replace(/_/g, '.'); 
        const user = appState.users.find(u => u.email === email); 
        if (user) { 
            const msgs = appState.chats[key] || []; 
            const unread = msgs.filter(m => m.sender === 'user' && !m.read).length; 
            chatUsers.push({ user, unread, key }); 
        } 
    });
    
    chatUsers.sort((a, b) => { 
        const msgsA = appState.chats[a.key] || [];
        const msgsB = appState.chats[b.key] || [];
        const timeA = msgsA.length > 0 ? msgsA[msgsA.length - 1].timestamp : 0;
        const timeB = msgsB.length > 0 ? msgsB[msgsB.length - 1].timestamp : 0;
        return new Date(timeB) - new Date(timeA); 
    });
    
    const filtered = chatUsers.filter(c => 
        (c.user.name || '').toLowerCase().includes(filter) || 
        c.user.email.toLowerCase().includes(filter)
    );
    
    if (filtered.length === 0) { 
        container.innerHTML = '<div style="color:var(--text-muted);font-size:0.5rem;text-align:center;padding:16px;">No chat users found</div>'; 
        return; 
    }
    
    filtered.forEach(c => { 
        const isSelected = chatSelectedUser === c.user.email;
        const unreadBadge = c.unread > 0 ? `<span class="unread-dot"></span>` : '';
        const unreadCount = c.unread > 0 ? `<span class="unread-count">${c.unread}</span>` : '';
        container.innerHTML += `
            <div class="chat-user-item ${isSelected ? 'selected' : ''}" onclick="window.selectChatUser('${c.user.email}')">
                <span class="user-name-text">${c.user.name || c.user.email}</span>
                <span style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                    ${unreadBadge}
                    ${unreadCount}
                </span>
            </div>
        `;
    });
}

window.selectChatUser = function(email) { 
    chatSelectedUser = email; 
    document.getElementById('chatSelectedUserDisplay').innerHTML = `
        <span>💬 ${appState.users.find(u => u.email === email)?.name || email}</span>
        <button class="clear-btn" onclick="clearSelectedChatUser()">✕</button>
    `;
    updateChatUserList(document.getElementById('chatSearchInput')?.value || ''); 
    loadChatMessages(); 
};

function clearSelectedChatUser() {
    chatSelectedUser = null;
    document.getElementById('chatSelectedUserDisplay').innerHTML = '<span>Select a user to chat</span><button class="clear-btn" onclick="clearSelectedChatUser()" style="display:none;">✕</button>';
    document.getElementById('chatMsgBox').innerHTML = '<div style="color:var(--text-muted);font-size:0.55rem;text-align:center;padding:20px;">Select a user to chat</div>';
    updateChatUserList(document.getElementById('chatSearchInput')?.value || '');
}

function loadChatMessages() {
    const box = document.getElementById('chatMsgBox'); 
    if (!box || !chatSelectedUser) { 
        box.innerHTML = '<div style="color:var(--text-muted);font-size:0.55rem;text-align:center;padding:20px;">Select a user to chat</div>'; 
        return; 
    }
    box.style.background = '#000000 !important';
    const key = chatSelectedUser.replace(/[.#$\/\[\]]/g, '_'); 
    const msgs = appState.chats && appState.chats[key] ? appState.chats[key] : [];
    if (msgs.length === 0) { 
        box.innerHTML = '<div style="color:var(--text-muted);font-size:0.55rem;text-align:center;padding:20px;">No messages</div>'; 
        return; 
    }
    box.innerHTML = '';
    msgs.forEach(c => { 
        const cls = c.sender === 'admin' ? 'user' : 'admin'; 
        const time = c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : ''; 
        box.innerHTML += `<div class="msg ${cls}">${c.message}<span class="time">${time}</span></div>`; 
        if (c.sender === 'user' && !c.read) c.read = true; 
    });
    box.scrollTop = box.scrollHeight; 
    saveLocalState(); 
    updateChatNotification();
}

window.sendChatMessage = function() {
    const input = document.getElementById('chatInputBox'); 
    const msg = input.value.trim(); 
    if (!msg || !chatSelectedUser) { 
        alert('Select a user and enter message'); 
        return; 
    }
    const key = chatSelectedUser.replace(/[.#$\/\[\]]/g, '_'); 
    if (!appState.chats) appState.chats = {}; 
    if (!appState.chats[key]) appState.chats[key] = [];
    appState.chats[key].push({ sender: 'admin', message: msg, timestamp: new Date().toISOString(), read: false });
    saveLocalState(); 
    input.value = ''; 
    loadChatMessages(); 
    updateChatUserList(document.getElementById('chatSearchInput')?.value || ''); 
    updateChatNotification();
};
document.getElementById('chatInputBox')?.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendChatMessage(); });

function updateChatNotification() {
    let totalUnread = 0; 
    const chatKeys = Object.keys(appState.chats || {});
    chatKeys.forEach(key => { 
        const msgs = appState.chats[key] || []; 
        const unread = msgs.filter(m => m.sender === 'user' && !m.read).length; 
        totalUnread += unread; 
    });
    document.getElementById('chatNotificationCount').textContent = totalUnread;
    document.getElementById('chatNotificationCount').className = 'count ' + (totalUnread > 0 ? 'red' : 'green');
}

/* ===== REVENUE FUNCTIONS ===== */
window.openRevenuePopup = function() {
    openModal('revenuePopup');
    showRevenueBreakdown('total');
};

window.showRevenueBreakdown = function(period) {
    const payments = (appState.payments || []).filter(p => p.status === 'success');
    const now = new Date();
    let filtered = [];
    let title = '';

    if (period === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = payments.filter(p => new Date(p.date) >= start);
        title = 'Today';
    } else if (period === 'yesterday') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = payments.filter(p => {
            const d = new Date(p.date);
            return d >= start && d < end;
        });
        title = 'Yesterday';
    } else if (period === 'weekly') {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
        filtered = payments.filter(p => new Date(p.date) >= start);
        title = 'This Week';
    } else if (period === 'monthly') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = payments.filter(p => new Date(p.date) >= start);
        title = 'This Month';
    } else if (period === 'yearly') {
        const start = new Date(now.getFullYear(), 0, 1);
        filtered = payments.filter(p => new Date(p.date) >= start);
        title = 'This Year';
    } else if (period === 'custom') {
        const dateStr = document.getElementById('revenueCustomDate').value;
        if (!dateStr) { alert('Select a date'); return; }
        const customDate = new Date(dateStr);
        const start = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
        const end = new Date(start.getTime() + 24*60*60*1000);
        filtered = payments.filter(p => {
            const d = new Date(p.date);
            return d >= start && d < end;
        });
        title = 'Custom Date';
    } else { // total
        filtered = payments;
        title = 'Total Revenue';
    }

    const totalAmount = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
    const container = document.getElementById('revenueBreakdownContent');
    const noData = document.getElementById('noRevenueData');

    if (filtered.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    noData.style.display = 'none';
    let html = `<div style="font-size:0.7rem;color:var(--popup-label);margin-bottom:4px;font-family:'Orbitron',sans-serif;">${title}</div>`;
    filtered.forEach(p => {
        const user = appState.users.find(u => u.email === p.userEmail);
        const name = user ? user.name || user.email : p.userEmail;
        html += `<div class="revenue-item"><span>${name}</span><span class="revenue-amount">₹${p.amount}</span></div>`;
    });
    html += `<div class="revenue-total">Total: ₹${totalAmount}</div>`;
    container.innerHTML = html;
};

/* ===== POPUP OPENERS ===== */
window.openPendingPaymentsPopup = function() { renderPendingPayments(); openModal('pendingPaymentsPopup'); };
window.openPendingVerificationsPopup = function() { renderPendingVerifications(); openModal('pendingVerificationsPopup'); };
window.openUsersPopup = function() { showVerifiedUsers(); openModal('usersPopup'); };
window.openChatPopup = function() { openChatPopup(); };

/* ===== MODAL HELPERS ===== */
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
window.openModal = openModal; window.closeModal = closeModal;

/* ===== ADMIN AUTH ===== */
let adminSession = sessionStorage.getItem('admin_logged_in');
if (adminSession === 'true') {
    adminLoggedIn = true;
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminArea').style.display = 'block';
    loadLocalState();
} else {
    window.location.href = 'index.html';
}

/* ===== LOGOUT ===== */
document.getElementById('adminLogoutBtn').addEventListener('click', function() {
    adminLoggedIn = false;
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('user_logged_in');
    window.location.href = 'index.html';
});

/* ===== CHANGE PASSWORD ===== */
window.changeAdminPassword = function() {
    const newPass = document.getElementById('adminNewPassword').value;
    const confirmPass = document.getElementById('adminConfirmPassword').value;
    if (newPass.length < 4) { alert('Password must be at least 4 characters!'); return; }
    if (newPass !== confirmPass) { alert('Passwords do not match!'); return; }
    appState.password = newPass;
    saveLocalState();
    sessionStorage.setItem('admin_logged_in', 'true');
    const btn = document.getElementById('adminNewPassword').closest('.admin-section').querySelector('.btn-save');
    btn.textContent = '✅ Saved';
    setTimeout(() => { btn.textContent = '💾 Save'; }, 2000);
    document.getElementById('adminNewPassword').value = '';
    document.getElementById('adminConfirmPassword').value = '';
    disableEditFields(document.querySelector('.admin-section'));
};

/* ===== EXPORT GLOBAL FUNCTIONS ===== */
window.adminApprovePayment = adminApprovePayment; window.adminRejectPayment = adminRejectPayment;
window.adminApproveVerification = adminApproveVerification; window.adminRejectVerification = adminRejectVerification;
window.openUserDetailPopup = openUserDetailPopup; window.giveFreeCredits = giveFreeCredits; window.blockUser = blockUser; window.removeUser = removeUser; window.chatWithUser = chatWithUser;
window.openPendingPaymentsPopup = openPendingPaymentsPopup; window.openPendingVerificationsPopup = openPendingVerificationsPopup; window.openUsersPopup = openUsersPopup; window.openChatPopup = openChatPopup;
window.showVerifiedUsers = showVerifiedUsers; window.showAddUserForm = showAddUserForm; window.adminAddUserFromPopup = adminAddUserFromPopup; window.searchUsersInPopup = searchUsersInPopup;
window.adminAddCreditPack = adminAddCreditPack; window.adminDeleteCreditPack = adminDeleteCreditPack; window.adminEditCreditPack = adminEditCreditPack; window.adminUpdateCreditPack = adminUpdateCreditPack;
window.adminSavePaymentSettings = adminSavePaymentSettings; window.adminSaveLogo = adminSaveLogo;
window.adminAddBroker = adminAddBroker; window.adminDeleteBroker = adminDeleteBroker; window.adminEditBroker = adminEditBroker; window.adminUpdateBroker = adminUpdateBroker;
window.adminSaveOffer = adminSaveOffer; window.saveAdminSettings = saveAdminSettings;
window.enableEdit = enableEdit; window.previewQRImage = previewQRImage;
window.editTool = editTool; window.adminUpdateTool = adminUpdateTool; window.toggleToolVisibility = toggleToolVisibility; window.deleteTool = deleteTool; window.showAddToolForm = showAddToolForm; window.adminAddTool = adminAddTool;
window.toggleToolFire = toggleToolFire;
window.selectChatUser = selectChatUser; window.sendChatMessage = sendChatMessage; window.filterChatUsers = filterChatUsers; window.clearSelectedChatUser = clearSelectedChatUser;
window.changeAdminPassword = changeAdminPassword;
window.editSocial = editSocial; window.adminUpdateSocial = adminUpdateSocial; window.toggleSocialVisibility = toggleSocialVisibility; window.deleteSocial = deleteSocial; window.showAddSocialForm = showAddSocialForm; window.adminAddSocial = adminAddSocial;
window.saveCreditsPerSignal = saveCreditsPerSignal;
window.togglePaymentFields = togglePaymentFields;
window.openRevenuePopup = openRevenuePopup;
window.showRevenueBreakdown = showRevenueBreakdown;

/* ===== CURSOR GLOW ===== */
const glow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; glow.classList.add('active'); });
    document.addEventListener('mouseleave', () => { glow.classList.remove('active'); });
}

/* ===== INITIALIZATION ===== */
console.log('⚙️ Admin Panel Loaded');
