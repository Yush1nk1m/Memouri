import React, { useState } from 'react';
import apiURL from '../shared/apiConfig';
import { Link, useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (loggedInId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="title">Memouri</div>
      <div className="des">우리의 이야기, 함께 간직해보세요.</div>
      <div className="background">
        <h2>로그인</h2>
        <div className="form">
          <p>
            <input
              className="login"
              type="text"
              name="username"
              placeholder="아이디"
              onChange={(e) => {
                setId(e.target.value);
              }}
            />
          </p>
          <p>
            <input
              className="login"
              type="password"
              name="pwd"
              placeholder="비밀번호"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyDown={(e) => {
                console.log('pressed');
                if (e.key === 'Enter') {
                  const userData = {
                    userId: id,
                    password: password,
                  };
                  fetch(`${apiURL}/api/users/login`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      console.log('로그인');
                      onLogin(id);
                      navigate('/editor/');
                    })
                    .catch((error) => {
                      // Handle errors
                      console.error('Error:', error);
                    });
                }
              }}
            />
          </p>
          <p>
            <input
              className="submit"
              type="button"
              value="로그인"
              onClick={() => {
                const userData = {
                  userId: id,
                  password: password,
                };
                fetch(`${apiURL}/api/users/login`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(userData),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    console.log('로그인');
                    onLogin(id);
                    navigate('/editor/');
                  })
                  .catch((error) => {
                    // Handle errors
                    console.error('Error:', error);
                  });
              }}
            />
          </p>
        </div>
        <div>
          계정이 없으신가요?{' '}
          <div>
            <Link to="/signup" className="returnbtn">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
