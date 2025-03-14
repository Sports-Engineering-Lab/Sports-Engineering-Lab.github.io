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

        # 주석 제거 (한 줄 안에 있는 주석만 제거)
        cleaned_lines = []
        for line in lines:
            # 주석이 포함된 부분 제거
            if '<!--' in line and '-->' in line:
                line = line[:line.find('<!--')] + line[line.find('-->') + 3:]
            if line.strip():
                cleaned_lines.append(line)

        info = {
            'name': '',
            'category': '',
            'photo': '',
            'position': [],
            'alumniType': [],  # 배열로 변경하여 복수 타입 저장
            'zoom': 1  # 기본값 1로 설정
        }

        current_section = ''
        found_required = {'name': False, 'category': False, 'photo': False, 'position': False}
        i = 0
        
        while i < len(cleaned_lines):
            line = cleaned_lines[i].strip()
            
            # 이름 파싱 (첫 번째 # 으로 시작하는 라인)
            if line.startswith('# ') and not found_required['name']:
                info['name'] = line.replace('# ', '').strip()
                found_required['name'] = True
                i += 1
                continue
            
            # 섹션 헤더 확인
            if line.startswith('## '):
                current_section = line.replace('## ', '').strip()
                i += 1
                continue
            
            # 카테고리 찾기
            if '[x]' in line and not found_required['category']:
                categories = ['Principal Investigator', 'Postdoctoral researcher', 
                             'Doctoral Students', "Master's Students", 'Alumni']
                for category in categories:
                    if category in line:
                        info['category'] = category
                        found_required['category'] = True
                        
                        # Alumni인 경우 타입 체크 (복수 선택 가능)
                        if category == 'Alumni':
                            j = i + 1
                            while j < len(cleaned_lines):
                                alumni_line = cleaned_lines[j].strip()
                                if '[x]' in alumni_line:
                                    if 'Postdoctoral Alumni' in alumni_line:
                                        info['alumniType'].append('Postdoctoral')
                                    elif 'Doctoral Alumni' in alumni_line:
                                        info['alumniType'].append('Doctoral')
                                    elif "Master's Alumni" in alumni_line:
                                        info['alumniType'].append("Master's")
                                if '##' in alumni_line:  # 다음 섹션 시작
                                    break
                                j += 1
                        break
                i += 1
                continue
            
            # 현재 섹션에 따라 정보 파싱
            if current_section == 'Photo' and not found_required['photo']:
                info['photo'] = line
                found_required['photo'] = True
                
                # 다음 줄에 zoom 속성이 있는지 확인
                if i + 1 < len(cleaned_lines):
                    next_line = cleaned_lines[i + 1].strip()
                    if next_line.startswith('zoom:'):
                        try:
                            zoom_value = float(next_line.replace('zoom:', '').strip())
                            info['zoom'] = zoom_value
                        except ValueError:
                            pass  # 숫자로 변환할 수 없는 경우 기본값 유지
                
                i += 1
                continue
            elif current_section == 'Position' and not found_required['position']:
                # "Position Title, Department Name, University Name"인 경우 공란으로 처리
                if line == "Position Title, Department Name, University Name":
                    info['position'] = []
                else:
                    positions = [pos.strip() for pos in line.split(',')]
                    info['position'] = positions
                found_required['position'] = True
                i += 1
                continue
            
            i += 1
        
        # 필수 정보가 모두 있는지 확인
        if all(found_required.values()):
            return info
        else:
            print(f"Warning: Missing required information in {md_path}")
            return info if info['name'] and info['category'] else None
    
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