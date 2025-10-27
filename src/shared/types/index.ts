export interface Participant {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Game {
  id: string;
  name: string;
  date: Date;
  winnerId: string;
  participants: string[];
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