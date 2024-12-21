# Sports Engineering Lab Homepage

## People에 사람 추가 방법

1. 프로필 사진을 assets/people/photos/ 폴더에 추가
2. assets/people/ 폴더에 {Your_Name}.md로 파일 생성 후 아래 포맷을 복사/붙여넣기 하기

    ```markdown
    <!-- 홈페이지에 표시될 영문 이름을 입력하세요. 파일명도 입력하신 것과 같게 꼭 수정해주세요. -->
    # Member Name

    <!-- 소속 카테고리를 선택하세요. 해당하는 카테고리 앞의 [ ]에 x를 넣어주세요. 꼭 하나만 선택하세요. -->
    - [ ] Principal Investigator
    - [ ] Postdoctoral researcher
    - [ ] Doctoral Students
    - [ ] Master's Students
    - [x] Undergraduate Students
    - [ ] Alumni <!-- Alumni를 선택한 경우 어떤 Alumni인지 아래 체크박스에 체크해주세요. -->
      - [ ] Postdoctoral Alumni
      - [ ] Doctoral Alumni
      - [ ] Master's Alumni
      - [ ] Undergraduate Alumni

    ## Photo
    <!-- 본인 파일명을 입력하세요. 사진은 assets/people/photos/ 디렉토리에 저장해주세요. -->
    member_photo.jpg

    ## Position
    <!-- 직위, 소속 학과(소속 팀), 대학교(회사 혹인 기관) 순서로 작성해주세요. 꼭 쉼표로 구분해주세요. -->
    Position Title, Department Name, University Name

    ## Bio
    <!-- 본인의 학력, 경력, 수상 내역 등을 한 줄씩 입력해주세요. 최신 내용이 위로 가도록 작성해주세요. -->
    - Ph.D. in Sports Science, University Name (2020-Present)
    - M.S. in Biomechanics, University Name (2018-2020)
    - B.S. in Sports Science, University Name (2014-2018)
    - Research Intern, Research Institute Name (2017)
    - Best Paper Award, Conference Name (2019)

    ## Contact
    <!-- 연락처 정보를 입력하세요. 이메일은 필수입니다. -->
    Email: email@example.com
    Telephone: +82-2-XXX-XXXX

    ## Link
    <!-- 관련 학술 프로필 링크를 입력하세요. 선택사항입니다. -->
    [Google Scholar](https://scholar.google.com/citations?user=XXXX)
    [ORCID](https://orcid.org/XXXX-XXXX-XXXX-XXXX)
    [LinkedIn](https://www.linkedin.com/in/username)

    ## Description
    <!-- 본인에 대한 자세한 설명을 작성하세요. 연구 관심사, 학력, 업적, 현재 프로젝트 등을 자유롭게 포함할 수 있습니다. -->
    Write a detailed description about the member here. This can include research interests, academic background, achievements, and current projects.

    Multiple paragraphs can be added for longer descriptions. Make sure to add a blank line between paragraphs.
    ```

3. 파일 내용을 본인 정보에 맞게 수정 (주의: 절대 포맷에 변경을 가하지 말 것)
4. 포맷에 맞게 작성 후 commit을 완료하면 홈페이지에 자동 반영 됨

## Publications 추가 방법

1. assets/publications.md 파일을 열기
2. Our Recent Highlights에 내용을 추가하고 싶으면 ## Our Recent Highlights 하위에 아래와 같은 형식으로 내용 추가 (주의: 위 아래 내용과 반드시 줄바꿈으로 구분할 것)

    ```markdown
    ### Write title here
    Write description herer. Write description herer. Write description herer. Write description herer. Write description herer. Write description herer. Write description herer. Write description herer.
    [Paper](https://ieeexplore.ieee.org/document/~~~~~)
    [Video](https://www.youtube.com/watch~~~~~)
    ```

3. Every Publication에 내용을 추가하고 싶으면 ## Our Recent Hightlights 하위에 아래와 같은 형식으로 내용 추가 (주의: 위 아래 내용과 반드시 줄바꿈으로 구분할 것)

    ```markdown
    Write your paper here in APA format. Write your paper here in APA format. Write your paper here in APA format. Write your paper here in APA format. Write your paper here in APA format.
    [DOI](https://doi.org/~~~~)
    ```

4. commit을 완료하면 assets/publications.md 파일에 적혀있는 순서대로 홈페이지에 자동 반영 됨

## Photos 추가 방법

1. assets/photos/ 폴더에 추가하고 싶은 사진을 추가
2. assets/photos/photos.md 파일을 열기
3. Facilities에 추가하고 싶으면 ## Facilities 하위에 Activities에 추가하고 싶으면 ## Activities 하위에 아래와 같은 형식으로 내용 추가 (주의: 위 아래 내용과 반드시 줄바꿈으로 구분할 것)

    ```markdown
    ### Write title of your photo here
    - file: file_name.jpg
    - description: write description of your photo here. write description of your photo here.
    ```

4. commit을 완료하면 assets/photos/photos.md 파일에 적혀있는 순서대로 홈페이지에 자동 반영 됨

## 제작자 및 문의 정보

이준혁  
Email: jmjh98@snu.ac.kr
