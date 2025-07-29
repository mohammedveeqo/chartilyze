'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, TrendingUp, Target, Sparkles } from 'lucide-react'

interface EmptyJournalStateProps {
  onCreateStrategy: () => void;
}

export function EmptyJournalState({ onCreateStrategy }: EmptyJournalStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-4xl mx-auto p-8 text-center bg-gray-900 border-gray-800">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <BookOpen className="w-20 h-20 text-blue-500" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to Chartilyze!
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            Your AI-powered trading journal and strategy optimizer
          </p>
          <p className="text-gray-400 mb-8">
            Create your first trading strategy and let our AI help you structure, analyze, and optimize it for better results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <Target className="w-10 h-10 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold text-white mb-2">AI Strategy Analysis</h3>
            <p className="text-sm text-gray-400">
              Describe your strategy in plain text and watch our AI break it down into structured components with tags, indicators, and optimization suggestions.
            </p>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <TrendingUp className="w-10 h-10 mx-auto text-blue-500 mb-3" />
            <h3 className="font-semibold text-white mb-2">Performance Tracking</h3>
            <p className="text-sm text-gray-400">
              Monitor your trades, track strategy adherence, and get insights into your trading psychology and performance patterns.
            </p>
          </div>
          <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <BookOpen className="w-10 h-10 mx-auto text-purple-500 mb-3" />
            <h3 className="font-semibold text-white mb-2">Structured Journaling</h3>
            <p className="text-sm text-gray-400">
              Keep detailed records of your trades with screenshots, notes, and metadata to build a comprehensive trading history.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={onCreateStrategy}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your First Strategy
          </Button>
          <p className="text-sm text-gray-500">
            Takes less than 5 minutes • AI-powered analysis included
          </p>
        </div>
      </Card>
    </div>
  );
}