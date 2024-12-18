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
            position: []
        };

        // 카테고리 체크
        const categories = ['Principal Investigator', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Undergraduate Students', 'Lab Alumni'];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 카테고리 찾기
            if (line.includes('[x]')) {
                for (const category of categories) {
                    if (line.includes(category)) {
                        member.category = category;
                        break;
                    }
                }
            }
            
            // 사진 찾기
            if (line.startsWith('## Photo')) {
                member.photo = lines[i + 1].trim();
            }
            
            // 직위 찾기
            if (line.startsWith('## Position')) {
                let j = i + 1;
                while (j < lines.length && !lines[j].startsWith('##')) {
                    const pos = lines[j].trim();
                    if (pos) member.position.push(pos);
                    j++;
                }
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

    const memberElement = document.createElement('div');
    memberElement.className = 'person';
    memberElement.innerHTML = `
        <a href="member.html?name=${encodeURIComponent(member.name)}">
            <img src="../assets/people/photos/${member.photo}" alt="${member.name}">
            <h3>${member.name}</h3>
            ${member.position.map(pos => `<p>${pos}</p>`).join('')}
        </a>
    `;
    
    section.querySelector('.people-grid').appendChild(memberElement);
}

// 페이지 로드 시 실행
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