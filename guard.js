// guard.js
(function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const expiryDate = localStorage.getItem('expiryDate');
    const timeout = 10 * 60 * 1000; // 10 phút
    const telegramLink = "https://t.me/s/Dai_Hoc_Duy_Tan/";

    // 1. CHẶN HIỂN THỊ NGAY LẬP TỨC
    // Nếu chưa đăng nhập, xóa sạch HTML để dù có lỗi file login.html vẫn không lộ dữ liệu
    // if (isLoggedIn !== 'true') {
    //     document.documentElement.innerHTML = "Access Denied. Redirecting..."; 
    //     if (!window.location.href.includes("login.html")) {
    //         window.location.href = "login.html";
    //     }
    //     return;
    // }

    // 2. Kiểm tra hạn dùng tài khoản
    // if (expiryDate && new Date(expiryDate) < new Date()) {
    //     redirectToTelegram();
    //     return;
    // }

    // 3. Hiển thị lại nội dung sau khi đã xác thực xong
    document.addEventListener("DOMContentLoaded", function() {
        document.body.style.display = "flex"; // Khớp với layout 'display: flex' trong index.html
    });

    // --- CÁC LOGIC CÒN LẠI GIỮ NGUYÊN ---
    function redirectToTelegram() {
        localStorage.clear();
        window.location.href = telegramLink;
    }

    function resetTimer() {
        localStorage.setItem('lastActivity', new Date().getTime().toString());
    }

    function checkInactivity() {
        const lastActive = parseInt(localStorage.getItem('lastActivity') || new Date().getTime());
        const now = new Date().getTime();
        if (now - lastActive > timeout) {
            redirectToTelegram();
        }
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
    });

    if (!localStorage.getItem('lastActivity')) {
        resetTimer();
    }

    setInterval(checkInactivity, 10000);
})();

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
