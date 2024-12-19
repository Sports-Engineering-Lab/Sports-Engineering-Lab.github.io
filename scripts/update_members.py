import os
import json
import re
from pathlib import Path

def parse_md_file(file_path):
    """마크다운 파일에서 멤버 정보를 추출"""
    data = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 파일 이름에서 이름 추출
    name = os.path.splitext(os.path.basename(file_path))[0]
    data['name'] = name
    
    # 기본 필드들 추출
    fields = ['position', 'email', 'interests', 'education']
    for field in fields:
        match = re.search(f'{field}:\\s*(.+)', content, re.IGNORECASE)
        if match:
            data[field.lower()] = match.group(1).strip()
    
    return data

def main():
    # assets/people 디렉토리의 모든 .md 파일 처리
    people_dir = Path('assets/people')
    members = []
    
    for md_file in people_dir.glob('*.md'):
        if md_file.name != 'profile_format.md':  # 형식 파일 제외
            member_data = parse_md_file(md_file)
            if member_data:
                members.append(member_data)
    
    # members.json 파일 생성
    output_file = people_dir / 'members.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(members, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main() 