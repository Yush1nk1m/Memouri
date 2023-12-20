/*
file controller
파일 시스템 조작과 관련된 미들웨어 및 함수 정의
*/
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// multer를 이용해 이미지 업로드 시의 동작을 정의한다
exports.uploadImage = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {                        // 파일 저장 경로 설정
            cb(null, "uploads/pictures/");
        },

        filename(req, file, cb) {                           // 파일 이름 설정
            const ext = path.extname(file.originalname);    // 확장자 추출
            cb(null, req.userId + ext);                    // [사용자 id].[확장자]로 파일 이름 설정
        },
    }),

    //limits: { fileSize: 5 * 1024 * 1024 },  // 일단 사진 크기에 제한을 두지 않는다.
});

// multer를 이용해 동영상 업로드 시의 동작을 정의한다
exports.uploadVideo = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {    // 파일 저장 경로 설정
            cb(null, "uploads/videos/");
        },

        filename(req, file, cb) {       // 파일 이름 설정
            const ext = path.extname(file.originalname);        // 확장자 추출
            cb(null, req.user.id + Date.now() + ext);           // "[업로더의 id][현재 시각][확장자]" 포맷으로 파일 이름 설정
        },
    }),

    //limits: { fileSize: 100 * 1024 * 1024 },  // 일단 비디오 크기에 제한을 두지 않는다.
});

// 경로에 있는 파일이 존재하면 삭제하는 함수
exports.deleteFileIfExists = (path) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 해당 경로에 파일이 존재하는지 확인
            await fs.promises.access(path, fs.constants.F_OK);      // 존재하지 않을 경우 에러 발생
    
            // 파일이 존재할 경우 삭제
            await fs.promises.unlink(path);                         // 삭제되지 않을 경우 에러 발생

            resolve();
        } catch (err) {
            if (err.code === "ENOENT") {                            // ENOENT(경로상에 파일 존재하지 않음) 외의 에러 발생 시
                resolve();                                          // 서버 에러로 판단해 throw 한다
            } else {
                reject(err);
            }
        }
    });
};

// 경로에 해당하는 디렉터리가 없으면 생성하는 함수
exports.accessOrCreateDirectory = (path) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 해당 경로가 존재하는지 확인
            await fs.promises.access(path, fs.constants.F_OK);      // 존재하지 않을 경우 에러 발생

            resolve();
        } catch (err) {
            if (err.code === "ENOENT") {                            // 경로가 존재하지 않을 경우
                await fs.promises.mkdir(path, { recursive: true }); // 디렉터리를 새로이 생성한다
                
                resolve();
            } else {
                reject(err);                                        // 이외의 오류는 서버 에러로 판단해 throw 한다
            }
        }
    });
};

// 디렉터리와 그 내용을 삭제하는 함수
exports.deleteDirectoryIfExists = (directoryPath) => {
    return new Promise((resolve, reject) => {
        try {
            if (fs.existsSync(directoryPath)) {
                fs.readdirSync(directoryPath).forEach((file) => {
                    const curPath = path.join(directoryPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) { // 디렉터리인 경우 재귀 삭제
                        this.deleteDirectoryIfExists(curPath);
                    } else { // 파일인 경우 삭제
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(directoryPath);
    
                resolve();
            } else {
                console.log("해당 디렉터리리가 존재하지 않습니다.");
            }
        } catch (err) {
            reject(err);
        }
    });
};
