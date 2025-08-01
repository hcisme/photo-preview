import { FC } from 'react';
import { Button } from 'antd';
import { useAppContext } from '@/store/app';

const Index: FC = () => {
  const { loading, addFolder } = useAppContext();

  return (
    <>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {!loading && (
          <Button
            type="primary"
            onClick={addFolder}
          >
            点击选择文件夹
          </Button>
        )}
      </div>
    </>
  );
};

export default Index;
