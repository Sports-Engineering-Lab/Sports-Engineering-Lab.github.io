// 마크다운 파일 파싱
async function parsePublicationsMD() {
    try {
        const response = await fetch('../assets/publications.md');
        if (!response.ok) {
            throw new Error('Failed to fetch publications data');
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const publications = {
            byYear: {}
        };
        
        let currentYear = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // 년도 체크
            if (line.startsWith('## ')) {
                currentYear = line.replace('## ', '');
                if (!publications.byYear[currentYear]) {
                    publications.byYear[currentYear] = [];
                }
                continue;
            }
            
            // 링크 체크
            if (line.startsWith('[')) {
                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                if (match && currentYear) {
                    const [_, title, url] = match;
                    publications.byYear[currentYear][
                        publications.byYear[currentYear].length - 1
                    ].links.push({ title, url });
                }
                continue;
            }
            
            // 내용 처리
            if (currentYear && !line.startsWith('#')) {
                publications.byYear[currentYear].push({
                    citation: line,
                    links: []
                });
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
    
    const yearsHTML = Object.entries(publications.byYear)
        .sort(([yearA], [yearB]) => yearB - yearA) // 년도 내림차순 정렬
        .map(([year, papers]) => `
            <section class="year-section">
                <h2>${year}</h2>
                ${papers.map(paper => `
                    <div class="publication-entry">
                        <p class="citation">${paper.citation}</p>
                        <div class="paper-links">
                            ${paper.links.map(link => `
                                <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
                            `).join(' ')}
                        </div>
                    </div>
                `).join('')}
            </section>
        `).join('');
    
    container.innerHTML = yearsHTML;
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

document.addEventListener('DOMContentLoaded', initializePublicationsPage); 