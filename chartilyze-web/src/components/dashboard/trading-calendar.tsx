'use client'

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  trades: number
  pnl: number
  isToday: boolean
}

const generateCalendarDays = (): CalendarDay[] => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: CalendarDay[] = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = current.getMonth() === currentMonth
    const isToday = current.toDateString() === today.toDateString()
    
    // Mock trading data
    const trades = isCurrentMonth && current <= today ? Math.floor(Math.random() * 8) : 0
    const pnl = trades > 0 ? (Math.random() - 0.4) * 500 : 0
    
    days.push({
      date: current.getDate(),
      isCurrentMonth,
      trades,
      pnl,
      isToday
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

export function TradingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays] = useState(generateCalendarDays())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-500/20 border-green-500/40'
    if (pnl < 0) return 'bg-red-500/20 border-red-500/40'
    return 'bg-gray-700/50 border-gray-600'
  }
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Trading Calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-white font-medium px-3">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square p-1 rounded-lg border cursor-pointer transition-all hover:bg-gray-800/50
                ${day.isCurrentMonth ? 'opacity-100' : 'opacity-30'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${day.trades > 0 ? getPnLColor(day.pnl) : 'border-gray-700'}
              `}
            >
              <div className="w-full h-full flex flex-col justify-between">
                <span className={`text-xs font-medium ${
                  day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                }`}>
                  {day.date}
                </span>
                
                {day.trades > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-300">{day.trades}</div>
                    <div className={`text-xs font-medium ${
                      day.pnl > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {day.pnl > 0 ? '+' : ''}${Math.round(day.pnl)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40"></div>
            <span className="text-xs text-gray-400">Profitable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40"></div>
            <span className="text-xs text-gray-400">Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-700/50 border border-gray-600"></div>
            <span className="text-xs text-gray-400">No Trades</span>
          </div>
        </div>
      </div>
    </div>
  )
}