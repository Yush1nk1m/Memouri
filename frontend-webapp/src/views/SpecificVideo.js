import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Panel from '@enact/sandstone/Panels';
import HLSVideo from './HLSVideo';
import apiURL from '../shared/apiConfig';
import Button from '@enact/sandstone/Button';
import Item from '@enact/sandstone/Item';
import Heading from '@enact/sandstone/Heading';
import BodyText from '@enact/sandstone/BodyText';
import css from '../scss/SpecificVideo.module.less';

const SpecificVideo = () => {
	const [videoPath, setVideoPath] = useState('');
	const [videoTitle, setVideoTitle] = useState('');
	const [videoDesc, setVideoDesc] = useState('');
	const {videoId} = useParams();
	const [isLiked, setIsLiked] = useState(0);

	const navigate = useNavigate();

	const handleClick = () => {
		navigate(-1);
	};

	const loadVideoPath = async videoid => {
		try {
			const response = await fetch(`${apiURL}/api/videos/hls/${videoid}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			const decodedPath = decodeURIComponent(data.path);

			console.log(`불러온 Video 경로: ${decodedPath}`);

			return decodedPath;
		} catch (error) {
			console.error('Error fetching video path:', error);
			return null;
		}
	};
	const patchLikeVideo = async videoid => {
		try {
			const response = await fetch(`${apiURL}/api/videos/like/${videoid}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			if (data.like !== 0) {
				setIsLiked(data.like);
			} else {
				setIsLiked(0);
			}

			console.log(`Video(${videoid})의 좋아요 여부: ${data}`);
		} catch (error) {
			console.error('Error patching video like:', error);
		}
	};
	const patchPinVideo = async videoid => {
		try {
			const response = await fetch(`${apiURL}/api/videos/pin/${videoid}`, {
				method: 'PATCH',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			//console.log(data);
		} catch (error) {
			console.error('Error patching video like:', error);
		}
	};
	const loadVideoLikeNumber = async videoid => {
		try {
			const response = await fetch(`${apiURL}/api/videos/info/${videoid}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			setIsLiked(data.like);
			setVideoTitle(data.title);
			setVideoDesc(data.description);
		} catch (error) {
			console.error('Error Loadint the number of video like:', error);
		}
	};

	// useEffect(() => {
	loadVideoPath(videoId).then(path => {
		const fullVideoPath = `${apiURL}/${path}`;
		setVideoPath(fullVideoPath);
	});
	loadVideoLikeNumber(videoId);
	// }, [videoId]);

	return (
		<div className={css.specificVideoWrapper}>
			{videoPath && (
				<HLSVideo
					className={css.specificVideo}
					title="Video Title"
					subtitle="Video Subtitle"
					src={videoPath}
					poster="URL_TO_YOUR_POSTER_IMAGE"
					videoId={videoId}
					autoplay
				/>
			)}
			<div className={css.buttonBar}>
				<Button icon="arrowhookleft" size="big" onClick={handleClick} />
				<Button
					style={{
						color: isLiked === 1 ? 'red' : 'inherit'
					}}
					// className={css.likeButton}
					icon="heart"
					onClick={() => {
						patchLikeVideo(videoId);
					}}
				/>
				<Item className={css.likeNumber} size="big">
					{isLiked}
				</Item>
				<Button
					style={{
						marginRight: '50px'
					}}
					icon="📎"
					onClick={() => {
						patchPinVideo(videoId);
					}}
				/>
			</div>
			<div className={css.desc}>
				<Heading className="desc__title">{videoTitle}</Heading>
				<BodyText className="desc__content" size="small">
					{videoDesc}
				</BodyText>
			</div>
		</div>
	);
};

export default SpecificVideo;
