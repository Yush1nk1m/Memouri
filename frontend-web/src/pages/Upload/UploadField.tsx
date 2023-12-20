import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import apiURL from '../../shared/apiConfig';
import './UploadField.css';
import axios from 'axios';
import { format } from 'date-fns';

import {
  VideoWithThumbnail,
  UploadFieldProps,
  UploadListProps,
} from '../../shared/types';

const UploadField: React.FC<UploadFieldProps> = ({ selectedGroupId }) => {
  const [videos, setVideos] = useState<VideoWithThumbnail[]>([]);
  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/users/videos/${selectedGroupId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const videos = await response.json();

      // Fetch thumbnails for each video
      const videosWithThumbnails = await Promise.all(
        videos.map(async (video: VideoWithThumbnail) => {
          try {
            const thumbnailResponse = await axios.get(
              `${apiURL}/api/videos/thumbnail/${video.videoId}`,
              {
                withCredentials: true,
                responseType: 'arraybuffer',
              },
            );

            const arrayBuffer = thumbnailResponse.data;
            const blob = new Blob([arrayBuffer], { type: 'image/png' });
            const thumbnailUrl = URL.createObjectURL(blob);

            return { ...video, thumbnail: thumbnailUrl };
          } catch (error) {
            console.error('Error: thumbnail 불러오기 오류\n', error);
            return video;
          }
        }),
      );

      setVideos(videosWithThumbnails);
    } catch (error) {
      console.error('Error: group 불러오기 오류\n', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedGroupId]);

  const onDelete = (videoId: string) => {
    try {
      fetch(`${apiURL}/api/videos`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: videoId }),
      }).then(() => {
        console.log('log: 비디오 삭제(delete) 성공\n');
        fetchVideos();
      });
    } catch (error) {
      console.error('Error: 비디오 삭제(delete) 오류\n', error);
    }
  };

  return (
    <div>
      <p>{/* Something here */}</p>
      <div>
        <Filter />
        <UploadList videos={videos} onDelete={onDelete} />
        <CreateVideoModal selectedGroupId={selectedGroupId} />
      </div>
    </div>
  );
};

const Filter = () => {
  return (
    <div className="Filter">
      <div className="item">삭제</div>
      <div className="item">영상</div>
      <div className="item">제목</div>
      <div className="item">조회수</div>
      <div className="item">동영상 길이</div>
      <div className="item">업로드한 시간</div>
      <div className="item">설명</div>
    </div>
  );
};

const UploadList: React.FC<UploadListProps> = ({ videos, onDelete }) => {
  return (
    <>
      {videos.map((video) => (
        <div className="video-container" key={video.videoId}>
          <div className="item">
            <button onClick={() => onDelete(video.videoId)}>-</button>
          </div>
          <div className="item">
            <img className="thumbnail" src={video.thumbnail} alt="thumbnail" />
          </div>
          <div className="item">{video.title}</div>
          <div className="item">{video.view}</div>
          <div className="item">{Math.floor(video.lengthInSeconds)}초</div>
          <div className="item">
            {format(new Date(video.createdAt), 'yyyy년 MM월 dd일 HH시 mm분')}
          </div>
          <div className="item">{video.description}</div>
        </div>
      ))}
    </>
  );
};

const CreateVideoModal = ({
  selectedGroupId,
}: {
  selectedGroupId: string | undefined;
}) => {
  const [file, setFile] = useState<File | undefined>();
  const [title, setTitle] = useState<string>('');
  const [description, setdescrpition] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const upload = async (formData: FormData) => {
    try {
      setUploading(true);
      axios
        .post(`${apiURL}/api/videos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        })
        .then(() => {
          setUploading(false);
          closeModal();
        });
    } catch (error) {
      alert('비디오 업로드 실패');
      console.log(error);
    }
  };

  const showModal = () => {
    dialogRef.current?.showModal();
  };
  const closeModal = () => {
    setFile(undefined);
    setTitle('');
    setdescrpition('');
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the value of the file input
    }
    console.log('close');
    dialogRef.current?.close();
  };

  const onClickCustomButton = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    if (file && selectedGroupId !== undefined) {
      formData.append('video', file);
      formData.append('groupId', selectedGroupId);
      formData.append('title', title);
      formData.append('description', description);
      console.log(formData);
      upload(formData);
    } else {
      console.log('전송실패');
    }
  };

  const onChangeFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList !== null && fileList.length > 0) {
      const selectedFile = fileList[0];
      setFile(selectedFile);
    }
  };

  return (
    <div>
      <button className="uploadButton" onClick={showModal}>
        비디오 업로드
      </button>

      <dialog className="Modal" ref={dialogRef}>
        <div className="title">
          <div>비디오 업로드</div>
          <button onClick={closeModal}>X</button>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="file"
            name="video"
            multiple
            onChange={onChangeFiles}
            ref={fileInputRef}
          />
          <div className="modalButton">
            <button type="button" onClick={onClickCustomButton}>
              비디오 선택하기
            </button>
            <button type="submit">비디오 전송하기</button>
          </div>
        </form>
        <div>
          <div>
            <input
              type="text"
              name="videoTitle"
              placeholder="비디오 제목"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <br />
            <input
              type="text"
              name="videoDescription"
              placeholder="비디오 설명"
              value={description}
              onChange={(e) => {
                setdescrpition(e.target.value);
              }}
            />
            {uploading && <div>업로딩 중...</div>}
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default UploadField;
