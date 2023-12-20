const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../controllers/auth");
const { uploadVideo } = require("../../controllers/file");
const { processVideo, registerVideo, sendThumbnail, sendGroupVideoList,
    sendVideoInformation, sendMasterPlaylistPath, toggleVideoPin, toggleVideoLike,
    changeVideoTitle, sendVideoPlayback, changeVideoPlayback, deleteVideo, verifyUserJoinedGroup, changeVideoDescription } = require("../../controllers/video");

// verifyToken 미들웨어를 모든 라우터에 우선 적용
router.use(verifyToken);

// POST /api/videos - 동영상 저장 요청
router.post("/", uploadVideo.single("video"), verifyUserJoinedGroup, processVideo, registerVideo);

// DELETE /api/videos - 동영상 삭제 요청
router.delete("/", deleteVideo);

// GET /api/videos/thumbnail/:videoId - 동영상 썸네일 이미지 요청
router.get("/thumbnail/:videoId", sendThumbnail);

// GET /api/videos/list/:groupId - 그룹에 있는 모든 동영상의 목록 요청
router.get("/list/:groupId", sendGroupVideoList);

// GET /api/videos/info/:videoId - 특정 동영상의 정보 요청
router.get("/info/:videoId", sendVideoInformation);

// GET /api/videos/hls/:videoId - 특정 동영상의 m3u8 마스터 플레이리스트 경로 요청
router.get("/hls/:videoId", sendMasterPlaylistPath);

// PATCH /api/videos/pin/:videoId - 특정 동영상 핀/언핀 요청
router.patch("/pin/:videoId", toggleVideoPin);

// PATCH /api/videos/like/:videoId - 특정 동영상 좋아요/좋아요 취소 요청
router.patch("/like/:videoId", toggleVideoLike);

// PATCH /api/videos/title/:videoId - 동영상 제목 변경 요청
router.patch("/title/:videoId", changeVideoTitle);

// PATCH /api/videos/description/:videoId - 동영상 설명 변경 요청
router.patch("/description/:videoId", changeVideoDescription);

// GET /api/videos/playback/:videoId - 동영상 이어보기 시점 반환 요청
router.get("/playback/:videoId", sendVideoPlayback);

// PATCH /api/videos/playback/:videoId - 동영상 이어보기 시점 변경 요청
router.patch("/playback/:videoId", changeVideoPlayback);

module.exports = router;