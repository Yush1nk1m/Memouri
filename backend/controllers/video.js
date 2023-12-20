const util = require("util");
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = util.promisify(ffmpeg.ffprobe);
const path = require('path');
const fs = require("fs");
const hlsParser = require("hls-parser");
const os = require("os");
const { MasterPlaylist, Variant } = hlsParser.types;

const User = require("../models/user");
const Group = require("../models/group");
const Video = require("../models/video");
const Picture = require("../models/picture");
const GroupUser = require("../models/groupUser");
const UserVideo = require("../models/userVideo");

const { accessOrCreateDirectory, deleteDirectoryIfExists, deleteFileIfExists } = require("./file");

const segmentDuration = 5;      // 하나의 세그먼트 크기 = 5초
const resolutions = [           // 해상도 및 해상도별 최소 요구 비트 전송률 정보를 담은 배열
    { name: '144p', width: 256, height: 144, bandwidth: 200000, averageBandwidth: 180000, codecs: "avc1.4d401e,mp4a.40.2" },        // 144p: 변형 스트림 200Kbps 대역폭 필요, 스트림 평균 180Kbps 대역폭
    { name: '240p', width: 426, height: 240, bandwidth: 400000, averageBandwidth: 350000, codecs: "avc1.4d401f,mp4a.40.2" },        // 240p: 변형 스트림 400Kbps 대역폭 필요, 스트림 평균 350Kbps 대역폭
    { name: '360p', width: 640, height: 360, bandwidth: 800000, averageBandwidth: 700000, codecs: "avc1.4d401f,mp4a.40.2" },        // 360p: 변형 스트림 800Kbps 대역폭 필요, 스트림 평균 700Kbps 대역폭
    { name: '480p', width: 854, height: 480, bandwidth: 1500000, averageBandwidth: 1200000, codecs: "avc1.4d401f,mp4a.40.2" },      // 480p: 변형 스트림 1.5Mbps 대역폭 필요, 스트림 평균 1.2Mbps 대역폭
    { name: '720p', width: 1280, height: 720, bandwidth: 3000000, averageBandwidth: 2800000, codecs: "avc1.4d401f,mp4a.40.2" },     // 720p: 변형 스트림 3Mbps 대역폭 필요, 스트림 평균 2.8Mbps 대역폭
    { name: '1080p', width: 1920, height: 1080, bandwidth: 5000000, averageBandwidth: 4500000, codecs: "avc1.4d4028,mp4a.40.2" }    // 1080p: 변형 스트림 5Mbps 대역폭 필요, 스트림 평균 4.5Mbps 대역폭
];

/*
FFmpeg을 사용하여 해상도에 맞게 동영상을 H.264 인코딩하는 함수
inputPath = [인코딩할 동영상이 저장된 경로, ex) uploads/videos/[videoId].mp4]
outputPath = [인코딩된 동영상이 저장될 경로, ex) uploads/videos/hls/144p.mp4]
*/
function encodeVideo(inputPath, outputPath, resolution) {
    return new Promise((resolve, reject) => {
        try {
            ffmpeg()
                .input(inputPath)
                .videoCodec("libx264")                              // H.264 인코딩
                .audioCodec("aac")                                  // mp4a.40.2 오디오 인코딩
                .size(`${resolution.width}x${resolution.height}`)                     // 해상도
                .autoPad(true, "black")
                .on("end", () => {
                    console.log(`${resolution.name} 해상도 인코딩 완료`);
    
                    resolve();
                })
                .on("error", (err) => {
                    console.error(`${resolution.name} 인코딩 중 에러 발생: ${err}`);
    
                    reject(err);
                })
                .save(outputPath);
        } catch (err) {
            console.error(err);

            reject(err);
        }
    });
};

/*
FFmpeg을 사용하여 인코딩된 동영상으로부터 세그먼트를 생성하는 함수
inputPath = [H.264 인코딩된 동영상 저장 경로]
outputDir = [해상도별 세그먼트 저장 디렉터리 경로]
*/
function createSegment(inputPath, outputDir) {
    return new Promise((resolve, reject) => {
        try {
            // 플레이리스트가 저장될 경로
            const playlistPath = path.join(outputDir, "playlist.m3u8");

            // 세그먼트 및 플레이리스트 생성
            ffmpeg(inputPath)
                .addOption(`-threads ${os.cpus().length}`)
                .addOption("-start_number", 0)
                // 세그먼트의 길이를 강제한 후 동영상 이어보기 시 치명적인 오류가 발생하여 이 옵션을 제거한다 2023-12-04 01:44
                //.addOption("-hls_time", segmentDuration)    // 한 세그먼트의 길이
                //.addOption("-hls_flags split_by_time")      // 동영상 시간을 기준으로 분할
                .addOption("-hls_list_size", 0)             // 저장할 세그먼트 파일 최대 개수(무제한)
                .addOption("-f", "hls")                     // HLS 포맷
                .output(playlistPath)
                .on("end", () => {
                    console.log(`${outputDir}에 HLS 세그먼트가 생성되었습니다.`);

                    resolve();
                })
                .on("error", (err) => {
                    console.log(`HLS 세그먼트 생성 중 오류 발생: ${err}`);

                    reject(err);
                })
                .run();

        } catch (err) {
            console.error(err);

            reject(err);
        }
    });
};

// POST /api/videos 라우터에서 동영상 썸네일 추출, HLS 관련 파일 생성하는 미들웨어
exports.processVideo = async (req, res, next) => {
    try {
        // multer가 저장한 원본 동영상의 경로 추출
        const videoPath = req.file.path;
        // 동영상의 경로에서 동영상 id 추출
        const videoId = path.basename(videoPath, path.extname(videoPath));
        // 동영상의 경로에서 확장자 추출
        const videoExt = path.extname(videoPath);

        // HLS 관련 파일들이 저장될 디렉터리 생성
        const hlsPath = path.normalize(`uploads/videos/hls/${videoId}`);
        await accessOrCreateDirectory(hlsPath);

        // 동영상의 메타데이터 읽기
        const metadata = await ffprobe(videoPath);

        // 원본 동영상의 해상도 정보 추출
        const originalResolution = metadata.streams.find((stream) => stream.codec_type === "video");
        const originalWidth = originalResolution.width;     // 너비 정보
        const originalHeight = originalResolution.height;   // 높이 정보

        // 마스터 플레이리스트의 variant들을 담을 배열 선언
        let variants = [];

        // 144p, 240, 360p, 480p, 720p, 1080p 중 원본 동영상의 해상도 이하로만 인코딩
        for (const resolution of resolutions) {
            // 원본 동영상의 해상도 이하인 경우
            if (resolution.width <= originalWidth && resolution.height <= originalHeight) {
                // 인코딩될 동영상의 경로 설정
                const encodedPath = path.join(hlsPath, `${resolution.name}${videoExt}`);

                // 동영상 인코딩
                await encodeVideo(videoPath, encodedPath, resolution);

                // 해상도별 세그먼트 디렉터리 생성
                const resolutionDir = path.join(hlsPath, resolution.name);
                await accessOrCreateDirectory(resolutionDir);

                // 세그먼트 및 플레이리스트 생성
                await createSegment(encodedPath, resolutionDir);
                
                // 해상도별 세그먼트 묶음의 Adaptive Streaming 조건을 나타낼 수 있는 variant를 생성한다
                const variant = new Variant({
                    uri: path.normalize(`${resolution.name}/playlist.m3u8`),            // 해상도별 플레이리스트 경로 지정
                    bandwidth: resolution.bandwidth,                                    // 변형 스트림의 평균 대역폭 지정                                                 
                    codecs: resolution.codecs,                                          // 스트림에 사용된 오디오, 비디오 코덱 지정
                    resolution: { width: resolution.width, height: resolution.height }, // 스트림 해상도 지정
                });
                // 마스터 플레이리스트 생성을 위해 variant 정보를 추가한다
                variants.push(variant);
            }
        }

        // 앞서 구성한 Variant 배열로 마스터 플레이리스트를 생성한다
        const masterPlaylist = new MasterPlaylist({
            isMasterPlaylist: true,
            version: 3,
            variants,
        });

        // 마스터 플레이리스트를 파일로 저장한다
        await fs.promises.writeFile(path.normalize(`uploads/videos/hls/${videoId}/playlist.m3u8`), hlsParser.stringify(masterPlaylist));

        // FFmpeg를 사용한 썸네일 추출
        // 동영상 길이에 따라 5초 단위로 생성
        await createThumbnails(videoPath, metadata.format.duration);
    
        // 모두 성공 시 다음 미들웨어로 이동한다(registerVideo)
        next();
    } catch (err) {
        next(err);
    }
}

// POST /api/videos 라우터에서 동영상 저장 전 사용자가 파일을 저장할 수 있는지 검사하는 미들웨어
// 동영상 저장의 경우 파일 시스템에 큰 영향을 주는 작업이기 때문에 검증을 반드시 우선해야 한다
exports.verifyUserJoinedGroup = async (req, res, next) => {
    try {
        // 데이터베이스에서 사용자 정보 조회
        const userId = req.userId;                          // verifyToken 미들웨어 성공 시 req.userId에 사용자 정보 저장됨
        const user = await User.findOne({ userId });        // 토큰 기반 인증 캐싱 방법을 사용하고 있기 때문에 반복적인 존재성 검증은 필요하지 않음
        
        // 데이터베이스에서 그룹 조회
        const { groupId } = req.body;                       // 요청 body에서 그룹 id 추출
        const group = await Group.findOne({ groupId });     // 데이터베이스에서 그룹 id로 그룹을 찾는다
        if (!group) {                                       // 데이터베이스에 등록된 그룹이 없을 시        
            return res.sendStatus(411);                     // 411 상태 코드: 등록되지 않은 그룹 id
        }

        // 사용자가 그룹에 가입되어 있는지 조회
        const groupUser = await GroupUser.findOne({ user: user._id, group: group._id });
        if (!groupUser) {            
            return res.sendStatus(499);                     // 499 상태 코드: 접근 권한 위반
        }

        // 조회한 데이터를 req 객체에 저장
        req.userDoc = user;
        req.groupDoc = group;
        req.groupUserDoc;

        // 다음 미들웨어로 이동
        next();
    } catch (err) {
        // 이미 multer가 저장한 동영상 삭제
        await deleteFileIfExists(req.file.path);

        next(err);
    }
};

// POST /api/videos 라우터에서 데이터베이스에 동영상 정보를 등록하는 미들웨어
exports.registerVideo = async (req, res, next) => {
    try {
        // 데이터베이스에 동영상을 저장하기 위한 기본적인 정보
        const { title, description } = req.body;           // 클라이언트 요청으로부터 { [그룹 id], [제목], [설명] } 추출
        
        const videoPath = req.file.path;                            // 동영상이 저장된 경로
        const ext = path.extname(req.file.originalname);            // 원본 동영상의 확장자(마침표 포함)
        const videoId = path.basename(videoPath, ext);              // 비디오와 관련된 모든 데이터의 경로는 videoId와 관련된다([업로더 id][업로드 일시] 포맷)

        let lengthInSeconds = 0;                                    // 동영상의 재생 시간
        
        // 데이터베이스에서 사용자 조회
        const user = req.userDoc;                                   // verifyUserJoinedGroup 미들웨어 참고
        // 데이터베이스에서 그룹 조회
        const group = req.groupDoc;                                 // verifyUserJoinedGroup 미들웨어 참고
        
        // FFmpeg를 사용한 비디오 전체 정보 추출
        const metadata = await ffprobe(videoPath);              // 동영상의 메타데이터 추출
        lengthInSeconds = metadata.format.duration;             // 동영상 길이 추출

        // 데이터베이스에 새로운 동영상 다큐먼트 생성
        const video = await Video.create({                      // 영상 저장, 썸네일 추출까지 완료되었다면 데이터베이스에 동영상 정보 저장
            videoId,                                            // video의 ID는 "[사용자 id][업로드 일시]" 포맷이다
            ext,                                                // 원본 동영상 확장자
            uploader: user._id,
            group: group._id,
            title,
            description,
            lengthInSeconds,
        });

        // 같은 그룹에 속한 모든 사용자 찾기
        const groupUsers = await GroupUser.find({ group: group._id })
                                          .populate("user");

        // groupUsers의 각각의 다큐먼트에 대해
        if (groupUsers) {
            await Promise.all(groupUsers.map(async (doc) => {
                // 기존에 존재하고 있던 사용자 정보 추출
                const exUser = doc.user;
    
                // 새로 생성된 동영상에 대해 그룹 내 모든 사용자의 개인화된 정보를 추가한다
                return await UserVideo.create({
                    user: exUser._id,
                    video: video._id,
                });
            }))
        }

        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 동영상에서 5초 단위로 썸네일 이미지를 추출한다
function createThumbnails(videoPath, duration) {
    return new Promise(async (resolve, reject) => {
      try {
        const videoId = path.basename(videoPath, path.extname(videoPath));
        const thumbnailDir = path.normalize(`uploads/thumbnails/${videoId}`);

        // 썸네일 추출 시간의 배열
        const timemarks = [];
        // 0, 5, 10, ... 등 5초 단위로 추가
        for (let t = 0; t <= Math.floor(duration); t += 5) {
            timemarks.push(`${t}`);
        }

        ffmpeg(videoPath)
            .on("filenames", (filenames) => {
                console.log("Thumbnail images:", filenames);
            })
            .on("end", () => {
                console.log("썸네일 추출이 완료되었습니다.");

                resolve();
            })
            .on("error", (err) => {
                console.log(`썸네일 추출 중 오류 발생: ${err}`);

                reject(err);
            })
            .screenshots({
                folder: thumbnailDir,           // 썸네일을 저장할 디렉터리
                filename: "thumbnail-%s.png",   // 썸네일 파일명 양식: thumbnail_n.png
                timemarks,                      // 추출할 시간 배열
                size: "640x360",
            })
            .autopad('black');

        } catch (err) {
            console.error(`썸네일 생성 중 오류 발생하였습니다: ${err}`);

            reject(err);
        }
    });
};

// 썸네일 전송 미들웨어
exports.sendThumbnail = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 동영상의 id 추출
        const videoId = req.params.videoId;
        
        // 동영상 id로 썸네일 이미지 저장 경로 유도(uploads/videos/videoId/)
        const thumbnailDir = path.normalize(`uploads/thumbnails/${videoId}`);
        
        // 동영상 id로 데이터베이스 조회
        const video = await Video.findOne({ videoId });         // 같은 videoId를 가진 다큐먼트 조회
        if (!video) {                                           // 조회되지 않는 경우
            console.error("데이터베이스에 비디오 정보가 존재하지 않음");

            return res.sendStatus(409);                         // 409 상태 코드: 데이터베이스에 비디오가 존재하지 않음
        }

        const userId = req.userId;                             // verifyToken 미들웨어 수행으로 req.user에 사용자 정보 저장
        const user = await User.findOne({ userId });            // 사용자 id로 데이터베이스에서 조회
        
        // 데이터베이스에서 비디오에 대한 사용자의 개인화된 정보를 찾는다
        const userVideo = await UserVideo.findOne({
            user: user._id,
            video: video._id,
        });
        if (!userVideo) {   // 비디오에 대한 사용자의 개인화된 정보가 없을 경우
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 사용자가 동영상을 이어볼 시점을 찾는다
        const markInSeconds = userVideo.markInSeconds;
        // markInSeconds로 썸네일 파일의 이름(인덱스)을 유도한다
        const filename = `thumbnail-${Math.floor(markInSeconds / 5) * 5}.png`;
        
        // 썸네일 이미지가 저장된 경로를 유도한다
        const thumbnailPath = path.join(thumbnailDir, filename);
        
        // 이미지를 스트림으로 전송하기 위해 스트림을 생성한다
        const imageStream = fs.createReadStream(thumbnailPath);
        
        // 일단 성공했다고 가정하고 상태 코드를 설정한다
        res.status(200);
        // 스트림 파이프 연결
        imageStream.pipe(res);
        
        imageStream.on("error", (err) => {
            // 408 상태 코드: 스트림 데이터 전송 중 오류 발생
            return res.sendStatus(408);
        })
    } catch (err) {
        next(err);
    }
};

// 그룹 내 전체 동영상 목록 전송 미들웨어
exports.sendGroupVideoList = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 그룹 id 추출
        const groupId = req.params.groupId;
        // 데이터베이스에서 그룹 조회
        const group = await Group.findOne({ groupId });
        if (!group) {                                   // 데이터베이스에 등록된 그룹이 없을 시
            return res.sendStatus(411);                 // 411 상태 코드: 등록되지 않은 그룹 id
        }

        // 데이터베이스에서 사용자 조회 
        const userId = req.userId;                      // verifyToken 미들웨어 성공 시 req.userId에 사용자 id 저장됨
        const user = await User.findOne({ userId });    // 토큰 기반 인증 캐싱 방법을 사용하고 있기 때문에 반복적인 존재성 검증은 필요하지 않음

        // 데이터베이스에서 사용자와 그룹 간의 연결 조회
        const exGroupUser = await GroupUser.findOne({ group: group._id, user: user._id });  // 사용자가 그룹에 가입되어 있는지 확인
        if (!exGroupUser) {                             // 사용자와 그룹 간의 연결이 존재하지 않는 경우(가입되지 않은 경우)
            return res.sendStatus(499);                 // 499 상태 코드: 접근 권한 위반
        }

        const videos = await Video.find({ group: group._id })
                                  .select("_id videoId title description like view lengthInSeconds createdAt");   // 데이터베이스에서 해당 그룹의 비디오를 모두 찾는다

        let info = [];
        // 그룹 내 각각의 동영상에 대해 개인화된 정보 추가
        // 동영상 목록이 null이 아닐 경우에만 수행한다
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

        // 200 상태 코드: 성공
        // 전송 데이터 형식 { "info": { [동영상 id], [제목], [설명], [좋아요], [조회수], [길이], [생성 일시], [핀 일시], [좋아요 일시], [이어보기 시점] }의 배열 }
        res.status(200).json({ info });
    } catch (err) {
        next(err);
    }
};

// 특정 동영상 정보 전송 미들웨어
exports.sendVideoInformation = async (req, res, next) => {
    try {
        const videoId = req.params.videoId;                 // 요청 파라미터로부터 동영상 id 추출

        // 데이터베이스에서 동영상 조회
        const video = await Video.findOne({ videoId })      // 같은 videoId를 가진 다큐먼트 조회
                                 .populate("group");        // 및 그룹 조회
        if (!video) {                                       // 비디오가 조회되지 않는 경우
            return res.sendStatus(409);                     // 409 상태 코드: 데이터베이스에 비디오가 존재하지 않음
        }

        // vefiryToken 미들웨어의 결과로부터 사용자 id 추출
        const userId = req.userId;
        // 사용자 id로 데이터베이스에서 사용자 조회
        const user = await User.findOne({ userId });
        
        // 비디오 조회 시 얻어온 그룹 다큐먼트로 치환, 데이터베이스 조회 횟수를 줄임
        const group = video.group;

        // 데이터베이스에서 사용자와 그룹 간의 관계 조회
        const groupUser = await GroupUser.findOne({
            user: user._id,
            group: group._id,
        });
        if (!groupUser) {   // 만약 사용자가 그룹에 가입되어 있지 않으면

            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 데이터베이스에서 동영상에 대한 사용자의 개인화된 정보 조회
        const userVideo = await UserVideo.findOne({
            user: user._id,
            video: video._id,
        }); // 앞선 검증으로 UserVideo 다큐먼트가 실제로 있는지는 검증하지 않아도 된다

        // 위 두 조건에서 걸리지 않는다면 데이터베이스와 파일 시스템 모두에 비디오가 있는 것이 검증된 것이다.
        return res.status(200).json({
            videoId,
            uploaderName: user.name,
            groupName: group.name,
            title: video.title,
            description: video.description,
            like: video.like,
            view: video.view,
            lengthInSeconds: video.lengthInSeconds,
            markInSeconds: userVideo.markInSeconds,     // 이어보기 시점은 개인화된 정보이다
            createdAt: video.createdAt,
            pinnedAt: userVideo.pinnedAt,               // 동영상 고정 시점은 개인화된 정보이다
            likedAt: userVideo.likedAt,                 // 좋아요 표시한 시점은 개인화된 정보이다
        });
    } catch (err) {
        next(err);
    }

};

// HLS 스트리밍 시 처음으로 요청해야 할 마스터 플레이리스트 경로 전송 미들웨어
// HLS 스트리밍 요청을 했다는 것은 사용자가 동영상을 재생했다는 의미이므로 조회수 또한 증가시킨다
exports.sendMasterPlaylistPath = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 동영상 id 추출
        const videoId = req.params.videoId;
        // verifyToken 미들웨어에서 저장한 사용자 id 추출
        const userId = req.userId;
    
        // 동영상 id로 동영상 조회
        const video = await Video.findOne({ videoId })
                                .populate("group");     // 동영상이 속한 그룹 정보도 함께 조회
        if (!video) {       // 만약 동영상이 없으면
            // 409 상태 코드: 데이터베이스에 동영상 존재하지 않음
            return res.sendStatus(409);
        }
    
        // 동영상의 그룹 정보 저장
        const group = video.group;
    
        // 사용자 id로 데이터베이스에서 사용자 정보 조회
        const user = await User.findOne({ userId });
    
        // 데이터베이스에서 사용자와 그룹 간의 관계 조회
        const groupUser = await GroupUser.findOne({
            user: user._id,
            group: group._id,
        });
        if (!groupUser) {   // 만약 사용자가 그룹에 가입되어 있지 않으면
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }
    
        // 동영상 id로부터 마스터 플레이리스트가 저장된 경로 유도
        const m3u8Path = path.normalize(`uploads/videos/hls/${videoId}/playlist.m3u8`);

        // 동영상 조회수 1 증가
        await Video.findByIdAndUpdate(video._id, { $inc: { view: +1 } });

        // 200 상태 코드: 성공
        // json 형식으로 경로 URI 인코딩하여 전달
        return res.status(200).json({ path: encodeURIComponent(m3u8Path) });
    } catch (err) {
        next(err);
    }
};

// 동영상의 핀 여부를 토글하는 미들웨어
exports.toggleVideoPin = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 동영상 id 추출
        const videoId = req.params.videoId;
        // verifyToken 미들웨어에서 저장한 사용자 id 추출
        const userId = req.userId;
    
        // 동영상 id로 동영상 조회
        const video = await Video.findOne({ videoId });
        if (!video) {       // 만약 동영상이 없으면
            // 409 상태 코드: 데이터베이스에 동영상 존재하지 않음
            return res.sendStatus(409);
        }
    
        // 사용자 id로 데이터베이스에서 사용자 정보 조회
        const user = await User.findOne({ userId });

        // 데이터베이스에서 동영상의 개인화된 정보 조회
        const userVideo = await UserVideo.findOne({
            user: user._id,
            video: video._id,
        });
        if (!userVideo) {   // 만약 사용자가 그룹에 가입되어 있지 않으면 UserVideo의 다큐먼트도 존재하지 않는다
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료

        // 사용자가 동영상을 고정했는지, 고정 해제했는지 응답할 때 사용되는 변수 선언
        let toggledTo;

        // 동영상이 고정되어 있지 않은 경우
        if (!userVideo.pinnedAt) {
            // 동영상 핀 설정: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            await UserVideo.findByIdAndUpdate(userVideo._id, { pinnedAt: new Date() });
            
            // 핀 설정되었음을 나타낸다
            toggledTo = "pin";
        }
        // 동영상이 고정되어 있는 경우
        else {
            // 동영상 핀 해제: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            await UserVideo.findByIdAndUpdate(userVideo._id, { pinnedAt: null });
            
            // 핀 해제되었음을 나타낸다
            toggledTo = "unpin";
        }
        
        // 200 상태 코드: 성공
        return res.status(200).json(toggledTo);
    } catch (err) {
        next(err);
    }
};

// 동영상의 좋아요 여부를 토글하는 미들웨어
exports.toggleVideoLike = async (req, res, next) => {
    try {
        // 요청 파라미터로부터 동영상 id 추출
        const videoId = req.params.videoId;
        // verifyToken 미들웨어에서 저장한 사용자 id 추출
        const userId = req.userId;
    
        // 동영상 id로 동영상 조회
        const video = await Video.findOne({ videoId });
        if (!video) {       // 만약 동영상이 없으면
            // 409 상태 코드: 데이터베이스에 동영상 존재하지 않음
            return res.sendStatus(409);
        }
    
        // 사용자 id로 데이터베이스에서 사용자 정보 조회
        const user = await User.findOne({ userId });

        // 데이터베이스에서 동영상의 개인화된 정보 조회
        const userVideo = await UserVideo.findOne({
            user: user._id,
            video: video._id,
        });
        if (!userVideo) {   // 만약 사용자가 그룹에 가입되어 있지 않으면 UserVideo의 다큐먼트도 존재하지 않는다
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료

        // 사용자의 좋아요 표시 여부
        let toggledTo;
        // 사용자 요청 이후 동영상의 좋아요 개수
        let like;

        // 동영상에 좋아요 표시가 되어 있지 않은 경우
        if (!userVideo.likedAt) {
            // 동영상 좋아요 설정: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            await UserVideo.findByIdAndUpdate(
                userVideo._id,
                {
                    likedAt: new Date(),
                }
            );

            // 동영상 좋아요 개수 증가: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            like = (await Video.findByIdAndUpdate(
                video._id,
                {
                    $inc: { like: +1 },
                },
                {
                    new: true,
                }
            )).like;

            // 좋아요 설정되었음을 나타낸다
            toggledTo = "like";
        }
        // 동영상에 좋아요 표시가 되어 있는 경우
        else {
            // 동영상 좋아요 취소 설정: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            await UserVideo.findByIdAndUpdate(
                userVideo._id,
                {
                    likedAt: null,
                }
            );

            // 동영상 좋아요 개수 감소: 동기화 문제에 유의해야 하므로 즉시 데이터베이스 쿼리 실행
            like = (await Video.findByIdAndUpdate(
                video._id,
                {
                    $inc: { like: -1 },
                },
                {
                    new: true,
                }
            )).like;

            // 좋아요 취소되었음을 나타낸다
            toggledTo = "unlike";
        }

        // 200 상태 코드: 성공
        // 전환된 상태(좋아요 혹은 좋아요 취소)와 그 이후 동영상의 좋아요 개수를 응답한다
        return res.status(200).json({
            toggledTo,
            like,
        });
    } catch (err) {
        next(err);
    }
};

// 동영상의 제목을 변경하는 미들웨어
exports.changeVideoTitle = async (req, res, next) => {
    try {
        // verifyToken의 결과로부터 사용자 id를 추출한다
        const userId = req.userId;
        // 요청 파라미터로부터 동영상 id를 추출한다
        const videoId = req.params.videoId;
        // 요청 body로부터 변경할 동영상 제목을 추출한다
        const { title } = req.body;

        const video = await Video.findOne({ videoId })      // 데이터베이스에서 동영상 조회
                                 .populate("user");         // 및 User 참조 필드(uploader) 조회
        // 동영상이 존재하지 않는 경우
        if (!video) {
            // 409 상태 코드: 데이터베이스에 동영상 존재하지 않음
            return res.sendStatus(409);
        }
        // 제목을 수정하려는 사용자가 동영상의 업로더가 아닌 경우
        if (video.uploader.userId !== userId) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료

        // 동영상 제목 변경
        video.title = title;
        // 변경 사항 저장
        await video.save();
        
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 동영상의 이어보기 시점을 전송하는 미들웨어
exports.sendVideoPlayback = async (req, res, next) => {
    try{
        const videoId = req.params.videoId;
        const userId = req.userId;

        const user = await User.findOne({ userId });

        const video = await Video.findOne({ videoId });
        if (!video) {
            // 409 상태 코드: 데이터베이스에 동영상 존재하지 않음
            return res.sendStatus(409);
        }
        
        const userVideo = await UserVideo.findOne({
            user: user._id, 
            video: video._id,
        });
        if (!userVideo) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }
        
        return res.status(200).send({ 
            videoId: videoId, 
            markInSeconds: userVideo.markInSeconds,
        });

    } catch (err) {
        next(err);
    }
};

// 동영상의 이어보기 시점을 변경하는 미들웨어
exports.changeVideoPlayback = async (req, res, next) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.userId;
        const stopTime = req.body.stopTime;

        const user = await User.findOne({ userId });

        const video = await Video.findOne({ videoId });
        if (!video) {
            return res.sendStatus(409);
        }

        await UserVideo.findOneAndUpdate(
            {user: user._id, video: video._id}, // 찾고자 하는 필드(user, video)
            {markInSeconds: stopTime},          // 업데이트하려는 필드(markInSeconds)
            {new: true, upsert: true}           // 존재하지 않을 경우 생성
        );

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// 동영상을 삭제하는 미들웨어
exports.deleteVideo = async (req, res, next) => {
    try {
        const { videoId } = req.body;

        const video = await Video.findOne({ videoId })  // 비디오 id로 데이터베이스에서 조회
                                 .populate("group");    // 비디오가 속한 그룹 정보 함께 불러옴

        if (!video) {
            return res.sendStatus(409); // 비디오가 존재하지 않음
        }

        // 그룹의 마스터 object id 추출
        const master = video.group.master.toString();
        // 비디오 업로더 object id 추출
        const uploader = video.uploader.toString();

        // verifyToken 미들웨어 결과로 req.userId에 사용자 id가 저장된다
        const userId = req.userId;
        // 사용자 id로 데이터베이스 조회 및 object id 추출
        const user = (await User.findOne({ userId }))._id.toString();

        // 요청한 사용자가 비디오 업로더도 아니고 그룹의 마스터도 아닐 시
        if ((user !== uploader) && (user !== master)) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }

        // 검증 완료
        
        // 비디오 원본 파일 이름, 썸네일 추출
        const videoExt = video.ext;
        const videoOriginName = videoId + videoExt;

        await UserVideo.deleteMany({ video: video._id });
        
        await Video.findOneAndDelete({ videoId });
        
        deleteFileIfExists(path.join("uploads/videos/", videoOriginName));          // 비디오 원본 삭제
        deleteDirectoryIfExists(path.normalize(`uploads/thumbnails/${videoId}`));   // 비디오 썸네일 삭제
        deleteDirectoryIfExists(path.normalize(`uploads/videos/hls/${videoId}`));   // 비디오 hls 디렉토리 삭제
        
        return res.sendStatus(200);

    } catch (err) {
        console.error('Error: ', error);
        return res.sendStatus(500);
    }
};

// 동영상 설명 변경 미들웨어
exports.changeVideoDescription = async (req, res, next) => {
    try {
        // verifyToken 미들웨어가 실행되었다고 가정하고 req 객체에서 사용자 id 추출
        const userId = req.userId;
        // 요청 파라미터로부터 동영상 id 추출
        const videoId = req.params.videoId;
        // 요청 body로부터 새로운 설명글 추출
        const { description } = req.body;
    
        // 데이터베이스에서 동영상 조회
        const video = await Video.findOne({ videoId })
                                 .populate("uploader");
        
        // 동영상이 존재하지 않는 경우
        if (!video) {
            // 409 상태 코드: 동영상이 존재하지 않음
            return res.sendStatus(409);
        }
        
        // 동영상 업로더가 아닌 사람이 요청했을 경우
        if (video.uploader.userId !== userId) {
            // 499 상태 코드: 접근 권한 위반
            return res.sendStatus(499);
        }
        
        // 검증 완료

        // 동영상의 설명 바꾸기
        await Video.findByIdAndUpdate(video._id, {
            description,
        });
        
        // 200 상태 코드: 성공
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }    
};