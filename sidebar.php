<div class="admin-wrapper" style="display: flex; flex: 1; overflow: hidden;">
    <nav class="sidebar" style="width: 260px; background: var(--sidebar-bg); border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; padding: 15px 10px;">
        <div class="nav-group-label" style="font-size: 10px; color: #444; margin: 20px 0 10px 10px; letter-spacing: 2px;">ANALYTICS</div>
        <button class="nav-btn white-accent" onclick="loadContent('Views')"><i class="fas fa-eye"></i> Views</button>
        <button class="nav-btn white-accent" onclick="loadContent('Revenue')"><i class="fas fa-dollar-sign"></i> Revenue</button>

        <div class="nav-group-label" style="font-size: 10px; color: #444; margin: 20px 0 10px 10px; letter-spacing: 2px;">MANAGEMENT</div>
        <div class="nav-scroll-container" style="display: flex; flex-direction: column; overflow-y: auto; max-height: 480px;">
            <button class="nav-btn" onclick="loadContent('Tools Manager')"><i class="fas fa-tools"></i> Tools Manager</button>
            <button class="nav-btn" onclick="loadContent('Firebase')"><i class="fas fa-fire-alt"></i> Firebase</button>
            </div>
    </nav>
