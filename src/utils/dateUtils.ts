
// Date utility functions

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return '-';
  }
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const calculateDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};
