export type TelegramColorScheme = 'light' | 'dark';

const parseDevTelegramId = (): number | null => {
  const raw = import.meta.env.VITE_DEV_TELEGRAM_ID?.trim();
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn('VITE_DEV_TELEGRAM_ID must be a positive integer');
    return null;
  }

  return parsed;
};

const getDevContextId = (): string | null => {
  const raw = import.meta.env.VITE_DEV_CONTEXT_ID?.trim();
  return raw ? raw : null;
};

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        colorScheme?: TelegramColorScheme;
        onEvent?: (eventType: string, callback: () => void) => void;
        offEvent?: (eventType: string, callback: () => void) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          chat?: {
            id: number;
            type: 'private' | 'group' | 'supergroup' | 'channel';
            title?: string;
            username?: string;
          };
          start_param?: string;
        };
        version: string;
        platform: string;
        close: () => void;
      };
    };
  }
}

const applyThemeParams = () => {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
  const tg = window.Telegram.WebApp;
  const p = tg.themeParams;
  document.documentElement.style.setProperty('--tg-theme-bg-color', p.bg_color || '#ffffff');
  document.documentElement.style.setProperty('--tg-theme-text-color', p.text_color || '#000000');
  document.documentElement.style.setProperty('--tg-theme-hint-color', p.hint_color || '#999999');
  document.documentElement.style.setProperty('--tg-theme-link-color', p.link_color || '#2481cc');
  document.documentElement.style.setProperty('--tg-theme-button-color', p.button_color || '#2481cc');
  document.documentElement.style.setProperty('--tg-theme-button-text-color', p.button_text_color || '#ffffff');
};

export const initTelegramWebApp = (onThemeChange?: () => void) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;

    tg.ready();
    tg.expand();

    applyThemeParams();

    const handleThemeChange = () => {
      applyThemeParams();
      onThemeChange?.();
    };

    if (tg.onEvent) {
      tg.onEvent('themeChanged', handleThemeChange);
    }

    return tg;
  }

  return null;
};

export const getTelegramColorScheme = (): TelegramColorScheme => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    if (tg.colorScheme === 'dark' || tg.colorScheme === 'light') {
      return tg.colorScheme;
    }
    const bg = tg.themeParams.bg_color;
    if (bg) {
      const hex = bg.replace('#', '').slice(0, 6);
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? 'light' : 'dark';
      }
    }
  }
  return 'light';
};

export const getTelegramThemeParams = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const p = window.Telegram.WebApp.themeParams;
    return {
      bgColor: p.bg_color || '#ffffff',
      textColor: p.text_color || '#000000',
      hintColor: p.hint_color || '#999999',
      linkColor: p.link_color || '#2481cc',
      buttonColor: p.button_color || '#2481cc',
      buttonTextColor: p.button_text_color || '#ffffff',
    };
  }
  return {
    bgColor: '#ffffff',
    textColor: '#000000',
    hintColor: '#999999',
    linkColor: '#2481cc',
    buttonColor: '#2481cc',
    buttonTextColor: '#ffffff',
  };
};

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }

  const devTelegramId = parseDevTelegramId();
  if (devTelegramId) {
    return {
      id: devTelegramId,
      first_name: 'Local',
      last_name: 'Dev',
      username: 'local_dev',
    };
  }

  return null;
};

export const getTelegramChat = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.chat;
  }
  return null;
};

export const getTelegramContext = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const { user, chat } = window.Telegram.WebApp.initDataUnsafe;
    
    // Определяем контекст для данных:
    // - Если есть chat и это группа - используем chat.id
    // - Если это приватный чат или нет chat - используем user.id
    const contextId = chat && ['group', 'supergroup'].includes(chat.type) 
      ? chat.id.toString() 
      : user?.id.toString() || 'default';
    
    const contextType = chat && ['group', 'supergroup'].includes(chat.type) 
      ? 'group' as const
      : 'private' as const;
    
    return {
      contextId,
      contextType,
      user: user || null,
      chat: chat || null
    };
  }

  const devContextId = getDevContextId();
  const devTelegramId = parseDevTelegramId();
  const fallbackContextId = devContextId || (devTelegramId ? String(devTelegramId) : 'default');

  return {
    contextId: fallbackContextId,
    contextType: 'private' as const,
    user: devTelegramId
      ? {
          id: devTelegramId,
          first_name: 'Local',
          last_name: 'Dev',
          username: 'local_dev',
        }
      : null,
    chat: null
  };
};