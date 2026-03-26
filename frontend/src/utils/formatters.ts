import { Colors } from './colors';

export const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatKm = (km: number): string => {
  return `${km.toLocaleString('en-IN')} km`;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return Colors.success;
    case 'submitted': return Colors.primary;
    case 'draft': return Colors.warning;
    default: return Colors.textMuted;
  }
};

export const getStatusBg = (status: string): string => {
  switch (status) {
    case 'completed': return Colors.successBg;
    case 'submitted': return Colors.primaryBg;
    case 'draft': return Colors.warningBg;
    default: return Colors.gray100;
  }
};
