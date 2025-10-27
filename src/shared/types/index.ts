export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  contextId?: string; // Group or user context
  name: string;
  color: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Game {
  id: string;
  contextId?: string; // Group or user context
  name: string;
  date: Date;
  winnerId: string;
  participants: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TelegramContext {
  contextId: string;
  contextType: 'group' | 'private';
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  } | null;
  chat: {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
  } | null;
}

export interface GameStatistics {
  participantId: string;
  participantName: string;
  totalGames: number;
  wins: number;
  winPercentage: number;
}

export interface GameByTitle {
  gameName: string;
  gamesCount: number;
  participants: {
    participantId: string;
    participantName: string;
    totalGames: number;
    wins: number;
    winPercentage: number;
  }[];
}