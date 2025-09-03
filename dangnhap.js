// Import các hàm cần thiết từ Firebase SDK
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
// Import cấu hình app Firebase từ file config của bạn
import { app } from './firebase-config.js';

// Khởi tạo dịch vụ xác thực Firebase
const auth = getAuth(app);

// Lấy các element từ form đăng nhập trong file HTML
// ***QUAN TRỌNG***: Đảm bảo các ID này khớp với file dangnhap.html của bạn
const loginForm = document.getElementById('login-form'); // Hoặc 'loginForm' tùy theo file HTML
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorContainer = document.getElementById('error-message'); // Thêm một thẻ <div> để hiện lỗi

// Lắng nghe sự kiện khi người dùng gửi form
// Kiểm tra xem loginForm có tồn tại không trước khi thêm sự kiện
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        // Ngăn trang tải lại
        e.preventDefault(); 
    
        const email = emailInput.value;
        const password = passwordInput.value;
    
        // Xóa thông báo lỗi cũ
        if (errorContainer) errorContainer.textContent = '';
    
        // Sử dụng hàm của Firebase để đăng nhập
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Đăng nhập thành công
                const user = userCredential.user;
                console.log('Đăng nhập thành công với user:', user.uid);
                
                // Chuyển hướng đến trang bảng điều khiển
                window.location.href = 'bangdieukhien.html';
            })
            .catch((error) => {
                // Xử lý khi có lỗi xảy ra
                const errorCode = error.code;
                const errorMessage = error.message;
    
                console.error('Lỗi đăng nhập:', errorCode, errorMessage);
                
                // Hiển thị thông báo lỗi thân thiện cho người dùng
                if (errorContainer) {
                    if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
                        errorContainer.textContent = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
                    } else {
                        errorContainer.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
                    }
                } else {
                    // Nếu không có errorContainer, dùng alert như một giải pháp dự phòng
                    alert('Email hoặc mật khẩu không chính xác.');
                }
            });
    });
} else {
    console.error('Không tìm thấy form đăng nhập. Hãy kiểm tra lại ID trong file HTML.');
}

