const mongoose = require("mongoose");

const { Types: { ObjectId } } = mongoose;

const GroupSchema = new mongoose.Schema({
    // 그룹의 운영자
    master: {
        type: ObjectId,         // 운영자(User)의 _id
        required: true,         // 값이 반드시 존재해야 한다
        ref: "User",            // User 스키마를 참조한다
    },

    // 그룹의 아이디
    groupId: {
        type: String,           // 가변 문자열
        required: true,         // 값이 반드시 존재해야 한다
    },

    // 그룹의 비밀번호
    password: {
        type: String,           // 가변 문자열
        required: true,         // 값이 반드시 존재해야 한다
    },

    // 그룹의 이름
    name: {
        type: String,
        required: true,
    },
}, {
    // 타임스탬프로 생성, 수정 날짜 저장
    timestamps: {
        createdAt: "createdAt",    // 다큐먼트 생성 날짜
        updatedAt: "updatedAt",    // 다큐먼트 수정 날짜
    },      
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;