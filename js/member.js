// URL에서 멤버 이름 가져오기
function getMemberNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

// 마크다운 파일 파싱
async function parseMemberMD(memberName) {
    try {
        const response = await fetch(`../assets/people/${memberName}.md`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${memberName}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        const member = {
            name: '',
            category: '',
            photo: '',
            position: [],
            bio: [],
            contact: {},
            links: [],
            description: '',
            alumniType: ''
        };

        // 카테고리 체크
        const categories = ['Principal Investigator', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Interns', 'Alumni'];
        
        let currentSection = '';
        let descriptionLines = [];
        
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

            // 카테고리 체크
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
                                     alumniLine.includes('Intern Alumni'))) {
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
                    if (line.startsWith('-')) {
                        const bioItem = line.substring(2).trim();
                        member.bio.push(bioItem);
                    }
                    break;
                case 'Contact':
                    const [key, value] = line.split(':').map(s => s.trim());
                    if (key && value) {
                        member.contact[key] = value;
                    }
                    break;
                case 'Link':
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        member.links.push({
                            title: linkMatch[1],
                            url: linkMatch[2]
                        });
                    }
                    break;
                case 'Description':
                    if (line) {
                        descriptionLines.push(line);
                    }
                    break;
            }
        }
        
        member.description = descriptionLines.join('\n');
        return member;
    } catch (error) {
        throw error;
    }
}

// 멤버 정보를 페이지에 표시
function displayMemberProfile(member) {
    const memberSection = document.querySelector('.member-section');
    
    // 이미지 로드를 시도하고 실패하면 파비콘으로 대체
    const loadImage = async () => {
        return new Promise((resolve) => {
            if (!member.photo) {
                resolve('../assets/logo/SEL_favicon.png');
                return;
            }

            const img = new Image();
            img.onload = () => resolve(`../assets/people/photos/${member.photo}`);
            img.onerror = () => resolve('../assets/logo/SEL_favicon.png');
            img.src = `../assets/people/photos/${member.photo}`;
        });
    };

    loadImage().then(photoSrc => {
        // 프로필 카드
        const profileCardHTML = `
            <img src="${photoSrc}" alt="${member.name}">
            <h2>${member.name}</h2>
            ${member.category === 'Alumni' && member.alumniType ? 
                `<p class="alumni-type">${member.alumniType} Alumni</p>` : ''}
            ${member.position.map(pos => `<p class="position">${pos}</p>`).join('')}
        `;
        
        // Bio 섹션
        const bioSectionHTML = `
            <h3>Bio</h3>
            <ul>
                ${member.bio.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
        
        // Contact와 Links 섹션
        const contactHTML = `
            <h3>Contact</h3>
            ${Object.entries(member.contact).map(([key, value]) => 
                key.toLowerCase() === 'email' ?
                `<p><strong>${key}:</strong> <a href="mailto:${value}">${value}</a></p>` :
                `<p><strong>${key}:</strong> ${value}</p>`
            ).join('')}
        `;
        
        const linksHTML = `
            <h3>Links</h3>
            ${member.links.map(link => 
                `<a href="${link.url}" target="_blank">${link.title}</a>`
            ).join(' | ')}
        `;
        
        // Description 섹션
        const descriptionHTML = `
            ${member.description.split('\n').map(para => 
                para ? `<p>${para}</p>` : ''
            ).join('')}
        `;

        // 각 섹션에 HTML 삽입
        memberSection.querySelector('.profile-card').innerHTML = profileCardHTML;
        memberSection.querySelector('.bio-section').innerHTML = bioSectionHTML;
        memberSection.querySelector('.member-contact').innerHTML = contactHTML;
        memberSection.querySelector('.member-links').innerHTML = linksHTML;
        memberSection.querySelector('.description-section').innerHTML = descriptionHTML;
    });
}

// 페이지 로드 시 실행
async function initializeMemberPage() {
    try {
        const memberName = getMemberNameFromURL();
        if (!memberName) {
            window.location.href = 'people.html';
            return;
        }
        
        const member = await parseMemberMD(memberName);
        displayMemberProfile(member);
        document.title = `${member.name} - Sports Engineering Lab`;
    } catch (error) {
        window.location.href = 'people.html';
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    initializeMemberPage();
    
    // 네비게이션 메뉴와 로고 클릭 시 스크롤 위치 초기화
    document.querySelectorAll('.header-container a').forEach(link => {
        link.addEventListener('click', () => {
            sessionStorage.removeItem('peoplePageScroll');
        });
    });

    // 현재 페이지의 네비게이션 메뉴 아이템 활성화
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // member 페이지에서는 active 효과를 적용하지 않음
        if (!currentPath.includes('member')) {
            if ((currentPath === '/' && linkPath === '/') ||
                (currentPath.includes('people') && linkPath.includes('people')) ||
                (currentPath.includes('publications') && linkPath.includes('publications')) ||
                (currentPath.includes('media_coverage') && linkPath.includes('media_coverage')) ||
                (currentPath.includes('activities') && linkPath.includes('activities'))) {
                link.classList.add('active');
                link.style.pointerEvents = 'none';
            }
        }
    });
});

function createMemberPage(memberData) {
    return `
    <div class="member-container">
        <a href="people.html" class="go-back-btn">← Go back</a>
        
        <div class="member-profile">
            <!-- 기존 멤버 프로필 내용 -->
            <h1>${memberData.name}</h1>
            <p class="position">${memberData.position || ''}</p>
            <p class="email">${memberData.email || ''}</p>
            <p class="interests"><strong>Research Interests:</strong> ${memberData.interests || ''}</p>
            <div class="education">
                <strong>Education:</strong>
                <p>${memberData.education || ''}</p>
            </div>
        </div>
    </div>
    `;
} 