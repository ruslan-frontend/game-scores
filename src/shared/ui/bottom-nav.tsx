import React from 'react';
import styled from 'styled-components';
import { ChartColumn, Gamepad2, Users } from 'lucide-react';

const Nav = styled.nav`
  position: fixed;
  bottom: 8px;
  left: 12px;
  right: 12px;
  height: calc(56px + env(safe-area-inset-bottom, 0));
  padding: 7px;
  padding-bottom: calc(7px + env(safe-area-inset-bottom, 0));
  background: #f8fafc;
  border: 2px solid #0f172a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-shadow: 4px 4px 0 #0f172a;
  overflow: hidden;
  isolation: isolate;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 46px;
  padding: 6px 6px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: ${(p) =>
    p.$active
      ? '#1d4ed8'
      : '#64748b'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.24s ease;
  position: relative;
  z-index: 1;

  &:active {
    transform: translateY(1px);
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  line-height: 1;
  color: currentColor;
  transition: color 0.2s ease;
`;

const NavLabel = styled.span<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    opacity: ${(p) => (p.$active ? 1 : 0)};
    transform: scaleX(${(p) => (p.$active ? 1 : 0.7)});
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
`;

export type TabKey = 'participants' | 'games' | 'statistics';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'participants', label: 'Участники', icon: <Users /> },
  { key: 'games', label: 'Игры', icon: <Gamepad2 /> },
  { key: 'statistics', label: 'Статистика', icon: <ChartColumn /> },
];

interface BottomNavProps {
  activeKey: TabKey;
  onChange: (key: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeKey, onChange }) => {
  return (
    <Nav role="tablist">
      {TABS.map(({ key, label, icon }) => (
        <NavItem
          key={key}
          type="button"
          role="tab"
          aria-selected={activeKey === key}
          $active={activeKey === key}
          onClick={() => onChange(key)}
        >
          <NavIcon>{icon}</NavIcon>
          <NavLabel $active={activeKey === key}>{label}</NavLabel>
        </NavItem>
      ))}
    </Nav>
  );
};
