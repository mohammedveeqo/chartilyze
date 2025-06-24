import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function calculatePnL(entry: number, exit: number, type: 'long' | 'short', size: number = 1): number {
  if (type === 'long') {
    return (exit - entry) * size
  } else {
    return (entry - exit) * size
  }
}

export function calculateRiskReward(entry: number, stopLoss: number, takeProfit: number, type: 'long' | 'short'): string {
  let risk: number
  let reward: number
  
  if (type === 'long') {
    risk = entry - stopLoss
    reward = takeProfit - entry
  } else {
    risk = stopLoss - entry
    reward = entry - takeProfit
  }
  
  if (risk <= 0) return '0:0'
  
  const ratio = reward / risk
  return `${ratio.toFixed(1)}:1`
}

export function getTradeStatus(pnl: number): 'win' | 'loss' | 'breakeven' {
  if (pnl > 0) return 'win'
  if (pnl < 0) return 'loss'
  return 'breakeven'
}

export function isTradingDay(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6 // Exclude weekends (0 = Sunday, 6 = Saturday)
}
export function getWeekdayName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
export function getMonthName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'long' }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
export function getYear(date: Date): number {
  return date.getFullYear()
}
export function getDayOfMonth(date: Date): number {
  return date.getDate()
}
export function getTimeString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}   

export function getColorClasses(color: string): string {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

    