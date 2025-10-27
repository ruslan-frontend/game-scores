import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Space, ColorPicker } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import { ParticipantAdapter } from '../../shared/lib/data-adapter';
import { ParticipantAvatar } from '../../shared/ui';
import { AVATAR_COLORS } from '../../shared/lib';
import type { Participant } from '../../shared/types';


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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(participant.color);
  const [previewName, setPreviewName] = useState(participant.name);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        name: participant.name
      });
      setSelectedColor(participant.color);
      setPreviewName(participant.name);
    }
  }, [visible, participant, form]);

  const handleSubmit = async (values: { name: string }) => {
    if (!values.name?.trim()) {
      message.error('Введите имя участника');
      return;
    }

    setLoading(true);
    try {
      const success = await ParticipantAdapter.update(participant.id, {
        name: values.name.trim(),
        color: selectedColor
      });
      
      if (success) {
        message.success('Участник обновлен');
        setVisible(false);
        onSuccess?.();
      } else {
        message.error('Участник не найден');
      }
    } catch (error) {
      message.error('Ошибка при обновлении участника');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewName(e.target.value || participant.name);
  };

  const handleColorChange = (color: Color) => {
    setSelectedColor(color.toHexString());
  };

  return (
    <>
      <div onClick={() => setVisible(true)}>
        {trigger || (
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
          />
        )}
      </div>

      <Modal
        title="Редактировать участника"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <ParticipantAvatar
              name={previewName}
              color={selectedColor}
              size={64}
            />
          </div>

          <Form.Item
            name="name"
            label="Имя участника"
            rules={[{ required: true, message: 'Введите имя участника' }]}
          >
            <Input
              placeholder="Имя участника"
              maxLength={50}
              onChange={handleNameChange}
            />
          </Form.Item>

          <Form.Item label="Цвет аватара">
            <Space>
              <ColorPicker
                value={selectedColor}
                onChange={handleColorChange}
                presets={[
                  {
                    label: 'Рекомендуемые',
                    colors: [...AVATAR_COLORS],
                  },
                ]}
                showText
                size="large"
              />
              <span style={{ color: '#666', fontSize: '14px' }}>
                Выберите цвет или используйте рекомендуемые
              </span>
            </Space>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setVisible(false)}>
                Отмена
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};