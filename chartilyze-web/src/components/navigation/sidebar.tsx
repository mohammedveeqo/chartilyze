'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserProfile } from './user-profile'
import { StrategySelector } from './strategy-selector/strategy-selector'
import { RecentTradesList } from './recent-trades/recent-trades-list'
import { AddTradeModal } from './modals/add-trade-modal'
import { navigationItems } from './navigation-items'

export function Sidebar() {
  const [showAddTrade, setShowAddTrade] = useState(false)
  const pathname = usePathname()

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 h-screen flex flex-col sticky top-0">
      <UserProfile />

      <nav className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Button 
          onClick={() => setShowAddTrade(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Trade
        </Button>
      </div>

      <StrategySelector />
      <RecentTradesList />

      {showAddTrade && <AddTradeModal onClose={() => setShowAddTrade(false)} />}
    </div>
  )
}
