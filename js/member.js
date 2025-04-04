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
            education: [],     // Bio 대신 education으로 변경
            professionalCareers: [], // 새로운 professional careers 필드 추가
            contact: {},
            links: [],
            description: '',
            alumniType: [],  // 배열로 변경
            zoom: 1 // 기본값 1로 설정
        };

        // 카테고리 체크
        const categories = ['Director', 'Postdoctoral researcher', 
                           'Doctoral Students', "Master's Students", 
                           'Alumni'];
        
        let currentSection = '';
        let descriptionLines = [];
        
        // 주석 제거 전처리
        const cleanedLines = [];
        for (let line of lines) {
            // 주석이 포함된 부분 제거
            if (line.includes('<!--') && line.includes('-->')) {
                line = line.replace(/<!--.*?-->/g, '');
                if (line.trim()) {
                    cleanedLines.push(line);
                }
            } else if (line.startsWith('<!--') || line.includes('-->')) {
                // 주석 시작이나 끝만 있는 라인은 무시
                continue;
            } else if (line.trim()) {
                // 비어있지 않은 라인만 추가
                cleanedLines.push(line);
            }
        }
        
        for (let i = 0; i < cleanedLines.length; i++) {
            const line = cleanedLines[i].trim();
            
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
                        
                        // Alumni인 경우 타입 체크 (복수 선택 가능)
                        if (category === 'Alumni') {
                            // 다음 라인들을 검사하여 Alumni 타입 찾기
                            for (let j = i + 1; j < cleanedLines.length && !cleanedLines[j].startsWith('##'); j++) {
                                const alumniLine = cleanedLines[j].trim();
                                
                                if (alumniLine.includes('[x]')) {
                                    if (alumniLine.includes('Postdoctoral Alumni')) {
                                        member.alumniType.push('Postdoctoral');
                                    } else if (alumniLine.includes('Doctoral Alumni')) {
                                        member.alumniType.push('Doctoral');
                                    } else if (alumniLine.includes("Master's Alumni")) {
                                        member.alumniType.push("Master's");
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
                continue;
            }
            
            // 빈 라인 무시
            if (!line) {
                continue;
            }
            
            // 현재 섹션에 따라 정보 파싱
            switch (currentSection) {
                case 'Photo':
                    if (!member.photo) {
                        member.photo = line;
                        
                        // 다음 줄에 zoom 속성이 있는지 확인
                        if (i + 1 < cleanedLines.length) {
                            const nextLine = cleanedLines[i + 1].trim();
                            if (nextLine.startsWith('zoom:')) {
                                const zoomValue = parseFloat(nextLine.replace('zoom:', '').trim());
                                if (!isNaN(zoomValue)) {
                                    member.zoom = zoomValue;
                                }
                            }
                        }
                    }
                    break;
                case 'Position':
                    // "Position Title, Department Name, University Name"인 경우 공란으로 처리
                    if (line !== "Position Title, Department Name, University Name") {
                        const positions = line.split(',').map(p => p.trim());
                        member.position.push(...positions);
                    }
                    break;
                case 'Education': // Bio 대신 Education으로 변경
                    if (line.startsWith('-')) {
                        const educationItem = line.substring(2).trim();
                        member.education.push(educationItem);
                    }
                    break;
                case 'Professional Careers': // 새로운 Professional Careers 섹션 추가
                    if (line.startsWith('-')) {
                        const careerItem = line.substring(2).trim();
                        member.professionalCareers.push(careerItem);
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
        // zoom 속성을 적용하기 위한 스타일 생성
        const zoomValue = member.zoom || 1;
        
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
        
        // 카테고리 표시 처리
        let categoryDisplay = '';
        if (member.category === 'Alumni' && member.alumniType && member.alumniType.length > 0) {
            // 배열인 경우 (복수 선택)
            if (Array.isArray(member.alumniType)) {
                // 순서 변경: Master's, Doctoral, Postdoctoral 순으로 정렬
                const sortedTypes = [];
                if (member.alumniType.includes("Master's")) sortedTypes.push("Master's");
                if (member.alumniType.includes("Doctoral")) sortedTypes.push("Doctoral");
                if (member.alumniType.includes("Postdoctoral")) sortedTypes.push("Postdoctoral");
                
                categoryDisplay = `<p class="alumni-type">${sortedTypes.join(', ')} Alumni</p>`;
            } else {
                // 문자열인 경우 (이전 버전 호환성)
                categoryDisplay = `<p class="alumni-type">${member.alumniType} Alumni</p>`;
            }
        } else if (member.category) {
            // Alumni가 아닌 다른 카테고리도 동일한 스타일로 표시
            let displayCategory = member.category;
            
            // 카테고리 이름 포맷 변경
            if (displayCategory === 'Postdoctoral researcher') {
                displayCategory = 'Postdoctoral Researcher';
            } else if (displayCategory === 'Doctoral Students') {
                displayCategory = 'Doctoral Student';
            } else if (displayCategory === "Master's Students") {
                displayCategory = "Master's Student";
            }
            
            categoryDisplay = `<p class="alumni-type">${displayCategory}</p>`;
        }
        
        // 프로필 카드
        const profileCardHTML = `
            <div class="profile-img-container">
                <img src="${photoSrc}" alt="${member.name}" style="${imgStyle}">
            </div>
            <h2>${member.name}</h2>
            ${categoryDisplay}
            ${member.position.map(pos => `<p class="position">${pos}</p>`).join('')}
        `;
        
        // Education 섹션 (Bio 대신)
        const educationSectionHTML = `
            <h3>Education</h3>
            <ul>
                ${member.education.map(item => {
                    // 괄호 안의 날짜 부분을 찾습니다
                    const match = item.match(/\(([^)]+)\)$/);
                    if (match) {
                        // 날짜 부분을 제외한 내용과 날짜를 분리합니다
                        const content = item.replace(/\s*\([^)]+\)$/, '');
                        const date = match[0];
                        return `<li><span class="content">${content}</span><span class="date">${date}</span></li>`;
                    }
                    return `<li><span class="content">${item}</span></li>`;
                }).join('')}
            </ul>
        `;
        
        // Professional Careers 섹션 (새로 추가)
        const professionalCareersSectionHTML = `
            <h3>Professional Careers</h3>
            <ul>
                ${member.professionalCareers.map(item => {
                    // 괄호 안의 날짜 부분을 찾습니다
                    const match = item.match(/\(([^)]+)\)$/);
                    if (match) {
                        // 날짜 부분을 제외한 내용과 날짜를 분리합니다
                        const content = item.replace(/\s*\([^)]+\)$/, '');
                        const date = match[0];
                        return `<li><span class="content">${content}</span><span class="date">${date}</span></li>`;
                    }
                    return `<li><span class="content">${item}</span></li>`;
                }).join('')}
            </ul>
        `;
        
        // Contact 섹션
        const contactSectionHTML = `
            <h3>Contact</h3>
            ${Object.entries(member.contact).map(([key, value]) => {
                // 이메일인 경우 mailto 링크 추가
                if (key.toLowerCase() === 'email') {
                    return `<p><strong>${key}:</strong> <a href="mailto:${value}">${value}</a></p>`;
                }
                return `<p><strong>${key}:</strong> ${value}</p>`;
            }).join('')}
        `;

        // Links 섹션
        const linksSectionHTML = `
            <h3>Links</h3>
            <p>
                ${member.links.map((link, index) => 
                    `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.title}</a>${index < member.links.length - 1 ? ' | ' : ''}`
                ).join('')}
            </p>
        `;

        // Description 섹션
        const descriptionSectionHTML = `
            ${member.description.split('\n').map(para => 
                para ? `<p>${para}</p>` : ''
            ).join('')}
        `;

        // 페이지에 정보 표시
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            profileCard.innerHTML = profileCardHTML;
        }
        
        // Education 섹션 - 내용이 있을 때만 표시
        const educationSection = document.querySelector('.education-section');
        if (educationSection) {
            if (member.education && member.education.length > 0) {
                educationSection.innerHTML = educationSectionHTML;
                educationSection.style.display = 'block';
            } else {
                educationSection.style.display = 'none';
            }
        }
        
        // Professional Careers 섹션 - 내용이 있을 때만 표시
        const professionalCareersSection = document.querySelector('.professional-careers-section');
        if (professionalCareersSection) {
            if (member.professionalCareers && member.professionalCareers.length > 0) {
                professionalCareersSection.innerHTML = professionalCareersSectionHTML;
                professionalCareersSection.style.display = 'block';
            } else {
                professionalCareersSection.style.display = 'none';
            }
        }

        // Description 섹션
        const descriptionSection = document.querySelector('.description-section');
        if (descriptionSection && member.description) {
            descriptionSection.innerHTML = descriptionSectionHTML;
            descriptionSection.style.display = 'block';
        } else if (descriptionSection) {
            descriptionSection.style.display = 'none';
        }

        // Contact 정보 - 항상 표시
        const contactSection = document.querySelector('.member-contact');
        if (contactSection) {
            contactSection.innerHTML = contactSectionHTML;
        }

        // 링크 정보 - 항상 표시
        const linksSection = document.querySelector('.member-links');
        if (linksSection) {
            linksSection.innerHTML = linksSectionHTML;
        }
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