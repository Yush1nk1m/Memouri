import React, { useEffect, useState } from 'react';
import './Editor.css';
import EditorNavbar from './EditorNavbar';
import UploadField from './Upload/UploadField';
import { Group, TokenProps } from '../shared/types';
import apiURL from '../shared/apiConfig';
import { UploadFieldProps } from '../shared/types';
interface EditorProps {
  TokenProps: TokenProps;
  onLogout: () => void;
}

const Editor: React.FC<EditorProps> = ({ TokenProps, onLogout }) => {
  const { loggedInId } = TokenProps;
  const tokenInfo = { loggedInId };

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined,
  );
  const [groups, setGroups] = useState<Group[]>([]);

  const onGroupSelect = (selectedGroupId: string | undefined) => {
    setSelectedGroup(selectedGroupId);
  };

  const onAddGroup = (newGroupId: string, password: string) => {
    const _ = { groupId: newGroupId, password: password };
    fetch(`${apiURL}/api/groups/join`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_),
    })
      .then((response) => response.json())
      .then((data) => {
        const newGroup: Group = {
          groupId: newGroupId,
          groupName: data.groupName,
          password: password,
        };
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
      })
      .catch((error) => {
        console.error('Error: onAddGroup()', error);
      });
  };
  const onCreateGroup = (
    groupId: string,
    password: string,
    groupName: string,
  ) => {
    const data = {
      groupId: groupId,
      password: password,
      name: groupName,
    };

    fetch(`${apiURL}/api/groups/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log('Response: success on creating group\n', data);
        const newGroup = {
          groupId: data.groupId,
          groupName: data.name,
          password: data.password,
        };
        setGroups([...groups, newGroup]);
      })
      .catch((error) => {
        // Handle errors
        console.error('Error: onCreateGroup()\n', error);
      });
  };

  useEffect(() => {
    fetch(`${apiURL}/api/groups/list`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(`Response: 그룹(크기 : ${data.length}) 불러오기 성공\n`);
        setGroups(data);
      })
      .catch((error) => {
        console.error('Error: group 불러오기 오류\n', error);
      });
  }, []);

  return (
    <div className="Editorcontainer">
      <div className="vertical-container">
        <div className="editorBanner">
          <EditorBanner onLogout={onLogout} />
        </div>
        <div className="horizontal-container">
          <div className="editorNavbar">
            <EditorNavbar
              onGroupSelect={onGroupSelect}
              onAddGroup={onAddGroup}
              onCreateGroup={onCreateGroup}
              groups={groups}
              selectedGroup={selectedGroup}
              tokenInfo={tokenInfo}
            />
          </div>
          <div className="editorUploader">
            <EditorUploader {...{ selectedGroup, loggedInId }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorBanner = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <>
      <div className="bannerLogo">
        <div>MemoUri </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            marginLeft: '10px',
          }}
        >
          STUDIO
        </div>
        <button
          onClick={() => {
            onLogout();
          }}
        >
          로그아웃
        </button>
      </div>
    </>
  );
};

interface EditorUploaderProps {
  selectedGroup: string | undefined;
  loggedInId: string;
}
const EditorUploader: React.FC<EditorUploaderProps> = ({
  selectedGroup,
  loggedInId,
}) => {
  const uploadFieldprops: UploadFieldProps = {
    selectedGroupId: selectedGroup,
    loggedInId: loggedInId,
  };

  return (
    <>
      <div className="uploadBar">
        <div className="contentsUploadbar">콘텐츠 업로드</div>
      </div>

      <div className="uploadField">
        <UploadField {...uploadFieldprops} />
      </div>
    </>
  );
};
export default Editor;
