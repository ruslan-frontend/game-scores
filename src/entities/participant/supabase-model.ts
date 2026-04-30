import { supabase } from '../../shared/config/supabase';
import { AuthService } from '../../shared/lib/auth';
import { getRandomColor, isValidColor, normalizeColor } from '../../shared/lib';
import { isMockMode, mockStore } from '../../shared/lib/mock-store';
import type { Participant } from '../../shared/types';

export class SupabaseParticipantModel {
  static async uploadAvatar(participantId: string, file: File): Promise<string | null> {
    if (isMockMode()) {
      return URL.createObjectURL(file);
    }

    try {
      const authUser = await supabase.auth.getUser();
      const authUserId = authUser.data.user?.id;
      if (!authUserId) {
        throw new Error('Auth session is required to upload avatar');
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${authUserId}/${participantId}/${crypto.randomUUID()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('participant-avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('participant-avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading participant avatar:', error);
      return null;
    }
  }

  static async getAll(): Promise<Participant[]> {
    if (isMockMode()) {
      return mockStore.getParticipants();
    }

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('context_id', context.contextId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(this.mapToParticipant);
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  static async create(name: string, color?: string, avatarUrl?: string): Promise<Participant | null> {
    if (isMockMode()) {
      const validatedColor = color && isValidColor(color) ? normalizeColor(color) : getRandomColor();
      return mockStore.createParticipant(name.trim(), validatedColor, avatarUrl);
    }

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();
      const validatedColor = color && isValidColor(color) ? normalizeColor(color) : getRandomColor();

      const { data, error } = await supabase
        .from('participants')
        .insert({
          user_id: user.id,
          context_id: context.contextId,
          name: name.trim(),
          color: validatedColor,
          avatar_url: avatarUrl ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToParticipant(data);
    } catch (error) {
      console.error('Error creating participant:', error);
      return null;
    }
  }

  static async update(id: string, updates: Partial<Pick<Participant, 'name' | 'color' | 'avatarUrl'>>): Promise<boolean> {
    if (isMockMode()) {
      const processedUpdates: Partial<Pick<Participant, 'name' | 'color' | 'avatarUrl'>> = { ...updates };
      if (updates.color && !isValidColor(updates.color)) {
        processedUpdates.color = getRandomColor();
      } else if (updates.color) {
        processedUpdates.color = normalizeColor(updates.color);
      }
      return mockStore.updateParticipant(id, processedUpdates);
    }

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      // Validate color if provided
      const processedUpdates: any = { ...updates };
      if (updates.color && !isValidColor(updates.color)) {
        processedUpdates.color = getRandomColor();
      } else if (updates.color) {
        processedUpdates.color = normalizeColor(updates.color);
      }
      if (updates.avatarUrl !== undefined) {
        processedUpdates.avatar_url = updates.avatarUrl;
        delete processedUpdates.avatarUrl;
      }

      const { error } = await supabase
        .from('participants')
        .update(processedUpdates)
        .eq('id', id)
        .eq('context_id', context.contextId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating participant:', error);
      return false;
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (isMockMode()) {
      return mockStore.deleteParticipant(id);
    }

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)
        .eq('context_id', context.contextId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting participant:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<Participant | null> {
    if (isMockMode()) {
      return mockStore.findParticipantById(id);
    }

    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .eq('context_id', context.contextId)
        .single();

      if (error) throw error;

      return this.mapToParticipant(data);
    } catch (error) {
      console.error('Error finding participant:', error);
      return null;
    }
  }

  private static mapToParticipant(data: any): Participant {
    return {
      id: data.id,
      contextId: data.context_id,
      name: data.name,
      color: data.color,
      avatarUrl: data.avatar_url ?? undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}