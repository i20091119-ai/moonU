# 달 관측소 (moonU)

4학년 2학기 과학 1. 밤하늘 관찰 - 1. 달의 모양과 표면 관찰 (과학 14~15쪽, 실험관찰 10쪽)
가상 실험실 관찰 차시 시제품 v0.1. 검토용이며 논의가 끝나면 내릴 예정.

## 실행
`index.html`을 연다. 인터넷 연결 없이 동작한다.

## 흐름
인트로 → 예상 → 관찰 1(망원경 맞추기, 초점, 달 사진과 달 견주기) → 관찰 2(달 표면에서 직접 찾아 찍기 4곳, 뒷면 포함) → 정리(낱말 고르기, 내 사진 붙이기) → 창의 활동(달 무늬에서 본 모양) → 더 해 보기(착륙 지점 고르기 / 달 모형 빚기 / 달 사진 찍기) → 스스로 평가·관찰 일지

## 자료 출처
- 달 색 지도·높이 지도, 지형 조각(`assets/moon_terrain.js`, 높이 64픽셀/도·색 원본에서 관찰 지점 6곳을 잘라 냄): NASA's Scientific Visualization Studio, CGI Moon Kit (https://svs.gsfc.nasa.gov/4720)
- `assets/tb_*.jpg`, `video/help.mp4`: 동아출판 2022 개정 초등 과학 4-2 교과서·지도서 자료. 검토 목적으로만 포함. 재배포 금지
- `assets/bg_hill.jpg`, `lander.png`: 생성형 그림 도구로 제작
- 관찰 2의 큰 충돌 구덩이 32개(이름, 위도, 경도, 지름): 국제천문연맹(IAU) 행성 명명 목록(USGS Gazetteer of Planetary Nomenclature)의 값을 적은 것. 이 작업 환경에서 원문 사이트를 열 수 없어 값을 대조하지는 못했고, 대신 `tools/check_craters.py`로 NASA 높이 자료에서 32곳 모두 가운데가 테두리보다 700~3,800 m 낮은 것을 확인함
- 글꼴: 잘난체(여기어때컴퍼니), G마켓 산스(G마켓). 동아 샘플에 들어 있던 파일을 그대로 가져옴. 납품 전 각 글꼴의 사용 조건 확인 필요
- `assets/spot_sea1.jpg`, `spot_sea2.jpg`, `spot_cr1.jpg`: NASA CGI Moon Kit 색 지도를 잘라 음영을 더한 것(`tools/build_spot_photos.py`)
- `assets/pred_*.png`(예상 선택지 그림 4종): 생성형 그림 도구로 제작(2026-11-22)
- `assets/moon_normal.js`(법선 지도 4096×2048), `assets/moon_color8k.js`(색 지도 8192×4096): NASA CGI Moon Kit에서 만듦(`tools/build_textures_hq.py`)
- `assets/ic_start.png`, `ic_journal.png`, `ic_prep.png`, `ic_video.png`, `prep_tablet.png`: 생성형 그림 도구로 제작(2026-11-22). 동아 샘플 아이콘의 그림체를 글로 옮겨 요청함
- three.js r160 (MIT)
