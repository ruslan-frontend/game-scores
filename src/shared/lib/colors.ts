export const AVATAR_COLORS = [
  '#f56565', // red
  '#ed8936', // orange  
  '#ecc94b', // yellow
  '#48bb78', // green
  '#38b2ac', // teal
  '#4299e1', // blue
  '#667eea', // indigo
  '#9f7aea', // purple
  '#ed64a6', // pink
  '#a0aec0', // gray
  '#68d391', // light green
  '#63b3ed', // light blue
] as const;

export const getRandomColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const isValidColor = (color: string): boolean => {
  // Check if it's a valid hex color
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

export const normalizeColor = (color: string): string => {
  // Ensure color is in proper hex format
  if (!color.startsWith('#')) {
    return `#${color}`;
  }
  return color.toUpperCase();
};