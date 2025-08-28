// Đợi cho toàn bộ nội dung trang (DOM) được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Lấy biểu mẫu đăng nhập bằng ID của nó
    const loginForm = document.getElementById('loginForm');

    // Kiểm tra xem biểu mẫu có tồn tại không
    if (loginForm) {
        // Thêm một trình nghe sự kiện 'submit' cho biểu mẫu
        loginForm.addEventListener('submit', (event) => {
            // Ngăn chặn hành vi mặc định của biểu mẫu (tải lại trang)
            event.preventDefault();

            // Lấy giá trị từ các trường email và mật khẩu
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Kiểm tra đơn giản xem các trường có trống không
            if (email.trim() === '' || password.trim() === '') {
                alert('Vui lòng nhập cả email và mật khẩu.');
                return; // Dừng thực thi nếu có lỗi
            }

            // Nếu không có lỗi, mô phỏng việc đăng nhập thành công
            console.log('Email:', email);
            console.log('Password:', password);

            // Lưu email tạm vào localStorage (để dùng sau nếu cần)
            localStorage.setItem('userEmail', email);

            // Thông báo thành công
            alert(`Đăng nhập thành công với email: ${email}`);

            // ✅ Kiểm tra role
            const signupData = JSON.parse(localStorage.getItem("signupData"));

            if (signupData && signupData.role) {
                // Đã có role => vào thẳng dashboard theo role
                if (signupData.role === "Huấn luyện viên") {
                    window.location.href = "coach-dashboard.html";
                } else if (signupData.role === "Vận động viên") {
                    window.location.href = "athlete-dashboard.html";
                }
            } else {
                // Chưa có role (người mới đăng ký) => sang trang xác nhận vai trò
                window.location.href = "xacnhan-vaitro.html";
            }
        });
    }
});
