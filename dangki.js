// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
const db = getFirestore(app);

// Lắng nghe sự kiện khi toàn bộ nội dung trang đã được tải
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn form tự gửi đi

            // Lấy dữ liệu từ form
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const submitButton = signupForm.querySelector('.submit-btn');

            // Vô hiệu hóa nút bấm để tránh người dùng nhấn nhiều lần
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            try {
                // 1. Tạo người dùng mới bằng Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. SỬA LỖI QUAN TRỌNG: Sử dụng setDoc để tạo hoặc GHI ĐÈ dữ liệu trong Firestore
                // Điều này đảm bảo rằng nếu người dùng đăng ký lại, thông tin sẽ được cập nhật.
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName,
                    email: email,
                    role: role
                });
                
                // 3. Lưu vai trò vào localStorage để trang xác nhận có thể sử dụng
                localStorage.setItem('userRole', role);

                // 4. Thông báo và chuyển hướng
                alert('Đăng ký tài khoản thành công!');
                window.location.href = 'xacnhan-vaitro.html';

            } catch (error) {
                // Xử lý các lỗi thường gặp
                console.error("Lỗi đăng ký:", error.message);
                if (error.code === 'auth/email-already-in-use') {
                    alert('Lỗi: Email này đã được sử dụng. Vui lòng chọn email khác.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Lỗi: Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).');
                } else {
                    alert('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.');
                }
            } finally {
                // Kích hoạt lại nút bấm sau khi xử lý xong
                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Ký';
            }
        });
    }
});

