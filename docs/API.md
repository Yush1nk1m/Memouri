# REST API 문서

Memouri 서비스의 REST API에 대한 정보를 제공하는 문서입니다. 이 API는 클라이언트의 정보 저장, 삭제 및 변경, 인증 관리, 비디오 관리, 그룹 관리 및 프로필 관리 등의 기능을 포함하며, 해당 API에 대한 설명과 request, parameter, response, status 에 대해 설명합니다.

***

## 목차
### 1. [회원 관리](#1-회원-관리)
- [회원 가입하기](#11-회원-가입하기)
- [회원 탈퇴하기](#12-회원-탈퇴-요청하기)
- [회원 이름 변경하기](#13-회원-이름-변경하기)
- [회원 이메일 변경하기](#14-회원-이메일-변경하기)
### 2. [인증](#2-인증)
- [로그인 하기](#21-로그인하기)
- [로그아웃 하기](#22-로그아웃하기)
### 3. [QRCode 인증](#3-qrcode-인증)
- [QRCode 발급받기](#31-qrcode-발급-받기)
- [SSE 통신 연결하기](#32-sseserver-sent-event-통신-연결하기)
- [QRCode 로그인하기](#33-qrcode로-로그인하기)
- [토큰 쿠키에 담기](#34-토큰-쿠키에-담기)
### 4. [비디오 관리 및 인터렉션](#4-비디오-관리-및-인터렉션)
- [사용자가 업로드한 비디오 목록 조회하기](#41-사용자가-업로드한-비디오-목록-조회하기)
- [그룹 전체 비디오 목록 조회하기](#42-그룹-전체-비디오-목록-조회하기)
- [비디오 저장하기](#43비디오-저장하기)
- [비디오 삭제하기](#44비디오-삭제하기)
- [비디오 상세 정보 조회하기](#45-비디오-상세-정보-조회하기)
- [비디오 고정하기](#46-비디오-고정하기)
- [비디오 좋아요하기](#47-비디오-좋아요하기)
- [비디오 제목 변경하기](#48-비디오-제목-변경하기)
- [비디오 설명 변경하기](#49-비디오-설명-변경하기)
### 5. [비디오 스트리밍](#5-비디오-스트리밍)
- [비디오 스트리밍 요청하기](#51-비디오-스트리밍-요청하기)
- [비디오 재생시점 불러오기](#52-비디오-재생-시점-불러오기)
- [비디오 재생시점 저장하기](#53-비디오-재생-시점-저장하기)
### 6. [썸네일](#6-썸네일-이미지-불러오기)
- [썸네일 이미지 불러오기](#6-썸네일-이미지-불러오기)
### 7. [그룹 관리](#7-그룹-관리)
- [그룹 생성하기](#71-그룹-생성하기)
- [그룹 가입하기](#72-그룹-가입하기)
- [가입한 그룹 조회하기](#73-가입한-그룹-조회하기)
- [그룹 마스터 권한 양도하기](#74-그룹-마스터-권한-양도하기)
- [그룹 삭제하기](#75-그룹-삭제하기)
- [그룹 탈퇴하기](#76-그룹-탈퇴하기)
### 8. [프로필 관리](#8-프로필-관리)
- [프로필 사진 저장하기](#81-프로필-사진-저장하기)
- [프로필 사진 불러오기](#82-프로필-사진-불러오기)

***

## 1. 회원 관리
클라이언트의 정보를 저장하거나 삭제, 변경하는 API입니다.

### 1.1. 회원 가입하기
클라이언트가 회원가입 버튼을 클릭했을 때 클라이언트로부터 받은 회원 정보를 User 스키마에 저장합니다.
#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MJ-01 | /api/users/join | http://localhost:4000 | POST |

#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| userId | String | 사용자의 ID | TRUE |
| password | String | 사용자의 비밀번호  | TRUE |
| name | String | 사용자의 이름 | FALSE |
| email | String | 사용자의 이메일 | FALSE |

#### Response
상태 코드를 반환합니다.

#### Status
- 200: 성공
- 407: 이미 존재하는 userId
- 500: 서버 에러 발생

___

### 1.2. 회원 탈퇴 요청하기
클라이언트가 회원 탈퇴 버튼을 클릭했을 때 User 스키마에서 해당 클라이언트의 저장된 정보를 삭제하고 해당 클라이언트가 업로드한 비디오 또한 Video 스키마에서 삭제합니다.

#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MJ-02 | /api/users/ | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| password | String | 사용자의 비밀번호 | TRUE |

#### Response

상태 코드를 응답합니다.

#### Status

- 200: 성공
- 402: 올바르지 않은 사용자 비밀번호
- 403: 사용자가 아직 어떤 그룹의 마스터로 존재하고 있음
- 500: 서버 에러 발생

___

### 1.3. 회원 이름 변경하기
클라이언트가 회원 이름 변경하기 버튼을 클릭했을 때 User 스키마에서 해당 클라이언트의 저장된 이름을 변경합니다.

#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MJ-03 | /api/users/name | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| password | String | 사용자의 비밀번호 | TRUE |
| name | String | 사용자의 새 이름 | TRUE |

#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 402: 올바르지 않은 사용자 비밀번호
- 500: 서버 에러 발생

___

### 1.4. 회원 이메일 변경하기
클라이언트가 회원 이메일 변경하기 버튼을 클릭했을 때 User 스키마에서 해당 클라이언트의 저장된 이메일을 변경합니다.

#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MJ-04 | /api/users/email | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| password | String | 사용자의 비밀번호 | TRUE |
| email | String | 사용자의 새 이메일 | TRUE |

#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 402: 올바르지 않은 사용자 비밀번호
- 500: 서버 에러 발생

***

## 2. 인증
클라이언트의 신원을 확인하고 시스템에 접근 권한을 관리하는 API입니다.

### 2.1. 로그인하기
클라이언트가 로그인 버튼을 클릭했을 때 클라이언트로부터 받은 userId, password를 User 스키마에서 검증합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MA-1 | /api/users/login | http://localhost:4000 | POST |

#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| userId | String | 사용자의 ID | TRUE |
| password | String | 사용자의 비밀번호  | TRUE |

#### Response
응답은 다음과 같은 쿠키를 설정합니다.

- `accessToken`: 사용자의 인증을 확인하는 토큰입니다. 이 쿠키는 HTTP 통신만 가능하며 (`httpOnly: true`), 클라이언트 측에서는 접근할 수 없습니다. 이 토큰은 일반적으로 사용자가 인증된 상태를 유지하는 데 사용되며 유효 기간은 15분입니다.

- `refreshToken`: `accessToken`이 만료되었을 때 새로운 `accessToken`을 받기 위해 사용되는 토큰입니다. 이 쿠키도 HTTP 통신만 가능하며 (`httpOnly: true`), 클라이언트 측에서는 접근할 수 없습니다. `refreshToken`은 `accessToken`보다 더 긴 24시간의 유효 기간을 가집니다.

#### Status
- 200: 성공
- 401: 등록되지 않은 userId
- 402: 올바르지 않은 password
- 500: 서버 에러 발생

___

### 2.2 로그아웃하기
클라이언트가 로그아웃 버튼을 클릭했을 때 현재 클라이언트가 로그인 세션을 종료하는 API입니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MA-2 | /api/users/logout | http://localhost:4000 | GET |


#### Parameter
파라미터가 없습니다.

#### Response

응답은 클라이언트의 브라우저에서 다음 쿠키들을 삭제합니다:

- `accessToken`: 사용자의 인증 정보를 담고 있는 쿠키입니다. 이 응답은 `accessToken` 쿠키를 클라이언트에서 제거합니다.
- `refreshToken`: 사용자의 세션을 유지하기 위해 사용되는 쿠키입니다. 이 응답은 `refreshToken` 쿠키를 클라이언트에서 제거합니다.


#### Status
- 200: 성공
- 500: 서버 에러 발생

  
***

## 3. QRCode 인증
클라이언트가 QRCode를 이용해서 인증하는 경우를 관리하는 API입니다.

### 3.1. QRCode 발급 받기
클라이언트가 QRCode로 로그인 버튼을 클릭할 때 3분 동안 지속되는 session ID 와 QRCode date url을 응답합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MA-2 | /api/users/qrlogin | http://localhost:4000 | GET |


#### Parameter
파라미터가 없습니다.

#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| sessionId | String | 해당 QRCode로 로그인하는 유저를 식별하기 위한 id |
| qrCodeDataURL | String | 발급된 QRCode | 

#### Status
- 200: 성공
- 500: 서버 에러 발생

___

### 3.2. SSE(Server-Sent-Event) 통신 연결하기
QRCode로 접속한 모바일 기기로 로그인 성공 시 클라이언트(TV)로 accessToken과 resfreshToken을 응답하기 위해 SSE 통신을 연결합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MQ-2 | /api/users/qrlogin/connect/:sessionId | http://localhost:4000 | GET |


#### Parameter
URL 파라미터입니다.
- `sessionId`: QR 로그인 연결을 위한 고유 세션 식별자로 사용자의 로그인 세션을 구별하기 위해 사용됩니다.


#### Response

응답은 다음과 같은 HTTP 헤더를 포함합니다:

- `Access-Control-Allow-Origin: "*"`: 이 헤더는 CORS(Cross-Origin Resource Sharing) 정책을 설정합니다. `"*"` 값은 모든 도메인에서의 요청을 허용한다는 것을 의미합니다.

- `Content-Type: "text/event-stream"`: 이 헤더는 응답의 콘텐츠 유형을 지정합니다. `text/event-stream`은 SSE를 위한 MIME 타입으로, 클라이언트에게 실시간 데이터를 스트리밍할 때 사용됩니다.

- `Connection: "keep-alive"`: 이 헤더는 네트워크 연결을 지속적으로 유지하며, 서버와 클라이언트 간의 지속적인 데이터 교환을 가능하게 합니다. 

- `Cache-Control: "no-cache"`: 이 헤더는 캐싱 정책을 설정합니다. `no-cache`는 응답이 캐시되지 않아야 함을 나타냅니다.


응답은 SSE 프로토콜을 따르는 데이터 스트림으로 구성됩니다. 이 데이터는 실시간으로 클라이언트(TV)에게 전송됩니다.

#### Status
- 200: 성공
- 500: 서버 에러 발생

___

### 3.3. QRCode로 로그인하기
QRCode로 접속한 모바일 기기로 로그인 버튼을 클릭했을 때 클라이언트(TV)로 accessToken과 resfreshToken을 SSE 통신으로 응답합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MQ-3 | /api/users/qrlogin/:sessionId | http://localhost:4000 | POST |


#### Parameter
URL 파라미터:
- `sessionId`: QR 로그인 연결을 위한 고유 세션 식별자로 사용자의 로그인 세션을 구별하기 위해 사용됩니다.

body 파라미터:
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| userId | String | 사용자의 ID | TRUE |
| password | String | 사용자의 비밀번호  | TRUE |



#### Response
Server-Sent Events 프로토콜을 사용하여 실시간 데이터 스트림을 제공합니다. 각 이벤트는 다음 형식을 따릅니다:

- `event`: 이벤트의 유형으로 `"QR"`로 설정되어 있습니다.
- `data`: 전송되는 데이터를 포함하며, JSON 형식의 문자열입니다. 이 데이터는 `"message0"`, `"message1"`, `"message2"`라는 세 개의 키를 가지며, 각각 `sessionId_`, `accessToken_`, `refreshToken_`의 값을 포함합니다.


#### Status
- 200: 로그인 성공
- 401: 등록되지 않은 id
- 402: 올바르지 않은 password
- 404: 유효하지 않은 sessionId
- 500: 서버 내부 에러


___

### 3.4. 토큰 쿠키에 담기
클라이언트로부터 받은 accessToken과 refreshToken을 쿠키로 설정하고 응답합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MQ-4 | /api/users/setCookie | http://localhost:4000 | POST |


#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| accessToken | String | 액세스 토큰 | TRUE |
| refreshToken | String | 리프레쉬 토큰 | TRUE |



#### Response
## 응답 형식

응답은 클라이언트의 브라우저에 다음 쿠키를 설정합니다:

- `accessToken`: 사용자 인증을 위한 토큰입니다. `httpOnly: true` 옵션으로 설정되어, 이 쿠키는 클라이언트 측에서 접근할 수 없습니다.
- `refreshToken`: 액세스 토큰이 만료된 경우 새 토큰을 생성하는 데 사용되는 토큰입니다. 이 쿠키도 `httpOnly: true`로 설정되어, 클라이언트 측에서 접근할 수 없습니다.


#### Status
- 200: 로그인 성공
- 500: 서버 내부 에러

***

## 4. 비디오 관리 및 인터렉션
클라이언트가 특정 그룹에 업로드한 비디오 목록을 조회하거나 그룹 전체의 비디오 목록을 조회하는 API입니다.

### 4.1. 사용자가 업로드한 비디오 목록 조회하기
클라이언트가 그룹 ID를 통해 특정 그룹에 해당 클라이언트가 업로드한 모든 비디오 목록을 조회합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-01 | /api/videos/:id | http://localhost:4000 | GET |

#### Parameter
URL Parameter:
- `id`: 그룹의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| videos | Json | videoId, title, description, like, view, lengthInSeconds, markInSeconds, createdAt, pinnedAt, likedAt |

#### Status
- 200: 성공 (비디오 데이터가 없으면 빈 배열 반환)
- 411: 등록되지 않은 groupId
- 499: 접근 권한 위반
- 500: 서버 에러 발생

___

### 4.2. 그룹 전체 비디오 목록 조회하기
클라이언트가 특정 그룹의 모든 비디오 목록을 조회합니다. 

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-02 | /api/videos/list/:id | http://localhost:4000 | GET |



#### Parameter
URL Parameter:
- `id`: 그룹의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| videos | Json | videoId, title, description, like, view, lengthInSeconds, markInSeconds, createdAt, pinnedAt, likedAt |

#### Status
- 200: 성공 (비디오 데이터가 없으면 빈 배열 반환)
- 411: 등록되지 않은 groupId
- 499: 접근 권한 위반
- 500: 서버 에러 발생

___

### 4.3.비디오 저장하기
클라이언트가 특정 그룹에 비디오를 업로드하고 저장합니다. 비디오 업로드 폼의 파일 필드 이름은 반드시 `video`로 설정해야 합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-03 | /api/videos/ | http://localhost:4000 | POST |



#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| groupId | String | 그룹 ID | TRUE |
| title | String | 비디오 제목 | TRUE |
| description | String | 비디오 설명 | FALSE |


#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 403: 비디오 메타데이터 추출 실패
- 405: 썸네일 추출 중 오류 발생
- 406: 데이터베이스에 비디오 저장 실패
- 411: 등록되지 않은 groupId
- 499: 접근 권한 위반(사용자가 그룹에 가입되어 있지 않은 경우)
- 500: 서버 내부 에러

___

### 4.4.비디오 삭제하기
클라이언트가 특정 비디오를 삭제합니다. 비디오 삭제는 해당 비디오의 업로더나 그룹의 마스터만 수행할 수 있습니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-04 | /api/videos/ | http://localhost:4000 | DELETE |



#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| videoId | String | 비디오 ID | TRUE |


#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 409: 해당 동영상 존재하지 않음
- 499: 접근 권한 위반(업로더 또는 그룹의 마스터가 아닌 경우)
- 500: 서버 내부 에러

___

### 4.5. 비디오 상세 정보 조회하기
클라이언트가 특정 비디오의 상세 정보를 조회합니다. 

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-05 | /api/videos/info/:videoId | http://localhost:4000 | GET |



#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- |
| videoId | String | 동영상의 고유 식별자 |
| groupName | String | 동영상이 속한 그룹의 이름 |
| title  | String | 동영상의 제목 |
| like | Number | 동영상에 대한 좋아요 개수 |
| view | Number | 동영상의 조회수 |
| lengthInSeconds | Number | 동영상의 길이(초 단위) |
| markInSeconds | Number | 비디오 재생 지점(초 단위) |
| createdAt | String | 동영상의 업로드 일시 |
| pinnedAt | String | 동영상이 핀(고정)된 일시 |
| likedAt | String | 동영상에 좋아요를 표시한 일시 |


#### Status
- 200: 성공
- 409: 데이터베이스에 비디오가 존재하지 않음
- 499: 접근 권한 위반(사용자가 그룹에 가입되어 있지 않은 경우)
- 500: 서버 내부 에러

___

### 4.6. 비디오 고정하기
클라이언트가 특정 비디오를 핀(고정)하거나 언핀(고정 해제)합니다. 동영상이 이미 핀된 상태이면 언핀 처리하고, 핀되지 않은 상태이면 핀 처리합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-06 | /api/videos/pin/:id | http://localhost:4000 | PATCH |



#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- |
| toggledTo | String | pin/unpin 상태 |



#### Status
- 200: 성공
- 409: 데이터베이스에 비디오가 존재하지 않음
- 499: 접근 권한 위반(사용자가 그룹에 가입되어 있지 않은 경우)
- 500: 서버 내부 에러

___


### 4.7. 비디오 좋아요하기
클라이언트가 특정 비디오를 '좋아요'하거나 '좋아요 취소'합니다. 좋아요가 이미 표시된 경우에는 좋아요를 취소하고, 표시되지 않은 경우에는 좋아요를 표시합니다.

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-07 | /api/videos/like/:id | http://localhost:4000 | PATCH |



#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- |
| toggledTo | String | like/unlike 상태 |



#### Status
- 200: 성공
- 409: 데이터베이스에 동영상 존재하지 않음
- 499: 접근 권한 위반(사용자가 속한 그룹의 동영상이 아닌 경우)
- 500: 서버 내부 에러

___

### 4.8. 비디오 제목 변경하기
클라이언트가 특정 비디오의 제목을 변경합니다. 제목 변경은 해당 비디오의 업로더만 수행할 수 있습니다.
#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-08 | /api/videos/title/:id | http://localhost:4000 | PATCH |
#### Parameter
URL Parameter:

- `id`: 비디오의 id입니다.

BODY Parameter:

___

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| title | String | 비디오의 새 제목 | TRUE |

#### Response
상태코드로 응답합니다.
#### Status
- 200: 성공
- 409: 데이터베이스에 동영상 존재하지 않음
- 499: 접근 권한 위반(업로더와 제목을 수정하는 사람이 불일치)
- 500: 서버 내부 에러

___

### 4.9. 비디오 설명 변경하기
클라이언트가 특정 비디오의 설명을 Video 스키마에서 변경합니다. 

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MV-09 | /api/videos/description | http://localhost:4000 | PATCH |
#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| description | String | 비디오의 새 설명 | TRUE |

#### Response

상태코드로 응답합니다.

#### Status
- 200: 성공
- 500: 서버 내부 에러


***
  
## 5. 비디오 스트리밍
비디오 스트리밍과 관련된 기능들인 HLS를 통한 실시간 스트리밍, 비디오의 재생 시점 조회 및 저장을 다루는 API입니다. 

### 5.1. 비디오 스트리밍 요청하기
HLS(High Efficiency Streaming Protocol)를 사용하여 실시간 비디오 스트리밍을 제공합니다. m3u8 마스터 플레이리스트 파일의 경로를 반환합니다. 서버에서 encodeURIComponent로 주소를 인코딩하여 보내주기 때문에 클라이언트 측에서 decodeURIComponent로 디코딩해야 합니다

#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MS-01 | /api/videos/hls/:id | http://localhost:4000 | GET |

#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| path | String | m368 파일이 저장된 경로 |


#### Status
- 200: 성공
- 409: 데이터베이스에 동영상 존재하지 않음
- 499: 접근 권한 위반(사용자가 그룹에 가입되어 있지 않은 경우)
- 500: 서버 내부 에러

___

### 5.2. 비디오 재생 시점 불러오기
클라이언트가 시청하려는 비디오의 재생 시점을 조회합니다. 이전에 시청을 중단한 시점을 기억하고 다시 시청할 때 해당 시점부터 시작할 수 있도록 합니다.(Playback)


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MS-02 | /api/videos/playback/:id | http://localhost:4000 | GET |

#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 409: 데이터베이스에 동영상 존재하지 않음
- 499: 접근 권한 위반(사용자가 그룹에 가입되어 있지 않은 경우)
- 500: 서버 내부 에러

___

### 5.3. 비디오 재생 시점 저장하기
클라이언트가 시청을 종료한 동영상의 재생 시점을 저장합니다.


#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MS-03 | /api/videos/playback/:id | http://localhost:4000 | PATCH |

#### Parameter

URL Parameter:
- `id`: 비디오의 id입니다.

  
BODY Parameter:


| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| stopTime | Int | 시청을 중단한 시점의 타임스탬프(초 단위)| TRUE |


#### Response
상태 코드를 응답합니다.

#### Status
- 200: 성공
- 409: 데이터베이스에 동영상 존재하지 않음
- 500: 서버 내부 에러


***

## 6. 썸네일 이미지 불러오기
특정 비디오의 썸네일 이미지를 스트리밍 방식으로 제공하는 API입니다.응답은 Node.js의 fs.createReadStream()을 사용하여 스트림으로 전송됩니다.


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MT-01 | /api/videos/thumbnail/:id | http://localhost:4000 | GET |

#### Parameter
URL Parameter:
- `id`: 비디오의 id입니다.


#### Response
응답은 Node.js의 fs.createReadStream()을 사용하여 스트림으로 전송됩니다. 이를 통해 서버는 썸네일 이미지 파일을 스트리밍 방식으로 클라이언트에 전송합니다. 클라이언트는 fetch 함수를 사용하여 이 스트림을 GET 요청으로 요청하고, 응답으로 스트림을 받습니다.

클라이언트는 다음과 같은 방식으로 요청을 보내야 합니다: 

```
fetch('/api/videos/thumbnail/${videoId}')
```

서버는 스트림 형식으로 썸네일 이미지를 전송하며, 클라이언트는 이 스트림을 받아서 처리합니다.

예시:
```
fetch(`/api/videos/thumbnail/${videoId}`)
  .then(response => {
    // 스트림 처리 로직
  });

```


#### Status
- 200: 성공
- 408: 스트림 전송 중 오류 발생
- 409: 데이터베이스에 비디오가 존재하지 않음
- 410: 파일 시스템에 파일이 존재하지 않음
- 499: 접근 권한 위반(사용자가 가입되어 있지 않은 그룹의 동영상인 경우)
- 500: 서버 내부 에러


***

## 7. 그룹 관리
새로운 그룹을 생성하거나 기존 그룹에 가입, 속한 그룹의 목록을 조회하는 그룹 관련 기능의 API입니다.
---
### 7.1. 그룹 생성하기
클라이언트가 새로운 그룹을 생성합니다. 


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-01 | /api/groups/create | http://localhost:4000 | POST |


#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| groupId | String | 그룹 ID | TRUE |
| password | String | 그룹 비밀번호 | TRUE |
| name | String | 그룹 이름 | TRUE |



#### Response
상태 코드를 반환합니다.


#### Status
- 200: 성공
- 412: 중복된 groupId 존재
- 500: 서버 내부 에러

___

### 7.2. 그룹 가입하기
클라이언트가 특정 그룹에 가입합니다. 이 때 그룹 ID와 그룹 비밀번호가 필요합니다.


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-02 | /api/groups/join | http://localhost:4000 | POST |


#### Parameter
| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| groupId | String | 그룹 ID | TRUE |
| password | String | 그룹 비밀번호 | TRUE |


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| groupName | String | 그룹 이름 |


#### Status
- 200: 성공
- 411: 등록되지 않은 그룹 ID
- 413: 그룹 비밀번호 불일치
- 414: 사용자가 이미 그룹에 가입됨
- 500: 서버 내부 에러

___

### 7.3. 가입한 그룹 조회하기
클라이언트가 속한 모든 그룹의 리스트를 제공합니다. 응답으로 그룹 멤버쉽 정보를 가집니다.


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-03 | /api/groups/list | http://localhost:4000 | GET |


#### Parameter
파라미터가 없습니다.


#### Response
| Name | Type | Description | 
| :--- | :--- | :--- | 
| groups | array | "groupId": "그룹ID1", "groupName": "그룹이름1" |

보충 설명:

아래와 같이 사용자가 속한 그룹의 ID(groupId)와 이름(groupName)을 포함하는 Json 객체 배열을 반환합니다.

  { "groupId": "그룹ID1", "groupName": "그룹이름1" },
  
  { "groupId": "그룹ID2", "groupName": "그룹이름2" }
  
  ...


#### Status
- 200: 성공
- 500: 서버 내부 에러

___

### 7.4. 그룹 마스터 권한 양도하기
클라이언트가 특정 그룹의 마스터 권한을 양도합니다.


#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-04 | /api/groups/master | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| userPassword | String | 유저 비밀번호 | TRUE |
| groupId | String | 그룹 ID | TRUE |
| groupPassword | String | 그룹 비밀번호 | TRUE |
| newMasterId | String | 그룹의 새 마스터 | TRUE |

#### Response
상태 코드로 응답합니다.

#### Status
- 200: 성공
- 401: 등록되지 않은 사용자(newMaster)
- 402: 올바르지 않은 사용자 비밀번호
- 411: 등록되지 않은 그룹
- 413: 그룹 비밀번호 불일치
- 499: 접근 권한 위반(요청한 사용자가 그룹의 마스터가 아님)
- 500: 서버 에러 발생

___

### 7.5. 그룹 삭제하기
클라이언트가 특정 그룹의 삭제를 요청했을 때 Group 스키마에서 해당 그룹의 정보를 삭제합니다. 

#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-05 | /api/groups | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| groupId | String | 그룹 ID | TRUE |
| Password | String | 그룹 비밀번호 | TRUE |

#### Response
상태 코드로 응답합니다.

#### Status
- 200: 성공
- 411: 등록되지 않은 그룹 id
- 413: 그룹 비밀번호 불일치
- 499: 접근 권한 위반(요청한 사용자가 그룹의 마스터가 아님)
- 500: 서버 에러 발생


___

### 7.6. 그룹 탈퇴하기
클라이언트가 특정 그룹에서 탈퇴를 요청했을 때 GroupUser 스키마에서 해당 클라이언트의 정보를 삭제하고 Video 스키마에서 해당 클라이언트가 업로드한 비디오들 또한 삭제합니다.

#### Request

| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MG-05 | /api/groups/leave | http://localhost:4000 | POST |

#### Parameter

| Name | Type | Description | Required |
| :--- | :--- | :--- | :--- |
| groupId | String | 그룹 ID | TRUE |
| Password | String | 그룹 비밀번호 | TRUE |

#### Response
상태 코드로 응답합니다.

#### Status
- 200: 성공
- 402: 사용자 비밀번호 불일치
- 403: 사용자가 그룹의 마스터임(탈퇴 불가, 그룹을 삭제하거나 권한을 양도해야 함)
- 405: 사용자가 그룹에 가입되어 있지 않음
- 411: 등록되지 않은 그룹
- 500: 서버 에러 발생


___

## 8. 프로필 관리
클라이언트의 프로필 사진을 저장하거나 불러오는 API입니다.
---
### 8.1. 프로필 사진 저장하기
클라이언트의 프로필 사진을 저장합니다. 사진 업로드 폼에서 파일 필드의 name은 반드시 image로 설정해야 하며 폼 데이터 타입은 멀티파트로 보내야 합니다.


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MP-01 | /api/users/picture | http://localhost:4000 | POST |


#### Parameter
image (File): 

파일 업로드를 위한 필드입니다. 반드시 이 이름("image")으로 설정되어야 합니다.

폼 데이터 타입 설정: 

요청 데이터는 멀티파트(Multipart) 폼 데이터로 보내야 합니다. 폼 데이터 타입은 enctype="multipart/form-data"로 설정되어야 합니다.

요청 시 예시:
```
const formData = new FormData();
formData.append("image", file);
axios.post("http://localhost:4000/api/users/picture", formData);

```

#### Response
상태 코드를 반환합니다.


#### Status
- 200: 성공
- 500: 서버 내부 에러


___

### 8.2. 프로필 사진 불러오기
클라이언트의 프로필 사진을 불러옵니다. 프로필 사진은 URL을 통해 직접 접근할 수 있으며, <img> 태그를 사용하여 표시할 수도 있습니다.


#### Request
| ID | URL | HOST | METHOD |
| :--- | :--- | :--- | :--- |
| MP-02 | /api/users/picture | http://localhost:4000 | GET |


#### Parameter
파라미터가 없습니다.


#### Response
상태 코드를 반환합니다.


#### Status
- 200: 성공
- 408: 스트림 전송 중 오류 발생
- 415: 파일 시스템에 프로필 이미지가 존재하지 않음
- 416: 데이터베이스에 프로필 이미지가 등록되지 않음
- 500: 서버 내부 에러
  
***

