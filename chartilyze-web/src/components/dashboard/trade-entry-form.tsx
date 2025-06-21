// src/components/dashboard/trade-entry-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

interface TradeFormData {
  symbol: string
  type: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  position: number
  risk: number
  strategy: string
  technicalAnalysis: string
  psychologicalState: string
  rulesFollowed: string[]
  lessonsLearned: string
}

export function TradeEntryForm() {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    type: 'LONG',
    entryPrice: 0,
    exitPrice: 0,
    position: 0,
    risk: 0,
    strategy: '',
    technicalAnalysis: '',
    psychologicalState: '',
    rulesFollowed: [],
    lessonsLearned: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Add New Trade</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Symbol
            </label>
            <Input
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              placeholder="e.g. EUR/USD"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData, 
                type: e.target.value as 'LONG' | 'SHORT'
              })}
              className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
            >
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Entry Price
            </label>
            <Input
              type="number"
              value={formData.entryPrice}
              onChange={(e) => setFormData({
                ...formData, 
                entryPrice: parseFloat(e.target.value)
              })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Exit Price
            </label>
            <Input
              type="number"
              value={formData.exitPrice}
              onChange={(e) => setFormData({
                ...formData, 
                exitPrice: parseFloat(e.target.value)
              })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Technical Analysis
          </label>
          <Textarea
            value={formData.technicalAnalysis}
            onChange={(e) => setFormData({
              ...formData, 
              technicalAnalysis: e.target.value
            })}
            placeholder="Describe your technical analysis..."
            className="bg-gray-800 border-gray-700"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Psychological State
          </label>
          <Textarea
            value={formData.psychologicalState}
            onChange={(e) => setFormData({
              ...formData, 
              psychologicalState: e.target.value
            })}
            placeholder="How were you feeling during this trade?"
            className="bg-gray-800 border-gray-700"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Lessons Learned
          </label>
          <Textarea
            value={formData.lessonsLearned}
            onChange={(e) => setFormData({
              ...formData, 
              lessonsLearned: e.target.value
            })}
            placeholder="What did you learn from this trade?"
            className="bg-gray-800 border-gray-700"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
            Save Trade
          </Button>
        </div>
      </form>
    </Card>
  )
}
