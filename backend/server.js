const express = require('express');
const path = require("path");
const morgan = require("morgan");   // 디버깅용 로그 출력하는 패키지(서버 완성 시 삭제)

const mongoose = require('mongoose');
const apiRoutes = require("./routes/api");
const fileRoutes = require("./routes/file");

const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || 'mongodb://0.0.0.0:27017/mydb';

// CORS 설정으로 다른 도메인에서 파일을 요청할 수 있게 허용한다
const cors = require('cors');

app.use(cors({origin: true, credentials: true}));

// .env 사용을 위한 설정
const dotenv = require("dotenv");   // .env에 저장된 비밀 키를 사용하기 위한 패키지
dotenv.config();
// .env 사용을 위한 설정

mongoose.set('strictQuery', false);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(morgan("dev"));   // 서버 테스트용 패키지 설정(서버 완성 시 삭제)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());

// html 코드를 클라이언트에 제공하기 위한 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, "public")));

// hls 스트리밍 관련 파일을 제공하기 위한 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, "uploads/videos/hls")));

// form 데이터를 파싱하기 위한 미들웨어
app.use(express.urlencoded({ extended: true }));

// cookie-parser 로 req에 쿠키 저장
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).render("/");
});

// 외부에서 파일 요청을 했을 때 처리해주는 라우터를 등록한다
app.use("/uploads", fileRoutes); 

// /api 주소로 들어오는 모든 요청에 대한 라우터는 ./routes/api.js 가 매핑해줄 것이다.
app.use("/api", apiRoutes);

// 잘못된 경로 에러 처리
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어: 모든 서버 에러 발생 시 이 미들웨어로 진행된다
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  console.error(err);
  res.sendStatus(err.status || 500);
});

// 파일 시스템에 필요한 디렉터리 생성
const { accessOrCreateDirectory } = require("./controllers/file");
accessOrCreateDirectory("uploads/pictures");
accessOrCreateDirectory("uploads/thumbnails");
accessOrCreateDirectory("uploads/videos/hls");

app.listen(port, () => console.log(`Server listening on port ${port}`));