import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { basename } from 'node:path';
import { uniqBy } from 'lodash';
import { store } from '@electron/store';
import {
  GET_FOLDER_LIST,
  HIDE_FOLDER,
  HIDE_IMAGE,
  OPEN_DIRECTORY_DIALOG,
  OPEN_IN_EXPLORER
} from './eventName';
import { scanFolderForImages } from '@electron/utils/folder';

// 核心逻辑函数
const getFolderList = () => store.get('folderList', []);
const updateFolderList = (folders: StoreSchema['folderList']) => store.set('folderList', folders);

/**
 * 打开目录对话框处理
 */
const handleDirectorySelection = async (
  win: BrowserWindow
): Promise<{ canceled: boolean; list: StoreSchema['folderList'] }> => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['multiSelections', 'openDirectory']
  });

  if (canceled || filePaths.length === 0) {
    return { canceled, list: [] };
  }

  const newFolders = await Promise.all<FolderInfo>(
    filePaths.map(async (path) => {
      const contents = await scanFolderForImages(path);
      return {
        path,
        name: basename(path),
        contents,
        excludes: []
      };
    })
  );

  console.log(newFolders);

  const updatedList = uniqBy([...getFolderList(), ...newFolders], (folder) => folder.path);

  updateFolderList(updatedList);
  return { canceled, list: updatedList };
};

/**
 * 在资源管理器中打开路径
 */
const openInSystemExplorer = (path: string) => {
  shell.openPath(path).catch((error) => {
    console.error(`打开路径失败: ${path}`, error);
    dialog.showErrorBox('操作失败', `无法打开路径: ${path}`);
  });
};

/**
 * 隐藏文件夹（从列表中移除）
 */
const hideFolder = (targetPath: string) => {
  const updatedList = getFolderList().filter((folder) => folder.path !== targetPath);
  updateFolderList(updatedList);
  return updatedList;
};

// 隐藏单张图片
const hideImage = (folderPath: string, imageName: string) => {
  const folderList = getFolderList();
  const updatedList = folderList.map((folder) => {
    if (folder.path === folderPath) {
      const contents = folder.contents.filter((item) => item !== imageName);
      const excludes = folder.excludes.includes(imageName)
        ? folder.excludes
        : [...folder.excludes, imageName];

      return { ...folder, contents, excludes };
    }
    return folder;
  });
  updateFolderList(updatedList);

  return updatedList;
};

/**
 * 初始化文件夹相关的IPC监听
 */
export const initFolderManager = (win: BrowserWindow) => {
  ipcMain.handle(OPEN_DIRECTORY_DIALOG, () => handleDirectorySelection(win));
  ipcMain.handle(GET_FOLDER_LIST, () => getFolderList());
  ipcMain.handle(OPEN_IN_EXPLORER, (_, path: string) => openInSystemExplorer(path));
  ipcMain.handle(HIDE_FOLDER, (_, path: string) => hideFolder(path));
  ipcMain.handle(HIDE_IMAGE, (_, folderPath: string, imageName: string) => {
    return hideImage(folderPath, imageName);
  });
};
