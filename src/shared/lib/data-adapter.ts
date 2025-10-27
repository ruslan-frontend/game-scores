import { SupabaseParticipantModel } from '../../entities/participant/supabase-model';
import { SupabaseGameModel } from '../../entities/game/supabase-model';

// Простой экспорт Supabase моделей без адаптера
export const ParticipantAdapter = SupabaseParticipantModel;
export const GameAdapter = SupabaseGameModel;