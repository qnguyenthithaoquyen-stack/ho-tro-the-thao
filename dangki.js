document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo các dịch vụ Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();

    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Ngăn form tự gửi đi

            // Lấy tất cả dữ liệu từ form
            const fullName = signupForm.fullName.value;
            const username = signupForm.username.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;
            const age = signupForm.age.value;
            const city = signupForm.city.value;

            // Kiểm tra dữ liệu đầu vào
            if (!fullName || !username || !email || !password || !age || !city) {
                alert('Vui lòng điền đầy đủ tất cả các trường.');
                return;
            }
            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự.');
                return;
            }

            const submitButton = signupForm.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            // Bước 1: Tạo tài khoản người dùng với email và mật khẩu
            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    console.log('Tạo tài khoản thành công:', user.uid);

                    // Bước 2: Lưu các thông tin bổ sung (không bao gồm vai trò) vào Firestore
                    return db.collection('users').doc(user.uid).set({
                        fullName: fullName,
                        username: username,
                        email: email,
                        age: age,
                        city: city,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                })
                .then(() => {
                    console.log('Đã lưu thông tin ban đầu. Chuyển đến trang xác nhận vai trò.');
                    
                    // Bước 3: Chuyển hướng đến trang xác nhận vai trò
                    alert('Đăng ký thành công! Vui lòng xác nhận vai trò của bạn.');
                    window.location.href = 'xacnhan-vaitro.html';
                })
                .catch(error => {
                    console.error("Lỗi đăng ký:", error.message);
                    alert(`Đăng ký thất bại: ${error.message}`);
                    
                    submitButton.disabled = false;
                    submitButton.textContent = 'Đăng Ký';
                });
        });
    }
});

