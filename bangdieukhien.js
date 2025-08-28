document.addEventListener("DOMContentLoaded", () => {
    const signupData = JSON.parse(localStorage.getItem("signupData"));
    const menu = document.getElementById("mainMenu");

    if (signupData && signupData.role) {
        // Nếu đã login -> thêm menu Bảng điều khiển
        const dashboardLink = document.createElement("a");
        dashboardLink.textContent = "Bảng điều khiển";
        dashboardLink.href = "bangdieukhien.html";
        dashboardLink.classList.add("active");
        menu.appendChild(dashboardLink);

        // Redirect sang dashboard tương ứng
        if (signupData.role === "Huấn luyện viên") {
            window.location.href = "coach-dashboard.html";
        } else if (signupData.role === "Vận động viên") {
            window.location.href = "athlete-dashboard.html";
        }
    }
});
