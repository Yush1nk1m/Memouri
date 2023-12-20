const express = require('express');
const router = express.Router();
const { verifyToken, setCookie } = require('../../controllers/auth');
const { uploadImage } = require("../../controllers/file");
const { loginUser, logoutUser, joinUser, registerPicture, sendPicture,
    sendUploadedVideoList, deleteUser, changeUserName, changeUserEmail,
    sendUserInformation } = require('../../controllers/user');

// DELETE /api/users - 회원 탈퇴 요청
router.delete("/", verifyToken, deleteUser);

// POST /api/users/login - 로그인 요청
router.post("/login", loginUser);

// POST /api/users/logout - 로그아웃 요청
router.post("/logout", verifyToken, logoutUser);

// POST /api/users/join - 회원가입 요청
router.post("/join", joinUser);

// GET /api/users/info - (로그인한) 사용자의 정보 요청
router.get("/info", verifyToken, sendUserInformation);

// PATCH /api/users/name - 이름 변경 요청
router.patch("/name", verifyToken, changeUserName);

// PATCH /api/users/email - 이메일 변경 요청
router.patch("/email", verifyToken, changeUserEmail);

// POST /api/users/picture - 프로필 이미지 저장 요청 
router.post("/picture", verifyToken, uploadImage.single("image"), registerPicture);

// GET /api/users/picture - 프로필 이미지 불러오기 요청
router.get("/picture", verifyToken, sendPicture);

// GET /api/users/videos/:groupId - 사용자가 특정 그룹에 업로드한 모든 동영상 목록 조회
router.get("/videos/:groupId", verifyToken, sendUploadedVideoList);

// QRCODE 로그인
const qrlogin = require('./qrlogin');
router.use('/qrlogin', qrlogin);

// 로그인과 관련된 JWT 쿠키 설정
router.post('/setCookie', setCookie);

module.exports = router;