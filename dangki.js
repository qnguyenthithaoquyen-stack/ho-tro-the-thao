// =================================================================================
// LƯU Ý: BẠN CẦN THAY THẾ CẤU HÌNH FIREBASE CỦA MÌNH VÀO ĐÂY
// Bạn có thể lấy nó từ Firebase Console -> Project settings (Cài đặt dự án)
// =================================================================================
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

// Khởi tạo Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Lấy form đăng nhập từ HTML
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn trang web tải lại

    // Lấy email và mật khẩu từ các ô input
    const email = e.target.email.value;
    const password = e.target.password.value;
    const submitButton = e.target.querySelector('.submit-btn');

    // Vô hiệu hóa nút bấm và hiển thị trạng thái chờ
    submitButton.disabled = true;
    submitButton.textContent = 'Đang xử lý...';

    try {
        // 1. Dùng Firebase SDK để đăng nhập người dùng
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // 2. Nếu thành công, chuyển hướng đến trang xác nhận vai trò
        alert('Đăng nhập thành công!');
        // Chuyển hướng đến trang xác nhận vai trò để nhất quán với luồng đăng ký
        window.location.href = 'xacnhan-vaitro.html'; 

    } catch (error) {
        // Hiển thị lỗi cho người dùng nếu đăng nhập thất bại
        console.error("Lỗi đăng nhập:", error);
        alert('Đăng nhập thất bại: ' + error.message);
        
        // Kích hoạt lại nút bấm
        submitButton.disabled = false;
        submitButton.textContent = 'Đăng Nhập';
    }
});
