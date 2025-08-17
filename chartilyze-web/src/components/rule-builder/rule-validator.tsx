'use client'

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { VisualRule } from './types'

interface RuleValidatorProps {
  rule: VisualRule
}

export function RuleValidator({ rule }: RuleValidatorProps) {
  const validateRule = () => {
    const errors: string[] = []  // Add type annotation
    
    if (!rule.conditions.length) {
      errors.push('Rule must have at least one condition')
    }
    
    if (!rule.actions.length) {
      errors.push('Rule must have at least one action')
    }
    
    return errors
  }
  
  const errors = validateRule()
  const isValid = errors.length === 0
  
  return (
    <div className="mt-4 p-3 rounded-lg border border-gray-600">
      <div className="flex items-center gap-2 mb-2">
        {isValid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium text-gray-300">
          Rule Validation
        </span>
      </div>
      
      {errors.length > 0 && (
        <ul className="text-sm text-red-400 space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              {error}
            </li>
          ))}
        </ul>
      )}
      
      {isValid && (
        <p className="text-sm text-green-400">Rule is valid and ready to execute</p>
      )}
    </div>
  )
}