export function fmt(n: number | string | undefined | null): string {
  const v = typeof n === 'string' ? parseFloat(n) : Number(n ?? 0)
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
