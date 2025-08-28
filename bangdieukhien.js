document.addEventListener("DOMContentLoaded", () => {
    const signupData = JSON.parse(localStorage.getItem("signupData"));

    // Nếu đã login có role -> vào dashboard luôn
    if (signupData && signupData.role) {
        if (signupData.role === "Huấn luyện viên") {
            window.location.href = "coach-dashboard.html";
            return;
        } else if (signupData.role === "Vận động viên") {
            window.location.href = "athlete-dashboard.html";
            return;
        }
    }

    // Nếu chưa login -> gắn sự kiện cho nút "Đi đến trang đăng nhập"
    const gotoLoginBtn = document.getElementById("gotoLogin");
    if (gotoLoginBtn) {
        gotoLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // ✅ Luôn chuyển sang trang đăng nhập
            window.location.href = "dangnhap.html";
        });
    }
});
