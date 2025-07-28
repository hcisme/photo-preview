import { BrowserWindow, globalShortcut } from 'electron';
import isDev from 'electron-is-dev';

export default class DevToolsManager {
  private static KEY = 'F10';
  private win: BrowserWindow;
  private isDevToolsOpen: boolean = false;

  constructor(win: BrowserWindow) {
    this.win = win;
    
    if (isDev) {
      this.registerShortcut();
    }
  }

  /**
   * 注册开发者工具切换快捷键
   */
  private registerShortcut() {
    globalShortcut.register(DevToolsManager.KEY, () => {
      this.toggleDevTools();
    });

    this.win.on('closed', () => {
      globalShortcut.unregister(DevToolsManager.KEY);
    });
  }

  /**
   * 切换开发者工具状态
   */
  public toggleDevTools() {
    if (this.isDevToolsOpen) {
      this.win.webContents.closeDevTools();
    } else {
      this.win.webContents.openDevTools({
        mode: 'bottom',
        activate: true
      });
    }
    this.isDevToolsOpen = !this.isDevToolsOpen;
  }

  /**
   * 手动打开开发者工具
   */
  public openDevTools() {
    if (!this.isDevToolsOpen) {
      this.toggleDevTools();
    }
  }

  /**
   * 手动关闭开发者工具
   */
  public closeDevTools() {
    if (this.isDevToolsOpen) {
      this.toggleDevTools();
    }
  }

  /**
   * 注销快捷键并清理资源
   */
  public dispose() {
    globalShortcut.unregister(DevToolsManager.KEY);
  }
}
