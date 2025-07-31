import { forwardRef, useState, useImperativeHandle, Ref, useRef } from 'react';
import { Drawer, Dropdown, MenuProps } from 'antd';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

export interface ImageViewerRef {
  open: (startIndex?: number) => void;
  close: () => void;
}

interface IProps {
  imageList: string[];
  selectPath: string;
  onDeleteImage: (imageName: string) => void;
}

const ImageMenuItems: MenuProps['items'] = [
  {
    label: '删除',
    key: 'remove'
  }
];

const Index = (props: IProps, ref: Ref<ImageViewerRef>) => {
  const { selectPath, imageList, onDeleteImage } = props;
  const [open, setOpen] = useState(false);
  const swiperRef = useRef<SwiperRef | null>(null);

  useImperativeHandle(ref, () => ({
    open: (startIndex = 0) => {
      swiperRef.current?.swiper.slideTo(startIndex, 0);
      setOpen(true);
    },
    close: () => setOpen(false)
  }));

  const onRightClickImage = async (key: string, imageName: string) => {
    switch (key) {
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        window.electronAPI.hideImage(selectPath, [imageName]).then(() => {
          onDeleteImage(imageName);
        });
        break;
      default:
        break;
    }
  };

  return (
    <Drawer
      title="图片预览"
      height="96%"
      placement="bottom"
      closable
      onClose={() => setOpen(false)}
      open={open}
      forceRender
    >
      <div style={{ height: '100%' }}>
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay]}
          autoplay={false}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={50}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {imageList.map((image) => {
            return (
              <SwiperSlide
                key={image}
                style={{ width: '100%', height: '100%' }}
              >
                <Dropdown
                  key={image}
                  menu={{
                    items: ImageMenuItems,
                    onClick: ({ key }) => onRightClickImage(key, image)
                  }}
                  trigger={['contextMenu']}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={`${selectPath}/${image}`}
                      alt={image}
                      loading="lazy"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </Dropdown>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </Drawer>
  );
};

export default forwardRef<ImageViewerRef, IProps>(Index);
