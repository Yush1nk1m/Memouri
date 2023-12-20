/*
Group과 User의 다대다 관계를 나타내기 위한 스키마

1. 특정 사용자가 어떤 그룹들에 속해 있는지 찾을 때
2. 특정 그룹에 어떤 사용자들이 존재하고 있는지 찾을 때
*/
const mongoose = require("mongoose");

const { Types: { ObjectId } } = mongoose;

const GroupUserSchema = new mongoose.Schema({
    // 그룹 정보
    group: {
        type: ObjectId,     // 그룹(Group)의 _id
        required: true,
        ref: "Group",       // Group 스키마를 참조한다
    },

    // (그룹에 속한) 사용자 정보
    user: {
        type: ObjectId,     // 사용자(User)의 _id
        required: true,
        ref: "User",        // User 스키마를 참조한다
    },
}, {
    // 타임스탬프로 생성/수정 일시 저장
    timestamps: {
        createdAt: "createdAt",     // 다큐먼트 생성 일시
    },
});

const GroupUser = mongoose.model("GroupUser", GroupUserSchema);

module.exports = GroupUser;