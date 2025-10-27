import { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Layout } from './shared/ui';
import { MainPage } from './pages/main';
import { initTelegramWebApp } from './app/telegram';
import { AuthService } from './shared/lib/auth';
import 'antd/dist/reset.css';

function App() {
  useEffect(() => {
    const initApp = async () => {
      initTelegramWebApp();
      
      // Аутентифицируем пользователя для работы с Supabase
      try {
        await AuthService.getCurrentUser();
      } catch (error) {
        console.warn('Authentication failed:', error);
      }
    };

    initApp();
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
