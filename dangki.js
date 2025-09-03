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

// Khởi tạo các dịch vụ Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Chờ cho toàn bộ trang web tải xong rồi mới chạy mã
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const submitButton = signupForm.querySelector('.submit-btn');

    if (signupForm) {
        // Lắng nghe sự kiện khi người dùng nhấn nút "Đăng Ký"
        signupForm.addEventListener('submit', async (event) => {
            // Ngăn chặn hành vi mặc định của form (tải lại trang)
            event.preventDefault();

            // Lấy tất cả giá trị từ các ô nhập liệu
            const fullName = document.getElementById('fullName').value.trim();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;
            const city = document.getElementById('city').value;
            const role = document.getElementById('role').value;

            // Kiểm tra cơ bản để đảm bảo không có trường nào bị bỏ trống
            if (!fullName || !username || !email || !password || !age || !city || !role) {
                alert('Vui lòng điền đầy đủ tất cả các trường.');
                return;
            }

            // Vô hiệu hóa nút bấm để tránh người dùng nhấn nhiều lần
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            // Bắt đầu quá trình đăng ký và xử lý lỗi nếu có
            try {
                // 1. Dùng Firebase Auth để tạo tài khoản người dùng mới
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Lưu thông tin chi tiết (tên, tuổi, vai trò...) vào Firestore
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName,
                    username: username,
                    email: email,
                    age: parseInt(age, 10), // Chuyển tuổi sang dạng số
                    city: city,
                    role: role
                });

                // 3. Thông báo cho người dùng biết đăng ký đã thành công
                alert('Đăng ký thành công!');

                // 4. Tự động chuyển hướng người dùng đến trang tổng quan phù hợp với vai trò
                if (role === 'coach') {
                    window.location.href = 'coach-dashboard.html';
                } else {
                    window.location.href = 'athlete-dashboard.html';
                }

            } catch (error) {
                // Nếu có lỗi xảy ra trong khối 'try', mã sẽ nhảy vào đây
                console.error("Lỗi đăng ký: ", error);
                if (error.code === 'auth/email-already-in-use') {
                    alert('Lỗi: Email này đã được sử dụng. Vui lòng chọn một email khác.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Lỗi: Mật khẩu phải có ít nhất 6 ký tự.');
                } else {
                    alert('Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.');
                }
            } finally {
                // Khối này sẽ luôn chạy, dù đăng ký thành công hay thất bại
                // Kích hoạt lại nút bấm để người dùng có thể thử lại
                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Ký';
            }
        });
    }
});

