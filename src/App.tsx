import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import { Button } from 'antd';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        onClick={() => {
          setCount((prevCount) => prevCount + 1);
        }}
      >
        点击我 {count}
      </Button>

      <img src={reactLogo} alt="" />
    </>
  );
}

export default App;
