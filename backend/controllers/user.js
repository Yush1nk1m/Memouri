// /api/users 와 관련된 미들웨어들을 정의한 컨트롤러
const path = require("path");
const fs = require("fs");

const User = require("../models/user");
const Group = require("../models/group");
const Video = require("../models/video");
const Picture = require("../models/picture");
const GroupUser = require("../models/groupUser");
const UserVideo = require("../models/userVideo");

const { createToken } = require("./auth");
const { deleteFileIfExists, deleteDirectoryIfExists } = require("./file");

// 사용자 로그인 미들웨어
exports.loginUser = async (req, res, next) => {
    try {
        const { userId, password } = req.body;          // 요청 body로부터 사용자 아이디와 비밀번호 추출

        const user = await User.findOne({ userId });    // 데이터베이스에서 사용자 id로 조회
        if (!user) {                                    // 사용자가 등록되지 않은 경우
            return res.sendStatus(401);                 // 401 상태 코드: 등록되지 않은 사용자 id
        }
        if (password !== user.password) {               // 요청의 비밀번호와 데이터베이스의 비밀번호가 일치하지 않는 경우
            return res.sendStatus(402);                 // 402 상태 코드: 올바르지 않은 사용자 비밀번호
        }

        // JWT 토큰 생성
        const accessToken = createToken('access', userId, password);
        const refreshToken = createToken('refresh', userId, password);
        res.cookie('accessToken', accessToken, { httpOnly: true }); 
        res.cookie('refreshToken', refreshToken, { httpOnly: true });

        // 200 상태 코드: 성공
        // { 사용자 이름, 이메일 } 응답
        res.status(200).json({
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        // 에러 처리 미들웨어로 진행
        next(err);
    }
};

// 사용자 로그아웃 미들웨어
exports.logoutUser = (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 사용자 회원 가입 미들웨어
exports.joinUser = async (req, res, next) => {
    try {
        // 요청 body에서 사용자 id, 비밀번호를 받아온다
        const { userId, password, name, email } = req.body;

        // 데이터베이스에서 사용자 id로 조회한다
        const exUser = await User.findOne({ userId });
        // 중복된 id를 가진 사용자가 존재할 경우
        if (exUser) {
            // 407 상태 코드: 이미 존재하는 사용자 id
            return res.sendStatus(407);
        }

        // 데이터베이스에 새로운 데이터를 생성한다
        await User.create({
            userId,
            password,
            name,
            email,
        });

        res.sendStatus(200);                                // 200 상태 코드: 성공
    } catch (err) {
        next(err);
    }
}

// 사용자 정보 전송 미들웨어
exports.sendUserInformation = async (req, res, next) => {
    try {
        // verifyToken 미들웨어 성공 시 req.userId에 사용자 id 저장됨
        const userId = req.userId;
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });
    
        return res.status(200).json({
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
};

// 프로필 이미지 등록 미들웨어
exports.registerPicture = async (req, res, next) => {
    try {
        // verifyToken 미들웨어 성공 시 req.userId에 사용자 id 저장됨
        const userId = req.userId;
        
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });                // 사용자 id로 조회한다, 토큰 기반 인증 캐싱을 사용하고 있기 때문에 존재성 검증은 필요하지 않다

        // 데이터베이스에서 프로필 이미지 조회
        const picture = await Picture.findOne({ user: user._id });  // 앞서 사용자를 조회할 때 프로필 이미지도 함께 조회하였다
        
        // 이미 프로필 이미지가 저장된 경우
        if (picture) {
            if (path.extname(req.file.originalname) !== picture.ext) {
                // 파일 시스템에서 기존의 프로필 이미지를 삭제하고
                deleteFileIfExists(path.normalize("uploads/pictures/" + userId + picture.ext));
                
                // 프로필 이미지의 확장자를 변경한다
                await Picture.updateOne({ _id: picture._id },
                                    { ext: path.extname(req.file.originalname) });
            }

            // else의 경우는 고려할 필요가 없다, 확장자가 일치한다면 기존의 picture 다큐먼트를 그대로 사용하면 된다
        }
        // 프로필 이미지 정보가 없는 경우
        else {                                                   // 프로필 이미지가 저장되어 있지 않은 경우
            const result = await Picture.create({                // 먼저 프로필 이미지 다큐먼트를 생성하고
                user: user._id,
                ext: path.extname(req.file.originalname),
            });

            await User.updateOne({ userId }, { picture: result._id });  // 사용자의 picture 필드를 수정한다
        }

        return res.sendStatus(200);             // 200 상태 코드: 성공

    } catch (err) {
        // 500 상태 코드: 서버 에러 발생
        next(err);
    }
};

// 프로필 이미지 전송 미들웨어
exports.sendPicture = async (req, res, next) => {
    try {
        // 데이터베이스에서 사용자 조회
        const userId = req.user.id;                     // verifyToken 미들웨어 성공 시 req.user에 사용자 정보 저장됨
        const user = await User.findOne({ userId })     // 사용자 id로 데이터베이스에서 조회
                               .populate("picture");    // 및 프로필 이미지 정보 조회
        
        if (!user.picture) {                            // 데이터베이스에 프로필 이미지가 저장되어 있지 않은 경우
            return res.sendStatus(416);                 // 416 상태 코드: 데이터베이스에 프로필 이미지가 등록되어 있지 않음
        }

        const picture = user.picture;

        const picturePath = path.normalize("uploads/pictures/" + userId + picture.ext); // 사용자 id와 picture에 저장된 확장자로 파일 시스템상에 저장된 경로를 유도한다
    
        try {
            await fs.promises.access(picturePath, fs.constants.F_OK);   // 실제 파일 시스템에 프로필 이미지가 있는지 확인한다, 없을 시 catch 문이 실행된다
        } catch (err) {
            console.error(`해당 경로에 파일이 존재하지 않음: ${err}`);

            // 파일이 존재하지 않으면 데이터베이스에 해당 사용자의 프로필 이미지가 없다고 나타낸다
            await User.updateOne({
                _id: user._id,              // 해당 사용자를 찾아
            }, {
                picture: null,              // 프로필 이미지 필드를 null로 바꾼다
            });

            // 및 데이터베이스에서 프로필 이미지 데이터를 삭제한다
            await Picture.deleteOne({ _id: picture._id });

            return res.sendStatus(415);     // 415 상태 코드: 파일 시스템에 프로필 이미지가 존재하지 않음
        }

        const imageStream = fs.createReadStream(picturePath);   // 이미지를 스트림으로 전송하기 위해 읽기 스트림을 생성한다

        res.status(200);                    // 일단 성공했다고 가정하고 데이터를 보낸다
        imageStream.pipe(res);              // 스트림 파이프 연결

        imageStream.on("error", (err) => {  // 스트림 전송 중 오류 발생 시 콜백 함수 정의
            console.error(err);
            // 408 상태 코드: 스트림 전송 중 오류 발생
            return res.sendStatus(408);
        })
    } catch (err) {
        next(err);
    }
};

// 사용자가 그룹에 업로드한 동영상 목록 전송 미들웨어
exports.sendUploadedVideoList = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 그룹 id 추출
        const groupId = req.params.groupId;
        // 데이터베이스에서 그룹 조회
        const group = await Group.findOne({ groupId });
        if (!group) {   // 그룹이 존재하지 않으면
            // 411 상태 코드: 등록되지 않은 그룹
            return res.sendStatus(411);
        }
    
        // verifyToken의 결과인 req.userId로부터 사용자 id 추출
        const userId = req.userId;
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });
        if (!user) {    // 사용자가 존재하지 않으면
            // 401 상태 코드: 등록되지 않은 사용자
            return res.sendStatus(401);
        }

        // 데이터베이스에서 그룹과 사용자 간의 관계(가입 여부) 조회
        const groupUser = await GroupUser.findOne({
            user: user._id,
            group: group._id,
        });
        if (!groupUser) {   // 만약 가입되어 있지 않으면
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        const videos = await Video.find({
            uploader: user._id,
            group: group._id,
        });

        let info = [];
        if (videos) {
            info = await Promise.all(videos.map(async (video) => {
                const userVideo = await UserVideo.findOne({
                    user: user._id,
                    video: video._id,
                });
    
                return {
                    videoId: video.videoId,
                    title: video.title,
                    description: video.description,
                    like: video.like,
                    view: video.view,
                    lengthInSeconds: video.lengthInSeconds,
                    createdAt: video.createdAt,
                    pinnedAt: userVideo.pinnedAt,
                    likedAt: userVideo.likedAt,
                    markInSeconds: userVideo.markInSeconds,
                };
            }));
        }

        return res.status(200).json( info );

    } catch (err) {
        next(err);
    }
};

// 사용자 회원 탈퇴 미들웨어
exports.deleteUser = async (req, res, next) => {
    try {
        // verifyToken 미들웨어로 사용자 id 추출
        const userId = req.userId;
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });
        // 요청 body에서 비밀번호 추출
        const { password } = req.body;
    
        // 비밀번호가 불일치할 경우
        if (user.password !== password) {
            // 402 상태 코드: 올바르지 않은 사용자 비밀번호
            return res.sendStatus(402);
        }

        // 사용자가 마스터인 그룹이 있을 경우
        const exGroup = await Group.findOne({ master: user._id });
        if (exGroup) {
            // 403 상태 코드: 사용자가 아직 어떤 그룹의 마스터로 존재하고 있음
            return res.sendStatus(403);
        }

        // 검증 완료

        // 동영상에 대한 사용자의 개인화된 정보 삭제
        await Video.deleteMany({ user: user._id });

        // 데이터베이스에서 사용자의 프로필 이미지 정보 조회
        const picture = await Picture.findOne({ user: user._id });
        // 프로필 이미지가 존재할 경우 파일 시스템과 데이터베이스에서 삭제
        if (picture) {
            // 파일 시스템에서 삭제
            await deleteFileIfExists(path.normalize(`uploads/pictures/${userId}${picture.ext}`));
            // 데이터베이스에서 삭제
            await Picture.deleteOne({ _id: picture._id });
        }
        

        // 사용자가 업로드한 모든 동영상 삭제
        // 데이터베이스에서 사용자가 업로드한 모든 동영상 조회
        const videos = await Video.find({ uploader: user._id });
        if (videos) {
            // 각각의 동영상에 대해 
            await Promise.all(videos.map(async (video) => {
                // 동영상의 개인화된 정보 모두 삭제
                await UserVideo.deleteMany({ video: video._id });
                // 동영상 id 추출
                const videoId = video.videoId;
                
                // 썸네일 이미지가 저장된 디렉터리 경로 유도
                const thumbnailDir = path.normalize(`uploads/thumbnails/${videoId}`);
                // 동영상 원본의 경로 유도
                const videoPath = path.normalize(`uploads/videos/${videoId}${video.ext}`);
                // 동영상 HLS 스트리밍 관련 파일들이 저장된 디렉터리 경로 유도
                const hlsDir = path.normalize(`uploads/videos/hls/${videoId}`);

                // 모든 경로에 있는 파일 및 디렉터리 삭제
                await deleteFileIfExists(videoPath);
                await deleteDirectoryIfExists(thumbnailDir);
                await deleteDirectoryIfExists(hlsDir);

                // 데이터베이스에서 동영상 삭제
                await Video.deleteOne({ _id: video._id });
            }));
        }

        // 사용자와 그룹 간의 연결 관계 모두 삭제(가입 정보 삭제)
        await GroupUser.deleteMany({ user: user._id });

        // 최종적으로 사용자 정보 삭제
        await User.deleteOne({ _id: user._id });

        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 사용자 이름 변경 미들웨어
exports.changeUserName = async (req, res, next) => {
    try {
        // 새로운 이름 추출
        const { password, name } = req.body;
        // verifyToken 미들웨어가 앞에 수행되었다고 가정하고 사용자 id 추출
        const userId = req.userId;
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });

        // 만약 비밀번호가 일치하지 않을 경우
        if (user.password !== password) {
            // 402 상태 코드: 올바르지 않은 사용자 비밀번호
            return res.sendStatus(402);
        }

        // 바뀐 이름 저장
        user.name = name;
        await user.save();

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 사용자 이메일 변경 미들웨어
exports.changeUserEmail = async (req, res, next) => {
    try {
        // 새로운 이름 추출
        const { password, email } = req.body;
        // verifyToken 미들웨어가 앞에 수행되었다고 가정하고 사용자 id 추출
        const userId = req.userId;
        // 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });

        // 만약 비밀번호가 일치하지 않을 경우
        if (user.password !== password) {
            // 402 상태 코드: 올바르지 않은 사용자 비밀번호
            return res.sendStatus(402);
        }

        // 바뀐 이름 저장
        user.email = email;
        await user.save();

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};