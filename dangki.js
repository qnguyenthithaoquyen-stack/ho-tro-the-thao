// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Cấu hình Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyA2dXWCyjL2xgCSyeW9QQ7RvjI_O7kFHJw",
    authDomain: "sporthealthdata.firebaseapp.com",
    projectId: "sporthealthdata",
    storageBucket: "sporthealthdata.appspot.com",
    messagingSenderId: "789054240877",
    appId: "1:789054240877:web:04a400c9ea586523a86764",
};

// --- Khởi tạo Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Lấy các phần tử HTML ---
const signupForm = document.getElementById('signupForm');
const errorMessageDiv = document.getElementById('error-message');

// --- Xử lý sự kiện đăng ký ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Lấy các giá trị từ form
    const fullName = signupForm.fullName.value;
    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;
    const dateOfBirth = signupForm.dateOfBirth.value;
    const role = signupForm.role.value;
    const submitButton = signupForm.querySelector('.submit-btn');

    // Vô hiệu hóa nút bấm
    submitButton.disabled = true;
    submitButton.textContent = 'Đang xử lý...';
    errorMessageDiv.style.display = 'none';

    try {
        // Tạo người dùng trong Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Lưu thông tin bổ sung vào Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: fullName,
            username: username,
            email: email,
            dateOfBirth: dateOfBirth,
            role: role
        });

        alert('Đăng ký thành công!');
        
        // Chuyển hướng dựa trên vai trò
        if (role === 'coach') {
            window.location.href = 'coach-dashboard.html';
        } else {
            window.location.href = 'athlete-dashboard.html';
        }

    } catch (error) {
        // Xử lý lỗi
        let userMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
        if (error.code === 'auth/email-already-in-use') {
            userMessage = 'Địa chỉ email này đã được sử dụng.';
        } else if (error.code === 'auth/weak-password') {
            userMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        console.error("Lỗi đăng ký:", error);
        errorMessageDiv.textContent = userMessage;
        errorMessageDiv.style.display = 'block';
        
        // Kích hoạt lại nút bấm
        submitButton.disabled = false;
        submitButton.textContent = 'Đăng Ký';
    }
});
