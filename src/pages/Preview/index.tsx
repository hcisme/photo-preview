import { FC, useRef } from 'react';
import {
  Button,
  Col,
  Dropdown,
  Flex,
  Image,
  MenuProps,
  Row,
  Space,
  Splitter,
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { tempImageBase64 } from '@/utils/imageTool';
import ImageViewer, { ImageViewerRef } from './ImageViewer';

interface IProps {
  selectPath: string | null;
  list: StoreSchema['folderList'];
  onSelect: (path: string) => void;
  onAddFolder: () => void;
  onChangeFolder: (list: StoreSchema['folderList']) => void;
}

const { Text, Paragraph } = Typography;

const FolderMenuItems: MenuProps['items'] = [
  {
    label: '在资源管理器中打开',
    key: 'open-in-explorer'
  },
  {
    label: '删除',
    key: 'remove'
  }
];

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

const Index: FC<IProps> = (props) => {
  const { selectPath, list, onAddFolder, onSelect, onChangeFolder } = props;
  const imageViewerRef = useRef<ImageViewerRef>(null);
  const selectFolder = list.find((item) => item.path === selectPath);

  const onMenuClick = async (key: string, path: string) => {
    switch (key) {
      case 'open-in-explorer':
        window.electronAPI.openInExplorer(path);
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        const filteredList = await window.electronAPI.hideFolder(path);
        onChangeFolder(filteredList);
        break;
      default:
        break;
    }
  };

  const onRightClickImage = async (key: string, imageName: string) => {
    if (!selectPath) {
      return;
    }
    switch (key) {
      case 'open-in-explorer':
        // window.electronAPI.openImage(selectPath, imageName);
        imageViewerRef.current?.open(selectFolder?.contents.indexOf(imageName));
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        const filteredList = await window.electronAPI.hideImage(selectPath, imageName);
        onChangeFolder(filteredList);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Splitter style={{ height: '100vh' }}>
        <Splitter.Panel
          defaultSize="15%"
          min="10%"
          max="50%"
        >
          <Row gutter={[0, 16]}>
            <Col
              span={24}
              style={{ padding: '8px 8px 0 8px' }}
            >
              <Flex
                justify="space-between"
                align="center"
                style={{ width: '100%' }}
              >
                <Text strong>目录</Text>

                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={onAddFolder}
                >
                  添加目录
                </Button>
              </Flex>
            </Col>

            <Col span={24}>
              {list.map((item) => (
                <Dropdown
                  key={item.path}
                  menu={{
                    items: FolderMenuItems,
                    onClick: ({ key }) => onMenuClick(key, item.path)
                  }}
                  trigger={['contextMenu']}
                >
                  <div
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      transition: '0.3s',
                      borderRadius: '4px',
                      backgroundColor: selectPath === item.path ? '#e7e5e5ff' : 'transparent'
                    }}
                    onClick={() => onSelect(item.path)}
                  >
                    <Text
                      ellipsis={true}
                      title={item.path}
                    >
                      {item.name} <Text type="secondary">({item.path})</Text>
                    </Text>
                  </div>
                </Dropdown>
              ))}
            </Col>
          </Row>
        </Splitter.Panel>

        <Splitter.Panel>
          <Row
            gutter={[0, 16]}
            style={{ padding: '8px' }}
          >
            <Col span={24}>
              <h2>{selectFolder?.name}</h2>
            </Col>

            <Col span={24}>
              <Flex
                wrap
                gap="4px 16px"
              >
                {selectFolder?.contents.map((item) => {
                  return (
                    <Flex
                      key={item}
                      vertical
                      style={{ width: 100, height: 156, cursor: 'pointer' }}
                    >
                      <Dropdown
                        menu={{
                          items: ImageMenuItems,
                          onClick: ({ key }) => onRightClickImage(key, item)
                        }}
                        trigger={['contextMenu']}
                      >
                        <Space
                          direction="vertical"
                          style={{ width: '100%', height: 100 }}
                          onDoubleClick={() => {
                            if (!selectPath) {
                              console.error(`找不到这个 (${item}) 图片的路径`);
                              return;
                            }
                            window.electronAPI.openImage(selectPath, item);
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
                  );
                })}
              </Flex>
            </Col>
          </Row>
        </Splitter.Panel>
      </Splitter>

      <ImageViewer
        imageList={selectFolder?.contents.map((item) => `${selectPath}/${item}`) || []}
        ref={imageViewerRef}
      />
    </>
  );
};

export default Index;
