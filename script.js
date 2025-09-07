document.addEventListener('DOMContentLoaded', function () {
    const slides = document.getElementById('slides');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dots');

    if (!slides) {
        console.error("Không tìm thấy phần tử carousel-slides.");
        return;
    }

    const slideCount = slides.children.length;
    let currentIndex = 0;
    let autoSlideInterval; // Biến để lưu trữ interval tự động trượt

    // --- Bắt đầu phần CÀI ĐẶT ---
    const AUTO_SLIDE_ENABLED = true; // Bật/tắt tự động trượt
    const SLIDE_INTERVAL = 5000; // Thời gian tự động trượt (5000ms = 5 giây)
    // --- Kết thúc phần CÀI ĐẶT ---


    // Tạo các dấu chấm điều hướng
    for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetAutoSlide(); // Reset interval khi người dùng tương tác
        });
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.children;

    function updateCarousel() {
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Cập nhật trạng thái active cho dấu chấm
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentIndex);
        }
    }

    function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    // === HÀM MỚI: TỰ ĐỘNG TRƯỢT ===
    function startAutoSlide() {
        if (!AUTO_SLIDE_ENABLED) return;
        stopAutoSlide(); // Đảm bảo không có interval nào đang chạy
        autoSlideInterval = setInterval(nextSlide, SLIDE_INTERVAL);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    // =============================

    // Gán sự kiện cho các nút
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });
    }
    
    // Dừng tự động trượt khi di chuột vào và chạy lại khi di ra
    const carouselContainer = document.querySelector('.carousel-container');
    if(carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }


    // Khởi tạo carousel
    updateCarousel();
    startAutoSlide(); // Bắt đầu tự động trượt khi tải trang
});
