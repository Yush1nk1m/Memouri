/* eslint-disable */
import Button from '@enact/sandstone/Button';
import {InputField} from '@enact/sandstone/Input';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import $L from '@enact/i18n/$L';
import apiURL from '../shared/apiConfig';
import {Panel} from '@enact/sandstone/Panels';
import css from '../scss/Login.module.less';

const Login = props => {
	const [state, setState] = useState({
		userId: '',
		password: ''
	});
	const navigate = useNavigate();

	const handleSubmit = () => {
		fetch(`${apiURL}/api/users/login`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(state)
		})
			.then(response => {
				if (response.status === 200) {
					console.log('로그인에 성공하였습니다.');
					navigate('/home');
				} else {
					console.log('아이디 혹은 비밀번호를 다시 확안하세요.');
				}
			})
			.catch(error => console.error(error));
	};

	const handleQrSubmit = () => {
		navigate('/qrcode');
	};

	return (
		<>
			<div className={css.loginWrapper}>
				<div className={css.title}>Memouri</div>
				<div className={css.des}>우리의 이야기, 함께 간직해보세요.</div>
				<div className={css.formWrapper}>
					<InputField
						className={css.login}
						type="text"
						value={state.userId}
						onChange={e => setState(prev => ({...prev, userId: e.value}))}
						placeholder="Id"
					/>
					<InputField
						className={css.login}
						type="password"
						value={state.password}
						onChange={e => setState(prev => ({...prev, password: e.value}))}
						placeholder="Password"
					/>
					<div className={css.submitWrapper}>
						<Button className={css.submit} onClick={handleSubmit} type="submit">
							{$L('로그인')}
						</Button>
						<Button
							className={css.submit}
							onClick={handleQrSubmit}
							type="submit"
						>
							{$L('QR코드')}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
