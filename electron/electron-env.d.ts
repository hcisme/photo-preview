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
    hideImage: (folderPath: string, imageNameList: string[]) => Promise<void>;
    startWatching: (path: string) => Promise<void>;
    stopWatching: (path: string) => Promise<void>;
    onDirectoryUpdate: (callback: (data: StoreSchema['folderList']) => void) => Promise<void>;
    SaveAsFolder: (folderPath: string, imageNameList: string[]) => Promise<SaveAsFolder>;
  };
}

interface StoreSchema {
  folderList: FolderInfo[];
}

interface FolderInfo {
  name: string;
  path: string;
  contents: string[];
}

interface SaveAsFolder {
  canceled: boolean;
  savePath: string | null;
}
