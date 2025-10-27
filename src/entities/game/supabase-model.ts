import { supabase } from '../../shared/config/supabase';
import { AuthService } from '../../shared/lib/auth';
import { calculateWinPercentage } from '../../shared/lib';
import { SupabaseParticipantModel } from '../participant/supabase-model';
import type { Game, GameStatistics, GameByTitle } from '../../shared/types';

export class SupabaseGameModel {
  static async getAll(): Promise<Game[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_participants!inner(participant_id)
        `)
        .eq('context_id', context.contextId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(this.mapToGame);
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  static async create(name: string, winnerId: string, participantIds: string[]): Promise<Game | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      // Создаем игру
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          user_id: user.id,
          context_id: context.contextId,
          name: name.trim(),
          winner_id: winnerId,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Добавляем участников игры
      const gameParticipants = participantIds.map(participantId => ({
        game_id: gameData.id,
        participant_id: participantId,
        context_id: context.contextId,
      }));

      const { error: participantsError } = await supabase
        .from('game_participants')
        .insert(gameParticipants);

      if (participantsError) throw participantsError;

      // Обновляем список уникальных названий игр
      await this.updateGameTitles(name.trim());

      return this.mapToGame({ ...gameData, game_participants: gameParticipants });
    } catch (error) {
      console.error('Error creating game:', error);
      return null;
    }
  }

  static async getUniqueGameTitles(): Promise<string[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      const { data, error } = await supabase
        .from('games')
        .select('name')
        .eq('context_id', context.contextId);

      if (error) throw error;

      const uniqueTitles = [...new Set(data.map(game => game.name))];
      return uniqueTitles.sort();
    } catch (error) {
      console.error('Error fetching game titles:', error);
      return [];
    }
  }

  private static async updateGameTitles(_gameName: string): Promise<void> {
    // В Supabase мы получаем уникальные названия напрямую из базы
    // Этот метод оставлен для совместимости с localStorage версией
  }

  static async getStatistics(): Promise<GameStatistics[]> {
    try {
      const participants = await SupabaseParticipantModel.getAll();
      const games = await this.getAll();

      return participants.map(participant => {
        const participantGames = games.filter(game => 
          game.participants.includes(participant.id)
        );
        
        const wins = games.filter(game => game.winnerId === participant.id).length;
        const totalGames = participantGames.length;

        return {
          participantId: participant.id,
          participantName: participant.name,
          totalGames,
          wins,
          winPercentage: calculateWinPercentage(wins, totalGames)
        };
      });
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return [];
    }
  }

  static async getStatisticsByGames(): Promise<GameByTitle[]> {
    try {
      const games = await this.getAll();
      const participants = await SupabaseParticipantModel.getAll();
      
      const gameGroups = games.reduce((acc, game) => {
        if (!acc[game.name]) {
          acc[game.name] = [];
        }
        acc[game.name].push(game);
        return acc;
      }, {} as Record<string, Game[]>);

      return Object.entries(gameGroups).map(([gameName, gamesForTitle]) => {
        const participantStats = participants.map(participant => {
          const participantGamesForTitle = gamesForTitle.filter(game => 
            game.participants.includes(participant.id)
          );
          
          const wins = gamesForTitle.filter(game => game.winnerId === participant.id).length;
          const totalGames = participantGamesForTitle.length;

          return {
            participantId: participant.id,
            participantName: participant.name,
            totalGames,
            wins,
            winPercentage: calculateWinPercentage(wins, totalGames)
          };
        }).filter(stat => stat.totalGames > 0);

        return {
          gameName,
          gamesCount: gamesForTitle.length,
          participants: participantStats.sort((a, b) => b.winPercentage - a.winPercentage)
        };
      }).sort((a, b) => b.gamesCount - a.gamesCount);
    } catch (error) {
      console.error('Error calculating games statistics:', error);
      return [];
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const context = AuthService.getCurrentContext();

      // Сначала удаляем связи с участниками
      const { error: participantsError } = await supabase
        .from('game_participants')
        .delete()
        .eq('game_id', id)
        .eq('context_id', context.contextId);

      if (participantsError) throw participantsError;

      // Затем удаляем саму игру
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', id)
        .eq('context_id', context.contextId);

      if (gameError) throw gameError;

      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      return false;
    }
  }

  private static mapToGame(data: any): Game {
    const participants = data.game_participants?.map((gp: any) => gp.participant_id) || [];
    
    return {
      id: data.id,
      contextId: data.context_id,
      name: data.name,
      date: new Date(data.date),
      winnerId: data.winner_id,
      participants,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}