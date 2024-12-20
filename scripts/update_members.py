import os
import json
from pathlib import Path

def load_existing_members(json_path):
    """기존 members.json 파일을 로드합니다."""
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)['members']
            except (json.JSONDecodeError, KeyError):
                return []
    return []

def main():
    # assets/people 디렉토리의 모든 .md 파일 처리
    people_dir = Path('assets/people')
    output_file = people_dir / 'members.json'
    
    # 기존 members.json 파일 로드
    existing_members = load_existing_members(output_file)
    
    # 현재 존재하는 .md 파일들 확인
    current_md_files = set()
    for md_file in people_dir.glob('*.md'):
        if md_file.name != 'profile_format.md':  # 형식 파일 제외
            current_md_files.add(md_file.name)
    
    # 기존 목록에서 삭제된 파일 제거
    existing_members = [member for member in existing_members if member in current_md_files]
    
    # 새로 추가된 파일 확인 및 추가
    existing_set = set(existing_members)
    new_files = current_md_files - existing_set
    
    # 새 파일들을 기존 목록 끝에 추가
    existing_members.extend(sorted(new_files))
    
    # members.json 파일 업데이트
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"members": existing_members}, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main() 