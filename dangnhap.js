document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Giả lập đăng nhập thành công (ông chủ thay bằng logic thật nếu có backend)
    const loginThanhCong = (email !== "" && password !== "");

    if (loginThanhCong) {
      const signupData = JSON.parse(localStorage.getItem("signupData"));

      if (signupData && signupData.role) {
        if (signupData.role === "Huấn luyện viên") {
          window.location.href = "coach-dashboard.html";
        } else if (signupData.role === "Vận động viên") {
          window.location.href = "athlete-dashboard.html";
        }
      } else {
        // Chưa có role -> đi qua trang xác nhận
        window.location.href = "xacnhan-vaitro.html";
      }
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  });
});
