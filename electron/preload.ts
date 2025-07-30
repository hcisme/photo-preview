import { ipcRenderer, contextBridge } from 'electron';
import {
  GET_APP_NAME,
  GET_FOLDER_LIST,
  HIDE_FOLDER,
  HIDE_IMAGE,
  OPEN_DIRECTORY_DIALOG,
  OPEN_IN_EXPLORER,
  START_WATCHING,
  STOP_WATCHING,
  WATCHING_DIRECTORY
} from './event/eventName';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  getAppName: () => ipcRenderer.invoke(GET_APP_NAME),
  getFolderList: () => ipcRenderer.invoke(GET_FOLDER_LIST),
  selectFolder: () => ipcRenderer.invoke(OPEN_DIRECTORY_DIALOG),
  openInExplorer: (path: string) => ipcRenderer.invoke(OPEN_IN_EXPLORER, path),
  hideFolder: (path: string) => ipcRenderer.invoke(HIDE_FOLDER, path),
  hideImage: (folderPath: string, imageName: string) =>
    ipcRenderer.invoke(HIDE_IMAGE, folderPath, imageName),
  startWatching: (path: string) => ipcRenderer.invoke(START_WATCHING, path),
  stopWatching: (path: string) => ipcRenderer.invoke(STOP_WATCHING, path),
  onDirectoryUpdate: (callback: (data: StoreSchema['folderList']) => void) =>
    ipcRenderer.on(WATCHING_DIRECTORY, (_, data) => callback(data))
});
