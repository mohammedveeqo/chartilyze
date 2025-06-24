import { ChevronDown } from 'lucide-react'
import { useStrategy } from '@/app/hooks/use-strategy'
import type { StrategyName } from '@/types/strategy'

interface StrategyDropdownProps {
  isOpen: boolean
  onToggle: () => void
}

export function StrategyDropdown({ isOpen, onToggle }: StrategyDropdownProps) {
  const { currentStrategy, strategies, setCurrentStrategy } = useStrategy()

  // Create a typed array of strategy names
  const strategyNames = Object.keys(strategies) as StrategyName[]

  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left mb-3 px-3 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <span className="text-sm text-white">{currentStrategy}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          {strategyNames.map((strategy) => (
            <button
              key={strategy}
              onClick={() => {
                setCurrentStrategy(strategy)
                onToggle()
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                strategy === currentStrategy ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
              }`}
            >
              <div className="font-medium">{strategy}</div>
              <div className="text-xs text-gray-400 mt-1">
                {strategies[strategy].pairs.slice(0, 3).join(', ')}
                {strategies[strategy].pairs.length > 3 && '...'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
