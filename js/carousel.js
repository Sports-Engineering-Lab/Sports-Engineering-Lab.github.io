document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    let slideInterval;

    // 첫 번째와 마지막 슬라이드 복제
    const originalSlides = document.querySelectorAll('.carousel-slide');
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    
    carousel.appendChild(firstClone);
    carousel.insertBefore(lastClone, carousel.firstChild);

    // 복제 후 슬라이드와 도트 선택
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    let currentSlide = 0;
    const totalSlides = originalSlides.length;

    // 초기 위치 설정
    carousel.style.transform = `translateX(-100%)`;

    // 슬라이드 이동 함수
    function moveToSlide(index, instant = false) {
        if (instant) {
            carousel.style.transition = 'none';
        } else {
            carousel.style.transition = 'transform 0.5s ease-in-out';
        }
        
        carousel.style.transform = `translateX(-${(index + 1) * 100}%)`;
        currentSlide = index;
        updateDots();

        if (instant) {
            // 강제 리플로우
            carousel.offsetHeight;
            carousel.style.transition = 'transform 0.5s ease-in-out';
        }
    }

    // 도트 업데이트 함수
    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // 다음 슬라이드로 이동
    function nextSlide() {
        if (currentSlide >= totalSlides - 1) {
            moveToSlide(currentSlide + 1);
            setTimeout(() => {
                moveToSlide(0, true);
            }, 500);
        } else {
            moveToSlide(currentSlide + 1);
        }
    }

    // 이전 슬라이드로 이동
    function prevSlide() {
        if (currentSlide <= 0) {
            moveToSlide(-1);
            setTimeout(() => {
                moveToSlide(totalSlides - 1, true);
            }, 500);
        } else {
            moveToSlide(currentSlide - 1);
        }
    }

    // 자동 슬라이드 시작
    function startSlideShow() {
        stopSlideShow(); // 기존 인터벌 제거
        slideInterval = setInterval(nextSlide, 7000);
    }

    // 자동 슬라이드 정지
    function stopSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // 도트 클릭 이벤트
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopSlideShow();
            moveToSlide(index);
            startSlideShow();
        });
    });

    // 트랜지션 종료 이벤트
    carousel.addEventListener('transitionend', () => {
        if (currentSlide >= totalSlides) {
            moveToSlide(0, true);
        } else if (currentSlide < 0) {
            moveToSlide(totalSlides - 1, true);
        }
    });

    // 초기 슬라이드쇼 시작
    startSlideShow();
}); 