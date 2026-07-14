export function formatToUGX(valueInShillings: number): string {
  if (valueInShillings >= 1000000) {
    return (valueInShillings / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (valueInShillings >= 1000) {
    return (valueInShillings / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return valueInShillings.toString();
}
