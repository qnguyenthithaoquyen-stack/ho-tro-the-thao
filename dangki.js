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


document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const submitButton = signupForm.querySelector('.submit-btn');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullName').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;
            const city = document.getElementById('city').value;
            const role = document.getElementById('role').value;

            // Kiểm tra các trường trống
            if (!fullName || !username || !email || !password || !age || !city || !role) {
                alert('Vui lòng điền đầy đủ tất cả các trường.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            try {
                // 1. Tạo người dùng trong Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Lưu thông tin bổ sung vào Firestore
                // Sử dụng setDoc để tạo mới hoặc ghi đè nếu tài liệu đã tồn tại
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName,
                    username: username,
                    email: email,
                    age: age,
                    city: city,
                    role: role
                });

                alert('Đăng ký thành công!');

                // 3. Chuyển hướng trực tiếp đến trang tổng quan phù hợp
                if (role === 'coach') {
                    window.location.href = 'coach-dashboard.html';
                } else {
                    window.location.href = 'athlete-dashboard.html';
                }

            } catch (error) {
                console.error("Lỗi đăng ký: ", error);
                // Cung cấp thông báo lỗi thân thiện hơn
                if (error.code === 'auth/email-already-in-use') {
                    alert('Lỗi: Email này đã được sử dụng. Vui lòng chọn một email khác.');
                } else if (error.code === 'auth/weak-password') {
                    alert('Lỗi: Mật khẩu phải có ít nhất 6 ký tự.');
                } else {
                    alert('Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.');
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Ký';
            }
        });
    }
});

