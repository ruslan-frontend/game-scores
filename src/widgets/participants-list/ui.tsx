import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ParticipantAdapter } from '../../shared/lib/data-adapter';
import { EditParticipant } from '../../features/edit-participant';
import { ParticipantAvatar } from '../../shared/ui';
import type { Participant } from '../../shared/types';
import { formatDate } from '../../shared/lib';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ParticipantsListProps {
  refreshTrigger?: number;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ refreshTrigger }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const loadParticipants = async () => {
    const data = await ParticipantAdapter.getAll();
    setParticipants(data);
  };

  useEffect(() => {
    loadParticipants();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm('Удалить участника? Это действие нельзя отменить.');
    if (!shouldDelete) return;
    await ParticipantAdapter.delete(id);
    toast.success('Участник удален');
    loadParticipants();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Участники</CardTitle>
      </CardHeader>
      <CardContent className="pixel-list">
      {participants.length === 0 ? (
        <p className="pixel-row-subtitle">Участники не добавлены</p>
      ) : (
        participants.map((participant) => (
          <div
            key={participant.id}
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
              <div className="pixel-row-main">
                <ParticipantAvatar
                  name={participant.name}
                  color={participant.color}
                  size={40}
                  shape="square"
                />
                <div>
                  <p className="pixel-row-title">{participant.name}</p>
                  <p className="pixel-row-subtitle">
                    Добавлен: {formatDate(participant.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                borderLeft: '2px solid #0f172a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 86,
                padding: '6px',
                background: '#f8fafc',
                gap: 8,
              }}
            >
              <EditParticipant
                participant={participant}
                onSuccess={loadParticipants}
                trigger={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-100"
                    aria-label="Редактировать"
                    style={{ height: 44, width: 44, minHeight: 44, minWidth: 44, borderRadius: 8 }}
                  >
                    <Pencil />
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="icon-sm"
                className="border-2 border-red-700 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleDelete(participant.id)}
                aria-label="Удалить"
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