import { Metadata } from 'next'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentTrades } from '@/components/dashboard/recent-trades'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { TradingCalendar } from '@/components//dashboard/trading-calendar'
import { PsychologyInsights } from '@/components/dashboard/psychology-insights'
import { QuickActions } from '@/components/dashboard/quick-actions'

export const metadata: Metadata = {
  title: 'Dashboard | Chartilyze',
  description: 'Your AI-powered trading journal dashboard',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions - Top Left */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
          
          {/* Stats Cards - Top Right */}
          <div className="lg:col-span-3">
            <StatsCards />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Performance Chart - Left Large */}
          <div className="xl:col-span-2">
            <PerformanceChart />
          </div>
          
          {/* Psychology Insights - Right */}
          <div className="xl:col-span-1">
            <PsychologyInsights />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Trades - Left Large */}
          <div className="xl:col-span-2">
            <RecentTrades />
          </div>
          
          {/* Trading Calendar - Right */}
          <div className="xl:col-span-1">
            <TradingCalendar />
          </div>
        </div>
      </div>
    </div>
  )
}