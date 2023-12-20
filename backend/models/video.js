const mongoose = require("mongoose");

const { Types: { ObjectId } } = mongoose;

const VideoSchema = new mongoose.Schema({
  /** 비디오의 파일 이름
   *  이것은 서버에 저장된 비디오와 관련된 파일들의 '공통된' 이름을 저장하는 필드입니다
   *  파일 이름의 포맷은 "[업로더의 id] + [업로드 일시]"입니다
   *  예를 들어, 현재 시각을 나타내는 숫자가 12345이고, 사용자 아이디가 yushin이면,
   *  filename = yushin12345 입니다
   *  그러면 비디오는 yushin12345.mp4/.avi, ...
   *  썸네일 이미지는 yushin12345.png/.jpg, ...
   *  hls 스트리밍을 위한 파일은 yushin12345.m3u8 일 것입니다
   *  이 필드의 추가로 기존에 있던 videoPath, thumbnailPath는 삭제됩니다
   *  대신, 업로드된 비디오 원본의 확장자를 나타내는 ext가 파일 탐색을 위해 추가됩니다
   *  썸네일 이미지는 서버에서 생성하므로 동일한 확장자를 가지고 있어 확장자가 필요하지 않습니다
   */
  videoId: {
    type: String,       // 가변 문자열
    required: true,     // 값이 반드시 존재해야 한다
    unique: true,       // 값이 유일해야 한다(primary key)
  },

  // 원본 비디오의 확장자
  ext: {
    type: String,       // 가변 문자열
    required: true,     // 파일 시스템 탐색을 위해 값이 반드시 존재해야 한다
  },

  // 비디오를 업로드한 사용자
  uploader: {
    type: ObjectId,     // 업로더(User)의 _id
    required: true,     // 값이 반드시 존재해야 한다
    ref: "User",        // User 스키마를 참조한다
  },

  // 비디오가 소속되어 있는 그룹
  group: {
    type: ObjectId,     // 그룹(Group)의 _id
    required: true,     // 값이 반드시 존재해야 한다
    ref: "Group",       // Group 스키마를 참조한다
  },

  // 비디오 제목
  title: {
    type: String,       // 가변 문자열
    required: true,     // 값이 반드시 존재해야 한다
  },

  // 비디오 설명
  description: {
    type: String,       // 가변 문자열
  },

  // 비디오 좋아요 개수
  like: {
    type: Number,       // 0 이상의 정수
    default: 0,         // 기본값은 0 이다
  },

  // 비디오 조회수(스트리밍 수)
  view: {
    type: Number,       // 0 이상의 정수
    default: 0,         // 기본값은 0 이다
  },

  // 비디오 길이
  lengthInSeconds: {
    type: Number,       // 0 이상의 정수
    required: true,     // 값이 반드시 존재해야 한다
  },

}, {
  // 타임스탬프로 생성, 수정 날짜 저장
  timestamps: {
    createdAt: "createdAt",  // 다큐먼트 생성 날짜
    updatedAt: "updatedAt",  // 다큐먼트 수정 날짜
  },

});

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;