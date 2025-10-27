import { AuthService } from './auth';

// Импорты моделей
import { ParticipantModel as LocalParticipantModel } from '../../entities/participant/model';
import { GameModel as LocalGameModel } from '../../entities/game/model';
import { SupabaseParticipantModel } from '../../entities/participant/supabase-model';
import { SupabaseGameModel } from '../../entities/game/supabase-model';

// Определяем какую модель использовать
const isSupabaseAvailable = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

const shouldUseSupabase = async () => {
  if (!isSupabaseAvailable()) return false;
  
  try {
    const user = await AuthService.getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
};

// Адаптер для участников
export const ParticipantAdapter = {
  async getAll() {
    if (await shouldUseSupabase()) {
      return SupabaseParticipantModel.getAll();
    }
    return LocalParticipantModel.getAll();
  },

  async create(name: string, color?: string) {
    if (await shouldUseSupabase()) {
      return SupabaseParticipantModel.create(name, color);
    }
    return LocalParticipantModel.create(name, color);
  },

  async update(id: string, updates: any) {
    if (await shouldUseSupabase()) {
      return SupabaseParticipantModel.update(id, updates);
    }
    return LocalParticipantModel.update(id, updates);
  },

  async delete(id: string) {
    if (await shouldUseSupabase()) {
      return SupabaseParticipantModel.delete(id);
    }
    return LocalParticipantModel.delete(id);
  },

  async findById(id: string) {
    if (await shouldUseSupabase()) {
      return SupabaseParticipantModel.findById(id);
    }
    return LocalParticipantModel.findById(id);
  }
};

// Адаптер для игр
export const GameAdapter = {
  async getAll() {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.getAll();
    }
    return LocalGameModel.getAll();
  },

  async create(name: string, winnerId: string, participantIds: string[]) {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.create(name, winnerId, participantIds);
    }
    return LocalGameModel.create(name, winnerId, participantIds);
  },

  async getUniqueGameTitles() {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.getUniqueGameTitles();
    }
    return LocalGameModel.getUniqueGameTitles();
  },

  async getStatistics() {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.getStatistics();
    }
    return LocalGameModel.getStatistics();
  },

  async getStatisticsByGames() {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.getStatisticsByGames();
    }
    return LocalGameModel.getStatisticsByGames();
  },

  async delete(id: string) {
    if (await shouldUseSupabase()) {
      return SupabaseGameModel.delete(id);
    }
    return LocalGameModel.delete(id);
  }
};

// Функция для миграции данных из localStorage в Supabase
export const migrateToSupabase = async (): Promise<boolean> => {
  try {
    if (!isSupabaseAvailable()) {
      console.log('Supabase not configured, skipping migration');
      return false;
    }

    const user = await AuthService.getCurrentUser();
    if (!user) {
      console.log('User not authenticated, skipping migration');
      return false;
    }

    // Проверяем есть ли уже данные в Supabase
    const existingParticipants = await SupabaseParticipantModel.getAll();
    if (existingParticipants.length > 0) {
      console.log('Supabase already has data, skipping migration');
      return false;
    }

    // Получаем данные из localStorage
    const localParticipants = LocalParticipantModel.getAll();
    const localGames = LocalGameModel.getAll();

    if (localParticipants.length === 0 && localGames.length === 0) {
      console.log('No local data to migrate');
      return false;
    }

    console.log(`Migrating ${localParticipants.length} participants and ${localGames.length} games to Supabase...`);

    // Мигрируем участников
    const participantMap = new Map<string, string>(); // old_id -> new_id
    for (const participant of localParticipants) {
      const newParticipant = await SupabaseParticipantModel.create(participant.name, participant.color);
      if (newParticipant) {
        participantMap.set(participant.id, newParticipant.id);
      }
    }

    // Мигрируем игры
    for (const game of localGames) {
      const newWinnerId = participantMap.get(game.winnerId);
      const newParticipantIds = game.participants
        .map(id => participantMap.get(id))
        .filter(Boolean) as string[];

      if (newWinnerId && newParticipantIds.length > 0) {
        await SupabaseGameModel.create(game.name, newWinnerId, newParticipantIds);
      }
    }

    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};