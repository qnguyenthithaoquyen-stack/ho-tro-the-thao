document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const roleButtons = document.querySelectorAll('.role-btn');
    const confirmBtn = document.getElementById('confirmBtn');
    let selectedRole = null;

    // Lắng nghe sự kiện click trên các nút chọn vai trò
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa lớp 'active' khỏi tất cả các nút
            roleButtons.forEach(btn => btn.classList.remove('active'));
            // Thêm lớp 'active' cho nút được click
            button.classList.add('active');
            // Lưu vai trò đã chọn
            selectedRole = button.dataset.role;
        });
    });

    // Lắng nghe sự kiện click trên nút xác nhận
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (!selectedRole) {
                alert('Vui lòng chọn một vai trò.');
                return;
            }

            const user = auth.currentUser;
            if (user) {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Đang xử lý...';

                // Cập nhật document của người dùng với vai trò đã chọn
                db.collection('users').doc(user.uid).update({
                    role: selectedRole
                })
                .then(() => {
                    console.log(`Đã cập nhật vai trò '${selectedRole}' cho người dùng.`);
                    alert('Xác nhận vai trò thành công!');

                    // Chuyển hướng đến trang tổng quan phù hợp
                    if (selectedRole === 'coach') {
                        window.location.href = 'coach-dashboard.html';
                    } else if (selectedRole === 'athlete') {
                        window.location.href = 'athlete-dashboard.html';
                    } else {
                        // Chuyển về trang chủ nếu có vai trò khác (ví dụ: researcher)
                        window.location.href = 'index.html'; 
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi cập nhật vai trò:", error);
                    alert("Đã xảy ra lỗi. Vui lòng thử lại.");
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Xác nhận và tiếp tục';
                });
            } else {
                alert("Không tìm thấy người dùng đăng nhập. Vui lòng đăng nhập lại.");
                window.location.href = 'dangnhap.html';
            }
        });
    }

    // Kiểm tra trạng thái đăng nhập khi tải trang
    auth.onAuthStateChanged(user => {
        if (!user) {
            // Nếu không có người dùng nào đăng nhập, chuyển về trang đăng nhập
            console.log("Người dùng chưa đăng nhập, chuyển hướng...");
            window.location.href = 'dangnhap.html';
        }
    });
});

