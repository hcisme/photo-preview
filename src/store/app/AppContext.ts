import { createContext, useContext } from 'react';

export interface AppContextProps {
  folderList: StoreSchema['folderList'];
  selectPath: string | null;
  loading: boolean;
  getFolderList: () => Promise<void>;
  addFolder: () => Promise<void>;
  setPath: (path: string) => Promise<void>;
}

const initialAppContextProps = {
  folderList: [],
  selectPath: null,
  loading: false,
  getFolderList: function (): Promise<void> {
    throw new Error('getFolderList Function not implemented.');
  },
  addFolder: function (): Promise<void> {
    throw new Error('addFolder Function not implemented.');
  },
  setPath: function (): Promise<void> {
    throw new Error('setPath Function not implemented.');
  }
};

export const AppContext = createContext<AppContextProps>(initialAppContextProps);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
