// Chờ cho toàn bộ trang được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo các dịch vụ Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Lấy tham chiếu đến các phần tử trên trang
    const roleButtons = document.querySelectorAll('.role-btn');
    const confirmBtn = document.getElementById('confirm-btn');

    // Lưu vai trò được chọn, mặc định là 'coach' vì nó được chọn sẵn
    let selectedRole = 'coach';

    // --- KIỂM TRA BẢO MẬT ---
    // Đảm bảo người dùng đã đăng nhập khi truy cập trang này
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Nếu không có ai đăng nhập, chuyển hướng về trang đăng nhập
            console.log("Không tìm thấy người dùng, đang chuyển hướng...");
            window.location.href = 'dangnhap.html';
        }
    });

    // --- LOGIC CHỌN VAI TRÒ ---
    // Gán sự kiện click cho các nút chọn vai trò
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Bỏ lớp 'selected' ở tất cả các nút
            roleButtons.forEach(btn => btn.classList.remove('selected'));
            // Thêm lớp 'selected' cho nút vừa được nhấn
            button.classList.add('selected');
            // Cập nhật vai trò đã chọn
            selectedRole = button.dataset.role;
            // Kích hoạt nút xác nhận
            confirmBtn.disabled = false;
        });
    });

    // --- LOGIC XÁC NHẬN VÀ LƯU VÀO DATABASE ---
    // Gán sự kiện click cho nút xác nhận
    confirmBtn.addEventListener('click', () => {
        const user = auth.currentUser;

        // Kiểm tra lại xem vai trò đã được chọn và người dùng đã đăng nhập chưa
        if (selectedRole && user) {
            confirmBtn.textContent = 'Đang xử lý...';
            confirmBtn.disabled = true;

            // Tạo tham chiếu đến document của người dùng trong collection 'users'
            const userDocRef = db.collection('users').doc(user.uid);

            // Ghi dữ liệu (email và vai trò) vào Firestore
            userDocRef.set({
                email: user.email,
                role: selectedRole
            })
            .then(() => {
                console.log(`Đã lưu vai trò '${selectedRole}' cho người dùng ${user.uid}`);
                // --- LOGIC CHUYỂN HƯỚNG ĐÃ CẬP NHẬT ---
                // Chuyển hướng trực tiếp đến trang tổng quan phù hợp
                if (selectedRole === 'coach') {
                    window.location.href = 'coach-dashboard.html';
                } else if (selectedRole === 'athlete') {
                    window.location.href = 'athlete-dashboard.html';
                } else {
                    // Dự phòng nếu có vai trò khác
                    window.location.href = 'index.html';
                }
            })
            .catch(error => {
                console.error("Lỗi khi ghi dữ liệu: ", error);
                alert("Đã xảy ra lỗi khi lưu vai trò. Vui lòng thử lại.");
                confirmBtn.textContent = 'Xác nhận và tiếp tục';
                confirmBtn.disabled = false;
            });
        } else {
            alert("Vui lòng chọn một vai trò.");
        }
    });
});

