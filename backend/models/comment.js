const mongoose = require("mongoose");

const { Types: { ObjectId } } = mongoose;

const CommentSchema = new mongoose.Schema({
    // 댓글을 단 사용자
    commenter: {
        type: ObjectId,     // 사용자(User)의 _id
        required: true,     // 값이 반드시 존재해야 한다
        ref: "User",        // User 스키마를 참조한다
    },

    // 댓글이 달린 동영상
    video: {
        type: ObjectId,     // 동영상(Video)의 _id
        required: true,     // 값이 반드시 존재해야 한다
        ref: "Video",
    },

    // 댓글 내용
    content: {
        type: String,       // 가변 문자열
        required: true,     // 값이 반드시 존재해야 한다
    },

    // 댓글 좋아요 개수
    like: {
        type: Number,       // 0 이상의 정수
        default: 0,         // 기본 값은 0 이다
    },
}, {
    // 타임스탬프로 생성/수정 일시 저장
    timestamps: {
        createdAt: "createdAt",     // 다큐먼트 생성 일시
        updatedAt: "updatedAt",     // 다큐먼트 수정 일시
    },
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;