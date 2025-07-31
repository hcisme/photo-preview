import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path, { basename } from 'node:path';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { uniqBy } from 'lodash';
import chokidar, { FSWatcher } from 'chokidar';
import { store } from '@electron/store';
import {
  EXCLUDES_FOLDER_NAME,
  GET_FOLDER_LIST,
  HIDE_FOLDER,
  HIDE_IMAGE,
  OPEN_DIRECTORY_DIALOG,
  OPEN_IN_EXPLORER,
  SAVE_AS_FOLDER,
  START_WATCHING,
  STOP_WATCHING,
  WATCHING_DIRECTORY
} from './eventName';
import { scanFolderForImages } from '@electron/utils/folder';

const watchers: { [key: string]: FSWatcher } = {};
// 记录最后操作时间
let lastChangeTime = 0;

// 核心逻辑函数
const getFolderList = async () => {
  const folderList = store.get('folderList', []);
  const newFolderList = await Promise.all<FolderInfo>(
    folderList.map(async (item) => ({ ...item, contents: await scanFolderForImages(item.path) }))
  );
  updateFolderList(newFolderList);
  return newFolderList;
};
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

  if (canceled || !filePaths.length) {
    return { canceled, list: [] };
  }

  const newFolders = await Promise.all<FolderInfo>(
    filePaths.map(async (path) => {
      const contents = await scanFolderForImages(path);
      return {
        path,
        name: basename(path),
        contents
      };
    })
  );

  const updatedList = uniqBy([...(await getFolderList()), ...newFolders], (folder) => folder.path);

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
const hideFolder = async (targetPath: string) => {
  const updatedList = (await getFolderList()).filter((folder) => folder.path !== targetPath);
  updateFolderList(updatedList);
  return updatedList;
};

/**
 * 隐藏单张图片
 */
const hideImage = async (folderPath: string, imageNameList: string[]) => {
  const excludesDir = path.join(folderPath, EXCLUDES_FOLDER_NAME);

  try {
    await fs.access(excludesDir);
  } catch {
    await fs.mkdir(excludesDir);
    exec(`attrib +H "${excludesDir}"`);
  }

  for (const imageName of imageNameList) {
    const src = path.join(folderPath, imageName);
    const dest = path.join(excludesDir, imageName);

    try {
      await fs.access(src);
      await fs.rename(src, dest);
    } catch (err) {
      console.warn(`Hide Image Error: ${src} TO ${dest}`, err);
    }
  }
};

/**
 * 开始监听文件夹改变
 */
const startWatchingFolder = (win: BrowserWindow, folderPath: string) => {
  stopWatchingFolder(folderPath);

  // 使用chokidar监听目录
  const watcher = chokidar.watch(folderPath, {
    persistent: true,
    ignoreInitial: true,
    depth: 0
  });

  watchers[folderPath] = watcher;

  // 监听变化事件
  watcher
    .on('add', () => handleFileEvent(win))
    .on('change', () => handleFileEvent(win))
    .on('unlink', () => handleFileEvent(win))
    .on('error', (error) => console.error(`Watcher error: ${error}`));
};

/**
 * 停止监听文件夹改变
 */
const stopWatchingFolder = (path: string) => {
  if (watchers[path]) {
    watchers[path].close();
    delete watchers[path];
  }
};

const handleFileEvent = async (win: BrowserWindow) => {
  const now = Date.now();

  // 避免重复事件
  if (now - lastChangeTime < 100) return;
  lastChangeTime = now;

  const folderList = await getFolderList();

  win.webContents.send(WATCHING_DIRECTORY, folderList);
};

/**
 * 将图片另存为文件夹
 */
const SaveAsFolder: (
  win: BrowserWindow,
  folderPath: string,
  imageNameList: string[]
) => Promise<SaveAsFolder> = async (win, folderPath, imageNameList) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: '选择保存图片的文件夹',
    buttonLabel: '保存到此处',
    properties: ['openDirectory', 'createDirectory']
  });

  if (canceled || !filePaths.length) {
    return { canceled, savePath: null };
  }

  const targetDir = filePaths[0];

  for (const imageName of imageNameList) {
    const src = path.join(folderPath, imageName);
    const dest = path.join(targetDir, imageName);

    try {
      // 如果目标同名文件已存在，可选择覆盖或跳过
      await fs.copyFile(src, dest);
    } catch (err) {
      console.warn(`[SaveAsFolder] 复制失败: ${imageName}`, err);
    }
  }

  return { canceled, savePath: targetDir };
};

/**
 * 初始化文件夹相关的IPC监听
 */
export const initFolderManager = (win: BrowserWindow) => {
  ipcMain.handle(OPEN_DIRECTORY_DIALOG, () => handleDirectorySelection(win));
  ipcMain.handle(GET_FOLDER_LIST, () => getFolderList());
  ipcMain.handle(OPEN_IN_EXPLORER, (_, path: string) => openInSystemExplorer(path));
  ipcMain.handle(HIDE_FOLDER, (_, path: string) => hideFolder(path));
  ipcMain.handle(HIDE_IMAGE, (_, folderPath: string, imageNameList: string[]) => {
    return hideImage(folderPath, imageNameList);
  });

  ipcMain.handle(START_WATCHING, (_, path: string) => startWatchingFolder(win, path));
  ipcMain.handle(STOP_WATCHING, (_, path: string) => stopWatchingFolder(path));

  ipcMain.handle(SAVE_AS_FOLDER, (_, folderPath: string, imageNameList: string[]) =>
    SaveAsFolder(win, folderPath, imageNameList)
  );
};
