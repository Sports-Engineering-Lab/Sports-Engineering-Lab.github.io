async function loadMediaCoverage() {
    try {
        const response = await fetch('../assets/media_coverage/media_coverage.md');
        const text = await response.text();
        
        // Coverage List 섹션 추출
        const coverageListMatch = text.match(/## Coverage List\n\n([\s\S]*?)(?=\n\n|$)/);
        if (!coverageListMatch) return;
        
        const coverageItems = parseCoverageItems(coverageListMatch[1]);
        renderMediaItems(coverageItems);
    } catch (error) {
        console.error('Error loading media coverage:', error);
    }
}

function parseCoverageItems(text) {
    const items = [];
    const itemRegex = /- date: (.+)\n\s+title: (.+)\n\s+thumbnail: (.+)\n\s+link: (.+)(?:\n\s+description: (.+))?/g;
    
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
        items.push({
            date: match[1],
            title: match[2],
            thumbnail: match[3],
            link: match[4],
            description: match[5] || ''
        });
    }
    
    // 날짜 기준 내림차순 정렬
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMediaItems(items) {
    const container = document.querySelector('.media-items');
    
    items.forEach(item => {
        const mediaItem = document.createElement('article');
        mediaItem.className = 'media-item';
        
        mediaItem.innerHTML = `
            <img src="../assets/media_coverage/${item.thumbnail}" alt="${item.title}" class="media-item__thumbnail">
            <div class="media-item__content">
                <div class="media-item__date">${formatDate(item.date)}</div>
                <h3 class="media-item__title">${item.title}</h3>
                ${item.description ? `<p class="media-item__description">${item.description}</p>` : ''}
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="media-item__link">자세히 보기 →</a>
            </div>
        `;
        
        container.appendChild(mediaItem);
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 페이지 로드 시 미디어 커버리지 로드
document.addEventListener('DOMContentLoaded', loadMediaCoverage); 