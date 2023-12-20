/*
동영상(Video)과 사용자(User) 간의 다대다 관계를 정의한 스키마
어떤 동영상에 대한 사용자 개개인의 정보를 나타낸다
예를 들어 사용자마다 다음과 같은 차이가 있을 수 있다
1. 어떤 사용자는 동영상을 고정했고 다른 사용자는 고정하지 않았을 수 있다(pinnedAt)
2. 어떤 사용자는 동영상에 좋아요 표시를 했고 다른 사용자는 표시하지 않았을 수 있다(likedAt)
3. 어떤 사용자는 동영상을 10초까지 보았고, 다른 사용자는 20초까지 보았을 수 있다(markInSeconds)
*/
const mongoose = require("mongoose");

const { Types: { ObjectId } } = mongoose;

const UserVideoSchema = new mongoose.Schema({
    // 사용자 정보
    user: {
        type: ObjectId,     // 사용자(User)의 _id
        required: true,     // 값이 반드시 존재해야 한다
        ref: "User",        // User 스키마를 참조한다
    },

    // 동영상 정보
    video: {
        type: ObjectId,     // 동영상(Video)의 _id
        required: true,     // 값이 반드시 존재해야 한다
        ref: "Video",       // Video 스키마를 참조한다
    },

    // 사용자가 동영상을 고정했는지 나타내는 필드
    pinnedAt: {
        type: Date,         // 날짜 형식
        default: null,      // null 값을 가지면 고정하지 않은 것이다
    },

    // 사용자가 동영상에 좋아요 표시를 했는지 나타내는 필드
    likedAt: {
        type: Date,         // 날짜 형식
        default: null,      // null 값을 가지면 좋아요 표시를 하지 않은 것이다
    },

    // 사용자가 동영상을 이어보기 시작할 시간을 나타내는 필드
    markInSeconds: {
        type: Number,       // 초 단위(0 이상의 정수)
        default: 0,         // 기본적으로 0초 시점부터 본다
    },
});

const UserVideo = mongoose.model("UserVideo", UserVideoSchema);

module.exports = UserVideo;