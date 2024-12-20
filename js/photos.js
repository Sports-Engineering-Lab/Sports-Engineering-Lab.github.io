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
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // 섹션 체크
            if (line.startsWith('## Facilities')) {
                currentSection = 'facilities';
                continue;
            } else if (line.startsWith('## Activities')) {
                currentSection = 'activities';
                continue;
            }
            
            // 새로운 사진 항목 체크
            if (line.startsWith('### ')) {
                if (currentPhoto) {
                    photos[currentSection].push(currentPhoto);
                }
                currentPhoto = {
                    title: line.replace('### ', ''),
                    file: '',
                    description: ''
                };
                continue;
            }
            
            // 사진 정보 파싱
            if (line.startsWith('- ')) {
                const [key, value] = line.substring(2).split(': ');
                if (currentPhoto && value) {
                    currentPhoto[key] = value;
                }
            }
        }
        
        // 마지막 사진 추가
        if (currentPhoto) {
            photos[currentSection].push(currentPhoto);
        }
        
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
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
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