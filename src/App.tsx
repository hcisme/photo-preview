import SelectFolderPage from '@/pages/SelectFolder';
import Preview from '@/pages/Preview';
import { useAppContext } from '@/store/app';

function App() {
  const { folderList } = useAppContext();

  return <>{folderList.length ? <Preview /> : <SelectFolderPage />}</>;
}

export default App;
