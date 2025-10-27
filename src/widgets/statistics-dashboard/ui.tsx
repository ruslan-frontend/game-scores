import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Progress, Tabs, Badge, Space } from 'antd';
import { TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { GameModel } from '../../entities/game';
import { ParticipantModel } from '../../entities/participant';
import { ParticipantAvatar } from '../../shared/ui';
import type { GameStatistics, GameByTitle } from '../../shared/types';

interface StatisticsDashboardProps {
  refreshTrigger?: number;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState<GameStatistics[]>([]);
  const [gameStatistics, setGameStatistics] = useState<GameByTitle[]>([]);

  const loadStatistics = () => {
    const stats = GameModel.getStatistics();
    setStatistics(stats.sort((a, b) => b.winPercentage - a.winPercentage));
    
    const gameStats = GameModel.getStatisticsByGames();
    setGameStatistics(gameStats);
  };

  useEffect(() => {
    loadStatistics();
  }, [refreshTrigger]);

  const generalColumns = [
    {
      title: 'Участник',
      key: 'participantName',
      render: (_: unknown, record: GameStatistics) => {
        const participant = ParticipantModel.findById(record.participantId);
        return (
          <Space>
            {participant && (
              <ParticipantAvatar
                name={participant.name}
                color={participant.color}
                size={32}
              />
            )}
            <span>{record.participantName}</span>
          </Space>
        );
      },
    },
    {
      title: 'Игр сыграно',
      dataIndex: 'totalGames',
      key: 'totalGames',
      width: 120,
    },
    {
      title: 'Побед',
      dataIndex: 'wins',
      key: 'wins',
      width: 80,
    },
    {
      title: 'Процент побед',
      key: 'winPercentage',
      width: 150,
      render: (_: unknown, record: GameStatistics) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={record.winPercentage}
            size="small"
            style={{ flex: 1, marginRight: 8 }}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
  ];

  const gameColumns = [
    {
      title: 'Участник',
      key: 'participantName',
      render: (_: unknown, record: GameStatistics) => {
        const participant = ParticipantModel.findById(record.participantId);
        return (
          <Space>
            {participant && (
              <ParticipantAvatar
                name={participant.name}
                color={participant.color}
                size={24}
              />
            )}
            <span>{record.participantName}</span>
          </Space>
        );
      },
    },
    {
      title: 'Игр',
      dataIndex: 'totalGames',
      key: 'totalGames',
      width: 80,
    },
    {
      title: 'Побед',
      dataIndex: 'wins',
      key: 'wins',
      width: 80,
    },
    {
      title: 'Процент',
      key: 'winPercentage',
      width: 120,
      render: (_: unknown, record: GameStatistics) => (
        <Progress
          percent={record.winPercentage}
          size="small"
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <TeamOutlined />
          Общая
        </span>
      ),
      children: statistics.length === 0 ? (
        <Typography.Text type="secondary">
          Статистика будет доступна после добавления игр
        </Typography.Text>
      ) : (
        <Table
          dataSource={statistics}
          columns={generalColumns}
          rowKey="participantId"
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'byGames',
      label: (
        <span>
          <TrophyOutlined />
          По играм
        </span>
      ),
      children: gameStatistics.length === 0 ? (
        <Typography.Text type="secondary">
          Статистика по играм будет доступна после добавления игр
        </Typography.Text>
      ) : (
        <div>
          {gameStatistics.map((gameStats) => (
            <Card
              key={gameStats.gameName}
              size="small"
              style={{ marginBottom: 16 }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{gameStats.gameName}</span>
                  <Badge count={gameStats.gamesCount} showZero color="#108ee9" />
                </div>
              }
            >
              <Table
                dataSource={gameStats.participants}
                columns={gameColumns}
                rowKey="participantId"
                pagination={false}
                size="small"
                showHeader={gameStats.participants.length > 1}
              />
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card title={<><TrophyOutlined /> Статистика</>}>
      <Tabs
        defaultActiveKey="general"
        items={tabItems}
        size="small"
      />
    </Card>
  );
};