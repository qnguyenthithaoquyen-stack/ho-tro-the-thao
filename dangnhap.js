document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert('Vui lòng nhập cả email và mật khẩu.');
                return;
            }

            console.log('Email:', email);
            console.log('Password:', password);

            let signupData = JSON.parse(localStorage.getItem("signupData"));

            // 👉 Nếu user đã có role => login xong vào thẳng dashboard
            if (signupData && signupData.role) {
                if (signupData.role === "Huấn luyện viên") {
                    window.location.href = "coach-dashboard.html";
                } else if (signupData.role === "Vận động viên") {
                    window.location.href = "athlete-dashboard.html";
                }
            } else {
                // 👉 Chỉ khi user vừa đăng ký (chưa chọn role) thì mới sang xác nhận vai trò
                signupData = { email, role: "" };
                localStorage.setItem("signupData", JSON.stringify(signupData));
                window.location.href = "xacnhan-vaitro.html";
            }
        });
    }
});
