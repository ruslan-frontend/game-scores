import { supabase } from '../config/supabase';
import { getTelegramUser, getTelegramContext } from '../../app/telegram';
import type { User, TelegramContext } from '../types';

export class AuthService {
  private static currentUser: User | null = null;
  private static currentContext: TelegramContext | null = null;

  static async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      // Получаем контекст Telegram
      const context = getTelegramContext();
      this.currentContext = context;
      
      const telegramUser = context.user;
      const testUserId = telegramUser?.id || 12345;
      
      // Проверяем существует ли пользователь в базе
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', testUserId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        throw fetchError;
      }

      let user: User;

      if (existingUser) {
        user = this.mapToUser(existingUser);
      } else {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            telegram_id: testUserId,
            username: telegramUser?.username || 'test_user',
            first_name: telegramUser?.first_name || 'Test',
            last_name: telegramUser?.last_name || 'User',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        user = this.mapToUser(newUser);
      }

      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  static getCurrentContext(): TelegramContext {
    return this.currentContext || getTelegramContext();
  }

  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null && getTelegramUser() !== null;
  }

  private static mapToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      telegramId: dbUser.telegram_id,
      username: dbUser.username || undefined,
      firstName: dbUser.first_name || undefined,
      lastName: dbUser.last_name || undefined,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  }
}

// Hook для получения текущего пользователя в компонентах
export const useCurrentUser = () => {
  return AuthService.getCurrentUser();
};