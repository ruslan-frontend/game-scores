import { useEffect, useState } from 'react';
import { ConfigProvider, theme, Spin, Alert, Button } from 'antd';
import { Layout } from './shared/ui';
import { MainPage } from './pages/main';
import { initTelegramWebApp } from './app/telegram';
import { AuthService } from './shared/lib/auth';
import 'antd/dist/reset.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        setError(null);
        
        initTelegramWebApp();
        
        // Проверяем настройки Supabase
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          throw new Error('Supabase не настроен. Проверьте переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.');
        }
        
        // Аутентифицируем пользователя для работы с Supabase
        await AuthService.getCurrentUser();
        
      } catch (error) {
        console.error('App initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Ошибка инициализации приложения');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 16
        }}>
          <Spin size="large" />
          <div>Загрузка приложения...</div>
        </div>
      </ConfigProvider>
    );
  }

  if (error) {
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
        <div style={{ 
          padding: 24,
          maxWidth: 600,
          margin: '50px auto'
        }}>
          <Alert
            message="Ошибка загрузки"
            description={
              <div>
                <p>{error}</p>
                <p>Возможные причины:</p>
                <ul>
                  <li>Не настроены переменные окружения Supabase</li>
                  <li>Проблемы с подключением к базе данных</li>
                  <li>Приложение должно работать в Telegram WebApp</li>
                </ul>
              </div>
            }
            type="error"
            showIcon
            action={
              <Button onClick={handleRetry}>
                Попробовать снова
              </Button>
            }
          />
        </div>
      </ConfigProvider>
    );
  }

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
