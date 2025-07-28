import { BrowserWindow, Tray, Menu, nativeImage, app } from 'electron';

/**
 * TrayManager 类用于管理 Electron 应用的托盘图标和相关功能。
 */
export default class TrayManager {
  private tray: Tray | null = null;
  private appIsQuitting: boolean = false;
  private win: BrowserWindow | null;
  private iconPath: string;
  private appName: string;

  constructor(win: BrowserWindow, iconPath: string, appName: string = app.getName()) {
    this.win = win;
    this.iconPath = iconPath;
    this.appName = appName;
    this.appIsQuitting = false;

    // 创建托盘图标
    this.createTray();

    // 处理窗口关闭事件（最小化到托盘）
    this.handleWindowClose();

    // 处理应用退出事件
    this.handleAppQuit();
  }

  private createTray() {
    // 创建托盘图标
    this.tray = new Tray(nativeImage.createFromPath(this.iconPath));
    this.tray.setToolTip(this.appName);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '打开主界面',
        click: () => this.showWindow()
      },
      {
        label: '退出',
        click: () => this.quitApp()
      }
    ]);

    this.tray.setContextMenu(contextMenu);

    // 托盘图标点击事件
    this.tray.on('click', () => this.toggleWindow());
  }

  private handleWindowClose() {
    this.win?.on('close', (event) => {
      if (!this.appIsQuitting) {
        event.preventDefault();
        this.hideWindow();
      }
    });
  }

  private handleAppQuit() {
    app.on('before-quit', () => {
      this.appIsQuitting = true;
      this.destroy();
    });
  }

  public showWindow() {
    this.win?.show();
    this.win?.focus();
  }

  public hideWindow() {
    this.win?.hide();
  }

  public toggleWindow() {
    if (!this.win) return;

    if (this.win.isVisible()) {
      this.hideWindow();
    } else {
      this.showWindow();
    }
  }

  public quitApp() {
    this.appIsQuitting = true;
    app.quit();
  }

  public destroy() {
    this.tray?.destroy();
    this.tray = null;
    this.win = null;
  }
}
