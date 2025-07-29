import { app, ipcMain } from 'electron';
import { GET_APP_NAME } from './eventName';

export const listenGetAppName = () => {
  ipcMain.handle(GET_APP_NAME, () => app.getName());
};
