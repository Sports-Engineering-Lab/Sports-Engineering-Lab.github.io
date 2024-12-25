// 마크다운 파일 파싱
async function parseActivitiesMD() {
    try {
        const response = await fetch('../assets/activities/activities.md');
        if (!response.ok) {
            throw new Error('Failed to fetch activities data');
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const activities = [];
        let currentActivity = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // 섹션 체크
            if (line.startsWith('## ')) {
                if (currentActivity) {
                    activities.push(currentActivity);
                }
                
                currentActivity = {
                    title: line.replace('## ', ''),
                    files: [],
                    description: ''
                };
                continue;
            }
            
            // 파일 및 설명 파싱
            if (line.startsWith('- ') && currentActivity) {
                const [key, value] = line.substring(2).split(': ');
                if (key === 'files') {
                    currentActivity.files = value.split(',').map(file => file.trim());
                } else if (key === 'description') {
                    currentActivity.description = value;
                }
            }
        }
        
        // 마지막 활동 추가
        if (currentActivity) {
            activities.push(currentActivity);
        }
        
        return activities;
    } catch (error) {
        console.error('Error parsing activities:', error);
        throw error;
    }
}

// 활동 그리드 표시
function displayActivities(activities) {
    const container = document.querySelector('.photos-container');
    
    const activitiesHTML = `
        <section class="activities">
            <div class="photo-grid">
                ${activities.map(activity => {
                    const safeActivityJson = JSON.stringify(activity)
                        .replace(/\\/g, '\\\\')
                        .replace(/'/g, "\\'")
                        .replace(/"/g, '\\"')
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\r')
                        .replace(/\t/g, '\\t');
                    
                    return `
                        <div class="photo-item" onclick='showActivityModal("${safeActivityJson}")'>
                            <img src="../assets/activities/${activity.files[0]}" 
                                 alt="${activity.title}"
                                 onerror="this.onerror=null; this.src='../assets/logo/SEL_logo.jpg';">
                            <h3>${activity.title}</h3>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
    `;
    
    container.innerHTML = activitiesHTML;
}

// 파일 타입 확인
function getFileType(file) {
    const extension = file.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['mp4', 'webm'].includes(extension)) return 'video';
    return 'unknown';
}

// 모달 내 미디어 요소 생성
function createMediaElement(file, isActive = false) {
    const fileType = getFileType(file);
    if (fileType === 'image') {
        return `<img src="../assets/activities/${file}" 
                    alt="" 
                    class="carousel-item ${isActive ? 'active' : ''}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='../assets/logo/SEL_logo.jpg';">`;
    } else if (fileType === 'video') {
        return `
            <div class="carousel-item ${isActive ? 'active' : ''}" style="width: 100%; height: 100%;">
                <video style="width: 100%; height: 100%; object-fit: contain; display: none;" controls>
                    <source src="../assets/activities/${file}" type="video/${file.split('.').pop()}"
                            onerror="this.parentElement.style.display='none'; this.parentElement.nextElementSibling.style.display='block';">
                </video>
                <img src="../assets/logo/SEL_logo.jpg" 
                     style="width: 100%; height: 100%; object-fit: contain; display: block;" 
                     alt="">
                <script>
                    document.currentScript.previousElementSibling.previousElementSibling.addEventListener('loadeddata', function() {
                        this.style.display = 'block';
                        this.nextElementSibling.style.display = 'none';
                    });
                </script>
            </div>
        `;
    }
    return `<img src="../assets/logo/SEL_logo.jpg" class="carousel-item ${isActive ? 'active' : ''}" alt="">`;
}

// 모달 표시
function showActivityModal(activityJson) {
    try {
        const activity = JSON.parse(activityJson);
        const existingModal = document.querySelector('.photo-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        
        const hasMultipleFiles = activity.files.length > 1;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button" onclick="closeModal()">&times;</span>
                <div class="carousel-container">
                    <div class="carousel-track">
                        ${activity.files.map((file, index) => createMediaElement(file, index === 0)).join('')}
                    </div>
                    ${hasMultipleFiles ? `
                        <button class="carousel-button prev" onclick="moveCarousel(-1)">&lt;</button>
                        <button class="carousel-button next" onclick="moveCarousel(1)">&gt;</button>
                        <div class="carousel-dots">
                            ${activity.files.map((_, index) => `
                                <span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="modal-info">
                    <h3>${activity.title}</h3>
                    <p>${activity.description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', handleKeyDown);
    } catch (error) {
        closeModal();
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.querySelector('.photo-modal');
    if (modal) {
        modal.remove();
        document.removeEventListener('keydown', handleKeyDown);
    }
}

// ESC 키 이벤트 핸들러
function handleKeyDown(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// 현재 슬라이드 인덱스 추적
let currentSlide = 0;

// 캐러셀 이동
function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = track.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    // 비디오 처리
    slides.forEach(slide => {
        if (slide.tagName === 'VIDEO') {
            slide.pause();
        }
    });
}

// 특정 슬라이드로 이동
function goToSlide(index) {
    const track = document.querySelector('.carousel-track');
    const slides = track.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    
    currentSlide = index;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    // 비디오 처리
    slides.forEach(slide => {
        if (slide.tagName === 'VIDEO') {
            slide.pause();
        }
    });
}

// 페이지 로드 시 실행
async function initializeActivitiesPage() {
    try {
        const activities = await parseActivitiesMD();
        displayActivities(activities);
    } catch (error) {
        const container = document.querySelector('.photos-container');
        container.innerHTML = '<p>활동 정보를 불러오는 데 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', initializeActivitiesPage); 