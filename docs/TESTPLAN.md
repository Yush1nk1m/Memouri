# Test Plan 문서
이 문서는 Memouri 서비스의 테스트 플랜에 대한 상세한 정보를 제공합니다. 

***

## Front-End Test
프론트엔드의 인터렉션과 뷰는 use case를 기반으로 한 System Test로 진행합니다. Memouri 서비스의 프론트엔드는 사용자가 쉽게 회원가입, 동영상 업로드, 그룹 가입 등등의 활동을 지원하는 웹페이지와 스마트 TV 웹앱으로 나누어져 있습니다.

***

### 1. 회원 가입, 로그인, 로그아웃 하기 - 웹페이지
Test Case ID: FTC-01

| Test Step | Test Data | Expected Result |
| :--- | :----------------- | :--- |
| 사용자가 시스템에 접속합니다. | http://localhost:8000/ | ID, password를 입력하는 로그인 화면이 출력됩니다. |
| 사용자가 회원가입 버튼을 클릭합니다. |  | ID, password, name, email을 입력하는 회원가입 화면이 출력됩니다. |
| 사용자가 회원가입 완료 버튼을 클릭합니다. |  | 로그인 화면으로 돌아갑니다. |
| 사용자가 아이디, 비밀번호를 입력하고 로그인 버튼을 클릭합니다. |  | 가입한 그룹과 비디오 목록이 출력되는 메인 화면이 출력됩니다. |
| 사용자가 회원정보 버튼을 클릭합니다. |  | 사용자의 정보를 출력합니다. | 
| 사용자가 회원탈퇴 버튼을 클릭합니다. |  | 로그인 화면으로 돌아갑니다. | 

***

### 2. 회원 정보 변경하기(이름, 이메일) - 웹페이지
Test Case ID: FTC-02

| Test Step | Test Data | Expected Result |
| :--- | :----------------- | :--- |
| 사용자가 로그인한 상태로 시스템에 접속합니다. | http://localhost:8000/ | 가입한 그룹과 비디오 목록이 출력되는 메인 화면이 출력됩니다. |
| 사용자가 회원정보 버튼을 클릭합니다. |  | 사용자의 정보를 출력합니다. | 

***

### 3. QRCode 로 로그인하기
Test Case ID: FTC-03

***

### 4. 비디오 목록 조회하기
Test Case ID: FTC-04

***

### 5. 비디오 저장, 삭제하기 - 웹페이지
Test Case ID: FTC-05

| Test Step                                                           | Test Data                    | Expected Result                 |
|:--------------------------------------------------------------------|:-----------------------------|:--------------------------------|
| 사용자가 로그인 버튼을 눌러 에디터 페이지에 접속합니다.                                     | http://localhost:8000/editor | 페이지 좌측 네비게이션 바에서 가입한 그룹을 확인합니다. | 
| 화면 하단에 고정된 업로드 비디오 버튼을 누르고 업로드 모달을 띄운 뒤 비디오이름과 설명을 입력한뒤 서버에 업로드합니다. | | 업로드 목록에 비디오가 잘 업로드 되었는지 확입합니다.  |

***

### 6. 비디오 pin, like 하기
Test Case ID: FTC-06

***

### 7. 비디오 스트리밍 요청, 재생시점 저장하고 불러오기
Test Case ID: FTC-07

***

### 8. 그룹 생성하기 - 웹페이지
Test Case ID: FTC-08

| Test Step                               | Test Data                    | Expected Result                 |
|:----------------------------------------|:-----------------------------|:--------------------------------|
| 사용자가 로그인 버튼을 눌러 에디터 페이지에 접속합니다.         | http://localhost:8000/editor | 페이지 좌측 네비게이션 바에서 가입한 그룹을 확인합니다. | 
| 그룹 생성버튼을 눌러 그룹이름, ID, Password를 입력합니다. | | 하단 네비게이션 바에 생성한 그룹이 보이는지 확인합니다.|

***

### 9. 그룹 가입하기 - 웹페이지
Test Case ID: FTC-09

| Test Step                               | Test Data                    | Expected Result                 |
|:----------------------------------------|:-----------------------------|:--------------------------------|
| 사용자가 로그인 버튼을 눌러 에디터 페이지에 접속합니다.         | http://localhost:8000/editor | 페이지 좌측 네비게이션 바에서 가입한 그룹을 확인합니다. | 
| 그룹 가입버튼을 눌러 그룹이름, ID, Password를 입력합니다. | | 하단 네비게이션 바에 가입한 그룹이 보이는지 확인합니다.|

***

### 10. 가입한 그룹 조회하기 - 웹페이지
Test Case ID: FTC-10

| Test Step                               | Test Data                    | Expected Result                 |
|:----------------------------------------|:-----------------------------|:--------------------------------|
| 사용자가 로그인 버튼을 눌러 에디터 페이지에 접속합니다.         | http://localhost:8000/editor | 페이지 좌측 네비게이션 바에서 가입한 그룹을 확인합니다. | 

***

### 11. 프로필 사진 저장, 불러오기 - 웹페이지
Test Case ID: FTC-11

| Test Step                               | Test Data                    | Expected Result                 |
|:----------------------------------------|:-----------------------------|:--------------------------------|
| 사용자가 로그인 버튼을 눌러 에디터 페이지에 접속합니다.         | http://localhost:8000/editor | 페이지 좌측 프로필 이미지가 잘 불러와지는지 확인합니다. |
| 프로필 업로드 버튼을 클릭하고 서버에 프로필 png파일을 업로드합니다. |                              | 사용자의 프로필 이미지를 화면에 출력합니다.        | 

***




## Back-End Test
백엔드 API의 검증은 Postman의 newman을 이용하여 Unit Test로 진행합니다.

***

### 1. 회원 관리
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/users/join | 회원가입 하기 | BTC01-1 | API의 응답 상태 코드가 200이면 pass | {"userId": "testid", "password": "123", "name": "testname", "email":"testemail@memouri.com"} |
| /api/users/ | 회원 탈퇴하기 | BTC01-2 | API의 응답 상태 코드가 200이면 pass | {"password": "123"} |
| /api/users/name | 회원 이름 변경하기 | BTC01-3 |  API의 응답 상태 코드가 200이면 pass | {"password": "123", "name": "testname"} |
| /api/users/email | 회원 이메일 변경하기 | BTC01-4 |  API의 응답 상태 코드가 200이면 pass | {"password": "123", "email": "testemail@memouri.com"} |

***

### 2. 인증
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/users/login | 로그인하기 | BTC02-1 | API의 응답 상태 코드가 200, cookie에 accessToken과 refreshToken이 저장되면 pass | {"userId": "testid", "password": "123"} |
| /api/users/logout | 로그아웃하기 | BTC02-2 | API의 응답 상태 코드가 200, cookie에서 accessToken과 refreshToken이 삭제되면 pass |  |


***

### 3. QRCode 인증
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/users/qrlogin | session ID 및 QRCode 발급 받기 | BTC03-1 | API의 응답 상태 코드가 200, json 형식으로 sessionId와 qrCodeDataURL을 전송받으면 pass | 없음 |
| /api/users/qrlogin/connect/:sessionId | 클라이언트(TV)로 SSE 통신 연결하기 | BTC03-2 | API응답 상태 코드가 200, header가 Access-Control-Allow-Origin: "*", Content-Type: "text/event-stream", Connection: "keep-alive", Cache-Control: "no-cache"를 포함하면 pass | url parameter : "648e1852d1b393fd58ce2e6110618332" |
| /api/users/qrlogin/:sessionId | QRCode로 로그인하고 TV로 SSE 통신으로 토큰 응답하기 | BTC03-3 | {"userId":"testid", "password":"123"} |
| /api/users/setCookie | accessToken과 refreshToken을 클라이언트의 쿠키에 담기 | BTC03-4 | API의 응답 상태 코드가 200, cookie에 accessToken과 refreshToken이 저장되면 pass | {"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiSldUIiwiaWQiOiJoeTg4MzkiLCJwYXNzd29yZCI6IjEyMyIsImlhdCI6MTcwMjI3NDI4MiwiZXhwIjoxNzAyMjc1MTgyLCJpc3MiOiJtZW1vdXJpIn0.8Y1DmcvdQkZJBQbIjE-teZljsnhQ7bcVcb4d0ACUb94", "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiSldUIiwiaWQiOiJoeTg4MzkiLCJwYXNzd29yZCI6IjEyMyIsImlhdCI6MTcwMjI3NDI4MiwiZXhwIjoxNzE3ODI2MjgyLCJpc3MiOiJtZW1vdXJpIn0.okQOzzIGBlBAtWGwpAhA4Q9uHrjx3Djh3L_NTRzVsrE"} |

***

### 4. 비디오 관리 및 인터렉션
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/videos/:id | 사용자가 업로드한 비디오 목록 조회하기 | BTC04-1 | 응답 상태 코드가 200, json 형식으로 video의 정보가 전송되면 pass | url parameter: "testid1702276725086" |
| /api/videos/list/:id | 그룹 전체 비디오 목록 조회하기 | BTC04-2 | 응답 상태 코드가 200, json 형식으로 video의 정보가 전송되면 pass | url parameter: "testid1702276725086" |
| /api/videos | 비디오 저장하기 | BTC04-3 | 응답 상태 코드가 200이면 pass, POST method | {"groupId":  "testgroup", "title": "testtitle", "desription": "test description"} |
| /api/videos | 비디오 삭제하기 | BTC04-4 | 응답 상태 코드가 200이면 pass, DELETE method | {"videoId": "testid1702276725086"} | 
| /api/videos/info/:videoId | 비디오 상세 정보 조회하기 | BTC04-5 | 응답 상태 코드가 200, json 형식으로 videoId, groupName,	String, title, like, view, lengthInSeconds, markInSeconds, createdAt, pinnedAt, likedAt 전송되면 pass | url parameter : "testid1702276725086" |
| /api/videos/pin/:id | 비디오 고정(Pin) 하기 | BTC04-6 | 응답 상태 코드가 200, json 형식으로 toggledTo 이 전송되면 pass | url parameter: "testid1702276725086" |
| /api/videos/like/:id | 비디오 좋아요 하기 | BTC04-7 | 응답 상태 코드가 200, json 형식으로 toggledTo 이 전송되면 pass | url parameter: "testid1702276725086" |
| /api/videos/title/:id | 비디오 제목 변경하기 | BTC04-8 | 응답 상태 코드가 200이면 pass | {"title": "testtitle"}, url parameter: "testid1702276725086" |
| /api/videos/description | 비디오 설명 변경하기 | BTC04-9 | 응답 상태 코드가 200이면 pass | {"description": "test description"} |

***

### 5. 비디오 스트리밍
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/videos/hls/:id | 비디오 스트리밍 요청하기 | BTC05-1 | 응답 상태 코드가 200, json 형식으로 path 전송되면 pass | url parameter: "testid1702276725086" |
| /api/videos/playback/:id | 비디오 재생 시점 불러오기 | BTC05-2 | 응답 상태 코드가 200이면 pass, GET method | url paramter: "testid1702276725086" |
| /api/videos/playback/:id | 비디오 재생 시점 저장하기 | BTC05-3 | 응답 상태 코드가 200이면 pass, PATCH method | {"stopTime": 0}, url parameter: "testid1702276725086" |

***

### 6. 썸네일
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/videos/thumbnail/:id | 썸네일 이미지 불러오기 | BTC06-1 | 응답 상태 코드가 200, 썸네일 이미지 파일이 fs.createReadStream()을 통해 스트리밍 방식으로 잘 전송되면 pass | url paramter: "testid1702276725086" |

***

### 7. 그룹 관리
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/groups/create | 그룹 생성하기 | BTC07-1 | 응답 상태 코드가 200이면 pass | {"groupId": "testgroup", "password":"123", "name":"testname"} |
| /api/groups/join | 그룹 가입하기 | BTC07-2 | 응답 상태 코드가 200, json 형식으로 groupName 전송되면 pass | {"groupId": "testgroup", "password":"123"} |
| /api/groups/list | 가입한 그룹 조회하기 | BTC07-3 | 응답 상태 코드가 200, json 형식으로 groups(가입한 그룹 ID array)가 전송되면 pass |  |
| /api/groups/master | 그룹 마스터 권한 양도하기 | BTC07-4 | 응답 상태 코드가 200이면 pass | {"userPassword": "123", "groupId": "testgroup", "groupPassword": "123", "newMasterId": "testid2" } |
| /api/groups | 그룹 삭제하기 | BTC07-5 | 응답 상태 코드가 200이면 pass | {"groupId": "testgroup", "Password": "123"} |
| /api/groups/leave | 그룹 탈퇴하기 | BTC07-6 | 응답 상태 코드가 200이면 pass | {"groupId": "testgroup", "Password": "123"} |


***

### 8. 프로필 관리
| API | Test Name | Test Case ID | Description | Test Data |
| :--- | :----------------- | :--- | :--- | :--- |
| /api/users/picture | 프로필 사진 저장하기 | BTC08-1 | 응답 상태 코드가 200이면 pass, POST method | {"image": "home/Desktop/test_image.png"} |
| /api/users/picture | 프로필 사진 불러오기 | BTC09-2 | 응답 상태 코드가 200이면 pass, GET method |  |
