'use client'

import Link from 'next/link'
import { UserButton } from "@clerk/nextjs"
import { Settings } from 'lucide-react'

export function UserProfile() {
  return (
    <div className="p-6 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-lg font-semibold text-white">Chartilyze</span>
        </Link>
        <UserButton 
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              userButtonTrigger: "text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800",
              userButtonPopoverCard: "text-white"
            }
          }}
        />
      </div>
    </div>
  )
}
