import { db } from './firebase-logic.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- GLOBAL MODULE CONFIG ---
// Indhulo modules ki thaggattu fields ni define chesukovachu
const moduleConfigs = {
    "Views": { type: "stats", label: "LIVE NETWORK TRAFFIC", icon: "fa-eye", color: "#00ffcc" },
    "Revenue": { type: "stats", label: "TOTAL EARNINGS (INR)", icon: "fa-indian-rupee-sign", color: "var(--red)" },
    "Warning Note": { type: "complex", fields: ["text", "speed", "status"] },
    "Giveaway Winner": { type: "complex", fields: ["content", "speed", "status"] },
    "Ads Containers": { type: "textarea", label: "PASTE AD SCRIPT CODE" },
    "ST Resize": { type: "standard", label: "LAYOUT WIDTH (e.g. 1200px or 100%)" },
    "Firebase": { type: "standard", label: "PROJECT ID / CONFIG STRING" },
    "default": { type: "standard", label: "UPDATE CONFIGURATION" }
};

// --- MAIN CONTROLLER ---
window.loadContent = function(moduleName) {
    // 1. Mobile Friendly Scroll
    if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const mainDisplay = document.getElementById('mainDisplay');
    const config = moduleConfigs[moduleName] || moduleConfigs["default"];
    
    // 2. Update Header
    document.getElementById('panelHeader').innerHTML = `
        <h1>${moduleName} <span style="color:var(--red); font-size:12px;">_ONLINE</span></h1>
        <p>RUTHLESS TERMINAL // MODE: SECURE</p>
    `;

    // 3. Update Active Button State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.trim().includes(moduleName));
    });

    // 4. Render UI based on Module Type
    renderModuleUI(moduleName, config);
};

// --- UI RENDERING ENGINE ---
function renderModuleUI(name, config) {
    const mainDisplay = document.getElementById('mainDisplay');
    const docId = name.toLowerCase().replace(/\s+/g, '_');

    let html = `<div class="ruthless-card">`;

    if (config.type === "stats") {
        html += `
            <p class="card-label">${config.label}</p>
            <h2 style="color:${config.color}; font-size:32px; font-family:'Roboto Mono'; font-weight:bold; text-shadow:0 0 15px ${config.color}; margin:15px 0;">
                ${name === 'Views' ? '1,284' : '₹ 42,500'}
            </h2>
            <p style="color:#222; font-size:9px;">SYNCED: JUST NOW</p>
        `;
    } 
    else if (config.type === "complex") {
        html += `
            <h3 class="card-label">UPDATE ${name.toUpperCase()}</h3>
            <input type="text" id="compText" class="ruthless-input" placeholder="Enter content/message...">
            <div style="display:flex; gap:10px;">
                <input type="number" id="compSpeed" class="ruthless-input" style="flex:1;" placeholder="Speed (0-10)">
                <select id="compStatus" class="ruthless-input" style="flex:1;">
                    <option value="true">ACTIVE</option>
                    <option value="false">HIDDEN</option>
                </select>
            </div>
            <button class="save-btn" onclick="saveComplexData('${docId}')">DEPLOY UPDATE</button>
        `;
    }
    else if (config.type === "textarea") {
        html += `
            <h3 class="card-label">${config.label}</h3>
            <textarea id="stdInput" class="ruthless-input" style="height:150px; font-size:12px;"></textarea>
            <button class="save-btn" onclick="saveStandardData('${docId}')">SAVE SCRIPT</button>
        `;
    }
    else {
        html += `
            <h3 class="card-label">${config.label}</h3>
            <input type="text" id="stdInput" class="ruthless-input" placeholder="Type here...">
            <button class="save-btn" onclick="saveStandardData('${docId}')">UPDATE SYSTEM</button>
        `;
    }

    html += `</div>`;
    mainDisplay.innerHTML = html;
}

// --- DATA PERSISTENCE (FIREBASE SYNC) ---
window.saveStandardData = async (docId) => {
    const val = document.getElementById('stdInput').value;
    await pushToFirebase(docId, { value: val });
};

window.saveComplexData = async (docId) => {
    const data = {
        text: document.getElementById('compText')?.value || document.getElementById('compText')?.innerText || "",
        content: document.getElementById('compText')?.value || "", // for giveaway
        speed: parseInt(document.getElementById('compSpeed').value) || 0,
        status: document.getElementById('compStatus').value === "true"
    };
    await pushToFirebase(docId, data);
};

async function pushToFirebase(docId, data) {
    try {
        const btn = event.target;
        btn.innerText = "EXECUTING...";
        btn.disabled = true;

        await setDoc(doc(db, "site_settings", docId), {
            ...data,
            lastUpdated: serverTimestamp()
        });

        btn.innerText = "SUCCESS // SYNCED";
        btn.style.background = "#fff";
        btn.style.color = "#000";

        setTimeout(() => {
            btn.innerText = "UPDATE SYSTEM";
            btn.style.background = "var(--red)";
            btn.style.color = "#fff";
            btn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error("RUTHLESS ERROR:", error);
        alert("SYNC FAILED!");
    }
}

// Initial Load
window.onload = () => loadContent(localStorage.getItem('activeModule') || 'Views');
