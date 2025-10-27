import React, { useState } from 'react';
import { Button, Input, Form, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { ParticipantModel } from '../../entities/participant';

interface AddParticipantProps {
  onSuccess?: () => void;
}

export const AddParticipant: React.FC<AddParticipantProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string }) => {
    if (!values.name?.trim()) {
      message.error('Введите имя участника');
      return;
    }

    setLoading(true);
    try {
      ParticipantModel.create(values.name);
      message.success('Участник добавлен');
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error('Ошибка при добавлении участника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleSubmit}
      style={{ width: '100%' }}
    >
      <Form.Item
        name="name"
        style={{ flex: 1 }}
        rules={[{ required: true, message: 'Введите имя участника' }]}
      >
        <Input
          placeholder="Имя участника"
          maxLength={50}
        />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<UserAddOutlined />}
        >
          Добавить
        </Button>
      </Form.Item>
    </Form>
  );
};