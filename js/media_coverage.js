async function loadMediaCoverage() {
    try {
        const response = await fetch('../assets/media_coverage/media_coverage.md');
        const text = await response.text();
        const items = parseMediaCoverage(text);
        displayMediaCoverage(items);
    } catch (error) {
        console.error('Error loading media coverage:', error);
    }
}

function parseMediaCoverage(text) {
    const items = [];
    const lines = text.split('\n');
    let currentItem = {};

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('- ')) {
            const [key, value] = line.substring(2).split(': ');
            if (key && value) {
                currentItem[key] = value;
            }
        } else if (line === '') {
            if (Object.keys(currentItem).length > 0) {
                items.push({...currentItem});
                currentItem = {};
            }
        }
    });

    if (Object.keys(currentItem).length > 0) {
        items.push(currentItem);
    }

    return items;
}

function adjustFontSize(element) {
    const maxFontSize = 28;
    const minFontSize = 20;
    const maxLength = 100; // 이 길이 이상이면 폰트 크기가 줄어들기 시작
    
    const content = element.textContent;
    if (content.length > maxLength) {
        const ratio = Math.max(minFontSize / maxFontSize, 1 - ((content.length - maxLength) / 200));
        const newSize = Math.max(maxFontSize * ratio, minFontSize);
        element.style.fontSize = `${newSize}px`;
        element.style.paddingTop = '40px'; // 폰트 크기가 줄어들 때만 padding 추가
    } else {
        element.style.paddingTop = '0'; // 기본 상태에서는 padding 제거
    }
}

function displayMediaCoverage(items) {
    const container = document.getElementById('media-coverage-container');
    
    items.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        mediaItem.innerHTML = `
            <img class="media-thumbnail" src="../assets/media_coverage/${item.thumbnail}" alt="Media coverage thumbnail">
            <div class="media-content">
                <div class="media-date">${item.date}</div>
                <a href="${item.link}" class="media-text" target="_blank">
                    ${item.content}
                </a>
            </div>
        `;
        
        container.appendChild(mediaItem);
        
        // 폰트 크기 조절
        const textElement = mediaItem.querySelector('.media-text');
        adjustFontSize(textElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 네비게이션 메뉴 활성화
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes('media_coverage') && linkPath.includes('media_coverage')) {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
        }
    });

    initializeMediaCoveragePage();
});

document.addEventListener('DOMContentLoaded', loadMediaCoverage); 