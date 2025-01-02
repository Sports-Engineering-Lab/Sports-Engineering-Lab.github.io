async function loadMediaCoverage() {
    try {
        const response = await fetch('../assets/media_coverage/media_coverage.md');
        const text = await response.text();
        const items = parseMediaCoverage(text);
        displayMediaCoverage(items);
    } catch (error) {
        console.error('Error loading media coverage:', error);
    }
}

function parseMediaCoverage(text) {
    const items = [];
    const lines = text.split('\n');
    let currentItem = {};

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('- ')) {
            const [key, value] = line.substring(2).split(': ');
            if (key && value) {
                currentItem[key] = value;
            }
        } else if (line === '') {
            if (Object.keys(currentItem).length > 0) {
                items.push({...currentItem});
                currentItem = {};
            }
        }
    });

    if (Object.keys(currentItem).length > 0) {
        items.push(currentItem);
    }

    return items;
}

function displayMediaCoverage(items) {
    const container = document.getElementById('media-coverage-container');
    
    items.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        mediaItem.innerHTML = `
            <img class="media-thumbnail" src="../assets/media_coverage/${item.thumbnail}" alt="Media coverage thumbnail">
            <div class="media-content">
                <div class="media-date">${item.date}</div>
                <a href="${item.link}" class="media-text" target="_blank">
                    ${item.content}
                </a>
            </div>
        `;
        
        container.appendChild(mediaItem);
    });
}

document.addEventListener('DOMContentLoaded', loadMediaCoverage); 