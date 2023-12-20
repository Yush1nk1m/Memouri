import Item from '@enact/sandstone/Item';
import Button from '@enact/sandstone/Button';
import Alert from '@enact/sandstone/Alert';
import {useState, useEffect, useRef, useCallback} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import GroupVideo from '../views/GroupVideo';
import HomeVideo from '../views/HomeVideo';
import apiURL from '../shared/apiConfig';
import $L from '@enact/i18n/$L';
import css from '../scss/Header.module.less';
import {useProcStat, useUnitList} from '../hooks/useData';
import BodyText from '@enact/ui/BodyText';

const Header = props => {
	const [headerMenus, setHeaderMenus] = useState([]);
	const [isPopupOpen, openPopup] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState('');
	const [activeGroup, setActiveGroup] = useState(0);
	const [videos, setVideos] = useState([]);
	const navigate = useNavigate();
	const location = useLocation();
	const procStat = useProcStat();
	const memStat = useUnitList();

	// groupList 불러와서 headerMenus 만들기
	useEffect(() => {
		const getGroupList = async () => {
			try {
				const response = await fetch(`${apiURL}/api/groups/list`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const groupList = await response.json();

				const newHeaderMenus = groupList.map(group => ({
					groupName: group.groupName,
					groupId: group.groupId,
					src: `/group/${group.groupId}`
				}));
				console.log('useeffect');
				setHeaderMenus(newHeaderMenus);
			} catch (error) {
				console.error(error);
			}
		};
		getGroupList();
	}, []);

	//헤더 메뉴에서 그룹 클릭 시, 그룹별 비디오 페이지로 이동하기
	const handleGroupClick = groupId => {
		// console.log(groupId);
		setActiveGroup(1);
		setSelectedGroupId(groupId);
		// console.log(`selectedGroupId: ${selectedGroupId}`);
		navigate(`/group/${groupId}`);
	};

	//로그아웃 함수
	const logout = async () => {
		try {
			await fetch(`${apiURL}/api/users/logout`, {
				method: 'POST',
				credentials: 'include'
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handlePopupOpen = useCallback(() => {
		openPopup(true);
	}, []);

	const handlePopupClose = useCallback(() => {
		openPopup(false);
		logout();
		navigate('/');
	});

	const onLogoClick = () => {
		setActiveGroup(0);
		console.log(headerMenus);
		// navigate('/home');
	};

	// useEffect(() => {
	// 	// useEffect 내에서 activeGroup이 변경될 때의 추가 작업 수행
	// 	// console.log(activeGroup);/
	// 	if (activeGroup === 0) {
	// 		navigate('/home');
	// 	}
	// }, [activeGroup]);

	return (
		<>
			<div className={css.headerWrapper}>
				<Item className={css.heading} onClick={onLogoClick}>
					Memouri
				</Item>
				{/* <ul> */}
				{headerMenus.map((menu, key) => (
					<div key={key}>
						<Item
							className={css.item}
							onClick={() => handleGroupClick(menu.groupId)}
						>
							📁 {menu.groupName}
						</Item>
					</div>
				))}
				{/* </ul> */}

				<Button onClick={handlePopupOpen} size="small" icon="backspace" />
				<Alert open={isPopupOpen}>
					<span>{$L('로그아웃 하시겠습니까?')}</span>
					<Button onClick={handlePopupClose}>{$L('OK')}</Button>
				</Alert>
				<div className={css.ResourceMonitor}>
					<BodyText className="item">
						CPU : {JSON.stringify(procStat).replace(/"/g, '') + '%'}
					</BodyText>
					<BodyText className="item">
						MEM: {JSON.stringify(memStat).replace(/"/g, '') + '%'}
					</BodyText>
				</div>
			</div>

			<GroupVideo groupId={selectedGroupId} />
		</>
	);
};

export default Header;
