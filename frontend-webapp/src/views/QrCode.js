import React from 'react'
import apiURL from '../shared/apiConfig';
import { EventSourcePolyfill } from "event-source-polyfill"
import { useNavigate } from 'react-router-dom';
import css from '../scss/Login.module.less';

const QrCode = () => {
    const navigate = useNavigate();

    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        const Blob = window.Blob || window.WebKitBlob || window.MozBlob;
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }


    //서버에서 QR코드 이미지 가져오기
    const fetchQRCode = async () => {
        try {
            const response = await fetch(`${apiURL}/api/users/qrlogin`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            // console.log(data);
            const sessionId = data.sessionId;
            const imageBlob = data.qrCodeDataURL.includes('base64')
                ? dataURItoBlob(data.qrCodeDataURL)
                : await fetch(data.qrCodeDataURL).then(res => res.blob());

            const imageURL = URL.createObjectURL(imageBlob);

            // 이미지 엘리먼트 생성 및 소스 설정
            const imgElement = document.createElement('img');
            // console.log(imgElement);
            imgElement.src = imageURL;

            // 이미지를 표시하는 엘리먼트에 추가
            document.getElementById('imageContainer').appendChild(imgElement);
            console.log("session: ", data.sessionId);

            // const urlDiv = document.getElementById('url');
            // const link = document.createElement('a');
            // link.href = `/api/users/qrlogin/${data.sessionId}`;
            // link.textContent = 'QR Login 연결 링크';

            // link.target = '_blank'; // 새 창에서 열리도록 설정 (선택 사항)

            // urlDiv.appendChild(link);

            //데이터를 가져올 URL을 작성한다.
            // eventSource = new EventSourcePolyfill
            const eventSource = new EventSourcePolyfill(`${apiURL}/api/users/qrlogin/connect/` + data.sessionId, { withCredentials: false });


            //브라우저가 SSE지원하는지 체크
            if (typeof (EventSourcePolyfill) !== "undefined") {
                console.log("sse지원");
            } else {
                console.log("sse미지원");
            }


            // 서버와 커넥션이 맺어질 때 동작한다
            eventSource.addEventListener('open', function (e) {
                console.log(`connection is open`);
            });


            // 서버에서 데이터를 보낼 때 event없이 보내면 동작한다
            eventSource.addEventListener('message', function (e) {
                console.log(e.data);
            });
            console.log(data.sessionId);
            // 서버에서 데이터를 보낼 때 event를 QR로 설정해서 보낼 때 동작한다
            eventSource.addEventListener('QR', event => {
                const data = JSON.parse(event.data);
                console.log(sessionId);
                console.log(`${data.message0}`);
                console.log(`${data.message1}`);
                console.log(`${data.message2}`);
                if (data.message0 == sessionId) { // 로그인 성공
                    console.log('changed');
                    eventSource.close();
                    // localStorage.setItem('accessToken', data.message1);
                    // localStorage.setItem('refreshToken', data.message2);
                    // <!-- window.location.href = "http://localhost:4000"; -->
                    fetch(`${apiURL}/api/users/setCookie`, {
                        method: 'POST',
                        //   credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            accessToken: data.message1,
                            refreshToken: data.message2,
                        }),
                    })
                        .then(res => {
                            if (res.status == 200) {
                                //   window.location.href = "http://localhost:4000";
                                navigate('/home');
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }
            });



            eventSource.addEventListener('green', event => {
                const data = JSON.parse(event.data);
                console.log(`red : ${data.message}`);
            });


            // 서버에서 데이터를 보낼 때 event를 blue로 설정해서 보낼 때 동작한다
            eventSource.addEventListener('blue', event => {
                const data = JSON.parse(event.data);
                console.log(`blue : ${data.message}`);
            });


            // 에러 발생 시 동작한다.
            eventSource.addEventListener('error', function (e) {
                if (e.eventPhase == EventSourcePolyfill.CLOSED) {
                    eventSource.close()
                }
                if (e.target.readyState == EventSourcePolyfill.CLOSED) {
                    console.log("Disconnected");
                }
                else if (e.target.readyState == EventSourcePolyfill.CONNECTING) {
                    console.log("Connecting...");
                }
            }, false);



        } catch (error) {
            console.error('Error fetching and displaying QR Code:', error);
        }
    };

    fetchQRCode();

    return (

        <div className={css.loginWrapper}>
            <div className={css.title}>Memouri</div>
            <div className={css.des}>우리의 이야기, 함께 간직해보세요.</div>
            <div className={css.formWrapper}>
                <div className="form">
                    <div id="imageContainer"
                        style={{
                            width: '30%',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    ></div>
                    <div className="des"
                        style={{
                            color: 'black',
                            top: '80%',
                            width: '100%'
                        }}
                    >
                        <b>스마트폰을 이용해 QR 코드를 스캔하세요.</b>
                    </div>
                </div>
            </div>
            {/* <div id="url"></div> */}
        </div>
    )
}

export default QrCode