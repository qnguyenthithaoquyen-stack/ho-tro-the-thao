// Đợi cho toàn bộ trang HTML tải xong rồi mới chạy code bên trong
document.addEventListener('DOMContentLoaded', () => {

    // Giả sử Firebase đã được khởi tạo và gán vào window.firebase trong file HTML
    if (!window.firebase || !window.firebase.auth || !window.firebase.db) {
        console.error("Firebase chưa được khởi tạo! Hãy chắc chắn bạn đã nhúng mã cấu hình Firebase vào file HTML.");
        alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
        return;
    }

    const { auth, db } = window.firebase;
    const { signInWithEmailAndPassword, getDoc, doc } = window.firebase.firestore; // Lấy các hàm cần thiết

    // --- XỬ LÝ FORM ĐĂNG NHẬP ---
    const loginForm = document.getElementById('loginForm'); // Đảm bảo form của bạn có id="loginForm"

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Ngăn trang tải lại

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            if (!email || !password) {
                alert("Vui lòng nhập đầy đủ email và mật khẩu.");
                return;
            }

            // Đăng nhập bằng Firebase Auth
            signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const userId = userCredential.user.uid;
                    
                    // Lấy thông tin vai trò từ Firestore
                    const userDocRef = doc(db, 'users', userId);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        // Chuyển hướng dựa trên vai trò
                        if (userData.role === 'Huấn luyện viên') {
                            window.location.href = 'coach-dashboard.html';
                        } else if (userData.role === 'Vận động viên') {
                            window.location.href = 'athlete-dashboard.html';
                        } else {
                            // Chuyển về trang chủ nếu không có vai trò
                            alert('Đăng nhập thành công nhưng không xác định được vai trò.');
                            window.location.href = 'index.html';
                        }
                    } else {
                        alert('Đăng nhập thành công nhưng không tìm thấy thông tin người dùng.');
                    }
                })
                .catch(error => {
                    console.error("Lỗi đăng nhập:", error);
                    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
                    // Cung cấp thông báo lỗi thân thiện hơn
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                        errorMessage = 'Email hoặc mật khẩu không chính xác.';
                    }
                    alert(errorMessage);
                });
        });
    }
});
