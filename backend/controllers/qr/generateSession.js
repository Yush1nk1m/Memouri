const QRCode = require('qrcode');
const crypto = require('crypto');

// 임의의 세션 아이디 생성
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// 세션 만료 시간 생성
function generateExpiryTime(minutes) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
}

module.exports = () => {
    const sessionId = generateSessionId();
    const sessionExpiry = generateExpiryTime(3);
    console.log(sessionId, sessionExpiry);
    return {
        sessionId: sessionId,
        sessionExpiry: sessionExpiry
    };
};