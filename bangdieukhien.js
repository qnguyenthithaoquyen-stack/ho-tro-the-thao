// Đợi cho toàn bộ nội dung trang được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Lấy phần tử nút "Đi đến trang đăng nhập"
    const loginRedirectBtn = document.getElementById('loginRedirectBtn');

    // Thêm sự kiện 'click' cho nút
    loginRedirectBtn.addEventListener('click', (event) => {
        // Ngăn chặn hành vi mặc định của thẻ <a> (chuyển hướng)
        event.preventDefault();

        // Giả lập việc chuyển hướng người dùng đến trang đăng nhập
        alert('Chuyển hướng đến trang đăng nhập...');
        
        // Hoặc bạn có thể thực hiện chuyển hướng thực tế như sau:
        // window.location.href = 'duong_dan_den_trang_dang_nhap.html';
    });
});