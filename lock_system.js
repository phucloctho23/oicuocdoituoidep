const LOCK_CONFIG = {
    startTime: "23:01",
    endTime: "23:02",

    redirectLink: "https://t.me/+vHIkOFo7YeRlMGVl",
    message: "HỆ THỐNG TẠM KHÓA",
    subMessage: "Vui lòng quay lại sau thời gian đếm ngược."
};

(function () {
    let isSystemLocked = false;
    let overlayElement = null;

    // 1. CHÈN CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #system-lock-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.98); 
            z-index: 2147483647; 
            display: none; 
            flex-direction: column; justify-content: center; align-items: center;
            color: #fff; font-family: sans-serif; text-align: center; 
            user-select: none; -webkit-user-select: none;
            backdrop-filter: blur(10px);
            pointer-events: auto !important; 
            touch-action: none; 
        }
        #system-lock-overlay h1 { font-size: 2rem; margin: 15px 0; color: #e11d48; text-transform: uppercase; }
        .countdown-box { display: flex; gap: 15px; font-size: 1.5rem; font-weight: bold; margin-top: 20px; }
        .time-segment { background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 8px; min-width: 60px; }
        .time-segment span { display: block; font-size: 0.7rem; font-weight: normal; color: #aaa; }
        
        /* Hiệu ứng nhịp thở cho ổ khóa */
        .lock-icon {
            font-size: 5rem; 
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // 2. CHÈN HTML
    document.addEventListener('DOMContentLoaded', () => {
        overlayElement = document.createElement('div');
        overlayElement.id = 'system-lock-overlay';

        overlayElement.innerHTML = `
            <div class="lock-icon">🔒</div>
            <h1>${LOCK_CONFIG.message}</h1>
            <p>${LOCK_CONFIG.subMessage}</p>
            <div class="countdown-box">
                <div class="time-segment" id="lock-h">00<span>Giờ</span></div>
                <div class="time-segment" id="lock-m">00<span>Phút</span></div>
                <div class="time-segment" id="lock-s">00<span>Giây</span></div>
            </div>
        `;
        document.body.appendChild(overlayElement);
        const trapEvents = ['mousedown', 'click', 'contextmenu', 'touchstart', 'keydown', 'dblclick'];

        trapEvents.forEach(evt => {
            overlayElement.addEventListener(evt, (e) => {
                if (isSystemLocked) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = LOCK_CONFIG.redirectLink;
                }
            });
        });

        window.addEventListener('keydown', (e) => {
            if (isSystemLocked) {
                if (e.key === 'F12' ||
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                    window.location.href = LOCK_CONFIG.redirectLink;
                }
            }
        }, true);

        checkTimeAndLock();
        setInterval(checkTimeAndLock, 1000);
    });

    function checkTimeAndLock() {
        if (!overlayElement) return;

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const [sH, sM] = LOCK_CONFIG.startTime.split(':').map(Number);
        const [eH, eM] = LOCK_CONFIG.endTime.split(':').map(Number);

        const startMins = sH * 60 + sM;
        const endMins = eH * 60 + eM;

        let locked = false;
        let target = new Date();

        if (startMins < endMins) {
            if (currentMins >= startMins && currentMins < endMins) {
                locked = true;
                target.setHours(eH, eM, 0, 0);
            }
        } else {
            if (currentMins >= startMins || currentMins < endMins) {
                locked = true;
                target.setHours(eH, eM, 0, 0);
                if (currentMins >= startMins) target.setDate(target.getDate() + 1);
            }
        }

        isSystemLocked = locked;

        if (locked) {
            if (overlayElement.style.display !== 'flex') {
                overlayElement.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }

            const diff = target - now;
            if (diff > 0) {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                document.getElementById('lock-h').firstChild.textContent = String(h).padStart(2, '0');
                document.getElementById('lock-m').firstChild.textContent = String(m).padStart(2, '0');
                document.getElementById('lock-s').firstChild.textContent = String(s).padStart(2, '0');
            }
        } else {
            if (overlayElement.style.display !== 'none') {
                overlayElement.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    }
})();
