'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs"

export function UserProfile() {
  return (
    <div className="p-6 border-b border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-lg font-semibold text-white">Chartilyze</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">John Doe</div>
          <div className="text-xs text-gray-400">Pro Plan</div>
        </div>
      </div>
    </div>
  )
}
