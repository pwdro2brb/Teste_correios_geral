export function nowIso() {
  return new Date().toISOString()
}

export function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && value.includes('T')
}