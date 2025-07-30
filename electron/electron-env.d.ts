/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  electronAPI: {
    getAppName: () => Promise<string>;
    selectFolder: () => Promise<{ canceled: boolean; list: StoreSchema['folderList'] }>;
    getFolderList: () => Promise<StoreSchema['folderList']>;
    openInExplorer: (path: string) => Promise<void>;
    hideFolder: (path: string) => Promise<StoreSchema['folderList']>;
    hideImage: (folderPath: string, imageName: string) => Promise<StoreSchema['folderList']>;
    startWatching: (path: string) => Promise<void>;
    stopWatching: (path: string) => Promise<void>;
    onDirectoryUpdate: (callback: (data: StoreSchema['folderList']) => void) => void;
  };
}

interface StoreSchema {
  folderList: FolderInfo[];
}

interface FolderInfo {
  name: string;
  path: string;
  contents: string[];
  excludes: string[];
}
