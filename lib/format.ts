export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}
