import { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Layout } from './shared/ui';
import { MainPage } from './pages/main';
import { initTelegramWebApp } from './app/telegram';
import { AuthService } from './shared/lib/auth';
import { migrateToSupabase } from './shared/lib/data-adapter';
import 'antd/dist/reset.css';

function App() {
  useEffect(() => {
    const initApp = async () => {
      initTelegramWebApp();
      
      // Пытаемся аутентифицировать пользователя
      try {
        await AuthService.getCurrentUser();
        
        // Автоматически мигрируем данные если нужно
        await migrateToSupabase();
      } catch (error) {
        console.warn('Authentication or migration failed:', error);
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
