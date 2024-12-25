// 마크다운 파일 파싱
async function parsePhotosMD() {
    try {
        const response = await fetch('../assets/activities/activities.md');
        if (!response.ok) {
            throw new Error('Failed to fetch activities data');
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const photos = {
            activities: []
        };
        
        let currentSection = '';
        let currentPhoto = null;
        
        function addCurrentPhotoToSection() {
            if (currentPhoto && currentSection) {
                photos[currentSection].push(currentPhoto);
            }
        }
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // 섹션 체크
            if (line.startsWith('## ')) {
                // 이전 사진 추가
                addCurrentPhotoToSection();
                currentSection = 'activities';
                
                currentPhoto = {
                    title: line.replace('## ', ''),
                    file: '',
                    description: ''
                };
                continue;
            }
            
            // 사진 정보 파싱
            if (line.startsWith('- ') && currentPhoto) {
                const [key, value] = line.substring(2).split(': ');
                if (value) {
                    currentPhoto[key] = value;
                }
            }
        }
        
        // 마지막 사진 추가
        addCurrentPhotoToSection();
        
        return photos;
    } catch (error) {
        console.error('Error parsing activities:', error);
        throw error;
    }
}

// 사진 그리드 표시
function displayPhotos(photos) {
    const container = document.querySelector('.photos-container');
    
    // Activities 섹션
    const activitiesHTML = `
        <section class="activities">
            <div class="photo-grid">
                ${photos.activities.map(photo => `
                    <div class="photo-item" onclick="showPhotoModal('${photo.file}', '${photo.title}', '${photo.description}')">
                        <img src="../assets/activities/${photo.file}" alt="${photo.title}">
                        <h3>${photo.title}</h3>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
    
    container.innerHTML = activitiesHTML;
}

// 모달 표시
function showPhotoModal(file, title, description) {
    // 기존 모달이 있다면 제거
    const existingModal = document.querySelector('.photo-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <img src="../assets/activities/${file}" alt="${title}">
            <div class="modal-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ���달 외부 클릭 시 닫기
    const handleClick = (e) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('click', handleClick);
        }
    };
    modal.addEventListener('click', handleClick);
    
    // ESC 키로 모달 닫기
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

// 페이지 로드 시 실행
async function initializePhotosPage() {
    try {
        const photos = await parsePhotosMD();
        displayPhotos(photos);
    } catch (error) {
        console.error('Error initializing photos page:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializePhotosPage); 