export function formatToUGX(valueInShillings: number): string {
  if (valueInShillings >= 1000000) {
    return (valueInShillings / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (valueInShillings >= 1000) {
    return (valueInShillings / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return valueInShillings.toString();
}

export function formatCompactValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return value.toString();
}

export function formatMetricValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2).replace(/\.0+$/, '').replace(/\.$/, '') + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return value.toString();
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
