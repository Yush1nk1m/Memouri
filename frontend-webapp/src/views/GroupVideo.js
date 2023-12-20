import Panels from '@enact/sandstone/Panels';
import { Panel } from '@enact/sandstone/Panels';
import Image from '@enact/sandstone/Image';
import BodyText from '@enact/sandstone/BodyText';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiURL from '../shared/apiConfig';
import css from '../scss/GroupVideo.module.less';
import Scroller from '@enact/sandstone/Scroller';
const GroupVideo = props => {
	const [videos, setVideos] = useState([]);
	const navigate = useNavigate();
	const { groupId } = props;
	const location = useLocation();
	// console.log(location);
	const pathSegments = location.pathname.split('/'); // 경로를 '/'로 나누어 배열로 만듦
	const groupPath = pathSegments.slice(2).join('/'); // '/group' 이후의 부분을 추출하고 다시 합침

	console.log(groupPath); // 추출된 '/group' 이후의 부분을 출력 또는 필요한 곳에서 사용
	const sortVideosByPinnedDate = videos => {
		return videos.sort((videoA, videoB) => {
			const dateA = videoA.pinnedAt ? new Date(videoA.pinnedAt) : null;
			const dateB = videoB.pinnedAt ? new Date(videoB.pinnedAt) : null;

			if (dateA && dateB) {
				return dateB - dateA; // 날짜 오름차순 정렬
			} else if (dateA) {
				return -1; // dateA만 존재하면 dateA가 더 앞에 오도록 정렬
			} else if (dateB) {
				return 1; // dateB만 존재하면 dateB가 더 앞에 오도록 정렬
			} else {
				return 0; // 둘 다 존재하지 않으면 순서 변경 없음
			}
		});
	};

	const getGroupVideos = async groupId => {
		try {
			const response = await fetch(`${apiURL}/api/videos/list/${groupId}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const groupVideoData = await response.json();

			const groupVideoList = groupVideoData.info.map(video => ({
				videoId: video.videoId,
				title: video.title,
				desc: video.description,
				date: video.createAt,
				like: video.like,
				groupId: groupId,
				thumbnail: '',
				pinnedAt: video.pinnedAt
			}));

			if (groupVideoData.info.length > 0) {
				const groupVideoWithThumbnail = await Promise.all(
					groupVideoList.map(async video => {
						try {
							const thumbnailData = await fetch(
								`${apiURL}/api/videos/thumbnail/${video.videoId}`,
								{
									method: 'GET',
									credentials: 'include',
									headers: {
										'Content-Type': 'blob'
									},
									timeout: 10000
								}
							);

							if (thumbnailData.ok) {
								const thumbnailBlob = await thumbnailData.blob();
								const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
								return { ...video, thumbnail: thumbnailUrl };
							} else {
								console.error(thumbnailData);
								return video;
							}
						} catch (error) {
							console.error(error);
						}
					})
				);
				console.log(groupVideoWithThumbnail);
				const sortedVideos = sortVideosByPinnedDate(groupVideoWithThumbnail);
				// console.log(`썸네일 추가 비디오: ${groupVideoWithThumbnail.videoId}`);
				setVideos(sortedVideos);
			} else {
				setVideos([]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getGroupVideos(groupPath);
	}, [groupPath]);

	const handleThumbnailClick = (groupId, videoId) => {
		console.log(`groupId: ${groupId}`);
		navigate(`/group/${groupId}/video/${videoId}`);
	};

	// const sortPinnedVideos = (videoA, videoB) => {
	// 	if (videoA.pinnedAt && !videoB.pinnedAt) {
	// 		return -1;
	// 	} else if (!videoA.pinnedAt && videoB.pinnedAt) {
	// 		return 1;
	// 	} else {
	// 		return 0;
	// 	}
	// };

	return (
		<div>
			<div className={css.GroupVideoWrapper}>
				{videos.map((video, key) => (
					<div className={css.video} key={key}>
						<Image
							className={css.videoThumbnail}
							src={video.thumbnail}
							onClick={() => handleThumbnailClick(video.groupId, video.videoId)}
						/>
						{video.pinnedAt ? (
							<div style={{ position: 'fixed', marginTop: '0px' }}>📌</div>
						) : (
							<></>
						)}
						<BodyText
							className={css.videoTitle}
							onClick={() => handleThumbnailClick(video.groupId, video.videoId)}
						>
							{video.title}
						</BodyText>
					</div>
				))}
			</div>
			<Scroller>
				<div>
					saas
				</div>
			</Scroller>
		</div>
	);
};

export default GroupVideo;
