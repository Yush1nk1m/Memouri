/*
클라이언트가 HLS 관련 파일(.m3u8, .ts) 요청 시 스트림으로 제공하는 라우터
*/
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// 주소에 http://localhost:4000/uploads/videos/hls/:id 가 포함(router.use)된 경우의 GET 요청 처리
router.use("/videos/hls/:id", (req, res, ne제xt) => {
    try {
        // 요청 파라미터로부터 동영상 id 추출
        const videoId = req.params.id;

        // 요청으로부터 실제 파일의 경로 유도
        const filePath = (req.originalUrl).substring(1);
        const fileExt = path.extname(filePath);     // 파일의 확장자 추출

        // hls 파일 요청에 대해서만 파일을 직접적으로 제공할 수 있다
        if (fileExt == ".m3u8" || fileExt == ".ts") {

            // 확장자별 응답의 헤더에 MIME 타입 추가
            if (fileExt === ".m3u8") {
                res.header("Content-Type", "application/vnd.apple.mpegurl")
            }
            else if (fileExt === ".ts") {
                res.header("Content-Type", "video/mp2t");
            }

            // 파일 경로에 파일이 존재하는지 검사하고 있을 시 스트림으로 응답한다
            try {
                // 파일이 존재하는지 검사
                fs.accessSync(filePath, fs.constants.F_OK);
            } catch (err) {
                if (err.code === "ENOENT") {
                    // 410 상태 코드: 파일 시스템에 파일이 존재하지 않음
                    return res.sendStatus(410);
                }

                // 이외의 에러는 서버 에러 발생이므로 throw
                throw err;
            }

            // 파일이 존재할 시 실행되는 로직

            // hls 관련 파일에 대한 스트림 생성
            const stream = fs.createReadStream(filePath);

            // 미리 성공했다고 가정하고 상태 코드를 200으로 설정
            res.status(200);

            // 파일 스트림을 응답에 연결
            return stream.pipe(res);
        }
    } catch (err) {
        console.log(err);

        return res.sendStatus(500);         // 500 상태 코드: 서버 에러 발생
    }
});

module.exports = router;