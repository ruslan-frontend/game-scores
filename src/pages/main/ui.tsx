import React, { useState } from 'react';
import { AddParticipant } from '../../features/add-participant';
import { AddGame } from '../../features/add-game';
import { ParticipantsList } from '../../widgets/participants-list';
import { GamesList } from '../../widgets/games-list';
import { StatisticsDashboard } from '../../widgets/statistics-dashboard';
import { BottomNav, type TabKey } from '../../shared/ui';
import styled from 'styled-components';

const PageContent = styled.div`
  padding-bottom: calc(84px + env(safe-area-inset-bottom, 0));
`;

const Hero = styled.section`
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid #0f172a;
  background: #f8fafc;
  box-shadow: 4px 4px 0 #0f172a;
`;

const SectionSurface = styled.div`
  border-radius: 8px;
  padding: 16px;
  border: 2px solid #0f172a;
  background: #f8fafc;
  box-shadow: 4px 4px 0 #0f172a;
`;

const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('participants');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <PageContent>
        <Hero>
          <h1 className="retro-title">Game Scores</h1>
          <p className="retro-subtitle">
            Ведите счет, фиксируйте победителей и следите за статистикой в одном месте.
          </p>
        </Hero>

        {activeTab === 'participants' && (
          <SectionStack>
            <SectionSurface>
              <AddParticipant onSuccess={handleDataUpdate} />
            </SectionSurface>
            <SectionSurface>
              <ParticipantsList refreshTrigger={refreshTrigger} />
            </SectionSurface>
          </SectionStack>
        )}
        {activeTab === 'games' && (
          <SectionStack>
            <SectionSurface>
              <AddGame onSuccess={handleDataUpdate} />
            </SectionSurface>
            <SectionSurface>
              <GamesList refreshTrigger={refreshTrigger} />
            </SectionSurface>
          </SectionStack>
        )}
        {activeTab === 'statistics' && (
          <SectionSurface>
            <StatisticsDashboard refreshTrigger={refreshTrigger} />
          </SectionSurface>
        )}
      </PageContent>
      <BottomNav activeKey={activeTab} onChange={setActiveTab} />
    </>
  );
};