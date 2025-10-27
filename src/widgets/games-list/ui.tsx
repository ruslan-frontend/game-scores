import React, { useState, useEffect } from 'react';
import { List, Button, Typography, Card, Popconfirm, Tag, Space, Avatar } from 'antd';
import { DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { GameModel } from '../../entities/game';
import { ParticipantModel } from '../../entities/participant';
import { ParticipantAvatar } from '../../shared/ui';
import type { Game } from '../../shared/types';
import { formatDate } from '../../shared/lib';

const { Text } = Typography;

interface GamesListProps {
  refreshTrigger?: number;
}

export const GamesList: React.FC<GamesListProps> = ({ refreshTrigger }) => {
  const [games, setGames] = useState<Game[]>([]);

  const loadGames = () => {
    setGames(GameModel.getAll().sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  useEffect(() => {
    loadGames();
  }, [refreshTrigger]);

  const handleDelete = (id: string) => {
    GameModel.delete(id);
    loadGames();
  };

  const getParticipant = (id: string) => {
    return ParticipantModel.findById(id);
  };

  const getParticipantName = (id: string) => {
    const participant = getParticipant(id);
    return participant?.name || 'Неизвестный';
  };

  return (
    <Card title="История игр" style={{ marginBottom: 16 }}>
      {games.length === 0 ? (
        <Text type="secondary">Игры не добавлены</Text>
      ) : (
        <List
          dataSource={games}
          renderItem={(game) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Удалить игру?"
                  description="Это действие нельзя отменить"
                  onConfirm={() => handleDelete(game.id)}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={<TrophyOutlined />}
                title={
                  <div>
                    {game.name}
                    <Tag color="gold" style={{ marginLeft: 8 }}>
                      Победитель: {getParticipantName(game.winnerId)}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Space size="small">
                        <span>Участники:</span>
                        <Avatar.Group size="small" max={{ count: 4 }}>
                          {game.participants.map(participantId => {
                            const participant = getParticipant(participantId);
                            return participant ? (
                              <ParticipantAvatar
                                key={participantId}
                                name={participant.name}
                                color={participant.color}
                                size={24}
                              />
                            ) : null;
                          })}
                        </Avatar.Group>
                      </Space>
                    </div>
                    <div>Дата: {formatDate(game.date)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};