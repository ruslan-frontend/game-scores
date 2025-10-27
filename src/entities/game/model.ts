import { v4 as uuidv4 } from 'uuid';
import type { Game, GameStatistics, GameByTitle } from '../../shared/types';
import { storage, STORAGE_KEYS, calculateWinPercentage } from '../../shared/lib';
import { ParticipantModel } from '../participant';

export class GameModel {
  static getAll(): Game[] {
    const games = storage.get<Game[]>(STORAGE_KEYS.GAMES) || [];
    return games.map(g => ({
      ...g,
      date: new Date(g.date)
    }));
  }

  static create(name: string, winnerId: string, participantIds: string[]): Game {
    const game: Game = {
      id: uuidv4(),
      name: name.trim(),
      date: new Date(),
      winnerId,
      participants: participantIds
    };

    const games = this.getAll();
    games.push(game);
    storage.set(STORAGE_KEYS.GAMES, games);
    
    // Update game titles list
    this.updateGameTitles(name.trim());
    
    return game;
  }

  static getUniqueGameTitles(): string[] {
    return storage.get<string[]>(STORAGE_KEYS.GAME_TITLES) || [];
  }

  private static updateGameTitles(gameName: string): void {
    const titles = this.getUniqueGameTitles();
    if (!titles.includes(gameName)) {
      titles.push(gameName);
      storage.set(STORAGE_KEYS.GAME_TITLES, titles);
    }
  }

  static getStatistics(): GameStatistics[] {
    const games = this.getAll();
    const participants = ParticipantModel.getAll();

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
  }

  static getStatisticsByGames(): GameByTitle[] {
    const games = this.getAll();
    const participants = ParticipantModel.getAll();
    
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
      }).filter(stat => stat.totalGames > 0); // Only include participants who played this game

      return {
        gameName,
        gamesCount: gamesForTitle.length,
        participants: participantStats.sort((a, b) => b.winPercentage - a.winPercentage)
      };
    }).sort((a, b) => b.gamesCount - a.gamesCount); // Sort by most played games first
  }

  static delete(id: string): boolean {
    const games = this.getAll();
    const filteredGames = games.filter(g => g.id !== id);
    
    if (filteredGames.length === games.length) {
      return false;
    }
    
    storage.set(STORAGE_KEYS.GAMES, filteredGames);
    return true;
  }
}