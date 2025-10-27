import React, { useState } from 'react';
import { Button, Input, Form, Select, message, Checkbox, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { GameModel } from '../../entities/game';
import { ParticipantModel } from '../../entities/participant';

interface AddGameProps {
  onSuccess?: () => void;
}

export const AddGame: React.FC<AddGameProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [participants] = useState(() => ParticipantModel.getAll());
  const [gameTitles] = useState(() => GameModel.getUniqueGameTitles());
  const [customGameName, setCustomGameName] = useState('');

  const handleGameTitleSelect = (title: string) => {
    form.setFieldsValue({ name: title });
    setCustomGameName('');
  };

  const handleSubmit = async (values: { 
    name: string; 
    winnerId: string; 
    participants: string[];
  }) => {
    const gameName = values.name || customGameName;
    if (!gameName?.trim()) {
      message.error('Введите название игры');
      return;
    }

    if (!values.winnerId) {
      message.error('Выберите победителя');
      return;
    }

    if (!values.participants?.length) {
      message.error('Выберите участников');
      return;
    }

    if (!values.participants.includes(values.winnerId)) {
      message.error('Победитель должен быть среди участников');
      return;
    }

    setLoading(true);
    try {
      GameModel.create(gameName, values.winnerId, values.participants);
      message.success('Игра добавлена');
      form.resetFields();
      setCustomGameName('');
      onSuccess?.();
    } catch (error) {
      message.error('Ошибка при добавлении игры');
    } finally {
      setLoading(false);
    }
  };

  const participantOptions = participants.map(p => ({
    label: p.name,
    value: p.id
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ width: '100%' }}
    >
      <Form.Item label="Название игры">
        {gameTitles.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontSize: '14px', color: '#666' }}>
              Быстрый выбор:
            </div>
            <Space size={[0, 8]} wrap>
              {gameTitles.map(title => (
                <Tag
                  key={title}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleGameTitleSelect(title)}
                >
                  {title}
                </Tag>
              ))}
            </Space>
          </div>
        )}
        <Form.Item
          name="name"
          rules={[{ required: !customGameName, message: 'Введите название игры' }]}
          style={{ marginBottom: 0 }}
        >
          <Input
            placeholder="Или введите новое название"
            maxLength={100}
            value={customGameName}
            onChange={(e) => setCustomGameName(e.target.value)}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item
        name="participants"
        label="Участники"
        rules={[{ required: true, message: 'Выберите участников' }]}
      >
        <Checkbox.Group
          options={participantOptions}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="winnerId"
        label="Победитель"
        rules={[{ required: true, message: 'Выберите победителя' }]}
      >
        <Select placeholder="Выберите победителя">
          {participants.map(participant => (
            <Select.Option key={participant.id} value={participant.id}>
              {participant.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<PlusOutlined />}
          style={{ width: '100%' }}
        >
          Добавить игру
        </Button>
      </Form.Item>
    </Form>
  );
};