const express = require("express");
const router = express.Router();
const createQRCode = require('../../controllers/qr/generateQRCode');
const User = require("../../models/user");
const {createToken} = require('../../controllers/auth');

const sessions = new Map();
let sessions_num = 0;

router.get('/', async (req, res) => {
    try {
        const {qrCodeDataURL, sessionId, sessionExpiry} = await createQRCode();

        console.log(qrCodeDataURL);

        //session 등록
        sessions.set(sessionId, sessions_num);
        sessions_num += 1;
        setTimeout(() => {
            sessions.delete(sessionId);
        }, 3 * 60 * 1000);
        res.json({
            sessionId,
            qrCodeDataURL
        });

    } catch(error) {
        console.error('Error generating and sending QR Code:', error);
        res.status(500).send('Internal Server Error');
    }
});
let sessionId_ = "";
let accessToken_ = "";
let refreshToken_ = "";

let intervalId;
router.get('/connect/:sessionId', (req, res) => {

     const sessionId = req.params.sessionId;
    console.log("\n"+sessionId+"\n");

    if (!sessions.has(sessionId)) {
        return res.status(404).send('Session not found');
    }
    sessionId_ = '';
    accessToken_ = '';
    refreshToken_ = '';
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Content-Type", "text/event-stream")
      .setHeader("Connection", "keep-alive")
      .setHeader("Cache-Control", "no-cache")
    intervalId = setInterval(() => {
    res
        .status(200)
        .write(
            'event: QR\n'+
            'data: {"message0" : "' + sessionId_ + '", "message1" : "' + accessToken_ + '", "message2": "' + refreshToken_ + '"}\n\n'
        );
    }, 1000);

    setTimeout(() => {
        clearInterval(intervalId);
        res.end();
    }, 1000 * 60 * 5);


});

router.get('/change', (req, res) => {
    let {param} = req.query;
    accessToken_ = param;
    res.end();
});

router.get('/:sessionId', (req, res)=> {
    res.sendFile(__dirname + '/loginQRCode.html');
});

router.post('/:sessionId', express.json(), async (req, res) => {
    console.log(req);
    const sessionId = req.params.sessionId;
    try {
        const id = req.body.userId;
        const password = req.body.password;
        // const { id, password } = req.body;          // 클라이언트에서 { id: [사용자 아이디], password: [사용자 비밀번호] } 형태로 요청 전송
        const user = await User.findOne({ userId: id });    // DB의 users 컬렉션 중 동일한 id를 갖는 사용자가 있는지 탐색
        console.log(id);
        console.log(password);

        if (!user) {    // id가 동일한 사용자가 없을 경우
            console.log("check");
            res.status(401).end();          // 401 상태 코드: 등록되지 않은 id
            return;
        }

        if (password !== user.password) {   // id가 동일한 사용자가 있지만 비밀번호가 일치하지 않을 경우
            res.status(402).end();          // 402 상태 코드: 올바르지 않은 비밀번호
            return;
        }

        // id와 비밀번호가 둘 다 일치할 경우

        // JWT 토큰 생성
        const accessToken = createToken('access', id, password);
        const refreshToken = createToken('refresh', id, password);

        if (!sessions.has(sessionId)) {
            return res.status(404).send('Session not found');
          }
        console.log(sessionId);
        sessionId_ = sessionId;
        accessToken_ = accessToken;
        refreshToken_ = refreshToken;

        res.status(200).send("로그인 완료");

    } catch (err) {
        console.error(err);     // TEST CODE
        console.log(err);

        res.status(500).end();              // 500 상태 코드: 서버 에러
    }


});


module.exports = router;