// Import các hàm cần thiết từ Firebase SDK (sử dụng URL CDN cho ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
  authDomain: "sporthealthdata.firebaseapp.com",
  projectId: "sporthealthdata",
  storageBucket: "sporthealthdata.appspot.com",
  messagingSenderId: "789054240877",
  appId: "1:789054240877:web:04a400c9ea586523a86764",
  measurementId: "G-ZWS9C7P359"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn form tự gửi đi

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName').value;
            const role = document.getElementById('role').value; // Lấy vai trò người dùng chọn

            // Kiểm tra các trường có trống không
            if (!email || !password || !fullName) {
                alert('Vui lòng điền đầy đủ các trường bắt buộc.');
                return;
            }
            
            try {
                // Sử dụng Firebase Auth để tạo người dùng mới
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                // Đăng ký thành công
                const user = userCredential.user;
                console.log('Đăng ký thành công:', user);
                
                // Lưu vai trò vào localStorage để trang sau có thể sử dụng
                localStorage.setItem('userRole', role);

                alert('Đăng ký tài khoản thành công! Bạn sẽ được chuyển đến trang xác nhận vai trò.');

                // Chuyển hướng người dùng đến trang xác nhận vai trò
                window.location.href = 'xacnhan-vaitro.html';

            } catch (error) {
                // Xử lý lỗi từ Firebase
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Lỗi đăng ký:', errorCode, errorMessage);
                
                // Hiển thị thông báo lỗi thân thiện hơn cho người dùng
                if (errorCode === 'auth/email-already-in-use') {
                    alert('Lỗi: Email này đã được sử dụng.');
                } else if (errorCode === 'auth/weak-password') {
                    alert('Lỗi: Mật khẩu quá yếu. Mật khẩu phải có ít nhất 6 ký tự.');
                } else {
                    alert(`Đã xảy ra lỗi: ${errorMessage}`);
                }
            }
        });
    }
});

