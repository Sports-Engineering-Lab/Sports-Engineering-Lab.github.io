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
            alumniType: '',
            zoom: 1 // 기본값 1로 설정
        };

        // 카테고리 체크
        const categories = ['Principal Investigator', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Alumni'];
        
        let currentSection = '';
        let foundRequiredInfo = {
            name: false,
            category: false,
            photo: false,
            position: false
        };
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 주석 라인 무시
            if (line.startsWith('<!--') || line.includes('-->')) {
                continue;
            }
            
            // 이름 파싱 (첫 번째 # 으로 시작하는 라인)
            if (line.startsWith('# ') && !foundRequiredInfo.name) {
                member.name = line.replace('# ', '');
                foundRequiredInfo.name = true;
                // 모든 필수 정보를 찾았는지 확인
                if (Object.values(foundRequiredInfo).every(v => v)) break;
                continue;
            }
            
            // 섹션 헤더 확인
            if (line.startsWith('##')) {
                currentSection = line.replace('##', '').trim();
                continue;
            }
            
            // 카테고리 찾기
            if (line.includes('[x]') && !foundRequiredInfo.category) {
                for (const category of categories) {
                    if (line.includes(category)) {
                        member.category = category;
                        foundRequiredInfo.category = true;
                        // Alumni인 경우 타입 체크
                        if (category === 'Alumni') {
                            // Alumni 타입 체크를 위해 현재 위치부터 검사
                            let j = i;
                            while (j < lines.length) {
                                const alumniLine = lines[j].trim();
                                
                                if (alumniLine.includes('[x]') && 
                                    (alumniLine.includes('Postdoctoral Alumni') ||
                                     alumniLine.includes('Doctoral Alumni') ||
                                     alumniLine.includes("Master's Alumni"))) {
                                    const match = alumniLine.match(/- \[x\] (.*?) Alumni/);
                                    if (match) {
                                        member.alumniType = match[1].trim();
                                        break;
                                    }
                                }
                                j++;
                            }
                        }
                        // 모든 필수 정보를 찾았는지 확인
                        if (Object.values(foundRequiredInfo).every(v => v)) break;
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
                    if (!foundRequiredInfo.photo) {
                        member.photo = line;
                        foundRequiredInfo.photo = true;
                        
                        // 다음 줄에 zoom 속성이 있는지 확인
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1].trim();
                            if (nextLine.startsWith('zoom:')) {
                                const zoomValue = parseFloat(nextLine.replace('zoom:', '').trim());
                                if (!isNaN(zoomValue)) {
                                    member.zoom = zoomValue;
                                }
                            }
                        }
                        
                        // 모든 필수 정보를 찾았는지 확인
                        if (Object.values(foundRequiredInfo).every(v => v)) break;
                    }
                    break;
                    
                case 'Position':
                    if (!foundRequiredInfo.position) {
                        const positions = line.split(',').map(p => p.trim());
                        member.position.push(...positions);
                        foundRequiredInfo.position = true;
                        // 모든 필수 정보를 찾았는지 확인
                        if (Object.values(foundRequiredInfo).every(v => v)) break;
                    }
                    break;
            }
            
            // 모든 필수 정보를 찾았다면 파싱 중단
            if (Object.values(foundRequiredInfo).every(v => v)) {
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
function addMemberToSection(memberInfo, filename) {
    const section = document.querySelector(`[data-category="${memberInfo.category}"]`);
    if (!section) return;

    const memberElement = document.createElement('div');
    memberElement.className = 'person';

    // 이미지 로드 실패 시 기본 로고로 대체하는 이벤트 핸들러 추가
    const imgSrc = memberInfo.photo ? `../assets/people/photos/${memberInfo.photo}` : '../assets/logo/SEL_favicon.png';
    
    // zoom 속성을 적용하기 위한 스타일 생성
    const zoomValue = memberInfo.zoom || 1;
    
    // 확대/축소에 따라 다른 스타일 적용
    // 축소(zoom < 1)일 경우: object-fit 크기를 조절하여 더 넓은 영역이 보이게 함
    // 확대(zoom >= 1)일 경우: 이미지를 확대
    let imgStyle;
    if (zoomValue < 1) {
        // 축소할 때는 object-fit 크기를 조절하여 더 넓은 영역이 보이게 함
        imgStyle = `object-fit: contain; width: ${100 * zoomValue}%; height: ${100 * zoomValue}%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`;
    } else {
        // 확대할 때는 transform: scale()로 확대
        imgStyle = `transform: scale(${zoomValue}); transform-origin: center;`;
    }

    memberElement.innerHTML = `
        <a href="/member/?name=${encodeURIComponent(filename.replace('.md', ''))}">
            <div class="person-img-container">
                <img src="${imgSrc}" 
                     alt="${memberInfo.name}"
                     style="${imgStyle}"
                     onerror="this.onerror=null; this.src='../assets/logo/SEL_favicon.png';">
            </div>
            <h3>${memberInfo.name}</h3>
            ${memberInfo.category === 'Alumni' && memberInfo.alumniType ? 
                `<p class="alumni-type">${memberInfo.alumniType} ${memberInfo.category}</p>` : ''}
            ${memberInfo.position.map(pos => `<p>${pos}</p>`).join('')}
        </a>
    `;
    
    section.querySelector('.people-grid').appendChild(memberElement);
}

// 페이지 로드 시 실행
async function initializePeoplePage() {
    try {
        // members.json과 members_cache.json 파일을 동시에 로드
        const [membersResponse, cacheResponse] = await Promise.all([
            fetch('../assets/people/members.json'),
            fetch('../assets/people/members_cache.json')
        ]);

        if (!membersResponse.ok || !cacheResponse.ok) {
            throw new Error('Failed to fetch members data');
        }

        const [membersData, cacheData] = await Promise.all([
            membersResponse.json(),
            cacheResponse.json()
        ]);

        // 캐시된 정보를 사용하여 멤버 카드 생성
        for (const filename of membersData.members) {
            if (filename === 'profile_format.md') continue;
            
            const memberInfo = cacheData[filename];
            if (memberInfo) {
                addMemberToSection(memberInfo, filename);
            }
        }

        // 페이지 로드가 완료된 후 저장된 스크롤 위치로 복원
        restoreScrollPosition();
    } catch (error) {
        console.error('Error loading member data:', error);
    }
}

// 스크롤 위치 저장
function saveScrollPosition() {
    sessionStorage.setItem('peoplePageScroll', window.scrollY);
}

// 스크롤 위치 복원
function restoreScrollPosition() {
    const savedPosition = sessionStorage.getItem('peoplePageScroll');
    if (savedPosition !== null) {
        window.scrollTo(0, parseInt(savedPosition));
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    // 네비게이션 메뉴 활성화
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes('people') && linkPath.includes('people')) {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
        }
    });

    initializePeoplePage();
});

// 페이지를 떠날 때 스크롤 위치 저장
window.addEventListener('beforeunload', saveScrollPosition);

// URL에서 멤버 이름을 가져오는 함수
function getMemberNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

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