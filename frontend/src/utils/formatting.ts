/**
 * Format address to show first 6 and last 4 characters
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format amount with decimals
 */
export const formatAmount = (amount: string, decimals: number = 18): string => {
  const num = BigInt(amount);
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = num / divisor;
  const decimalPart = num % divisor;
  
  if (decimalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const decimalStr = decimalPart.toString().padStart(decimals, '0').slice(0, 6);
  return `${wholePart}.${decimalStr}`.replace(/\.?0+$/, '');
};

/**
 * Parse amount string to wei
 */
export const parseAmount = (amount: string, decimals: number = 18): string => {
  const [whole, decimal] = amount.split('.');
  const decimalPart = (decimal || '').padEnd(decimals, '0');
  return (whole + decimalPart).replace(/^0+/, '') || '0';
};

/**
 * Format date
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if invoice is overdue
 */
export const isOverdue = (dueDate: number, status: string): boolean => {
  return status !== 'paid' && Date.now() > dueDate * 1000;
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
