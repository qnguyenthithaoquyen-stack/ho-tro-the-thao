// Bạn cần thêm đoạn khởi tạo Firebase vào đầu file hoặc trong file HTML
// (Tương tự như trang dangnhap.html)

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const auth = firebase.auth(); // Giả sử Firebase đã được khởi tạo

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = event.target.email.value;
            const password = event.target.password.value;
            const userRole = event.target.role.value;

            try {
                // 1. Dùng Firebase để tạo người dùng mới
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                console.log('Tạo tài khoản thành công:', userCredential.user);

                // (Tùy chọn) Lưu thêm thông tin như tên, vai trò vào Firestore/Realtime Database
                // Gắn liền với user.uid

                // 2. Lưu vai trò vào localStorage để trang sau sử dụng
                localStorage.setItem('userRole', userRole);

                // 3. Chuyển hướng đến trang xác nhận
                alert('Đăng ký thành công!');
                window.location.href = 'xacnhan-vaitro.html';

            } catch (error) {
                console.error("Lỗi đăng ký:", error);
                alert('Đăng ký thất bại: ' + error.message);
            }
        });
    }
});
