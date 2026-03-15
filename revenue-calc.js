// --- 1. REVENUE VARIABLES ---
let refreshCount = 0;
let lastRefreshTimestamp = Date.now();
const REFRESH_INTERVAL = 15000; // 15 Seconds in milliseconds

// --- 2. ACTIVITY TRACKER ---
// User scroll chesina leda click chesina, ads refresh logic trigger avthundhi
function trackUserActivity() {
    const now = Date.now();
    
    // Check if 15 seconds have passed since last refresh
    if (now - lastRefreshTimestamp >= REFRESH_INTERVAL) {
        refreshCount++;
        lastRefreshTimestamp = now;
        
        console.log(`Ruthless Ads Refreshed: ${refreshCount} times.`);
        calculateLiveRevenue();
        
        // Dynamic Ad Content Refresh (Optional: Logic to reload ad iFrames)
        refreshAdContainers();
    }
}

// --- 3. REVENUE CALCULATION LOGIC ---
function calculateLiveRevenue() {
    // Get values from Admin Panel inputs
    const cpm = parseFloat(document.getElementById('admin-cpm').value) || 0;
    const usdRate = parseFloat(document.getElementById('admin-usd-rate').value) || 0;
    
    // Logic: Total Ads (4) * Refreshes / 1000 (CPM is per 1000 impressions)
    const totalImpressions = refreshCount * 4;
    const estimatedUSD = (totalImpressions / 1000) * cpm;
    const estimatedINR = estimatedUSD * usdRate;

    // Update Admin Display
    const revDisplay = document.getElementById('live-revenue-val');
    if (revDisplay) {
        revDisplay.innerText = estimatedINR.toFixed(2);
    }
}

// --- 4. AD CONTAINER REFRESH ---
function refreshAdContainers() {
    const ads = document.querySelectorAll('.ad-box');
    ads.forEach(ad => {
        // Animation effect for refresh
        ad.style.opacity = '0.5';
        setTimeout(() => { ad.style.opacity = '1'; }, 300);
        
        // Ikkada meeru Ad code iFrames ni reload chese logic pettukochu
    });
}

// --- 5. EVENT LISTENERS ---
window.addEventListener('scroll', trackUserActivity);
window.addEventListener('click', trackUserActivity);
window.addEventListener('mousemove', trackUserActivity); // Optional for more accuracy

// Update revenue if admin changes CPM/Rate manually
document.getElementById('admin-cpm').addEventListener('input', calculateLiveRevenue);
document.getElementById('admin-usd-rate').addEventListener('input', calculateLiveRevenue);
