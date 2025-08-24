"use client";

import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <div className="relative mx-auto max-w-5xl px-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-3xl rounded-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-2xl rounded-3xl animate-bounce" style={{animationDuration: '3s'}} />
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/15 via-blue-600/15 to-cyan-600/15 blur-xl rounded-3xl" style={{animation: 'float 4s ease-in-out infinite'}} />
      </div>
      
      <div className="relative">
        {/* Dashboard mockup */}
        <div className="relative bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
          {/* Browser controls */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="ml-4 text-xs text-gray-400">chartilyze.com/dashboard</div>
          </div>
          
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Trading Dashboard</h2>
                <p className="text-gray-400 text-sm">Welcome back, Alex</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 text-sm font-medium">New Trade</button>
          </div>
          
          {/* Simplified stats - only 2 key metrics */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Total P&L</span>
              </div>
              <div className="text-3xl font-bold text-green-400">+$12,847</div>
              <div className="text-sm text-gray-500">+18.3% this month</div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Win Rate</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">73.2%</div>
              <div className="text-sm text-gray-500">156 of 213 trades</div>
            </div>
          </div>
          
          {/* Simplified chart area */}
          <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Portfolio Performance</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">1M</button>
                <button className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">3M</button>
              </div>
            </div>
            
            {/* Simplified chart */}
            <div className="h-32 bg-gradient-to-t from-slate-800/50 to-transparent rounded relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-500/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                {[
                  { height: 35, color: 'bg-green-400/60' },
                  { height: 42, color: 'bg-green-400/60' },
                  { height: 28, color: 'bg-red-400/60' },
                  { height: 55, color: 'bg-green-400/60' },
                  { height: 48, color: 'bg-green-400/60' },
                  { height: 38, color: 'bg-red-400/60' },
                  { height: 65, color: 'bg-green-400/60' },
                  { height: 72, color: 'bg-green-400/60' }
                ].map((bar, i) => (
                  <div
                    key={i}
                    className={`${bar.color} rounded-t`}
                    style={{
                      height: `${bar.height}px`,
                      width: '8px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
};