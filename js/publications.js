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
            recentResearch: [],
            everyPublication: []
        };
        
        let currentSection = '';
        let currentTopic = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // 섹션 체크
            if (line.startsWith('## Our Recent Highlights')) {
                currentSection = 'recent';
                continue;
            } else if (line.startsWith('## Every Publication')) {
                currentSection = 'every';
                continue;
            }
            
            // Recent Research 토픽 체크
            if (line.startsWith('### ') && currentSection === 'recent') {
                if (currentTopic) {
                    publications.recentResearch.push(currentTopic);
                }
                currentTopic = {
                    title: line.replace('### ', ''),
                    description: '',
                    links: []
                };
                continue;
            }
            
            // 링크 체크
            if (line.startsWith('[')) {
                const match = line.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    const [_, title, url] = match;
                    if (currentSection === 'recent' && currentTopic) {
                        currentTopic.links.push({ title, url });
                    } else if (currentSection === 'every') {
                        publications.everyPublication[
                            publications.everyPublication.length - 1
                        ].links.push({ title, url });
                    }
                }
                continue;
            }
            
            // 내용 처리
            if (currentSection === 'recent' && currentTopic) {
                if (currentTopic.description) {
                    currentTopic.description += ' ' + line;
                } else {
                    currentTopic.description = line;
                }
            } else if (currentSection === 'every' && !line.startsWith('#')) {
                publications.everyPublication.push({
                    citation: line,
                    links: []
                });
            }
        }
        
        // 마지막 토픽 추가
        if (currentTopic) {
            publications.recentResearch.push(currentTopic);
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
    
    // Recent Highlights 섹션
    const recentHTML = `
        <section class="recent-highlights">
            <h2>Our Recent Highlights</h2>
            ${publications.recentResearch.map(topic => `
                <div class="research-topic">
                    <h3>${topic.title}</h3>
                    <p>${topic.description}</p>
                    <div class="topic-links">
                        ${topic.links.map(link => `
                            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>
                        `).join(' ')}
                    </div>
                </div>
            `).join('')}
        </section>
    `;
    
    // Every Publication 섹션
    const everyHTML = `
        <section class="every-publication">
            <h2>Every Publication</h2>
            ${publications.everyPublication.map(paper => `
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
    `;
    
    container.innerHTML = recentHTML + everyHTML;
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