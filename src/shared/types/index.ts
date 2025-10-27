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
  userId?: string; // For Supabase integration
  name: string;
  color: string;
  createdAt: Date;
  updatedAt?: Date; // For Supabase integration
}

export interface Game {
  id: string;
  userId?: string; // For Supabase integration
  name: string;
  date: Date;
  winnerId: string;
  participants: string[];
  createdAt?: Date; // For Supabase integration
  updatedAt?: Date; // For Supabase integration
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