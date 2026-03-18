const VALUE_COLORS: Record<number, string> = {
  1: '#6c5ce7',
  2: '#a29bfe',
  4: '#fd79a8',
  8: '#e17055',
  16: '#fdcb6e',
  32: '#00b894',
  64: '#00cec9',
  128: '#e84393',
  256: '#d63031',
  512: '#ffd32a',
  1024: '#ff6b6b',
};

export function getValueColor(value: number): string {
  return VALUE_COLORS[value] || '#fab1a0';
}
