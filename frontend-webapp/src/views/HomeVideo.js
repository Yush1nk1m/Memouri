import Panel from '@enact/sandstone/Panels';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Image from '@enact/sandstone/Image';
import BodyText from '@enact/sandstone/BodyText';
import apiURL from '../shared/apiConfig';
import css from '../scss/HomeVideo.module.less';
const HomeVideo = props => {
	const videos = props.videos;
	const setVideos = props.setVideos;
	const navigate = useNavigate();
	const headerMenus = props.headerMenus;
	// console.log(props);

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

	const getVideos = async groupId => {
		try {
			const response = await fetch(`${apiURL}/api/videos/list/${groupId}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const groupVideoData = await response.json();
			// console.log(groupVideoData);
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
								return {...video, thumbnail: thumbnailUrl};
							} else {
								console.error(thumbnailData);
								return video;
							}
						} catch (error) {
							console.error(error);
						}
					})
				);

				const combinedVideos = [...videos, ...groupVideoWithThumbnail];
				const sortedVideos = sortVideosByPinnedDate(combinedVideos);
				return sortedVideos;
			} else {
				return [];
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		console.log(headerMenus);
		let vids = [];
		const getAllVideos = async () => {
			for (const group of headerMenus) {
				const newvid = getVideos(group.groupId);
				console.log('newvid' + newvid);
				vids = [...vids, newvid];
			}
		};
		getAllVideos();
		setVideos[vids];
	}, []);

	const handleThumbnailClick = (groupId, videoId) => {
		console.log(`groupId: ${groupId}`);
		navigate(`/group/${groupId}/video/${videoId}`);
	};

	return (
		<BodyText style={{color: 'white', paddingLeft: '500px'}}>
			{videos.length}
		</BodyText>
		// <div className={css.HomeVideoWrapper}>
		// 	{videos.map((video, key) => (
		// 		<div className={css.video} key={key}>
		// 			<Image
		// 				className={css.videoThumbnail}
		// 				src={video.thumbnail}
		// 				onClick={() => handleThumbnailClick(video.groupId, video.videoId)}
		// 			/>

		// 			<BodyText
		// 				className={css.videoTitle}
		// 				onClick={() => handleThumbnailClick(video.groupId, video.videoId)}
		// 			>
		// 				{video.title}
		// 			</BodyText>
		// 		</div>
		// 	))}
		// </div>
	);
};

export default HomeVideo;
