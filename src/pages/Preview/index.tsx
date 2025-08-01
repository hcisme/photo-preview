import { FC, useState } from 'react';
import { Splitter } from 'antd';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

const Index: FC = () => {
  const [checkedList, setCheckedList] = useState<string[]>([]);

  return (
    <>
      <Splitter style={{ height: '100vh' }}>
        <Splitter.Panel
          defaultSize="15%"
          min="15%"
          max="50%"
        >
          <LeftPanel setCheckedList={setCheckedList} />
        </Splitter.Panel>

        <Splitter.Panel style={{ overflow: 'hidden' }}>
          <RightPanel
            checkedList={checkedList}
            setCheckedList={setCheckedList}
          />
        </Splitter.Panel>
      </Splitter>
    </>
  );
};

export default Index;
