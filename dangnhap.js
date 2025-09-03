// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
// THÊM: Import Firestore để đọc dữ liệu người dùng
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
const db = getFirestore(app); // THÊM: Khởi tạo Firestore

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitButton = e.target.querySelector('.submit-btn');

            if (!email || !password) {
                alert('Vui lòng nhập email và mật khẩu.');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Đang xử lý...';

            try {
                // Bước 1: Đăng nhập bằng Firebase Auth
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Đăng nhập Auth thành công:', user);

                // Bước 2: THÊM - Đọc thông tin người dùng từ Firestore bằng UID
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const role = userData.role;
                    console.log("Lấy vai trò người dùng thành công:", role);

                    alert('Đăng nhập thành công!');

                    // Bước 3: THÊM - Chuyển hướng dựa trên vai trò
                    if (role === 'coach') {
                        window.location.href = 'coach-dashboard.html'; // Tên tệp bảng điều khiển cho HLV
                    } else if (role === 'athlete') {
                        window.location.href = 'athlete-dashboard.html'; // Tên tệp bảng điều khiển cho VĐV
                    } else {
                        // Nếu không có vai trò, chuyển về trang chủ
                        alert("Không tìm thấy vai trò, chuyển về trang chủ.");
                        window.location.href = 'index.html';
                    }
                } else {
                    // Xử lý trường hợp không tìm thấy dữ liệu người dùng trong Firestore
                    console.error("Không tìm thấy thông tin người dùng trong Firestore!");
                    alert("Đăng nhập thành công nhưng không thể xác định vai trò của bạn.");
                    window.location.href = 'index.html';
                }

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
                // Kích hoạt lại nút bấm trong mọi trường hợp (thành công hay thất bại)
                submitButton.disabled = false;
                submitButton.textContent = 'Đăng Nhập';
            }
        });
    }
});

