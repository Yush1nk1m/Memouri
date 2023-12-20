const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../controllers/auth");
const { createGroup, joinGroup, sendGroupList, deleteGroup, changeGroupMaster, leaveGroup } = require("../../controllers/group");

// 모든 요청에 대해 verifyToken 미들웨어 적용
router.use(verifyToken);

// DELETE /api/groups - 그룹 삭제 요청
router.delete("/", deleteGroup);

// POST /api/groups/create - 그룹 생성 요청
router.post("/create", createGroup);

// POST /api/groups/join - 그룹 가입 요청
router.post("/join", joinGroup);

// POST /api/groups/leave - 그룹 탈퇴 요청
router.post("/leave", leaveGroup);

// GET /api/groups/list - 사용자가 속한 그룹 리스트 요청
router.get("/list", sendGroupList);

// PATCH /api/groups/master - 그룹의 마스터 교체 요청
router.patch("/master", changeGroupMaster);

module.exports = router;