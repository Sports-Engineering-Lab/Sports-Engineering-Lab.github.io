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

def parse_member_info(md_path):
    """MD 파일에서 필요한 기본 정보만 파싱합니다."""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        info = {
            'name': '',
            'category': '',
            'photo': '',
            'position': [],
            'alumniType': ''
        }

        current_section = ''
        found_required = {'name': False, 'category': False, 'photo': False, 'position': False}

        for line in lines:
            line = line.strip()
            
            # 주석 무시
            if line.startswith('<!--') or line.endswith('-->'):
                continue

            # 이름 파싱
            if line.startswith('# ') and not found_required['name']:
                info['name'] = line.replace('# ', '').strip()
                found_required['name'] = True
                continue

            # 섹션 확인
            if line.startswith('##'):
                current_section = line.replace('##', '').strip()
                continue

            # 카테고리 파싱
            if line.startswith('- [x]') and not found_required['category']:
                categories = ['Principal Investigator', 'Postdoctoral researcher', 
                            'Doctoral Students', "Master's Students", 
                            'Interns', 'Alumni']
                for category in categories:
                    if category in line:
                        info['category'] = category
                        found_required['category'] = True
                        
                        # Alumni 타입 체크
                        if category == 'Alumni':
                            alumni_types = ['Postdoctoral', 'Doctoral', "Master's", 'Intern']
                            for atype in alumni_types:
                                if f'{atype} Alumni' in line:
                                    info['alumniType'] = atype
                                    break
                        break
                continue

            # 섹션별 정보 파싱
            if current_section == 'Photo' and not found_required['photo']:
                if line:
                    info['photo'] = line
                    found_required['photo'] = True
            elif current_section == 'Position' and not found_required['position']:
                if line:
                    info['position'] = [pos.strip() for pos in line.split(',')]
                    found_required['position'] = True

            # 모든 필수 정보를 찾았으면 종료
            if all(found_required.values()):
                break

        return info
    except Exception as e:
        print(f"Error parsing {md_path}: {e}")
        return None

def main():
    # assets/people 디렉토리의 모든 .md 파일 처리
    people_dir = Path('assets/people')
    output_file = people_dir / 'members.json'
    cache_file = people_dir / 'members_cache.json'
    
    # 기존 members.json 파일 로드
    existing_members = load_existing_members(output_file)
    
    # 현재 존재하는 .md 파일들 확인
    current_md_files = set()
    member_cache = {}
    
    for md_file in people_dir.glob('*.md'):
        if md_file.name != 'profile_format.md':  # 형식 파일 제외
            current_md_files.add(md_file.name)
            # 각 멤버의 기본 정보 파싱 및 캐싱
            member_info = parse_member_info(md_file)
            if member_info:
                member_cache[md_file.name] = member_info
    
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
    
    # 캐시 파일 업데이트
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(member_cache, f, ensure_ascii=False, indent=4)

if __name__ == '__main__':
    main() 