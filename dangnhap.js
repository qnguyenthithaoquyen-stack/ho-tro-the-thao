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

            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';
            errorMessageDiv.style.display = 'none';

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const role = userData.role;

                    // Xây dựng URL đầy đủ để chuyển hướng
                    const currentPath = window.location.pathname;
                    const newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));

                    if (role === 'coach') {
                        window.location.href = newPath + '/coach-dashboard.html';
                    } else if (role === 'athlete') {
                        window.location.href = newPath + '/athlete-dashboard.html';
                    } else {
                        throw new Error('Không thể xác định vai trò người dùng.');
                    }
                } else {
                    throw new Error('Không tìm thấy dữ liệu người dùng.');
                }

            } catch (error) {
                console.error("Lỗi đăng nhập:", error);
                
                let friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
                } else {
                    friendlyMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                }
                errorMessageDiv.textContent = friendlyMessage;
                errorMessageDiv.style.display = 'block';

                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Nhập';
            }
        });
    }
});
