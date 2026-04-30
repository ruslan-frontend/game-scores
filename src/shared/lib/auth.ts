import { supabase } from '../config/supabase';
import { getTelegramUser, getTelegramContext } from '../../app/telegram';
import type { User, TelegramContext } from '../types';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

type DbUser = {
  id: string;
  auth_user_id: string | null;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};

export class AuthService {
  private static currentUser: User | null = null;
  private static currentContext: TelegramContext | null = null;

  private static resolveTelegramId(userId?: number): number {
    if (userId) return userId;

    const devTelegramIdRaw = import.meta.env.VITE_DEV_TELEGRAM_ID?.trim();
    const devTelegramId = devTelegramIdRaw ? Number.parseInt(devTelegramIdRaw, 10) : Number.NaN;
    if (Number.isFinite(devTelegramId) && devTelegramId > 0) {
      return devTelegramId;
    }

    return 12345;
  }

  private static async ensureSupabaseSession(): Promise<SupabaseAuthUser> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (sessionData.session?.user) {
      return sessionData.session.user;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError || !signInData.user) {
      throw signInError || new Error('Failed to create anonymous Supabase session');
    }

    return signInData.user;
  }

  static async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const authUser = await this.ensureSupabaseSession();

      // Получаем контекст Telegram
      const context = getTelegramContext();
      this.currentContext = context;
      
      const telegramUser = context.user;
      const resolvedTelegramId = this.resolveTelegramId(telegramUser?.id);
      
      // Проверяем существует ли пользователь в базе
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', resolvedTelegramId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        throw fetchError;
      }

      let user: User;

      if (existingUser) {
        if (existingUser.auth_user_id && existingUser.auth_user_id !== authUser.id) {
          throw new Error('Current Supabase session is not allowed to access this Telegram user');
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            auth_user_id: authUser.id,
            username: telegramUser?.username || existingUser.username || 'test_user',
            first_name: telegramUser?.first_name || existingUser.first_name || 'Test',
            last_name: telegramUser?.last_name || existingUser.last_name || 'User',
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user auth link:', updateError);
          throw updateError;
        }

        user = this.mapToUser(updatedUser);
      } else {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUser.id,
            telegram_id: resolvedTelegramId,
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

  private static mapToUser(dbUser: DbUser): User {
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