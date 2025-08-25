document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Ngăn form tự gửi đi

            const formData = new FormData(signupForm);
            const userData = {};
            formData.forEach((value, key) => {
                userData[key] = value;
            });

            // Kiểm tra xem các trường có trống không
            let allFieldsFilled = true;
            for (const key in userData) {
                if (userData[key].trim() === '') {
                    allFieldsFilled = false;
                    break;
                }
            }

            if (!allFieldsFilled) {
                alert('Vui lòng điền đầy đủ tất cả các trường.');
                return; // Dừng lại nếu có lỗi
            }

            // Lấy vai trò người dùng đã chọn
            const userRole = userData.role;

            // Lưu vai trò vào bộ nhớ tạm của trình duyệt (localStorage)
            // để trang xác nhận có thể đọc được
            localStorage.setItem('userRole', userRole);

            // Chuyển hướng người dùng đến trang xác nhận vai trò
            window.location.href = 'xacnhan-vaitro.html';
        });
    }
});
