import { useState } from 'react';
import { Button } from 'antd';
import reactLogo from '@/assets/react.svg';

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

      <img
        src={reactLogo}
        alt=""
      />
    </>
  );
}

export default App;
