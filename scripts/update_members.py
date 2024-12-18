import os
import json
from pathlib import Path

def update_members_list():
    # 프로젝트 루트 디렉토리 찾기
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    people_dir = root_dir / 'assets' / 'people'
    
    # .md 파일 목록 수집
    members = []
    for file_path in people_dir.glob('*.md'):
        if file_path.name != 'README.md':  # README.md 제외
            members.append(file_path.name)
    
    # 알파벳 순으로 정렬
    members.sort()
    
    # members.json 파일 생성 또는 업데이트
    output_file = people_dir / 'members.json'
    with output_file.open('w', encoding='utf-8') as f:
        json.dump({'members': members}, f, indent=2, ensure_ascii=False)
    
    print(f"멤버 목록이 업데이트되었습니다. 총 {len(members)}명의 멤버가 등록되어 있습니다.")
    for member in members:
        print(f"- {member}")

if __name__ == '__main__':
    update_members_list() 