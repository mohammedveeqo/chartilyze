import { create } from 'zustand'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'

type Journal = Doc<"journals">

interface StrategyFromJournal {
  id: string
  name: string
  description?: string
  rules: string[]
  components?: any[]
  globalTags?: string[]
  complexity?: 'simple' | 'intermediate' | 'advanced'
  riskProfile?: 'conservative' | 'moderate' | 'aggressive'
  journalId: Id<"journals"> // Changed from string to Id<"journals">
  journalName: string
}

interface StrategyStore {
  currentStrategyId: string | null
  editingStrategyId: string | null
  setCurrentStrategy: (strategyId: string) => void
  setEditingStrategy: (strategyId: string | null) => void
}

const useStrategyStore = create<StrategyStore>((set) => ({
  currentStrategyId: null,
  editingStrategyId: null,
  setCurrentStrategy: (strategyId) => set({ currentStrategyId: strategyId }),
  setEditingStrategy: (strategyId) => set({ editingStrategyId: strategyId }),
}))

// Hook to get all strategies from journals
export const useStrategies = () => {
  const journalsData = useQuery(api.journals.getUserJournals)
  
  if (!journalsData?.journals) {
    return {
      strategies: [],
      isLoading: true,
      hasStrategies: false
    }
  }

  const strategies: StrategyFromJournal[] = journalsData.journals
    .filter(journal => journal.strategy) // Only journals with strategies
    .map(journal => ({
      id: journal._id,
      name: journal.strategy!.name,
      description: journal.description,
      rules: journal.strategy!.rules || [],
      components: journal.strategy!.components,
      globalTags: journal.strategy!.globalTags,
      complexity: journal.strategy!.complexity,
      riskProfile: journal.strategy!.riskProfile,
      journalId: journal._id,
      journalName: journal.name
    }))

  return {
    strategies,
    isLoading: false,
    hasStrategies: strategies.length > 0
  }
}

// Hook to get current strategy data
export const useCurrentStrategy = () => {
  const { currentStrategyId, setCurrentStrategy } = useStrategyStore()
  const { strategies, isLoading } = useStrategies()
  
  // Auto-select first strategy if none selected and strategies exist
  if (!currentStrategyId && strategies.length > 0 && !isLoading) {
    setCurrentStrategy(strategies[0].id)
  }
  
  const currentStrategy = strategies.find(s => s.id === currentStrategyId)
  
  return {
    currentStrategy: currentStrategy || null,
    setCurrentStrategy,
    isLoading
  }
}

// Main hook for backward compatibility
export const useStrategy = () => {
  const store = useStrategyStore()
  const { strategies } = useStrategies()
  const { currentStrategy } = useCurrentStrategy()
  
  // Convert to old format for backward compatibility
  const strategiesRecord = strategies.reduce((acc, strategy) => {
    acc[strategy.name] = {
      pairs: [], // You might want to add pairs to your schema
      rules: strategy.rules,
      color: 'blue', // Default color, you might want to add this to schema
      trades: [] // Trades are separate in your schema
    }
    return acc
  }, {} as Record<string, any>)
  
  return {
    currentStrategy: currentStrategy?.name || '',
    editingStrategy: store.editingStrategyId,
    strategies: strategiesRecord,
    setCurrentStrategy: (strategyName: string) => {
      const strategy = strategies.find(s => s.name === strategyName)
      if (strategy) {
        store.setCurrentStrategy(strategy.id)
      }
    },
    setEditingStrategy: store.setEditingStrategy,
    updateStrategy: () => {}, // This would need to be implemented with Convex mutations
    // New methods for the updated system
    allStrategies: strategies,
    currentStrategyData: currentStrategy
  }
}

// Keep the old export for backward compatibility
export const useCurrentStrategyData = () => {
  const { currentStrategy } = useCurrentStrategy()
  return currentStrategy
}
