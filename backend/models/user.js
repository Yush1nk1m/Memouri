const mongoose = require("mongoose");
const { Types: { ObjectId } } = mongoose;

const UserSchema = new mongoose.Schema({
  // 사용자 아이디 다큐먼트
  userId: {
    type: String,     // 가변 문자열
    required: true,   // 값이 반드시 존재해야 한다
    unique: true,     // 값은 고유해야 한다
  },

  // 비밀번호 다큐먼트
  password: {
    type: String,     // 가변 문자열
    required: true,   // 값이 반드시 존재해야 한다
  },

  // 사용자 이름 다큐먼트
  name: {
    type: String,     // 가변 문자열
  },

  // 사용자 이메일 다큐먼트
  email: {
    type: String,     // 가변 문자열
  },

  // 프로필 이미지 컬렉션과 1:1 관계로 매핑됨
  picture: {
    type: ObjectId,   // 프로필 이미지 다큐먼트의 Object ID
    required: false,  // 사용자가 프로필 이미지를 갖지 않을 수도 있으므로 이 필드가 존재하지 않을 수도 있다
    ref: "Picture",   // Picture 스키마를 참조한다
    default: null,    // 기본적으로 프로필 이미지는 없는 상태이다
  },

}, {

  // 타임스탬프로 생성, 수정 날짜 저장
  timestamps: {
    createdAt: "createdAt",    // 다큐먼트 생성 날짜
    updatedAt: "updatedAt",    // 다큐먼트 수정 날짜
  },

});

const User = mongoose.model("User", UserSchema);

module.exports = User;