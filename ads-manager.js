function loadAds() {
    db.ref('site_settings/ads').on('value', snap => {
        const ads = snap.val();
        if (!ads) return;

        for (let i = 1; i <= 8; i++) {
            const id = `adSlot${i}`;
            const d = ads[id];
            const el = document.getElementById(id);

            if (el && d) {
                if (d.visible === false) {
                    el.style.display = "none";
                    el.innerHTML = '';
                    el.setAttribute('data-snippet', '');
                } else {
                    el.style.display = "flex";
                    el.style.width = d.width || "100%";
                    el.style.height = d.height || "auto";

                    // Update only if snippet changes
                    if (el.getAttribute('data-snippet') !== d.snippet) {
                        el.setAttribute('data-snippet', d.snippet);
                        el.innerHTML = ''; 
                        
                        const iframe = document.createElement('iframe');
                        iframe.style.width = "100%";
                        iframe.style.height = d.height || "100%";
                        iframe.style.border = "none";
                        iframe.scrolling = "no";
                        el.appendChild(iframe);
                        
                        const doc = iframe.contentWindow.document;
                        doc.open();
                        doc.write(`
                            <style>
                                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
                            </style>
                            <div>${d.snippet}</div>
                        `);
                        doc.close();
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', loadAds);
