import { format, formatDistance, formatRelative } from 'date-fns'

export const formatDate = (date: Date | string, pattern: string = 'PPP'): string => {
  return format(new Date(date), pattern)
}

export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), 'PPP p')
}

export const formatRelativeTime = (date: Date | string): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}