// Đợi cho toàn bộ nội dung trang được tải xong
document.addEventListener('DOMContentLoaded', () => {

    // Lấy các phần tử cần thiết từ DOM
    const changeImageBtn = document.getElementById('changeImageBtn');
    const fileInput = document.getElementById('fileInput');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const imagePlaceholderText = imagePlaceholder.querySelector('span');

    // Thêm sự kiện 'click' cho nút "Thay đổi ảnh"
    changeImageBtn.addEventListener('click', () => {
        // Khi nút được nhấn, kích hoạt sự kiện click của input file ẩn
        fileInput.click();
    });

    // Thêm sự kiện 'change' cho input file
    fileInput.addEventListener('change', (event) => {
        // Lấy tệp tin mà người dùng đã chọn
        const file = event.target.files[0];

        // Kiểm tra xem người dùng có chọn tệp không
        if (file) {
            // Tạo một đối tượng FileReader để đọc nội dung tệp
            const reader = new FileReader();

            // Thiết lập hàm sẽ chạy khi tệp được đọc xong
            reader.onload = (e) => {
                // Đặt ảnh nền của placeholder thành ảnh người dùng đã chọn
                imagePlaceholder.style.backgroundImage = `url('${e.target.result}')`;
                // Ẩn dòng chữ "Anh Minh Hoa Du An" đi
                if(imagePlaceholderText) {
                    imagePlaceholderText.style.display = 'none';
                }
            };

            // Bắt đầu đọc tệp dưới dạng Data URL (chuỗi base64)
            reader.readAsDataURL(file);
        }
    });
});