import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from '@/App';
import '@/assets/css/global.css';

window.electronAPI.getAppName().then((appName) => {
  document.title = appName;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN}>
    <AntdApp style={{ height: '100%' }}>
      <App />
    </AntdApp>
  </ConfigProvider>
);
