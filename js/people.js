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
            name: '',
            category: '',
            photo: '',
            position: [],
            bio: [],  // Bio 섹션을 저장할 배열 추가
            contact: {},
            links: [],
            alumniType: '' // Alumni 타입을 저장할 필드 추가
        };

        // 카테고리 체크
        const categories = ['Principal Investigator', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Undergraduate Students', 'Alumni'];
        
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 주석 라인 무시
            if (line.startsWith('<!--') || line.includes('-->')) {
                continue;
            }
            
            // 이름 파싱 (첫 번째 # 으로 시작하는 라인)
            if (line.startsWith('# ') && !member.name) {
                member.name = line.replace('# ', '');
                continue;
            }
            
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
                        // Alumni인 경우 타입 체크
                        if (category === 'Alumni') {
                            // Alumni 타입 체크를 위해 현재 위치부터 검사
                            let j = i;
                            while (j < lines.length) {
                                const alumniLine = lines[j].trim();
                                
                                if (alumniLine.includes('[x]') && 
                                    (alumniLine.includes('Postdoctoral Alumni') ||
                                     alumniLine.includes('Doctoral Alumni') ||
                                     alumniLine.includes("Master's Alumni") ||
                                     alumniLine.includes('Undergraduate Alumni'))) {
                                    const match = alumniLine.match(/- \[x\] (.*?) Alumni/);
                                    if (match) {
                                        member.alumniType = match[1].trim();
                                        break;
                                    }
                                }
                                j++;
                            }
                        }
                        break;
                    }
                }
                continue;
            }
            
            // 빈 라인이나 주석 라인 무시
            if (!line || line.startsWith('<!--')) {
                continue;
            }
            
            switch (currentSection) {
                case 'Photo':
                    member.photo = line;
                    break;
                    
                case 'Position':
                    const positions = line.split(',').map(p => p.trim());
                    member.position.push(...positions);
                    break;
                    
                case 'Bio':
                    // Bio 항목 파싱 (불릿 ���작하는 라인)
                    if (line.startsWith('-')) {
                        member.bio.push(line.substring(2).trim());
                    }
                    break;
                    
                case 'Contact':
                    const [key, value] = line.split(':').map(s => s.trim());
                    if (key && value) {
                        member.contact[key] = value;
                    }
                    break;
                    
                case 'Link':
                    // 마크다운 링크 형식 파싱
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
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

    const memberElement = document.createElement('div');
    memberElement.className = 'person';

    // 이미지 로드 실패 시 기본 로고로 대체하는 이벤트 핸들러 추가
    const imgSrc = member.photo ? `../assets/people/photos/${member.photo}` : '../assets/logo/SEL_favicon.png';

    memberElement.innerHTML = `
        <a href="member.html?name=${encodeURIComponent(member.name)}">
            <img src="${imgSrc}" 
                 alt="${member.name}"
                 onerror="this.onerror=null; this.src='../assets/logo/SEL_favicon.png';">
            <h3>${member.name}</h3>
            ${member.category === 'Alumni' && member.alumniType ? 
                `<p class="alumni-type">${member.alumniType} ${member.category}</p>` : ''}
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

// URL에서 멤버 이름을 가져오는 함수
function getMemberNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    // member.html 페이지 체크를 더 유연하게 수정
    if (window.location.pathname.endsWith('member.html') || 
        window.location.pathname.includes('/member.html')) {
        const memberName = getMemberNameFromURL();
        console.log('Member name from URL:', memberName);
        
        // member-detail 요소 존재 확인
        const memberDetailElement = document.querySelector('.member-detail');
        if (!memberDetailElement) {
            console.error('Could not find .member-detail element');
            return;
        }
        
        if (memberName) {
            try {
                await displayMemberDetail(memberName);
            } catch (error) {
                console.error('Error in displayMemberDetail:', error);
            }
        } else {
            console.error('No member name provided in URL');
        }
    } else {
        // people.html 페이지인 경우
        await initializePeoplePage();
    }
});

// 기존의 페이지 로드 이벤트 리스너는 제거
// document.addEventListener('DOMContentLoaded', initializePeoplePage);

function displayMembers(members) {
    members.forEach(member => {
        let categoryDisplay = member.category;
        if (member.category === 'Alumni' && member.alumniType) {
            categoryDisplay = `${member.alumniType} ${member.category}`;
        }
        
        // 멤버 표시 로직...
    });
} 

// 멤버 상세 정보를 표시하는 함수 수정
async function displayMemberDetail(memberName) {
    try {
        console.log('Loading member detail for:', memberName);
        const response = await fetch(`../assets/people/${memberName}.md`);
        if (!response.ok) {
            console.error('Failed to fetch member file:', response.status);
            throw new Error('Member file not found');
        }
        
        const content = await response.text();
        console.log('Loaded markdown content:', content);
        
        const member = await parseMemberMD(`${memberName}.md`);
        console.log('Parsed member data:', member);
        
        if (!member) {
            throw new Error('Failed to parse member data');
        }
        
        const memberDetailElement = document.querySelector('.member-detail');
        if (!memberDetailElement) {
            throw new Error('Could not find .member-detail element');
        }
        
        memberDetailElement.innerHTML = `
            <div class="member-header">
                <div class="profile-left">
                    <img src="${member.photo ? `../assets/people/photos/${member.photo}` : '../assets/logo/SEL_favicon.png'}" 
                         alt="${member.name}"
                         onerror="this.onerror=null; this.src='../assets/logo/SEL_favicon.png'">
                </div>
                <div class="member-info">
                    <h1>${member.name}</h1>
                    ${member.category === 'Alumni' && member.alumniType ? 
                        `<p class="alumni-type">${member.alumniType} ${member.category}</p>` : ''}
                    ${member.position.map(pos => `<p>${pos}</p>`).join('')}
                </div>
            </div>
            <div class="member-contact">
                ${Object.entries(member.contact).map(([key, value]) => 
                    `<p><strong>${key}:</strong> ${value}</p>`
                ).join('')}
            </div>
            ${member.links.length > 0 ? `
                <div class="member-links">
                    ${member.links.map(link => 
                        `<a href="${link.url}" target="_blank">${link.title}</a>`
                    ).join(' | ')}
                </div>
            ` : ''}
            <div class="member-bio">
                <h2>Bio</h2>
                <ul>
                    ${member.bio.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        console.error('Error in displayMemberDetail:', error);
        document.querySelector('.member-detail').innerHTML = `
            <div class="error-message">
                <h2>Error loading member details</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
} 