export function formatUAH(kopiykas: number): string {
  return `${(kopiykas / 100).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} грн`
}
