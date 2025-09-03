document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo Firebase Authentication
    const auth = firebase.auth();

    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Ngăn form tự gửi đi

            // Lấy email và mật khẩu từ form
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            // Kiểm tra dữ liệu đầu vào đơn giản
            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu.');
                return;
            }
            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự.');
                return;
            }

            const submitButton = signupForm.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            // --- BƯỚC QUAN TRỌNG: GỌI FIREBASE ĐỂ TẠO TÀI KHOẢN ---
            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Đăng ký thành công, Firebase sẽ tự động đăng nhập cho người dùng
                    console.log('Tạo tài khoản thành công:', userCredential.user.uid);

                    // Chuyển hướng người dùng đến trang xác nhận vai trò
                    window.location.href = 'xacnhan-vaitro.html';
                })
                .catch(error => {
                    // Xử lý các lỗi có thể xảy ra (ví dụ: email đã tồn tại)
                    console.error("Lỗi đăng ký:", error.message);
                    alert(`Đăng ký thất bại: ${error.message}`);
                    
                    // Kích hoạt lại nút bấm
                    submitButton.disabled = false;
                    submitButton.textContent = 'Đăng Ký';
                });
        });
    }
});
```

### Các bước cần thực hiện

1.  **Cập nhật `dangki.js`:** Xóa toàn bộ nội dung trong tệp `dangki.js` hiện tại của bạn và dán đoạn mã mới ở trên vào.
2.  **Nhúng Firebase SDK vào `dangki.html`:** Đảm bảo rằng tệp `dangki.html` của bạn có nhúng các thư viện Firebase và tệp `firebase-config.js` **trước** khi nhúng tệp `dangki.js`. Nếu chưa có, hãy thêm các dòng sau vào trước thẻ đóng `</body>`:

    ```html
    <!-- ... các phần tử HTML khác ... -->
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>
    <script src="firebase-config.js"></script> <!-- Tệp cấu hình của bạn -->
    <script src="js/dangki.js"></script> <!-- Tệp JS đã sửa lỗi -->
    </body>
    </html>
    
