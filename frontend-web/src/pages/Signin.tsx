import React, { useState } from 'react';
import apiURL from '../shared/apiConfig';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signin = (props: any) => {
  const navigate = useNavigate();
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');

  return (
    <div className="container">
      <div className="background">
        <h2>회원가입</h2>

        <div className="form">
          <p>
            <input
              className="login"
              type="text"
              placeholder="아이디"
              onChange={(e) => {
                setId(e.target.value);
              }}
            />
          </p>
          <p>
            <input
              className="login"
              type="text"
              placeholder="이름"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              placeholder="비밀번호"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              placeholder="비밀번호 확인"
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
            />
          </p>
          <p>
            <input
              className="login"
              type="text"
              placeholder="이메일 주소를 입력하세요"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </p>
          <p>
            <button
              className="submit"
              onClick={() => {
                if (password !== password2) {
                  alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                  return;
                }

                const userData = {
                  userId: id,
                  password: password,
                  name: name,
                  email: email,
                };

                axios
                  .post(`${apiURL}/api/users/join`, userData, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })
                  .then((response) => {
                    // Check the status code
                    if (response.status === 200) {
                      const json = response.data;
                      alert('가입완료');
                      console.log('회원가입에 성공했습니다.');
                      navigate('/');
                    } else {
                      // Handle other status codes as needed
                      console.error(
                        `Unexpected status code: ${response.status}`,
                      );
                    }
                  })
                  .catch((error) => {
                    if (error.response) {
                      console.log(error.response.status);
                    }
                  });
              }}
            >
              회원가입
            </button>
          </p>
        </div>
        <p>
          로그인화면으로 돌아가기{' '}
          <Link to="/login" className="returnbtn">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signin;
