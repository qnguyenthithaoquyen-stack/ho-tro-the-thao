// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
// THÊM: Import Firestore để lưu dữ liệu người dùng
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
const db = getFirestore(app); // THÊM: Khởi tạo Firestore

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const fullName = document.getElementById('fullName').value;
            const role = document.getElementById('role').value; 

            if (!email || !password || !fullName) {
                alert('Vui lòng điền đầy đủ các trường bắt buộc.');
                return;
            }
            
            try {
                // Bước 1: Tạo người dùng trong Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('Tạo tài khoản Auth thành công:', user);

                // Bước 2: THÊM - Lưu thông tin người dùng (bao gồm vai trò) vào Firestore
                // Chúng ta sẽ dùng UID (ID người dùng) làm key cho document
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: fullName,
                    email: email,
                    role: role
                });
                console.log('Lưu thông tin người dùng vào Firestore thành công');

                alert('Đăng ký tài khoản thành công! Bạn sẽ được chuyển đến trang xác nhận vai trò.');

                window.location.href = 'xacnhan-vaitro.html';

            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Lỗi đăng ký:', errorCode, errorMessage);
                
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

