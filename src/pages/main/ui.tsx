import React, { useState } from 'react';
import { Tabs, Space } from 'antd';
import { UserOutlined, ControlOutlined, BarChartOutlined } from '@ant-design/icons';
import { AddParticipant } from '../../features/add-participant';
import { AddGame } from '../../features/add-game';
import { ParticipantsList } from '../../widgets/participants-list';
import { GamesList } from '../../widgets/games-list';
import { StatisticsDashboard } from '../../widgets/statistics-dashboard';

export const MainPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabItems = [
    {
      key: 'participants',
      label: (
        <span>
          <UserOutlined />
          Участники
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <AddParticipant onSuccess={handleDataUpdate} />
          <ParticipantsList refreshTrigger={refreshTrigger} />
        </Space>
      ),
    },
    {
      key: 'games',
      label: (
        <span>
          <ControlOutlined />
          Игры
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <AddGame onSuccess={handleDataUpdate} />
          <GamesList refreshTrigger={refreshTrigger} />
        </Space>
      ),
    },
    {
      key: 'statistics',
      label: (
        <span>
          <BarChartOutlined />
          Статистика
        </span>
      ),
      children: <StatisticsDashboard refreshTrigger={refreshTrigger} />,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="participants"
      items={tabItems}
      style={{ width: '100%' }}
    />
  );
};