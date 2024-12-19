import os
import json
from pathlib import Path

def main():
    # assets/people 디렉토리의 모든 .md 파일 처리
    people_dir = Path('assets/people')
    members = []
    
    for md_file in people_dir.glob('*.md'):
        if md_file.name != 'profile_format.md':  # 형식 파일 제외
            members.append(md_file.name)
    
    # members.json 파일 생성
    output_file = people_dir / 'members.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"members": members}, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main() 