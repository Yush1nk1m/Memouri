const generateSession = require('./generateSession');
const QRCode = require('qrcode');
const fs = require('fs');
const URL_ = "localhost"

async function generateQRCode(){
    const {sessionId, sessionExpiry} = generateSession();
    const qrCodeDataURL = await QRCode.toDataURL('http://localhost:4000/api/users/qrlogin/'+sessionId);
    
    console.log('http://'+URL_+':4000/api/users/qrlogin/'+sessionId);

    return {
        qrCodeDataURL: qrCodeDataURL,
        sessionId: sessionId,
        sessionExpiry: sessionExpiry   
    };
}

module.exports = generateQRCode;