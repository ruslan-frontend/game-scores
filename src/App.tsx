import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Layout } from './shared/ui';
import { MainPage } from './pages/main';
import { initTelegramWebApp, getTelegramColorScheme } from './app/telegram';
import { AuthService } from './shared/lib/auth';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setColorScheme] = useState<'light' | 'dark'>(() => getTelegramColorScheme());

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        setError(null);

        initTelegramWebApp(() => setColorScheme(getTelegramColorScheme()));
        setColorScheme(getTelegramColorScheme());

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="size-5 animate-spin" />
        <span>Загрузка приложения...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 w-full max-w-xl px-4">
        <Alert variant="destructive">
          <AlertTitle>Ошибка загрузки</AlertTitle>
          <AlertDescription>
            <p className="mb-3">{error}</p>
            <p className="mb-2">Возможные причины:</p>
            <ul className="mb-4 list-disc pl-5">
              <li>Не настроены переменные окружения Supabase</li>
              <li>Проблемы с подключением к базе данных</li>
              <li>Приложение должно работать в Telegram WebApp</li>
            </ul>
            <Button onClick={handleRetry}>Попробовать снова</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Layout>
        <MainPage />
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
