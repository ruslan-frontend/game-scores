import type { Game, Participant } from '../types';

type MockState = {
  participants: Participant[];
  games: Game[];
};

const MOCK_STORAGE_KEY = 'game-scores:mock-state:v1';

const seedParticipants: Participant[] = [
  {
    id: 'mock-p1',
    contextId: 'mock',
    name: 'Алексей',
    color: '#3b82f6',
    createdAt: new Date('2026-04-01T10:00:00Z'),
    updatedAt: new Date('2026-04-01T10:00:00Z'),
  },
  {
    id: 'mock-p2',
    contextId: 'mock',
    name: 'Мария',
    color: '#f43f5e',
    createdAt: new Date('2026-04-01T10:05:00Z'),
    updatedAt: new Date('2026-04-01T10:05:00Z'),
  },
  {
    id: 'mock-p3',
    contextId: 'mock',
    name: 'Игорь',
    color: '#10b981',
    createdAt: new Date('2026-04-01T10:10:00Z'),
    updatedAt: new Date('2026-04-01T10:10:00Z'),
  },
];

const seedGames: Game[] = [
  {
    id: 'mock-g1',
    contextId: 'mock',
    name: 'Монополия',
    date: new Date('2026-04-20T19:00:00Z'),
    winnerId: 'mock-p2',
    winnerIds: ['mock-p2'],
    participants: ['mock-p1', 'mock-p2', 'mock-p3'],
    createdAt: new Date('2026-04-20T19:00:00Z'),
    updatedAt: new Date('2026-04-20T19:00:00Z'),
  },
];

const isBrowser = typeof window !== 'undefined';

const hasTelegramId = (): boolean => {
  if (!isBrowser) return false;
  return Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
};

const hasDevTelegramId = (): boolean => {
  const raw = import.meta.env.VITE_DEV_TELEGRAM_ID?.trim();
  if (!raw) return false;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0;
};

export const isMockMode = (): boolean => !hasTelegramId() && !hasDevTelegramId();

const parseDate = (value?: string): Date => (value ? new Date(value) : new Date());

const hydrateState = (raw: unknown): MockState | null => {
  if (!raw || typeof raw !== 'object') return null;
  const state = raw as { participants?: any[]; games?: any[] };
  if (!Array.isArray(state.participants) || !Array.isArray(state.games)) return null;

  return {
    participants: state.participants.map((p) => ({
      ...p,
      createdAt: parseDate(p.createdAt),
      updatedAt: parseDate(p.updatedAt),
    })),
    games: state.games.map((g) => ({
      ...g,
      winnerIds: Array.isArray(g.winnerIds) && g.winnerIds.length > 0 ? g.winnerIds : [g.winnerId].filter(Boolean),
      date: parseDate(g.date),
      createdAt: parseDate(g.createdAt),
      updatedAt: parseDate(g.updatedAt),
    })),
  };
};

const readState = (): MockState => {
  if (!isBrowser) return { participants: seedParticipants, games: seedGames };
  try {
    const saved = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!saved) return { participants: seedParticipants, games: seedGames };
    const parsed = hydrateState(JSON.parse(saved));
    return parsed ?? { participants: seedParticipants, games: seedGames };
  } catch {
    return { participants: seedParticipants, games: seedGames };
  }
};

const writeState = (state: MockState): void => {
  if (!isBrowser) return;
  window.localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({
      participants: state.participants,
      games: state.games,
    }),
  );
};

export const mockStore = {
  getParticipants(): Participant[] {
    const { participants } = readState();
    return [...participants].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },
  createParticipant(name: string, color: string): Participant {
    const state = readState();
    const now = new Date();
    const participant: Participant = {
      id: crypto.randomUUID(),
      contextId: 'mock',
      name,
      color,
      createdAt: now,
      updatedAt: now,
    };
    state.participants.push(participant);
    writeState(state);
    return participant;
  },
  updateParticipant(id: string, updates: Partial<Pick<Participant, 'name' | 'color'>>): boolean {
    const state = readState();
    const participant = state.participants.find((item) => item.id === id);
    if (!participant) return false;
    if (updates.name) participant.name = updates.name;
    if (updates.color) participant.color = updates.color;
    participant.updatedAt = new Date();
    writeState(state);
    return true;
  },
  deleteParticipant(id: string): boolean {
    const state = readState();
    const hasParticipant = state.participants.some((item) => item.id === id);
    if (!hasParticipant) return false;
    state.participants = state.participants.filter((item) => item.id !== id);
    state.games = state.games
      .map((game) => ({
        ...game,
        participants: game.participants.filter((pid) => pid !== id),
        winnerIds: (game.winnerIds?.length ? game.winnerIds : [game.winnerId]).filter((wid) => wid !== id),
      }))
      .map((game) => ({ ...game, winnerId: game.winnerIds[0] || '' }))
      .filter((game) => game.participants.length > 1 && game.winnerIds.length > 0);
    writeState(state);
    return true;
  },
  findParticipantById(id: string): Participant | null {
    const state = readState();
    return state.participants.find((item) => item.id === id) ?? null;
  },
  getGames(): Game[] {
    const { games } = readState();
    return [...games].sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  createGame(name: string, winnerIds: string[], participants: string[]): Game {
    const state = readState();
    const now = new Date();
    const game: Game = {
      id: crypto.randomUUID(),
      contextId: 'mock',
      name,
      winnerId: winnerIds[0],
      winnerIds,
      participants,
      date: now,
      createdAt: now,
      updatedAt: now,
    };
    state.games.push(game);
    writeState(state);
    return game;
  },
  deleteGame(id: string): boolean {
    const state = readState();
    const hasGame = state.games.some((item) => item.id === id);
    if (!hasGame) return false;
    state.games = state.games.filter((item) => item.id !== id);
    writeState(state);
    return true;
  },
  getUniqueGameTitles(): string[] {
    const { games } = readState();
    return [...new Set(games.map((game) => game.name))].sort();
  },
};
