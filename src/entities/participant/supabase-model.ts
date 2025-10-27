import { supabase } from '../../shared/config/supabase';
import { AuthService } from '../../shared/lib/auth';
import { getRandomColor, isValidColor, normalizeColor } from '../../shared/lib';
import type { Participant } from '../../shared/types';

export class SupabaseParticipantModel {
  static async getAll(): Promise<Participant[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(this.mapToParticipant);
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  static async create(name: string, color?: string): Promise<Participant | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const validatedColor = color && isValidColor(color) ? normalizeColor(color) : getRandomColor();

      const { data, error } = await supabase
        .from('participants')
        .insert({
          user_id: user.id,
          name: name.trim(),
          color: validatedColor,
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

  static async update(id: string, updates: Partial<Pick<Participant, 'name' | 'color'>>): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Validate color if provided
      const processedUpdates: any = { ...updates };
      if (updates.color && !isValidColor(updates.color)) {
        processedUpdates.color = getRandomColor();
      } else if (updates.color) {
        processedUpdates.color = normalizeColor(updates.color);
      }

      const { error } = await supabase
        .from('participants')
        .update(processedUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating participant:', error);
      return false;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting participant:', error);
      return false;
    }
  }

  static async findById(id: string): Promise<Participant | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
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
      userId: data.user_id,
      name: data.name,
      color: data.color,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}