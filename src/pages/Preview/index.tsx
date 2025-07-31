import { FC, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Flex,
  Image,
  MenuProps,
  message,
  Row,
  Space,
  Splitter,
  Typography
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { tempImageBase64 } from '@/utils/imageTool';
import ImageViewer, { ImageViewerRef } from './ImageViewer';
import './index.css';

interface IProps {
  selectPath: string;
  list: StoreSchema['folderList'];
  onSelect: (path: string) => void;
  onAddFolder: () => void;
  onChangeFolder: () => void;
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
  const [messageApi, contextHolder] = message.useMessage();
  const imageViewerRef = useRef<ImageViewerRef>(null);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const selectFolder = list.find((item) => item.path === selectPath);
  const contents = selectFolder?.contents || [];

  const onMenuClick = async (key: string, path: string) => {
    switch (key) {
      case 'open-in-explorer':
        window.electronAPI.openInExplorer(path);
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        window.electronAPI.hideFolder(path).then(() => {
          onChangeFolder();
        });
        break;
      default:
        break;
    }
  };

  const onRightClickImage = async (key: string, imageName: string, index: number) => {
    switch (key) {
      case 'open-in-explorer':
        imageViewerRef.current?.open(index);
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        window.electronAPI.hideImage(selectPath, [imageName]).then(() => {
          setCheckedList((prevList) => prevList.filter((item) => item !== imageName));
          onChangeFolder();
        });
        break;
      default:
        break;
    }
  };

  const saveAsFolder = () => {
    window.electronAPI.SaveAsFolder(selectPath, checkedList).then(({ canceled, savePath }) => {
      if (canceled) {
        messageApi.info('已取消保存');
      } else {
        onChangeFolder();
        setCheckedList([]);
        messageApi.success(`保存成功 路径为 ${savePath}`);
      }
    });
  };

  return (
    <>
      {contextHolder}
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
                justify="flex-end"
                align="center"
              >
                <Space>
                  <Button
                    type="dashed"
                    disabled={!checkedList.length}
                    onClick={saveAsFolder}
                  >
                    选中另存为
                  </Button>

                  <Button
                    type="dashed"
                    disabled={!checkedList.length}
                    onClick={async () => {
                      window.electronAPI.hideImage(selectPath, checkedList).then(() => {
                        onChangeFolder();
                        setCheckedList([]);
                      });
                    }}
                  >
                    删除选中
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
            </Col>

            <Col span={24}>
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
            </Col>
          </Row>
        </Splitter.Panel>
      </Splitter>

      <ImageViewer
        ref={imageViewerRef}
        selectPath={selectPath}
        imageList={contents}
        onDeleteImage={(name) => {
          setCheckedList((prevList) => prevList.filter((item) => item !== name));
          onChangeFolder();
        }}
      />
    </>
  );
};

export default Index;
