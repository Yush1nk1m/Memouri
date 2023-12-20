/*
사용자의 프로필 이미지를 나타내기 위한 스키마
1 user -> 1 picture & 1 picture -> 1 user (1:1 관계)
*/
const mongoose = require("mongoose");
const { Types: { ObjectId } } = mongoose;

const PictureSchema = new mongoose.Schema({
    // 프로필 이미지의 주인
    user: {
        type: ObjectId,     // 사용자 다큐먼트의 Object ID
        required: true,     // 이 다큐먼트가 생성됐다는 것은 어떤 사용자의 프로필 이미지가 생성됐다는 것이므로 주인이 반드시 필요하다
        unique: true,       // 1:1 관계이므로 이 필드는 유일해야 한다
        ref: "User",        // User 스키마를 참조한다
    },

    // 프로필 이미지의 확장자
    ext: {
        type: String,       // 가변 문자열
        required: true,     // 파일 시스템 탐색을 위해 필요하다
    },
});

const Picture = mongoose.model("Picture", PictureSchema);

module.exports = Picture;