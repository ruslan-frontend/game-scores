import { Layout as AntLayout } from 'antd';
import styled from 'styled-components';

const { Content } = AntLayout;

const StyledLayout = styled(AntLayout)`
  min-height: 100vh;
  background: var(--tg-theme-bg-color, #ffffff);
`;

const StyledContent = styled(Content)`
  padding: 16px;
  background: var(--tg-theme-bg-color, #ffffff);
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <StyledLayout>
      <StyledContent>
        {children}
      </StyledContent>
    </StyledLayout>
  );
};