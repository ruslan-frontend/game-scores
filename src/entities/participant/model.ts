import { v4 as uuidv4 } from 'uuid';
import type { Participant } from '../../shared/types';
import { storage, STORAGE_KEYS, getRandomColor, isValidColor, normalizeColor } from '../../shared/lib';

export class ParticipantModel {
  static getAll(): Participant[] {
    const participants = storage.get<Participant[]>(STORAGE_KEYS.PARTICIPANTS) || [];
    let needsMigration = false;
    
    const migratedParticipants = participants.map(p => {
      if (!p.color) {
        needsMigration = true;
        return {
          ...p,
          color: getRandomColor(),
          createdAt: new Date(p.createdAt)
        };
      }
      return {
        ...p,
        createdAt: new Date(p.createdAt)
      };
    });
    
    // Save migrated data if needed
    if (needsMigration) {
      storage.set(STORAGE_KEYS.PARTICIPANTS, migratedParticipants);
    }
    
    return migratedParticipants;
  }

  static create(name: string, color?: string): Participant {
    const validatedColor = color && isValidColor(color) ? normalizeColor(color) : getRandomColor();
    
    const participant: Participant = {
      id: uuidv4(),
      name: name.trim(),
      color: validatedColor,
      createdAt: new Date()
    };

    const participants = this.getAll();
    participants.push(participant);
    storage.set(STORAGE_KEYS.PARTICIPANTS, participants);
    
    return participant;
  }

  static update(id: string, updates: Partial<Pick<Participant, 'name' | 'color'>>): boolean {
    const participants = this.getAll();
    const participantIndex = participants.findIndex(p => p.id === id);
    
    if (participantIndex === -1) {
      return false;
    }
    
    // Validate color if provided
    const processedUpdates = { ...updates };
    if (updates.color && !isValidColor(updates.color)) {
      processedUpdates.color = getRandomColor();
    } else if (updates.color) {
      processedUpdates.color = normalizeColor(updates.color);
    }
    
    participants[participantIndex] = {
      ...participants[participantIndex],
      ...processedUpdates
    };
    
    storage.set(STORAGE_KEYS.PARTICIPANTS, participants);
    return true;
  }

  static delete(id: string): boolean {
    const participants = this.getAll();
    const filteredParticipants = participants.filter(p => p.id !== id);
    
    if (filteredParticipants.length === participants.length) {
      return false;
    }
    
    storage.set(STORAGE_KEYS.PARTICIPANTS, filteredParticipants);
    return true;
  }

  static findById(id: string): Participant | null {
    return this.getAll().find(p => p.id === id) || null;
  }
}