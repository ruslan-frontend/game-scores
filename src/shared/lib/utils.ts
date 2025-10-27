export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const calculateWinPercentage = (wins: number, total: number): number => {
  return total === 0 ? 0 : Math.round((wins / total) * 100);
};