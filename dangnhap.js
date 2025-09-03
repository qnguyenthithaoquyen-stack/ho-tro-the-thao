// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Ngăn trang web tải lại

            // Lấy email và mật khẩu từ các ô input
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitButton = e.target.querySelector('.submit-btn');

            if (!email || !password) {
                alert('Vui lòng nhập email và mật khẩu.');
                return;
            }

            // Vô hiệu hóa nút bấm và hiển thị trạng thái chờ
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            try {
                // Dùng Firebase Auth để đăng nhập người dùng
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                const user = userCredential.user;
                console.log('Đăng nhập thành công:', user);
                alert('Đăng nhập thành công!');

                // Chuyển hướng đến trang dashboard hoặc trang chính
                // TODO: Thay đổi '/dashboard' thành trang bạn muốn sau khi đăng nhập
                window.location.href = 'index.html'; 

            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Lỗi đăng nhập:", errorCode, errorMessage);
                
                if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
                    alert('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
                } else {
                    alert(`Đã xảy ra lỗi: ${errorMessage}`);
                }
                
            } finally {
                // Kích hoạt lại nút bấm
                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Nhập';
            }
        });
    }
});
