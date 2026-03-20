<main class="content-area" style="flex: 1; padding: 30px; background: radial-gradient(circle at top right, #120000, #050505); overflow-y: auto;">
        <div class="panel-header" id="panelHeader">
            <h1 style="font-size: 24px; letter-spacing: 3px; border-left: 5px solid var(--red); padding-left: 20px;">Admin Dashboard</h1>
            <p style="font-family: 'Roboto Mono'; color: #555; font-size: 13px; margin: 5px 0 30px 20px;">AUTHENTICATED SESSION: BINARY RUTHLESS TRADER</p>
        </div>

        <div id="mainDisplay">
            </div>
    </main>
</div>

<script>
    // Logic as per your provided code
    function loadContent(moduleName) {
        localStorage.setItem('activeModule', moduleName);
        // ... (remaining JS logic from your file)
    }

    window.onload = function() {
        const lastModule = localStorage.getItem('activeModule') || 'Views';
        loadContent(lastModule);
    };
</script>
</body>
</html>
