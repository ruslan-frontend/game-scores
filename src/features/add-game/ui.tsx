import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { GameAdapter, ParticipantAdapter } from '../../shared/lib/data-adapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AddGameProps {
  onSuccess?: () => void;
}

export const AddGame: React.FC<AddGameProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [gameTitles, setGameTitles] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [participantsData, titlesData] = await Promise.all([
        ParticipantAdapter.getAll(),
        GameAdapter.getUniqueGameTitles()
      ]);
      setParticipants(participantsData);
      setGameTitles(titlesData);
    };
    loadData();
  }, []);
  const [customGameName, setCustomGameName] = useState('');
  const hasGameName = Boolean((name || customGameName).trim());

  const handleGameTitleSelect = (title: string) => {
    setName(title);
    setCustomGameName(title);
  };

  const toggleParticipant = (participantId: string, checked: boolean) => {
    setSelectedParticipants((prev) => {
      const next = checked ? [...prev, participantId] : prev.filter((id) => id !== participantId);
      setWinnerIds((current) => current.filter((winnerId) => next.includes(winnerId)));
      return next;
    });
  };

  const toggleWinner = (participantId: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipants((prev) =>
        prev.includes(participantId) ? prev : [...prev, participantId],
      );
    }

    setWinnerIds((prev) => {
      if (!checked) return prev.filter((id) => id !== participantId);
      if (prev.length >= 3) {
        toast.error('Можно выбрать максимум 3 победителей');
        return prev;
      }
      return prev.includes(participantId) ? prev : [...prev, participantId];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const gameName = name || customGameName;
    if (!gameName?.trim()) {
      toast.error('Введите название игры');
      return;
    }

    if (!winnerIds.length) {
      toast.error('Выберите хотя бы одного победителя');
      return;
    }

    if (winnerIds.length > 3) {
      toast.error('Можно выбрать максимум 3 победителей');
      return;
    }

    if (!selectedParticipants.length) {
      toast.error('Выберите участников');
      return;
    }

    const hasOutsiderWinner = winnerIds.some((winnerId) => !selectedParticipants.includes(winnerId));
    if (hasOutsiderWinner) {
      toast.error('Победители должны быть среди участников');
      return;
    }

    setLoading(true);
    try {
      await GameAdapter.create(gameName, winnerIds, selectedParticipants);
      toast.success('Игра добавлена');
      setName('');
      setCustomGameName('');
      setSelectedParticipants([]);
      setWinnerIds([]);
      onSuccess?.();
    } catch {
      toast.error('Ошибка при добавлении игры');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pixel-form" onSubmit={handleSubmit}>
      <div className="pixel-form">
        <label className="pixel-label">Название игры</label>
        {gameTitles.length > 0 && (
          <div className="pixel-chip-list">
            {gameTitles.map((title) => (
              <button
                key={title}
                type="button"
                className="pixel-chip"
                onClick={() => handleGameTitleSelect(title)}
              >
                {title}
              </button>
            ))}
          </div>
        )}
        <Input
          className="pixel-input"
          placeholder="Введите название игры"
          maxLength={100}
          value={name}
          onChange={(event) => {
            const value = event.target.value;
            setName(value);
            setCustomGameName(value);
          }}
        />
      </div>

      {hasGameName && (
        <div className="pixel-form">
          <label className="pixel-label">Участники</label>
          <div className="pixel-check-group">
            {participants.map((participant) => (
              <label key={participant.id} className="pixel-check-item">
                <Checkbox
                  checked={selectedParticipants.includes(participant.id)}
                  onCheckedChange={(checked) => toggleParticipant(participant.id, Boolean(checked))}
                />
                <span>{participant.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {hasGameName && selectedParticipants.length > 0 && (
        <div className="pixel-form">
          <label className="pixel-label">Победители (1-3)</label>
          <div className="pixel-check-group">
            {participants.map((participant) => (
              <label key={participant.id} className="pixel-check-item">
                <Checkbox
                  checked={winnerIds.includes(participant.id)}
                  onCheckedChange={(checked) => toggleWinner(participant.id, Boolean(checked))}
                />
                <span>{participant.name}</span>
              </label>
            ))}
          </div>
          {winnerIds.length > 1 && (
            <Badge variant="secondary" className="w-fit border-2 border-slate-900 bg-slate-200 text-slate-900">
              Ничья: {winnerIds.length} победителя
            </Badge>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading} className="pixel-button">
        <Plus data-icon="inline-start" />
        {loading ? 'Добавление...' : 'Добавить игру'}
      </Button>
    </form>
  );
};