import { supabase } from '../config/supabase';
import { getTelegramUser, getTelegramContext } from '../../app/telegram';
import type { User, TelegramContext } from '../types';

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
  private static isLegacyContextMigrated = false;

  private static resolveTelegramId(userId?: number): number {
    if (userId) return userId;

    const devTelegramIdRaw = import.meta.env.VITE_DEV_TELEGRAM_ID?.trim();
    const devTelegramId = devTelegramIdRaw ? Number.parseInt(devTelegramIdRaw, 10) : Number.NaN;
    if (Number.isFinite(devTelegramId) && devTelegramId > 0) {
      return devTelegramId;
    }

    return 12345;
  }

  /**
   * Try to get or create a Supabase session.
   * Returns auth user id string if successful, null if anonymous auth is disabled
   * or unavailable. In that case the app falls back to anon-key + RLS anon policies.
   */
  private static async tryGetAuthUserId(): Promise<string | null> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        return sessionData.session.user.id;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        // Anonymous auth may be disabled in the project — that's OK,
        // we fall through and use the anon key with permissive RLS policies.
        console.warn('Anonymous sign-in unavailable, using anon key directly:', signInError.message);
        return null;
      }

      return signInData.user?.id ?? null;
    } catch {
      return null;
    }
  }

  private static async migrateLegacyContextData(userId: string, context: TelegramContext): Promise<void> {
    if (this.isLegacyContextMigrated || context.contextType !== 'private') {
      return;
    }

    try {
      const { error: participantsError } = await supabase
        .from('participants')
        .update({ context_id: context.contextId })
        .eq('user_id', userId)
        .is('context_id', null);
      if (participantsError) throw participantsError;

      const { error: gamesError } = await supabase
        .from('games')
        .update({ context_id: context.contextId })
        .eq('user_id', userId)
        .is('context_id', null);
      if (gamesError) throw gamesError;

      const { data: participantIds, error: participantIdsError } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', userId)
        .eq('context_id', context.contextId);
      if (participantIdsError) throw participantIdsError;

      const ids = participantIds.map((item) => item.id);
      if (ids.length > 0) {
        const { error: gameParticipantsError } = await supabase
          .from('game_participants')
          .update({ context_id: context.contextId })
          .is('context_id', null)
          .in('participant_id', ids);
        if (gameParticipantsError) throw gameParticipantsError;
      }

      this.isLegacyContextMigrated = true;
    } catch (error) {
      console.error('Error migrating legacy context data:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const context = getTelegramContext();
      this.currentContext = context;

      const telegramUser = context.user;
      const resolvedTelegramId = this.resolveTelegramId(telegramUser?.id);

      // Try to get a Supabase auth session (may be null if anonymous auth is disabled).
      const authUserId = await this.tryGetAuthUserId();

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
        // Guard: don't let a different session claim an already-owned account.
        if (authUserId && existingUser.auth_user_id && existingUser.auth_user_id !== authUserId) {
          throw new Error('Current Supabase session is not allowed to access this Telegram user');
        }

        const updatePayload: Record<string, unknown> = {
          username: telegramUser?.username || existingUser.username || 'user',
          first_name: telegramUser?.first_name || existingUser.first_name || 'User',
          last_name: telegramUser?.last_name || existingUser.last_name || null,
        };
        if (authUserId) {
          updatePayload.auth_user_id = authUserId;
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          // Non-fatal: use the existing record as-is.
          user = this.mapToUser(existingUser);
        } else {
          user = this.mapToUser(updatedUser);
        }
      } else {
        const insertPayload: Record<string, unknown> = {
          telegram_id: resolvedTelegramId,
          username: telegramUser?.username || 'user',
          first_name: telegramUser?.first_name || 'User',
          last_name: telegramUser?.last_name || null,
        };
        if (authUserId) {
          insertPayload.auth_user_id = authUserId;
        }

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(insertPayload)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          throw createError;
        }

        user = this.mapToUser(newUser);
      }

      this.currentUser = user;
      await this.migrateLegacyContextData(user.id, context);
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
