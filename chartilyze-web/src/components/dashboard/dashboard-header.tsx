// src/components/dashboard/dashboard-header.tsx
'use client'

import { Search } from 'lucide-react' // Only Search icon is needed
import { Input } from '@/components/ui/input' // Assuming this is your Shadcn/UI Input component
import { UserButton } from "@clerk/nextjs"; // Assuming you're using Clerk for user authentication

export function DashboardHeader() {
  return (
    // This div represents your minimal top bar.
    // It's designed to be compact and blend into the overall layout.
    // No background, border, or heavy padding, as these would be handled by a higher-level layout.
    <div className="flex justify-end items-center py-3 px-4"> 
      
      {/* The "Welcome back, Trader" greeting and date section has been removed.
        Its previous code looked like this:
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, Trader
          </h1>
          <p className="text-gray-400 text-sm">{currentDate}</p>
        </div>
      */}
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search trades..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
        
        {/* Notifications (Bell) and Settings icons have been removed from here.
          These elements are now conceptually moved to a primary sidebar for navigation.
          Their previous code looked like this:
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-5 w-5" />
          </Button>
        */}
        
        {/* User Profile Button */}
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </div>
  )
}