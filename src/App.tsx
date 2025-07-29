import { useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import SelectFolderPage from '@/pages/SelectFolder';
import Preview from '@/pages/Preview';

function App() {
  const [folderList, setFolderList] = useState<StoreSchema['folderList']>([]);
  const [selectPath, setSelectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const getFolderList = async () => {
    setLoading(true);
    const list = await window.electronAPI.getFolderList();
    setFolderList(list);
    setLoading(false);
  };

  const selectFolder = async () => {
    try {
      const { canceled, list } = await window.electronAPI.selectFolder();
      if (canceled) {
        messageApi.info('已取消选择');
        return;
      }

      setFolderList(list);
    } catch (err) {
      messageApi.error('打开文件夹对话框失败');
      console.error('打开文件夹对话框失败:', err);
    }
  };

  useEffect(() => {
    getFolderList();
  }, []);

  return (
    <Spin spinning={loading}>
      {contextHolder}

      {folderList.length ? (
        <Preview
          list={folderList}
          selectPath={selectPath}
          onSelect={(path) => setSelectPath(path)}
          onAddFolder={() => selectFolder()}
          onChangeFolder={(list) => setFolderList(list)}
        />
      ) : (
        <SelectFolderPage
          onSelect={() => {
            selectFolder();
          }}
        />
      )}
    </Spin>
  );
}

export default App;
