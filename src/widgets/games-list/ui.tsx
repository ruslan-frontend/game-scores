import React, { useState, useEffect } from 'react';
import { Trophy, Trash2 } from 'lucide-react';
import { GameAdapter, ParticipantAdapter } from '../../shared/lib/data-adapter';
import { ParticipantAvatar } from '../../shared/ui';
import type { Game } from '../../shared/types';
import { formatDate } from '../../shared/lib';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface GamesListProps {
  refreshTrigger?: number;
}

export const GamesList: React.FC<GamesListProps> = ({ refreshTrigger }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());

  const loadData = async () => {
    const [gamesData, participantsData] = await Promise.all([
      GameAdapter.getAll(),
      ParticipantAdapter.getAll()
    ]);
    
    setGames(gamesData.sort((a, b) => b.date.getTime() - a.date.getTime()));
    
    const participantsMap = new Map();
    participantsData.forEach(p => participantsMap.set(p.id, p));
    setParticipants(participantsMap);
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm('Удалить игру? Это действие нельзя отменить.');
    if (!shouldDelete) return;
    await GameAdapter.delete(id);
    toast.success('Игра удалена');
    loadData();
  };

  const getParticipant = (id: string) => {
    return participants.get(id);
  };

  const getParticipantName = (id: string) => {
    const participant = getParticipant(id);
    return participant?.name || 'Неизвестный';
  };

  const getWinnerLabel = (game: Game) => {
    const winners = (game.winnerIds?.length ? game.winnerIds : [game.winnerId])
      .map(getParticipantName)
      .join(', ');
    return winners || 'Неизвестный';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>История игр</CardTitle>
      </CardHeader>
      <CardContent className="pixel-list">
      {games.length === 0 ? (
        <p className="pixel-row-subtitle">Игры не добавлены</p>
      ) : (
        games.map((game) => (
          <div
            key={game.id}
            className="pixel-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 86px',
              alignItems: 'stretch',
              gap: 0,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 12, minWidth: 0 }}>
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-primary" />
                <p className="pixel-row-title">{game.name}</p>
              </div>

              <div
                className="mt-2"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 1fr) minmax(160px, 220px)',
                  gap: 10,
                  alignItems: 'start',
                }}
              >
                <div className="flex flex-col gap-3">
                  <Badge
                    variant="secondary"
                  className="w-fit max-w-full border-2 border-slate-900 bg-slate-200 px-3 py-1 text-base font-semibold text-slate-900"
                  >
                    Победители: {getWinnerLabel(game)}
                  </Badge>
                  <span className="pixel-row-subtitle" style={{ fontSize: 14, color: '#334155' }}>
                    Дата: {formatDate(game.date)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="pixel-row-subtitle" style={{ minWidth: 78 }}>Участники:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {game.participants.map((participantId) => {
                      const participant = getParticipant(participantId);
                      return participant ? (
                        <ParticipantAvatar
                          key={participantId}
                          name={participant.name}
                          color={participant.color}
                          avatarUrl={participant.avatarUrl}
                          size={24}
                          shape="square"
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderLeft: '2px solid #0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 86,
                padding: '6px',
                background: '#f8fafc',
              }}
            >
              <Button
                variant="outline"
                size="icon-sm"
                className="border-2 border-red-700 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleDelete(game.id)}
                aria-label="Удалить игру"
                style={{ height: 44, width: 44, minHeight: 44, minWidth: 44, borderRadius: 8 }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))
      )}
      </CardContent>
    </Card>
  );
};