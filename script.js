document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.getElementById('slides');
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.getElementById('dots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselContainer = document.querySelector('.carousel-container');

    let currentSlide = 0;
    let autoPlayInterval;

    // Tạo các dấu chấm điều hướng
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // Hàm chuyển đến slide cụ thể
    const goToSlide = (slideIndex) => {
        slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[slideIndex].classList.add('active');
        currentSlide = slideIndex;
    };

    // Hàm chuyển slide tiếp theo
    const nextSlide = () => {
        let newIndex = currentSlide + 1;
        if (newIndex >= slides.length) {
            newIndex = 0;
        }
        goToSlide(newIndex);
    };

    // Hàm chuyển slide trước đó
    const prevSlide = () => {
        let newIndex = currentSlide - 1;
        if (newIndex < 0) {
            newIndex = slides.length - 1;
        }
        goToSlide(newIndex);
    };

    // Hàm bắt đầu tự động trượt
    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000); // Trượt mỗi 5 giây
    };

    // Hàm dừng tự động trượt
    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    // Gán sự kiện cho các nút
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Dừng tự động trượt khi di chuột vào và bắt đầu lại khi di ra
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);

    // Bắt đầu tự động trượt
    startAutoPlay();
});
