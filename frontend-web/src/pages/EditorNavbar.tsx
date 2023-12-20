import apiURL from '../shared/apiConfig';
import axios from 'axios';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Group, TokenProps } from '../shared/types';
import '../shared/Modal.css';

interface GroupButton {
  groupId: string;
  groupName: string;
}

const EditorNavbar = ({
  onGroupSelect,
  onAddGroup,
  onCreateGroup,
  groups,
  selectedGroup,
  tokenInfo,
}: {
  onGroupSelect: (selectedGroupId: string) => void;
  onAddGroup: (newGroupId: string, password: string) => void;
  onCreateGroup: (
    newGroupId: string,
    password: string,
    groupName: string,
  ) => void;
  groups: Group[];
  selectedGroup: string | undefined;
  tokenInfo: TokenProps;
}) => {
  const loggedInId = tokenInfo.loggedInId;

  return (
    <>
      <div className="Profile">
        <Profile tokenInfo={tokenInfo} />
      </div>
      <div className="groupbar">
        <AddModal onAddGroup={onAddGroup} />
        <CraeteModal onCreateGroup={onCreateGroup} />
        <Groups
          groups={groups}
          selectedGroupId={selectedGroup}
          onGroupSelect={onGroupSelect}
        />
      </div>
    </>
  );
};

const Groups = ({
  groups,
  selectedGroupId,
  onGroupSelect,
}: {
  groups: Group[];
  selectedGroupId: string | undefined;
  onGroupSelect: (selectedGroupId: string) => void;
}) => {
  return (
    <>
      <div>
        {groups.map((group) => (
          <div key={group.groupId}>
            <button
              className="group"
              onClick={() => onGroupSelect(group.groupId)}
              style={{
                background:
                  selectedGroupId === group.groupId ? 'lightblue' : 'white',
              }}
            >
              📁 {group.groupName}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

const AddModal = ({
  onAddGroup,
}: {
  onAddGroup: (newGroupId: string, password: string) => void;
}) => {
  const [groupId, setGroupId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const showModal = () => {
    dialogRef.current?.showModal();
  };
  const closeModal = () => {
    dialogRef.current?.close();
  };

  return (
    <div>
      <button className="Modalbutton" onClick={showModal}>
        그룹참여
      </button>

      <dialog className="ModalCanvas" ref={dialogRef}>
      <div className='title'>
          <div>그룹 참여</div>
          <button onClick={closeModal}>X</button>
      </div>

      <div>
        <p>
          <input
            type="text"
            name="groupName"
            placeholder="그룹ID를 입력하세요"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
            }}
          />
          <br />
          <input
            type="text"
            name="groupPassword"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          </p>
        </div>

        <div>
          <button
            className='submitButton'
            onClick={() => {
              onAddGroup(groupId, password);
              closeModal();
            }}
          >
            그룹참여
          </button>
        </div>
      </dialog>
    </div>
  );
};

const CraeteModal = ({
  onCreateGroup,
}: {
  onCreateGroup: (
    newGroupId: string,
    password: string,
    groupName: string,
  ) => void;
}) => {
  const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const showModal = () => {
    dialogRef.current?.showModal();
  };
  const closeModal = () => {
    setGroupId('');
    setPassword('');
    setGroupName('');
    dialogRef.current?.close();
  };

  return (
    <div>
      <button className="Modalbutton" onClick={showModal}>
        그룹생성
      </button>

      <dialog className='ModalCanvas' ref={dialogRef}>
        <div className='title'>
          <div>그룹 생성</div>
          <button onClick={closeModal}>X</button>
        </div>

        <div className='inputs'>
          <p>
            <input
              type="text"
              name="groupName"
              placeholder="그룹이름"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
            />
            <br />
            <input
              type="text"
              name="groupName"
              placeholder="그룹ID를 설정하세요"
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
              }}
            />
            <br />
            <input
              type="text"
              name="groupPassword"
              placeholder="그룹의 비밀번호를 설정하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </p>
        </div>

        <div>
          <button
            className='submitButton'
            onClick={() => {
              onCreateGroup(groupId, password, groupName);
              closeModal();
            }}
          >
            추가
          </button>
        </div>
      </dialog>
    </div>
  );
};

const Profile = ({ tokenInfo }: { tokenInfo: TokenProps }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      axios
        .post(`${apiURL}/api/users/picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        })
        .then((response) => {
          console.log(imageUrl);
          console.log('사진 업로드 성공');
        })
        .catch((error) => {
          console.error('사진 업로드 실패:', error);
        });
    }
  };

  useEffect(() => {
    try {
      axios
        .get(`${apiURL}/api/users/picture`, {
          withCredentials: true,
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const arrayBuffer = response.data;
          const blob = new Blob([arrayBuffer], { type: 'image/png' });

          const _imaegUrl = URL.createObjectURL(blob);
          setImageUrl(_imaegUrl);
          console.log(_imaegUrl);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log('Profile already exists\n');
    }
  }, []);

  return (
    <div>
      <div className="item">
        <label className="Profile-button" htmlFor="Profile">
          프로필 업로드
        </label>
        <input
          type="file"
          name="image"
          id="Profile"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <div className="item">
        <img src={imageUrl} />
      </div>
      <div className="item">@{tokenInfo.loggedInId}</div>
    </div>
  );
};

export default EditorNavbar;
