import { FC } from 'react';
import { Button, Col, Dropdown, Flex, MenuProps, message, Row, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppContext } from '@/store/app';
import { copyToClipboard } from '@/utils/clipboard';

const { Text } = Typography;

const FolderMenuItems: MenuProps['items'] = [
  {
    label: '在资源管理器中打开',
    key: 'open-in-explorer'
  },
  {
    label: '复制路径',
    key: 'copy-path-to-clipboard'
  },
  {
    label: '删除',
    key: 'remove'
  }
];

const Index: FC<{ setCheckedList: (list: string[]) => void }> = (props) => {
  const { setCheckedList } = props;
  const { folderList: list, selectPath, setPath, addFolder, getFolderList } = useAppContext();
  const [messageApi, contextHolder] = message.useMessage();

  const onMenuClick = async (key: string, path: string) => {
    switch (key) {
      case 'open-in-explorer':
        window.electronAPI.openInExplorer(path);
        break;
      case 'copy-path-to-clipboard':
        copyToClipboard(
          selectPath!,
          () => messageApi.success('复制成功'),
          () => messageApi.error('复制失败')
        );
        break;
      case 'remove':
        // eslint-disable-next-line no-case-declarations
        window.electronAPI.hideFolder(path).then(() => {
          getFolderList();
          setCheckedList([]);
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      {contextHolder}
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
              onClick={addFolder}
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
                onClick={() => setPath(item.path)}
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
    </>
  );
};

export default Index;
