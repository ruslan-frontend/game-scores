import React from 'react';
import styled from 'styled-components';
import { getInitials } from '../lib';

interface AvatarWrapperProps {
  $color: string;
  $size: number;
  $shape: 'circle' | 'square';
}

const AvatarWrapper = styled.div<AvatarWrapperProps>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: ${props => (props.$shape === 'square' ? '8px' : '50%')};
  background-color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: ${props => props.$size * 0.4}px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface ParticipantAvatarProps {
  name: string;
  color: string;
  size?: number;
  shape?: 'circle' | 'square';
  className?: string;
}

export const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  name,
  color,
  size = 40,
  shape = 'circle',
  className
}) => {
  return (
    <AvatarWrapper 
      $color={color} 
      $size={size} 
      $shape={shape}
      className={className}
    >
      {getInitials(name)}
    </AvatarWrapper>
  );
};