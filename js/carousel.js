document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    // 슬라이드 이동 함수
    function moveToSlide(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
        currentSlide = index;
        updateDots();
    }

    // 도트 업데이트 함수
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // 다음 슬라이드로 이동
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        moveToSlide(currentSlide);
    }

    // 이전 슬라이드로 이동
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        moveToSlide(currentSlide);
    }

    // 이벤트 리스너 등록
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // 도트 클릭 이벤트
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveToSlide(index);
        });
    });

    // 자동 슬라이드 (5초마다)
    setInterval(nextSlide, 5000);
}); 