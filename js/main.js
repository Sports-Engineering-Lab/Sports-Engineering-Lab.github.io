document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.overlay');
    
    // 메뉴 토글 기능
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // 오버레이 클릭 시 메뉴 닫기
    overlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // 윈도우 리사이즈 시 모바일 메뉴 초기화
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 네비게이션 메뉴 클릭 이벤트 처리
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // people 페이지로 이동하는 경우 스크롤 정보 초기화
            if (this.getAttribute('href').includes('people.html')) {
                sessionStorage.removeItem('peoplePageScroll');
            }
        });
    });
});

// 네비게이션 메뉴 활성화
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath === '/' && linkPath === '/') {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
        }
    });
}); 