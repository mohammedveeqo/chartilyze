// src/components/dashboard/strategy-overview.tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Strategy {
  name: string;
  rules: string[];
}

export function StrategyOverview() {
  const strategy: Strategy = {
    name: 'Trend Following Breakout',
    rules: [
      'Trade in the direction of the trend',
      'Enter on breakouts of key levels',
      'Use 2:1 risk-reward ratio',
      'Maximum 2% risk per trade'
    ]
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">{strategy.name}</h2>
      <div className="space-y-2">
        {strategy.rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2">
            <Badge variant="outline">{index + 1}</Badge>
            <span className="text-gray-300">{rule}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
