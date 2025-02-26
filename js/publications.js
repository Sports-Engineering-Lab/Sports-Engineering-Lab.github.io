// 마크다운 파일 파싱
async function parsePublicationsMD() {
    try {
        const response = await fetch('../assets/publications.md');
        if (!response.ok) {
            throw new Error('Failed to fetch publications data');
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const publications = [];
        let currentPublication = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line || line.startsWith('# ')) continue;
            
            // 링크 체크
            if (line.startsWith('[')) {
                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                if (match && currentPublication) {
                    const [_, title, url] = match;
                    currentPublication.links.push({ title, url });
                }
                continue;
            }
            
            // 새로운 출판물 시작
            if (!line.startsWith('[')) {
                currentPublication = {
                    citation: line,
                    links: []
                };
                publications.push(currentPublication);
            }
        }
        
        return publications;
    } catch (error) {
        console.error('Error parsing publications:', error);
        throw error;
    }
}

// 출판 정보를 페이지에 표시
function displayPublications(publications) {
    const container = document.querySelector('.publications-container');
    
    const publicationsHTML = publications.map(paper => `
        <div class="publication-entry">
            <p class="citation">${paper.citation}</p>
            <div class="paper-links">
                ${paper.links.map(link => `
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = publicationsHTML;
}

// 페이지 로드 시 실행
async function initializePublicationsPage() {
    try {
        const publications = await parsePublicationsMD();
        displayPublications(publications);
    } catch (error) {
        console.error('Error initializing publications page:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 네비게이션 메뉴 활성화
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes('publications') && linkPath.includes('publications')) {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
        }
    });

    initializePublicationsPage();
}); 