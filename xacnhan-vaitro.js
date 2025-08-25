document.addEventListener('DOMContentLoaded', () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    const confirmBtn = document.getElementById('confirmBtn');

    // Lấy vai trò đã được lưu từ trang đăng ký
    let selectedRole = localStorage.getItem('userRole');

    // Hàm để cập nhật trạng thái active của các nút
    const updateActiveButton = (role) => {
        roleButtons.forEach(button => {
            if (button.getAttribute('data-role') === role) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    };

    // Đặt trạng thái active cho nút dựa trên vai trò đã lưu
    if (selectedRole) {
        updateActiveButton(selectedRole);
    }

    // Thêm sự kiện click cho các nút chọn vai trò
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedRole = button.getAttribute('data-role');
            updateActiveButton(selectedRole);
        });
    });

    // Thêm sự kiện click cho nút xác nhận
    confirmBtn.addEventListener('click', () => {
        if (!selectedRole) {
            alert('Vui lòng chọn một vai trò.');
            return;
        }

        // Chuyển hướng dựa trên vai trò đã chọn cuối cùng
        if (selectedRole === 'coach') {
            window.location.href = 'coach-dashboard.html';
        } else if (selectedRole === 'athlete') {
            window.location.href = 'athlete-dashboard.html';
        } else {
            // Mặc định chuyển về trang chủ cho các vai trò khác
            alert('Vai trò của bạn đã được xác nhận. Chuyển về trang chủ.');
            window.location.href = 'index.html';
        }
    });
});
