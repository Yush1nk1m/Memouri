 LG전자의 요청으로 실제 작업이 진행된 리포지토리의 접근 권한은 private 처리되었습니다. 히스토리 정보가 필요하시다면 별도로 요청해 주시기 바랍니다. 백엔드에서 작업한 내용은 /backend, /docs 디렉터리에 포함되어 있습니다.

# Memouri (2023. 10. ~ 2023.12.) / 2인 / 3개월

![Logo](Memouri%20(2023%2011%20~%202023%2012%20)%20e81321af45754516bacb9c8811344dcb/6e07d2f2-4a92-431f-8bc8-3986ca0b15d2.png)

**역할:** 백엔드 개발

**아키텍처**

![Architecture](Memouri%20(2023%2011%20~%202023%2012%20)%20e81321af45754516bacb9c8811344dcb/Untitled.png)

**기술 스택**

- **Express.js:** API 서버의 신속한 프로토타이핑 및 효율적인 미디어 관리를 위해 사용
- **MongoDB + Mongoose:** 미디어 프로세싱 과정에서 유연한 스키마로 동영상의 메타데이터를 편리하게 관리하기 위해 MongoDB를 사용, RDBMS를 사용하지 않는 상황에서 데이터 일관성을 유지하기 위해 ODM으로 Mongoose를 사용
- **FFMPEG + fluent-ffmpeg:** 미디어 프로세싱을 위해 FFMPEG을 사용, 파이프라인 구축 시 Node.js와의 통합을 위해 추상화된 라이브러리인 fluent-ffmpeg을 사용

**프로젝트 기여 내용**

- 데이터베이스 및 전체적인 REST API 서버 로직을 설계하고 구현하여 사실상 1인 백엔드 개발을 수행하였고, 개발한 내용을 문서화하여 작업 효율을 개선함
- 동영상 미디어 데이터를 Adaptive live streaming으로 사용자에게 전달하고 동적인 썸네일을 제공할 수 있도록 HLS segmentation과 썸네일 추출을 수행하는 미디어 프로세싱 파이프라인을 구축함
- 협업의 부재로 서비스를 클라우드 환경에 배포하지 못했지만 프론트엔드 웹 앱과 백엔드 서버 간 LAN을 활용하여 동일한 네트워크 내에서 사설 IP 주소를 통해 통신하게 하여 서비스 테스트 및 시연에 성공함
