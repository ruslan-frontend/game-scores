import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ParticipantAdapter } from '../../shared/lib/data-adapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AddParticipantProps {
  onSuccess?: () => void;
}

export const AddParticipant: React.FC<AddParticipantProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Введите имя участника');
      return;
    }

    setLoading(true);
    try {
      await ParticipantAdapter.create(trimmedName);
      toast.success('Участник добавлен');
      setName('');
      onSuccess?.();
    } catch {
      toast.error('Ошибка при добавлении участника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pixel-form" onSubmit={handleSubmit}>
      <label className="pixel-label">Имя участника</label>
      <Input
        className="pixel-input"
        placeholder="Имя участника"
        maxLength={50}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit" disabled={loading} className="pixel-button">
        <UserPlus data-icon="inline-start" />
        {loading ? 'Добавление...' : 'Добавить участника'}
      </Button>
    </form>
  );
};