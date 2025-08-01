import { FC, useRef } from 'react';
import {
  Button,
  Checkbox,
  Dropdown,
  Empty,
  Flex,
  Image,
  MenuProps,
  message,
  Space,
  Typography,
  theme
} from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { tempImageBase64 } from '@/utils/imageTool';
import ImageViewer, { ImageViewerRef } from '@/pages/Preview/ImageViewer';
import { useAppContext } from '@/store/app';
import './index.css';

const { Text, Paragraph } = Typography;

const ImageMenuItems: MenuProps['items'] = [
  {
    label: '打开',
    key: 'open-in-explorer'
  },
  {
    label: '删除',
    key: 'remove'
  }
];

const Index: FC<{ checkedList: string[]; setCheckedList: (list: string[]) => void }> = (props) => {
  const { checkedList, setCheckedList } = props;
  const { folderList: list, selectPath, getFolderList } = useAppContext();
  const {
    token: { colorFillSecondary, colorTextSecondary }
  } = theme.useToken();
  const imageViewerRef = useRef<ImageViewerRef>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const selectFolder = list.find((item) => item.path === selectPath);
  const contents = selectFolder?.contents || [];
  const checkDom = checkedList.length ? `(${checkedList.length}项)` : '';

  const onRightClickImage = async (key: string, imageName: string, index: number) => {
    switch (key) {
      case 'open-in-explorer':
        imageViewerRef.current?.open(index);
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        window.electronAPI.hideImage(selectPath!, [imageName]).then(() => {
          setCheckedList(checkedList.filter((item) => item !== imageName));
          getFolderList();
        });
        break;
      default:
        break;
    }
  };

  const saveAsFolder = () => {
    window.electronAPI.SaveAsFolder(selectPath!, checkedList).then(({ canceled, savePath }) => {
      if (canceled) {
        messageApi.info('已取消保存');
      } else {
        getFolderList();
        setCheckedList([]);
        messageApi.success(`保存成功 路径为 ${savePath}`);
      }
    });
  };

  return (
    <>
      {contextHolder}
      <Flex
        vertical
        gap="middle"
        style={{ height: '100%', padding: '8px', flexDirection: 'column' }}
      >
        <div>
          <h2>{selectFolder?.name}</h2>
        </div>

        {contents.length ? (
          <>
            <div>
              <Flex
                justify="flex-end"
                align="center"
              >
                <Space>
                  <Button
                    type="dashed"
                    disabled={!checkedList.length}
                    onClick={saveAsFolder}
                  >
                    选中{checkDom}另存为
                  </Button>

                  <Button
                    type="dashed"
                    disabled={!checkedList.length}
                    onClick={async () => {
                      window.electronAPI.hideImage(selectPath!, checkedList).then(() => {
                        getFolderList();
                        setCheckedList([]);
                      });
                    }}
                  >
                    删除选中 {checkDom}
                  </Button>

                  <Checkbox
                    indeterminate={checkedList.length > 0 && checkedList.length < contents.length}
                    checked={checkedList.length === contents.length}
                    onChange={(e) => {
                      setCheckedList(e.target.checked ? contents : []);
                    }}
                  >
                    全选
                  </Checkbox>
                </Space>
              </Flex>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ height: 8 }}></div>
              <Checkbox.Group
                value={checkedList}
                onChange={setCheckedList}
                style={{ width: '100%' }}
              >
                <Flex
                  wrap
                  gap="4px 16px"
                >
                  {contents.map((item, index) => {
                    return (
                      <Checkbox
                        key={item}
                        value={item}
                        className="checkbox-relative"
                      >
                        <Flex
                          vertical
                          style={{ width: 100, height: 156, cursor: 'pointer' }}
                        >
                          <Dropdown
                            menu={{
                              items: ImageMenuItems,
                              onClick: ({ key }) => onRightClickImage(key, item, index)
                            }}
                            trigger={['contextMenu']}
                          >
                            <Space
                              direction="vertical"
                              style={{ width: '100%', height: 100 }}
                              onDoubleClick={() => {
                                imageViewerRef.current?.open(index);
                              }}
                            >
                              <Image
                                width="100%"
                                height="100%"
                                preview={false}
                                src={tempImageBase64}
                              />
                              <Paragraph ellipsis={{ rows: 2 }}>{item}</Paragraph>
                            </Space>
                          </Dropdown>
                        </Flex>
                      </Checkbox>
                    );
                  })}
                </Flex>
              </Checkbox.Group>
            </div>
          </>
        ) : (
          <div style={{ height: '100%' }}>
            <Flex
              style={{ height: '100%' }}
              justify="center"
              align="center"
            >
              <Empty
                image={<PictureOutlined />}
                styles={{
                  image: { fontSize: 72, color: colorFillSecondary },
                  description: { color: colorTextSecondary }
                }}
                description={<Text style={{ color: 'inherit' }}>点击文件夹以显示图片</Text>}
              />
            </Flex>
          </div>
        )}
      </Flex>

      <ImageViewer
        ref={imageViewerRef}
        selectPath={selectPath!}
        imageList={contents}
        onDeleteImage={(name) => {
          setCheckedList(checkedList.filter((item) => item !== name));
          getFolderList();
        }}
      />
    </>
  );
};

export default Index;
