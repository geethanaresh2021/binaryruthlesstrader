// --- 1. AFFILIATE LINK CONFIGURATION ---
const DEFAULT_LINK = "https://your-broker-affiliate-link.com"; // Default link if none saved

// --- 2. REDIRECTION LOGIC ---
function redirectToBroker() {
    // Check if a custom link is saved in LocalStorage (from Admin Panel)
    const customLink = localStorage.getItem('ruthless_aff_link');
    
    // Use saved link or fallback to default
    const finalLink = (customLink && customLink.trim() !== "") ? customLink : DEFAULT_LINK;
    
    console.log(`Ruthless Redirecting to: ${finalLink}`);
    
    // Open in a new tab
    window.open(finalLink, '_blank');
}

// --- 3. SYNC ADMIN INPUT ON LOAD ---
function syncAffiliateInput() {
    const adminInput = document.getElementById('admin-aff-link');
    const savedLink = localStorage.getItem('ruthless_aff_link');
    
    if (adminInput && savedLink) {
        adminInput.value = savedLink;
    }
}

// --- 4. AUTO-LOAD ON START ---
document.addEventListener('DOMContentLoaded', () => {
    syncAffiliateInput();
});

// --- 5. SOCIAL MEDIA SYNC (OPTIONAL) ---
// Ikkada meeru Telegram/YouTube links ni kooda dynamic ga marchali ante ee logic vadochu
function updateSocialLinks(platform, newUrl) {
    localStorage.setItem(`ruthless_${platform}_link`, newUrl);
}
