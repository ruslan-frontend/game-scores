import React, { useState, useEffect } from 'react';
import { List, Button, Typography, Card, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ParticipantAdapter } from '../../shared/lib/data-adapter';
import { EditParticipant } from '../../features/edit-participant';
import { ParticipantAvatar } from '../../shared/ui';
import type { Participant } from '../../shared/types';
import { formatDate } from '../../shared/lib';

const { Text } = Typography;

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
    await ParticipantAdapter.delete(id);
    loadParticipants();
  };

  return (
    <Card title="Участники" style={{ marginBottom: 16 }}>
      {participants.length === 0 ? (
        <Text type="secondary">Участники не добавлены</Text>
      ) : (
        <List
          dataSource={participants}
          renderItem={(participant) => (
            <List.Item
              actions={[
                <Space key="actions">
                  <EditParticipant
                    participant={participant}
                    onSuccess={loadParticipants}
                    trigger={
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                      />
                    }
                  />
                  <Popconfirm
                    title="Удалить участника?"
                    description="Это действие нельзя отменить"
                    onConfirm={() => handleDelete(participant.id)}
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
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <ParticipantAvatar
                    name={participant.name}
                    color={participant.color}
                    size={40}
                  />
                }
                title={participant.name}
                description={`Добавлен: ${formatDate(participant.createdAt)}`}
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};