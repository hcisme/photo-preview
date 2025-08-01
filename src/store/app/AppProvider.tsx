import React, { ReactNode, useEffect, useState } from 'react';
import { message, Spin } from 'antd';
import { AppContext } from './AppContext';

const Index: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folderList, setFolderList] = useState<StoreSchema['folderList']>([]);
  const [selectPath, setSelectPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const getFolderList = async () => {
    setLoading(true);
    try {
      const list = await window.electronAPI.getFolderList();
      setFolderList(list);
    } catch (error) {
      messageApi.error('获取文件夹列表失败');
      console.error('获取文件夹列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFolder = async () => {
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

  const setPath = async (path: string) => {
    setSelectPath(path);
    await getFolderList();
    await window.electronAPI.startWatching(path);
  };

  const listenFolderChange = () => {
    window.electronAPI.onDirectoryUpdate(setFolderList);
  };

  useEffect(() => {
    getFolderList();
    listenFolderChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        folderList,
        selectPath,
        loading,
        getFolderList,
        addFolder,
        setPath
      }}
    >
      <Spin spinning={loading}>
        {contextHolder}
        {children}
      </Spin>
    </AppContext.Provider>
  );
};

export default Index;
