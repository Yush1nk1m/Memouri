// /api/groups 와 관련된 미들웨어들을 정의한 컨트롤러
const path = require("path");
const fs = require("fs");

const User = require("../models/user");
const Group = require("../models/group");
const Video = require("../models/video");
const Picture = require("../models/picture");
const GroupUser = require("../models/groupUser");
const UserVideo = require("../models/userVideo");

const { deleteDirectoryIfExists, deleteFileIfExists } = require("./file");

// 그룹 생성 미들웨어
exports.createGroup = async (req, res, next) => {
    try {
        const { groupId, password, name } = req.body;       // 클라이언트 요청의 body는 { groupId, password(그룹 비밀번호), name(그루비룸) } 순으로 전달된다
    
        const userId = req.user.id;                         // verifyToken 미들웨어에서 req.user에 사용자 정보를 저장하였다
        const user = await User.findOne({ userId });        // 데이터베이스에서 사용자 정보 조회

        const exGroup = await Group.findOne({ groupId });   // 데이터베이스에 중복된 그룹 id가 존재하는지 검사한다
        if (exGroup) {                    
            return res.sendStatus(412);                     // 412 상태 코드: 중복된 groupId
        }

        // 검증 후 그룹을 생성한다
        const group = await Group.create({
            master: user._id,
            groupId,
            password,
            name,
        });

        // 그룹 생성자도 그룹 인원의 일부이므로 관계를 추가한다
        await GroupUser.create({
            user: user._id,
            group: group._id,
        });

        return res.sendStatus(200);                         // 200 상태 코드: 성공
    } catch (err) {
        next(err);
    }
};

// 그룹 가입 미들웨어
exports.joinGroup = async (req, res, next) => {
    try {
        const userId = req.userId;                  // verifyToken 미들웨어에서 req.userId에 사용자 id를 저장한다
        const user = await User.findOne({ userId });      // 데이터베이스에서 사용자 정보를 조회한다

        // 요청 body에서 그룹 id를 추출한다
        const groupId = req.body.groupId;
        // 데이터베이스에서 그룹을 조회한다
        const group = await Group.findOne({ groupId });
        // 그룹이 존재하지 않을 시
        if (!group) {
            // 411 상태 코드: 등록되지 않은 그룹 id
            return res.sendStatus(411);
        }
        // 비밀번호가 일치하지 않을 시
        if (group.password !== req.body.password) {
            // 413 상태 코드: 그룹 비밀번호가 일치하지 않음
            return res.sendStatus(413);
        }

        // 데이터베이스에서 이미 사용자와 그룹이 연결된 다큐먼트가 존재하는지 확인
        const exGroupUser = await GroupUser.findOne({ user: user._id, group: group._id });
        if (exGroupUser) {                          // 이미 가입된 사용자일 경우
            return res.sendStatus(414);             // 414 상태 코드: 사용자가 이미 그룹에 가입됨
        }

        // 검증 완료

        // GroupUser 컬렉션에 새로운 다큐먼트를 생성한다(즉, 사용자가 그룹에 가입되었음을 둘 간의 연결로 나타낸다)
        await GroupUser.create({
            user: user._id,
            group: group._id,
        });

        // 그룹에 있는 모든 동영상에 대해 사용자의 개인화된 정보(고정 여부, 좋아요 여부, 이어보기 시간)를 추가한다
        const videos = await Video.find({ group: group._id });    // 그룹에 있는 모든 동영상을 찾는다
        await new Promise(async (resolve) => {
            for (const video of videos) {   // 각각의 동영상에 대해
                // 데이터베이스에 동영상에 대한 개인화된 정보 다큐먼트 생성
                await UserVideo.create({
                    user: user._id,
                    video: video._id,
                });
            }

            resolve();
        });

        // 200 상태 코드: 성공
        // json으로 그룹 이름 함꼐 전송
        return res.status(200).json({ groupName: group.name });
    } catch (err) {
        next(err);
    }
};

// 사용자가 속한 그룹 리스트 전송 미들웨어
exports.sendGroupList = async (req, res, next) => {
    try {
        // verifyToken 미들웨어 성공 시 req.user에 사용자 정보 저장됨
        const userId = req.userId;

        // 데이터베이스에서 사용자 조회
        // 토큰 기반 인증 캐싱 방법을 사용하고 있기 때문에 반복적인 존재성 검증은 필요하지 않음
        const user = await User.findOne({ userId });

        const groupUser = await GroupUser.find({ user: user._id })  // GroupUser 컬렉션에서 사용자가 가입된 모든 그룹을 찾는다
                                         .populate("group");        // 및 그룹 정보를 함께 조회한다

        // groupUser에서 group 정보만 추출하여 새로운 데이터로 대체한다
        let groups = [];
        if (groupUser) {
            groups = groupUser.map(({ group }) => {
                // 객체에 그룹의 id와 이름을 담는다
                const groupInfo = {
                    groupId: group.groupId,
                    groupName: group.name,
                }
    
                // groups는 groupInfo 객체의 배열이 된다
                return groupInfo;
            });
        }
        
        // 200 상태 코드: 성공
        // json 형태로 { profilePath: [프로필 경로], groups: [{ groupId, name }의 배열] } 응답
        res.status(200)                                 
           .json( groups );
    } catch (err) {
        next(err);
    }
};

// 그룹 삭제 미들웨어
exports.deleteGroup = async (req, res, next) => {
    try {
        // verifyToken 미들웨어가 먼저 수행되므로 req.userId에는 사용자 id 저장
        const userId = req.userId;
        // 요청 body에서 그룹 id와 비밀번호 추출
        const { groupId, password } = req.body;
        // 데이터베이스에서 그룹 조회
        const group = await Group.findOne({ groupId })
                                 .populate("master");   // 및 마스터 조회
        
        // 그룹이 존재하지 않을 경우
        if (!group) {
            // 411 상태 코드: 등록되지 않은 그룹 id
            return res.sendStatus(411);
        }
        
        // 그룹 비밀번호와 요청에 담긴 비밀번호가 일치하지 않을 경우
        if (group.password !== password) {
            // 413 상태 코드: 그룹 비밀번호 불일치
            return res.sendStatus(413);
        }

        // 그룹 삭제 요청을 한 사용자가 그룹의 마스터가 아닐 경우
        if (group.master.userId !== userId) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료

        // 그룹에 존재하는 모든 동영상 정보를 가져온다
        const videos = await Video.find({ group: group._id });
        // 각각의 동영상에 대해 
        if (videos) {
            await Promise.all(videos.map(async (video) => {
                // 동영상 id 추출
                const videoId = video.videoId;

                // 데이터베이스에서 사용자들의 동영상 개인화 정보 모두 삭제
                await UserVideo.deleteMany({ video: video._id });

                // 삭제할 파일 및 디렉터리의 경로 유도
                const videoPath = path.normalize(`uploads/videos/${videoId}${video.ext}`);  // 원본 동영상
                const thumbnailDir = path.normalize(`uploads/thumbnails/${videoId}`);       // 썸네일 이미지
                const hlsDir = path.normalize(`uploads/videos/hls/${videoId}`);             // HLS 스트리밍 관련
            
                // 파일 및 디렉터리 모두 삭제
                await deleteFileIfExists(videoPath);
                await deleteDirectoryIfExists(thumbnailDir);
                await deleteDirectoryIfExists(hlsDir);

                // 데이터베이스에서 동영상 삭제
                await Video.deleteOne({ _id: video._id });
            }));
        }

        // 데이터베이스에서 사용자와 그룹 간의 연결 정보(가입된 회원들 정보) 모두 삭제
        await GroupUser.deleteMany({ group: group._id });

        // 최종적으로 데이터베이스에서 그룹 삭제
        await Group.deleteOne({ _id: group._id });

        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch(err) {
        next(err);
    }
};

// 그룹의 마스터를 변경하는 미들웨어
exports.changeGroupMaster = async (req, res, next) => {
    try {
        // verifyToken 미들웨어가 선행되었다고 가정하고 req 변수로부터 사용자 id 추출
        const userId = req.userId;
        // 요청의 body로부터 필요한 데이터들을 추출
        const { userPassword, groupId, groupPassword, newMasterId } = req.body;

        // 먼저 데이터베이스에서 요청을 보낸 사용자를 조회한다
        const user = await User.findOne({ userId });
        // 요청한 사용자의 비밀번호와 검증 비밀번호가 일치하지 않을 시
        if (user.password !== userPassword) {
            // 402 상태 코드: 올바르지 않은 사용자 비밀번호
            return res.sendStatus(402);
        }

        // 데이터베이스에서 그룹 정보 조회
        const group = await Group.findOne({ groupId })
                                 .populate("master");   // 및 마스터 정보 함께 조회
        // 그룹이 존재하지 않을 시
        if (!group) {
            // 411 상태 코드: 등록되지 않은 그룹
            return res.sendStatus(411);
        }
        // 그룹 비밀번호가 일치하지 않을 시
        if (group.password !== groupPassword) {
            // 413 상태 코드: 그룹 비밀번호 불일치
            return res.sendStatus(413);
        }
        // 요청한 사용자가 그룹의 마스터가 아닐 경우
        if (group.master.userId !== userId) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료

        // 데이터베이스에서 새롭게 마스터가 될 사용자 정보 조회
        const newMaster = await User.findOne({ userId: newMasterId });
        if (!newMaster) {
            // 401 상태 코드: 등록되지 않은 사용자
            return res.sendStatus(401);
        }

        // 새로운 마스터가 될 사용자가 그룹에 가입되어 있는지 데이터베이스에서 조회
        const exGroupUser = await GroupUser.findOne({
            user: newMaster._id,
            group: group._id,
        });
        // 만약 가입되어 있지 않을 경우
        if (!exGroupUser) {
            // 405 상태 코드: 사용자가 그룹에 가입되어 있지 않음
            return res.sendStatus(405);
        }
        
        // 새로운 마스터 업데이트
        await Group.findByIdAndUpdate(group._id, { master: newMaster._id });

        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 그룹 탈퇴 미들웨어
exports.leaveGroup = async (req, res, next) => {
    try {
        // verifyToken 미들웨어에서 저장한 사용자 id를 불러옴
        const userId = req.userId;
        // 요청의 body에 담긴 사용자 비밀번호(password), 그룹 id 추출
        const { password, groupId } = req.body;

        // 데이터베이스에서 사용자 정보 조회
        const user = await User.findOne({ userId });
        // 사용자 비밀번호가 일치하지 않을 경우
        if (user.password !== password) {
            // 402 상태 코드: 사용자 비밀번호 불일치
            return res.sendStatus(402);
        }

        // 데이터베이스에서 그룹 정보 조회
        const group = await Group.findOne({ groupId })
                                 .populate("master");   // 및 마스터 정보 조회(마스터는 그룹을 탈퇴할 수 없음)
        // 그룹이 존재하지 않는 경우
        if (!group) {
            // 411 상태 코드: 등록되지 않은 그룹
            return res.sendStatus(411);
        }
        // 탈퇴하고자 하는 사용자가 그룹의 마스터인 경우
        if (group.master.userId === userId) {
            // 403 상태 코드: 사용자가 그룹의 마스터로 존재함
            return res.sendStatus(403);
        }

        // 데이터베이스에서 사용자가 그룹에 가입되어 있는지 조회
        const exGroupUser = await GroupUser.findOne({
            user: user._id,
            group: group._id,
        });
        // 그룹에 가입되어 있지 않은 사용자일 경우
        if (!exGroupUser) {
            // 405 상태 코드: 사용자가 그룹에 가입되어 있지 않음
            return res.sendStatus(405);
        }

        // 검증 완료

        // 데이터베이스에서 사용자가 그룹에 올린 모든 동영상 조회
        const videos = await Video.find({
            uploader: user._id,
            group: group._id,
        });
        
        // 업로드한 동영상이 존재할 경우
        if (videos) {
            // 각각의 동영상 및 개인화된 정보를 모두 삭제한다
            await Promise.all(videos.map(async (video) => {
                // 동영상 id 추출
                const videoId = video.videoId;

                // 개인화된 정보 삭제
                await UserVideo.deleteMany({ video: video._id });

                // 삭제할 파일 및 디렉터리의 경로 유도
                const videoPath = path.normalize(`uploads/videos/${videoId}${video.ext}`);  // 원본 동영상
                const thumbnailDir = path.normalize(`uploads/thumbnails/${videoId}`);       // 썸네일 이미지
                const hlsDir = path.normalize(`uploads/videos/hls/${videoId}`);             // HLS 스트리밍 관련

                // 파일 및 디렉터리 모두 삭제
                await deleteFileIfExists(videoPath);
                await deleteDirectoryIfExists(thumbnailDir);
                await deleteDirectoryIfExists(hlsDir);

                // 데이터베이스에서 동영상 삭제
                await Video.deleteOne({ _id: video._id });
            }));
        }

        // 데이터베이스에서 사용자의 그룹 가입 정보 삭제
        await GroupUser.deleteOne({
            user: user._id,
            group: group._id,
        });

        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};