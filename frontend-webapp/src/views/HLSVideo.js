import {useRef, useEffect, useState} from 'react';
//import Button from '@enact/sandstone/Button';
import Hls from 'hls.js';
import apiURL from '../shared/apiConfig';

const HLSVideo = props => {
	const videoRef = useRef(null);
	const hlsRef = useRef(null);
	const [playbackTime, setPlaybackTime] = useState(0);
	//console.log(props);

	const fetchPlaybackTime = async () => {
		try {
			const response = await fetch(
				`${apiURL}/api/videos/playback/${props.videoId}`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
			const data = await response.json();
			console.log(data);
			setPlaybackTime(data.markInSeconds);
			//console.log(typeof(data.markInSeconds));
		} catch (error) {
			console.error('Error fetching playback time:', error);
		}
	};

	const patchPlaybackTimeToServer = currentTime => {
		fetch(`${apiURL}/api/videos/playback/${props.videoId}`, {
			method: 'PATCH',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({stopTime: currentTime})
		})
			.then(data => {
				console.log('Playback time successfully sent to the server:', data);
			})
			.catch(error => {
				console.error('Error sending playback time to the server:', error);
			});
	};

	useEffect(() => {
		// 동영상 재생 시점 불러오기
		fetchPlaybackTime();
	}, [props.videoId]); // videoId가 변경될 때마다 playbackTime을 불러옵니다.

	useEffect(() => {
		// playbackTime 상태가 업데이트된 후에 HLS 로직을 시작합니다.
		const initializeHls = () => {
			const video = videoRef.current;
			if (Hls.isSupported() && video) {
				const hls = new Hls({
					autoStartLoad: false
				});
				hls.loadSource(props.src);
				hls.attachMedia(video);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					hls.startLoad(playbackTime);
				});

				// 'canplay' 이벤트 핸들러
				video.addEventListener('canplay', () => {
					video.play().catch(e => {
						console.error('Video play failed:', e);
					});
				});

				// 'error' 이벤트 핸들러
				video.addEventListener('error', e => {
					console.error('Video error:', e);
				});

				// 'pause' 이벤트 핸들러
				video.addEventListener('pause', () => {
					console.log('pause');
					const currentTime = Math.round(video.currentTime);
					patchPlaybackTimeToServer(currentTime);
				});

				// 'ended' 이벤트 핸들러
				video.addEventListener('ended', () => {
					console.log('stop');
					patchPlaybackTimeToServer(0);
					if (playbackTime === 0) {
						setPlaybackTime(-1);
					} else {
						setPlaybackTime(0);
					}
				});

				hlsRef.current = hls;
			}
		};

		if (playbackTime !== undefined) {
			initializeHls();
		} else {
			console.log(`playbackTime: ${playbackTime}`);
		}
	}, [props.src, playbackTime]);

	return (
		<>
			{/* <div>

				<Button icon="list" size="small" />
				<Button icon="playspeed" size="small" />
				<Button icon="speakercenter" size="small" />
				<Button icon="miniplayer" size="small" />
				<Button icon="subtitle" size="small" />
		</div> */}

			<video
				style={{width: '100vw', height: '80vh'}}
				ref={videoRef}
				controls
				height={720}
				width={1440}
			/>
		</>
	);
};

export default HLSVideo;
