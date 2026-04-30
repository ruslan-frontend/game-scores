import styled from 'styled-components';

const StyledLayout = styled.div`
  min-height: 100vh;
  min-height: calc(100vh - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0));
  background: transparent;
`;

const StyledContent = styled.main`
  width: min(100%, 860px);
  margin: 0 auto;
  padding: 16px 16px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0));
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
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