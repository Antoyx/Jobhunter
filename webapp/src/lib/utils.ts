import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min: number | null, max: number | null, currency = 'EUR'): string {
  if (!min && !max) return ''
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency
  const fmt = (n: number) => {
    if (n >= 1000) return `${symbol}${Math.round(n / 1000)}k`
    return `${symbol}${n}`
  }
  if (min && max) return `${fmt(min)}-${fmt(max)}`
  if (min) return `${fmt(min)}+`
  return `up to ${fmt(max!)}`
}
