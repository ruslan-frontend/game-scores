import { supabase } from '../config/supabase';
import { getTelegramUser } from '../../app/telegram';
import type { User } from '../types';

export class AuthService {
  private static currentUser: User | null = null;

  static async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    const telegramUser = getTelegramUser();
    if (!telegramUser) {
      console.warn('No Telegram user data available');
      return null;
    }

    try {
      // Проверяем существует ли пользователь в базе
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let user: User;

      if (existingUser) {
        // Пользователь существует, обновляем данные
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            username: telegramUser.username || null,
            first_name: telegramUser.first_name || null,
            last_name: telegramUser.last_name || null,
          })
          .eq('telegram_id', telegramUser.id)
          .select()
          .single();

        if (updateError) throw updateError;

        user = this.mapToUser(updatedUser);
      } else {
        // Создаем нового пользователя
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            telegram_id: telegramUser.id,
            username: telegramUser.username || null,
            first_name: telegramUser.first_name || null,
            last_name: telegramUser.last_name || null,
          })
          .select()
          .single();

        if (createError) throw createError;

        user = this.mapToUser(newUser);
      }

      // Создаем кастомный JWT для Row Level Security
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;

      // Сохраняем пользователя в сессии
      this.currentUser = user;
      
      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
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