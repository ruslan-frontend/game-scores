declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
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

export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    
    tg.ready();
    tg.expand();
    
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    
    return tg;
  }
  
  return null;
};

export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.user;
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
  
  return {
    contextId: 'default',
    contextType: 'private' as const,
    user: null,
    chat: null
  };
};