// 마크다운 파일 파싱
async function parsePhotosMD() {
    try {
        const response = await fetch('../assets/photos/photos.md');
        if (!response.ok) {
            throw new Error('Failed to fetch photos data');
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const photos = {
            facilities: [],
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
                // 섹션 변경 시 이전 사진 추가
                addCurrentPhotoToSection();
                
                if (line.includes('Facilities')) {
                    currentSection = 'facilities';
                } else if (line.includes('Activities')) {
                    currentSection = 'activities';
                }
                currentPhoto = null;  // 섹션이 바뀔 때 현재 사진 초기화
                continue;
            }
            
            // 새로운 사진 항목 체크
            if (line.startsWith('### ')) {
                // 이전 사진 추가
                addCurrentPhotoToSection();
                
                currentPhoto = {
                    title: line.replace('### ', ''),
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
        console.error('Error parsing photos:', error);
        throw error;
    }
}

// 사진 그리드 표시
function displayPhotos(photos) {
    const container = document.querySelector('.photos-container');
    
    // Facilities 섹션
    const facilitiesHTML = `
        <section class="facilities">
            <h2>Facilities</h2>
            <div class="photo-grid">
                ${photos.facilities.map(photo => `
                    <div class="photo-item" onclick="showPhotoModal('${photo.file}', '${photo.title}', '${photo.description}')">
                        <img src="../assets/photos/${photo.file}" alt="${photo.title}">
                        <h3>${photo.title}</h3>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
    
    // Activities 섹션
    const activitiesHTML = `
        <section class="activities">
            <h2>Activities</h2>
            <div class="photo-grid">
                ${photos.activities.map(photo => `
                    <div class="photo-item" onclick="showPhotoModal('${photo.file}', '${photo.title}', '${photo.description}')">
                        <img src="../assets/photos/${photo.file}" alt="${photo.title}">
                        <h3>${photo.title}</h3>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
    
    container.innerHTML = facilitiesHTML + activitiesHTML;
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
            <img src="../assets/photos/${file}" alt="${title}">
            <div class="modal-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 모달 외부 클릭 시 닫기
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