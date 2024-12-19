// URL에서 멤버 이름 가져오기
function getMemberNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

// 마크다운 파일 파싱
async function parseMemberMD(memberName) {
    const response = await fetch(`../assets/people/${memberName}.md`);
    const text = await response.text();
    const lines = text.split('\n');
    
    const member = {
        name: lines[0].replace('# ', ''),
        photo: '',
        position: [],
        bio: [],
        contact: {},
        links: [],
        description: ''
    };

    let currentSection = '';
    let descriptionLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('##')) {
            currentSection = line.replace('##', '').trim();
            continue;
        }

        if (line && !line.startsWith('<!--')) {
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
    }
    
    member.description = descriptionLines.join('\n');
    return member;
}

// 멤버 정보를 페이지에 표시
function displayMemberProfile(member) {
    const profileSection = document.querySelector('.member-profile');
    
    // Go back 버튼 추가
    const goBackButton = document.createElement('a');
    goBackButton.href = 'people.html';
    goBackButton.className = 'go-back-btn';
    goBackButton.innerHTML = '← Go back';
    document.querySelector('main').prepend(goBackButton);
    
    const topSectionHTML = `
        <div class="top-section">
            <div class="profile-left">
                <img src="../assets/people/photos/${member.photo}" 
                     alt="${member.name}"
                     onerror="console.error('Image failed to load:', this.src)"
                     onload="console.log('Image loaded successfully:', this.src)">
                <h2>${member.name}</h2>
                ${member.position.join('<br>')}
            </div>
            <div class="profile-right">
                <div class="member-bio">
                    <h3>Bio</h3>
                    <ul>
                        ${member.bio.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    const bottomSectionHTML = `
        <div class="bottom-section">
            <div class="description-content">
                ${member.description.split('\n').map(para => 
                    para ? `<p>${para}</p>` : ''
                ).join('')}
            </div>
            <div class="side-info">
                <div class="member-contact">
                    <h3>Contact</h3>
                    ${Object.entries(member.contact).map(([key, value]) => 
                        `<p><strong>${key}:</strong> ${value}</p>`
                    ).join('')}
                </div>
                <div class="member-links">
                    <h3>Links</h3>
                    ${member.links.map(link => 
                        `<a href="${link.url}" target="_blank">${link.title}</a>`
                    ).join(' | ')}
                </div>
            </div>
        </div>
    `;

    profileSection.innerHTML = topSectionHTML + bottomSectionHTML;

    const style = document.createElement('style');
    style.textContent = `
        .top-section {
            display: grid;
            grid-template-columns: 1.2fr 3fr;
            gap: 2rem;
            margin-bottom: 3rem;
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
        }
        .profile-left {
            text-align: center;
        }
        .profile-left img {
            width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 50%;
            margin-bottom: 1rem;
        }
        .profile-left h2 {
            margin-bottom: 0.5rem;
        }
        .position {
            margin: 0.3rem 0;
            color: #666;
            white-space: nowrap;
            overflow: visible;
        }
        .member-bio h3,
        .member-contact h3,
        .member-links h3 {
            color: #8B0000;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #ddd;
        }
        .member-bio ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .member-bio li {
            margin-bottom: 0.5rem;
        }
        .bottom-section {
            display: grid;
            grid-template-columns: 3fr 1fr;
            gap: 2rem;
            margin-top: 2rem;
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
        }
        .description-content {
            line-height: 1.6;
        }
        .description-content p {
            margin-bottom: 1.5rem;
        }
        .description-content p:last-child {
            margin-bottom: 0;
        }
        .side-info {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }
        .member-contact {
            margin-top: 0.3rem;
            padding: 0;
            border: none;
            box-shadow: none;
            margin-bottom: 2rem;
        }
        .member-links {
            margin-top: 0.3rem;
            padding: 0;
            border: none;
            box-shadow: none;
        }
        .member-contact p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
        }
        .member-links a {
            color: #0066cc;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .member-links a:hover {
            text-decoration: underline;
        }
        .profile-right {
            display: flex;
            align-items: flex-end;
            height: 100%;
        }
        .member-bio {
            width: 100%;
        }
        .member-contact p strong {
            font-size: 0.9rem;
        }
        .go-back-btn {
            display: inline-block;
            margin: 20px;
            padding: 10px 20px;
            background-color: #f8f9fa;
            color: #333;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .go-back-btn:hover {
            background-color: #e9ecef;
        }
    `;
    document.head.appendChild(style);
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
        console.error('Error loading member data:', error);
        window.location.href = 'people.html';
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', initializeMemberPage); 

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