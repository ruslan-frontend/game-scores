import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { ParticipantAdapter } from '../../shared/lib/data-adapter';
import { ParticipantAvatar } from '../../shared/ui';
import { AVATAR_COLORS } from '../../shared/lib';
import type { Participant } from '../../shared/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';


interface EditParticipantProps {
  participant: Participant;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export const EditParticipant: React.FC<EditParticipantProps> = ({
  participant,
  onSuccess,
  trigger
}) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(participant.color);
  const [previewName, setPreviewName] = useState(participant.name);
  const [name, setName] = useState(participant.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | undefined>(participant.avatarUrl);
  const fileInputId = `edit-participant-avatar-file-${participant.id}`;

  useEffect(() => {
    if (visible) {
      setName(participant.name);
      setSelectedColor(participant.color);
      setPreviewName(participant.name);
      setAvatarFile(null);
      setPreviewAvatarUrl(participant.avatarUrl);
    }
  }, [visible, participant]);

  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setPreviewAvatarUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setAvatarFile(null);
      setPreviewAvatarUrl(participant.avatarUrl);
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
      let avatarUrl = participant.avatarUrl;
      if (avatarFile) {
        const uploadedAvatarUrl = await ParticipantAdapter.uploadAvatar(participant.id, avatarFile);
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        } else {
          toast.error('Не удалось загрузить новую аватарку');
        }
      }

      const success = await ParticipantAdapter.update(participant.id, {
        name: trimmedName,
        color: selectedColor,
        avatarUrl,
      });
      
      if (success) {
        toast.success('Участник обновлен');
        setVisible(false);
        onSuccess?.();
      } else {
        toast.error('Участник не найден');
      }
    } catch {
      toast.error('Ошибка при обновлении участника');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setPreviewName(value || participant.name);
  };

  return (
    <>
      <div onClick={() => setVisible(true)}>
        {trigger || (
          <Button variant="ghost" size="icon-sm" aria-label="Редактировать">
            <Pencil />
          </Button>
        )}
      </div>

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="pixel-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать участника</DialogTitle>
            <DialogDescription>
              Обновите имя и цвет аватара участника.
            </DialogDescription>
          </DialogHeader>

          <form className="pixel-form" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              <ParticipantAvatar
                name={previewName}
                color={selectedColor}
                avatarUrl={previewAvatarUrl}
                size={64}
              />
            </div>

            <div className="pixel-form">
              <label className="pixel-label">Имя участника</label>
              <Input
                className="pixel-input"
                placeholder="Имя участника"
                maxLength={50}
                value={name}
                onChange={handleNameChange}
              />
            </div>

            <div className="pixel-form">
              <label className="pixel-label">Фото участника</label>
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

            <div className="pixel-form">
              <label className="pixel-label">Цвет аватара</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="pixel-input"
              />
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-7 rounded-full border-2 border-slate-900"
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Выбрать цвет ${color}`}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="border-2 border-slate-900" onClick={() => setVisible(false)}>
                Отмена
              </Button>
              <Button type="submit" className="pixel-button" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};