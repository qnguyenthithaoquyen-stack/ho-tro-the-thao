// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

const logoutButton = document.getElementById('logout-btn');

// === HÀNG RÀO XÁC THỰC ===
// Lắng nghe sự thay đổi trạng thái đăng nhập
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Người dùng đã đăng nhập, kiểm tra vai trò
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().role !== 'coach') {
            // Nếu không có thông tin hoặc vai trò không phải HLV, không cho phép truy cập
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = 'dangnhap.html'; // Sửa lỗi: Chuyển về trang đăng nhập đúng
        }
    } else {
        // Người dùng chưa đăng nhập, chuyển về trang đăng nhập
        // QUAN TRỌNG: Đảm bảo tên tệp là 'dangnhap.html'
        window.location.href = 'dangnhap.html';
    }
});

// === CHỨC NĂNG NÚT ĐĂNG XUẤT ===
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).catch((error) => console.error('Lỗi khi đăng xuất:', error));
        // onAuthStateChanged sẽ tự động xử lý việc chuyển hướng sau khi đăng xuất thành công
    });
}

// Các hàm khác của trang dashboard...
// (Toàn bộ logic tải danh sách VĐV giữ nguyên)

