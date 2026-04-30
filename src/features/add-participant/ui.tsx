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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputId = 'add-participant-avatar-file';

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAvatarFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загрузить только изображение');
      event.target.value = '';
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Максимальный размер аватарки 3MB');
      event.target.value = '';
      return;
    }
    setAvatarFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Введите имя участника');
      return;
    }

    setLoading(true);
    try {
      const participant = await ParticipantAdapter.create(trimmedName);
      if (!participant) {
        throw new Error('Failed to create participant');
      }

      if (avatarFile) {
        const avatarUrl = await ParticipantAdapter.uploadAvatar(participant.id, avatarFile);
        if (avatarUrl) {
          await ParticipantAdapter.update(participant.id, { avatarUrl });
        } else {
          toast.error('Участник создан, но аватар не загрузился');
        }
      }

      toast.success('Участник добавлен');
      setName('');
      setAvatarFile(null);
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
      <div className="pixel-form">
        <label className="pixel-label">Аватарка (необязательно)</label>
        <input
          id={fileInputId}
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
        <label htmlFor={fileInputId} className="pixel-file-trigger">
          Выбрать изображение
        </label>
        <span className="pixel-row-subtitle">
          {avatarFile ? avatarFile.name : 'Файл не выбран'}
        </span>
      </div>
      <Button type="submit" disabled={loading} className="pixel-button">
        <UserPlus data-icon="inline-start" />
        {loading ? 'Добавление...' : 'Добавить участника'}
      </Button>
    </form>
  );
};