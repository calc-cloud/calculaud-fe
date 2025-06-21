
// Formatting utility functions

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateTotalCost = (emfs: import('@/types').EMF[]): number => {
  return emfs.reduce((total, emf) => {
    const emfTotal = emf.costs.reduce((emfSum, cost) => emfSum + cost.amount, 0);
    return total + emfTotal;
  }, 0);
};

export const joinEMFIds = (emfs: import('@/types').EMF[]): string => {
  return emfs.map(emf => emf.id).join(', ');
};
