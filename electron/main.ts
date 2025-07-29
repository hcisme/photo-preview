import { app, BrowserWindow } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DevToolsManager, TrayManager } from '@electron/manager';
import { listenGetAppName, initFolderManager } from '@electron/event';

const require = createRequire(import.meta.url);
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

const icon = path.join(process.env.VITE_PUBLIC, 'favicon.png');
let win: BrowserWindow | null = null;
let trayManager: TrayManager | null = null;
let devToolsManager: DevToolsManager | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    title: app.getName(),
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: false
    }
  });
  win.setMenu(null);

  devToolsManager = new DevToolsManager(win);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    devToolsManager?.dispose();
    devToolsManager = null;

    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  listenGetAppName();

  const _win = createWindow();
  trayManager = new TrayManager(_win, icon);

  initFolderManager(_win);
});
