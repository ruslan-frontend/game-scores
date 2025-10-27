import { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Layout } from './shared/ui';
import { MainPage } from './pages/main';
import { initTelegramWebApp } from './app/telegram';
import 'antd/dist/reset.css';

function App() {
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2481cc',
          borderRadius: 8,
        },
      }}
    >
      <Layout>
        <MainPage />
      </Layout>
    </ConfigProvider>
  );
}

export default App;
