import { FC } from 'react';
import { Button } from 'antd';

interface IProps {
  onSelect?: () => void;
  loading: boolean;
}

const Index: FC<IProps> = (props) => {
  const { loading, onSelect } = props;

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
            onClick={onSelect}
          >
            点击选择文件夹
          </Button>
        )}
      </div>
    </>
  );
};

export default Index;
