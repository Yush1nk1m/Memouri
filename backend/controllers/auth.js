/*
authorization verification controller
JWT 토큰과 관련된 미들웨어들을 여기에 정의해 주시면 됩니다
*/
require("dotenv").config();                 // .env 값 사용을 위한 configuration
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;  // 보안을 위해 프로젝트 디렉터리에 .env를 생성하고 JWT_SECRET=[비밀 키]와 같이 비밀 키를 기록한다

exports.createToken = (type, id, password) => {
    if(type == 'access') {
        const accessToken = jwt.sign({
            type: 'JWT',
            id: id,
            password: password
        }, SECRET_KEY, {
            expiresIn: '15m',
            issuer:'memouri',
        });

        return accessToken;
    } else if(type == 'refresh') {
        const refreshToken = jwt.sign({
            type: 'JWT',
            id: id,
            password: password
        }, SECRET_KEY, {
            expiresIn: '180d',
            issuer:'memouri',
        });

        return refreshToken;
    }
};

exports.verifyToken = (req, res, next) => {
    const accessToken = req.cookies && req.cookies.accessToken;
    const refreshToken = req.cookies && req.cookies.refreshToken;

    if(!accessToken && !refreshToken){
        return res.sendStatus(400);   // 토큰 검증 에러
    }
    
    jwt.verify(accessToken, SECRET_KEY, (err, user) =>{
        if(err){
            if(err.name === 'TokenExpiredError') {
                return refreshAccessToken(req, res, next, refreshToken);
            }
            else {
                return res.sendStatus(400); // 토큰 검증 에러
            }
        }
        
        req.user = user;
        req.userId = user.id;
        next();
    });
};

function refreshAccessToken(req, res, next, refreshToken) {
    if (!refreshToken) {
      return res.sendStatus(400);
    }
  
    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            // 리프레시 토큰이 만료되거나 검증에 실패한 경우
            return res.sendStatus(400);
        }

        // 새로운 액세스 토큰 발급
        const newAccessToken = jwt.sign({
            type: 'JWT',
            id: user.id,
            password: user.password
        }, SECRET_KEY, {
            expiresIn: '15m',
            issuer:'memouri',
        });
        
        // 클라이언트에게 액세스 토큰을 쿠키로 전송
        res.cookie('accessToken', newAccessToken, { httpOnly: true });

        req.user = user;
        req.userId = user.id;

        next();
    });
};

exports.setCookie = (req, res, next) => {
    // JWT 토큰 생성
    try {
        const { accessToken, refreshToken } = req.body;   
        res.cookie('accessToken', accessToken, { httpOnly: true }); 
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        // 응답 보내기
        res.status(200).send('Tokens are generated and sent in cookies');
    } catch {
        next(err);
    }
};