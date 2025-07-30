import { app } from 'electron';
import { updateElectronApp } from 'update-electron-app';

// 配置自动更新
export function setupAutoUpdater() {
  if (app.isPackaged) {
    updateElectronApp({
      updateInterval: '10 minutes',
      logger: console
    });
  }
}
