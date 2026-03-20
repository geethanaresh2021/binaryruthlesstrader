<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Admin Dashboard | Ruthless System</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --red: #ff0000;
            --white: #ffffff;
            --bg: #050505;
            --sidebar-bg: #0a0a0a;
            --neon-glow: 0 0 15px rgba(255, 0, 0, 0.4);
            --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Fixed Layout: Desktop/Tablet Only */
        * { box-sizing: border-box; margin: 0; padding: 0; touch-action: manipulation; }
        html, body { 
            height: 100vh; width: 100vw; overflow: hidden; 
            background: var(--bg); color: #fff; font-family: 'Orbitron', sans-serif;
        }
        body { display: flex; flex-direction: column; }

        /* Custom Scrollbar for Ruthless Look */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 10px; }

        /* Input specific styling as requested */
        .fb-input { 
            background: #080808; border: 1px solid #222; padding: 12px; 
            color: #00ffcc !important; font-family: 'Roboto Mono' !important; 
            font-weight: bold !important; font-size: 13px; border-radius: 4px;
        }
    </style>
</head>
