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
        contact: {},
        links: [],
        description: ''
    };

    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('## Photo')) {
            member.photo = lines[i + 1].trim();
        }
        else if (line.startsWith('## Position')) {
            currentSection = 'position';
        }
        else if (line.startsWith('## Contact')) {
            currentSection = 'contact';
        }
        else if (line.startsWith('## Link')) {
            currentSection = 'links';
        }
        else if (line.startsWith('## Description')) {
            currentSection = 'description';
        }
        else if (line && !line.startsWith('#')) {
            switch (currentSection) {
                case 'position':
                    if (line) member.position.push(line);
                    break;
                case 'contact':
                    if (line) {
                        const [key, value] = line.split(':').map(s => s.trim());
                        member.contact[key] = value;
                    }
                    break;
                case 'links':
                    if (line.includes('[')) {
                        const matches = line.match(/\[(.*?)\]\((.*?)\)/);
                        if (matches) {
                            member.links.push({
                                name: matches[1],
                                url: matches[2]
                            });
                        }
                    }
                    break;
                case 'description':
                    if (line) {
                        member.description += line + '\n';
                    }
                    break;
            }
        }
    }
    
    return member;
}

// 멤버 정보를 페이지에 표시
function displayMemberProfile(member) {
    const profileSection = document.querySelector('.member-profile');
    
    profileSection.innerHTML = `
        <div class="member-header">
            <img src="../assets/people/photos/${member.photo}" alt="${member.name}">
            <h2>${member.name}</h2>
            ${member.position.map(pos => `<p class="position">${pos}</p>`).join('')}
        </div>
        
        <div class="member-info">
            <div class="member-contact">
                <h3>Contact</h3>
                ${Object.entries(member.contact).map(([key, value]) => 
                    `<p><strong>${key}:</strong> ${value}</p>`
                ).join('')}
            </div>
            
            <div class="member-links">
                <h3>Links</h3>
                ${member.links.map(link => 
                    `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>`
                ).join(' | ')}
            </div>
            
            <div class="member-description">
                <h3>About</h3>
                ${member.description.split('\n').map(para => 
                    para ? `<p>${para}</p>` : ''
                ).join('')}
            </div>
        </div>
    `;
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