document.addEventListener('DOMContentLoaded', () => {
    console.log('Trang tổng quan của vận động viên đã sẵn sàng!');

    // Lấy tất cả các nút "Chọn"
    const selectButtons = document.querySelectorAll('.select-btn');

    // Thêm sự kiện click cho mỗi nút
    selectButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Lấy nội dung của bài tập
            const exerciseText = event.target.closest('.exercise-item').querySelector('.exercise-info .title').textContent;
            alert(`Bạn đã chọn: ${exerciseText}`);
            // Ở đây bạn có thể thêm logic để xử lý việc chọn bài tập
        });
    });

    // Phần mã gây ra lỗi đã được gỡ bỏ.
    // Các thẻ <a> trong HTML giờ sẽ tự động xử lý việc chuyển trang.
});
