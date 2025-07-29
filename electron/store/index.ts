import Store from 'electron-store';

const store = new Store<StoreSchema>({
  defaults: {
    folderList: []
  }
});

export { store };
