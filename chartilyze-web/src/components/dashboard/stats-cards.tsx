'use client'

import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Percent, Brain, Quote, Gauge } from 'lucide-react'

// Interface for individual statistic cards
interface StatCard {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  trendDescription?: string
}

// Data for the core performance metrics
const coreStats: StatCard[] = [
  {
    title: 'Avg R:R',
    value: '2.3:1',
    change: '+0.3',
    changeType: 'positive',
    icon: <BarChart3 className="h-4 w-4" />, // Smaller icon
    trendDescription: 'vs last 7 days'
  },
  {
    title: 'Total R Earned',
    value: '+42.5 R',
    change: '+5.0 R',
    changeType: 'positive',
    icon: <Gauge className="h-4 w-4" />, // Smaller icon
    trendDescription: 'this month'
  },
  {
    title: 'Strategy Adherence',
    value: '82%',
    change: '-3.1%',
    changeType: 'negative',
    icon: <Percent className="h-4 w-4" />, // Smaller icon
    trendDescription: 'this week'
  },
  {
    title: 'Discipline Score',
    value: '7.5 / 10',
    icon: <Brain className="h-4 w-4" />, // Smaller icon
    trendDescription: 'Based on rule tracking & logging'
  }
]

// Data for the Quote of the Day
const quotes = [
  "A 1:2 risk-reward with just a 40% win rate still makes you consistently profitable.",
  "You can lose more trades than you win and still come out ahead — if your R:R is right.",
  "The market doesn’t pay you for being right — it pays you for managing risk.",
  "A single oversized trade can undo weeks of discipline.",
  "Risk comes first. Reward is just potential.",
  "Trading is simple: plan the trade, control the risk, accept the outcome.",
  "Professionals think in probabilities. Amateurs think in absolutes.",
  "You can’t control outcome — only process and position size.",
  "Consistency in execution beats brilliance in analysis.",
  "Focus on setups that repeat. Not setups that excite.",
  "Without a stop-loss, you’re just gambling.",
  "Your next trade doesn’t need to win — it just needs to follow the plan.",
  "1:3 R:R with 30% accuracy beats 1:1 R:R with 60% accuracy.",
  "Protecting your downside is the only way to stay in the game.",
  "Your job is to take good trades — not to force great outcomes."
];

// Function to get a random quote
const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)]

// Main component for the Stats Cards
export function StatsCards() {
  const quoteOfTheDay = getRandomQuote();

  return (
    <div className="flex flex-col py-3"> {/* Reduced overall vertical padding */}
      {/* Quote of the Day - Dynamically smaller */}
      <div className="text-center text-base italic text-gray-200 font-serif mb-4"> {/* Reduced font size to base, reduced bottom margin */}
        <span className="inline-flex items-center gap-1"> {/* Reduced gap */}
          <Quote className="h-3 w-3 text-gray-400" /> {/* Smaller quote icon */}
          {quoteOfTheDay}
        </span>
      </div>

      {/* Core Performance Metrics - Dynamically smaller, 4 distinct boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"> {/* Reduced gap between cards */}
        {coreStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-3 border border-gray-800 hover:border-gray-700 transition-colors" // Reduced individual card padding
          >
            {/* Icon and Title Group */}
            <div className="flex items-center gap-1 mb-1"> {/* Reduced gap and bottom margin */}
              <div className="text-blue-400">
                {stat.icon}
              </div>
              <p className="text-sm text-gray-300 font-medium">{stat.title}</p> {/* Smaller title font */}
            </div>

            {/* Value and Change Group */}
            <div className="flex items-end gap-1 text-white"> {/* Reduced gap */}
              <p className="text-2xl font-bold">{stat.value}</p> {/* Smaller value font */}
              {stat.change && stat.changeType && (
                <div className={`flex items-center text-xs pb-0.5 ${ // Smaller trend text/icon
                  stat.changeType === 'positive'
                    ? 'text-green-400'
                    : stat.changeType === 'negative'
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3" /> // Smaller trend icons
                  ) : stat.changeType === 'negative' ? (
                    <TrendingDown className="h-3 w-3" /> // Smaller trend icons
                  ) : null}
                  {stat.change}
                </div>
              )}
            </div>

            {/* Trend Description */}
{stat.trendDescription && (
  <p className="text-xs text-gray-500 mt-0.5">{stat.trendDescription}</p>
)}

          </div>
        ))}
      </div>
    </div>
  )
}