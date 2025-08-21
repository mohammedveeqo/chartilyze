import { create } from 'zustand'
import { useQuery } from 'convex/react'
import { useEffect } from 'react' // Add this import
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
  
  // Early return for loading state
  if (!journalsData) {
    return {
      strategies: [],
      isLoading: true,
      hasStrategies: false
    }
  }

  const strategies: StrategyFromJournal[] = (journalsData.journals || [])
    .filter(journal => journal?.strategy) // Add null check
    .map(journal => ({
      id: journal._id,
      name: journal.strategy!.name || 'Untitled Strategy',
      description: journal.description,
      rules: journal.strategy!.rules || [],
      components: journal.strategy!.components || [],
      globalTags: journal.strategy!.globalTags || [],
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
// Hook to get current strategy data
export const useCurrentStrategy = () => {
  const { currentStrategyId, setCurrentStrategy } = useStrategyStore()
  const { strategies, isLoading } = useStrategies()
  
  // Move auto-selection to useEffect
  useEffect(() => {
    if (!currentStrategyId && strategies.length > 0 && !isLoading) {
      setCurrentStrategy(strategies[0].id)
    }
  }, [currentStrategyId, strategies, isLoading, setCurrentStrategy])
  
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
  const { strategies, isLoading } = useStrategies()
  const { currentStrategy } = useCurrentStrategy()
  
  // Handle loading state
  if (isLoading) {
    return {
      currentStrategy: '',
      editingStrategy: null,
      strategies: {},
      setCurrentStrategy: () => {},
      setEditingStrategy: () => {},
      updateStrategy: () => {},
      allStrategies: [],
      currentStrategyData: null,
      isLoading: true
    }
  }

  // Convert to old format for backward compatibility
  const strategiesRecord = strategies.reduce((acc, strategy) => {
    acc[strategy.name] = {
      pairs: [],
      rules: strategy.rules,
      color: 'blue',
      trades: []
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
    updateStrategy: () => {},
    allStrategies: strategies,
    currentStrategyData: currentStrategy,
    isLoading: false
  }
}

// Keep the old export for backward compatibility
export const useCurrentStrategyData = () => {
  const { currentStrategy } = useCurrentStrategy()
  return currentStrategy
}
