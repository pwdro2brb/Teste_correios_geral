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

export function formatDateBR(date = new Date()): string {
  return date.toLocaleDateString('pt-BR')
}

export function formatDateTimeBR(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR')
}

export function isToday(dateLabel: string, date = new Date()): boolean {
  return dateLabel === formatDateBR(date)
}
