import { forwardRef, useState, useImperativeHandle, Ref } from 'react';
import { Drawer, Image } from 'antd';

export interface ImageViewerRef {
  open: (startIndex?: number) => void;
  close: () => void;
}

interface IProps {
  imageList: string[];
}

const Index = (props: IProps, ref: Ref<ImageViewerRef>) => {
  const { imageList } = props;
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    open: (startIndex = 0) => {
      setCurrentIndex(startIndex);
      setOpen(true);
    },
    close: () => setOpen(false)
  }));

  return (
    <Drawer
      title="图片预览"
      height="90%"
      placement="bottom"
      closable
      onClose={() => setOpen(false)}
      open={open}
    >
      <div style={{ height: '100%' }}>
        <Image.PreviewGroup
          items={imageList}
          preview={{
            current: currentIndex,
            onChange: (current) => {
              setCurrentIndex(current);
            }
          }}
        >
          <Image
            preview={false}
            src={imageList[currentIndex]}
            style={{ height: '100%' }}
          />
        </Image.PreviewGroup>
      </div>
    </Drawer>
  );
};

export default forwardRef<ImageViewerRef, IProps>(Index);
