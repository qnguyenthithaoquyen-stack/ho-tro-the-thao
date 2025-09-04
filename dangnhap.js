// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

// Đợi cho toàn bộ nội dung trang (DOM) được tải xong
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const submitButton = loginForm.querySelector('.submit-btn');

            // Vô hiệu hóa nút và xóa thông báo lỗi cũ
            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';
            errorMessageDiv.style.display = 'none';

            try {
                // 1. Đăng nhập người dùng bằng Firebase Auth
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Lấy thông tin vai trò từ Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const role = userData.role;

                    // 3. Chuyển hướng dựa trên vai trò
                    if (role === 'coach') {
                        window.location.href = 'coach-dashboard.html';
                    } else if (role === 'athlete') {
                        window.location.href = 'athlete-dashboard.html';
                    } else {
                        // Trường hợp vai trò không xác định
                        throw new Error('Không thể xác định vai trò người dùng.');
                    }
                } else {
                    // Trường hợp không tìm thấy dữ liệu người dùng trong Firestore
                    throw new Error('Không tìm thấy dữ liệu người dùng.');
                }

            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                
                // Hiển thị thông báo lỗi thân thiện
                let friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
                } else {
                    friendlyMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                }
                errorMessageDiv.textContent = friendlyMessage;
                errorMessageDiv.style.display = 'block';

                // Kích hoạt lại nút
                submitButton.disabled = false;
                submitButton.textContent = '
