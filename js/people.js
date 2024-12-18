// 마크다운 파일 파싱 함수
async function parseMemberMD(filename) {
    try {
        const response = await fetch(`../assets/people/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${filename}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const member = {
            name: lines[0].replace('# ', ''),
            category: '',
            photo: '',
            position: [],
            bio: [],  // Bio 섹션을 저장할 배열 추가
            contact: {},
            links: []
        };

        // 카테고리 체크
        const categories = ['Principal Investigator', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Undergraduate Students', 'Lab Alumni'];
        
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 섹션 헤더 확인
            if (line.startsWith('##')) {
                currentSection = line.replace('##', '').trim();
                continue;
            }
            
            // 카테고리 찾기
            if (line.includes('[x]')) {
                for (const category of categories) {
                    if (line.includes(category)) {
                        member.category = category;
                        break;
                    }
                }
            }
            
            switch (currentSection) {
                case 'Photo':
                    if (line && !line.startsWith('<!--')) {
                        member.photo = line;
                    }
                    break;
                    
                case 'Position':
                    if (line && !line.startsWith('<!--')) {
                        const positions = line.split(',').map(p => p.trim());
                        member.position.push(...positions);
                    }
                    break;
                    
                case 'Bio':
                    // Bio 항목 파싱 (불릿 포인트로 시작하는 라인)
                    if (line.startsWith('-') && !line.startsWith('<!--')) {
                        member.bio.push(line.substring(2).trim());
                    }
                    break;
                    
                case 'Contact':
                    if (line && !line.startsWith('<!--')) {
                        const [key, value] = line.split(':').map(s => s.trim());
                        if (key && value) {
                            member.contact[key] = value;
                        }
                    }
                    break;
                    
                case 'Link':
                    // 마크다운 링크 형식 파싱
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch && !line.startsWith('<!--')) {
                        member.links.push({
                            title: linkMatch[1],
                            url: linkMatch[2]
                        });
                    }
                    break;
            }
        }
        
        return member;
    } catch (error) {
        console.error(`Error parsing ${filename}:`, error);
        return null;
    }
}

// 멤버 정보를 해당하는 섹션에 추가하는 함수
function addMemberToSection(member, category) {
    const section = document.querySelector(`[data-category="${category}"]`);
    if (!section) return;

    console.log('Adding member:', member);

    const memberElement = document.createElement('div');
    memberElement.className = 'person';

    memberElement.innerHTML = `
        <a href="member.html?name=${encodeURIComponent(member.name)}">
            <img src="../assets/people/photos/${member.photo}" 
                 alt="${member.name}"
                 onerror="console.error('Image failed to load:', this.src)"
                 onload="console.log('Image loaded successfully:', this.src)">
            <h3>${member.name}</h3>
            ${member.position.map(pos => `<p>${pos}</p>`).join('')}
        </a>
    `;
    
    section.querySelector('.people-grid').appendChild(memberElement);
}

// 이지 로드 시 실행
async function initializePeoplePage() {
    try {
        // members.json 파일 로드
        const response = await fetch('../assets/people/members.json');
        if (!response.ok) {
            throw new Error('Failed to fetch members list');
        }
        const data = await response.json();
        
        // 각 멤버의 마크다운 파일 파싱
        for (const filename of data.members) {
            // profile_format.md 파일은 건너뛰기
            if (filename === 'profile_format.md') continue;
            
            const member = await parseMemberMD(filename);
            if (member && member.category) {
                addMemberToSection(member, member.category);
            }
        }
    } catch (error) {
        console.error('Error loading member data:', error);
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', initializePeoplePage); 