// src/components/onboarding/onboarding-wizard.tsx
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const steps = [
  'Welcome',
  'Create Strategy',
  'Define Rules',
  'Finalize'
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [strategy, setStrategy] = useState({
    name: '',
    description: '',
    rules: ['']
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit strategy and complete onboarding
      console.log('Strategy created:', strategy)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Chartilyze</h2>
            <p className="text-gray-400 mb-6">Let's set up your trading strategy to get started with journaling.</p>
            <Button onClick={handleNext}>Get Started</Button>
          </div>
        )
      case 1:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Create Your Strategy</h2>
            <Input
              placeholder="Strategy Name"
              value={strategy.name}
              onChange={(e) => setStrategy({...strategy, name: e.target.value})}
              className="mb-4"
            />
            <Textarea
              placeholder="Strategy Description"
              value={strategy.description}
              onChange={(e) => setStrategy({...strategy, description: e.target.value})}
              className="mb-4"
            />
            <Button onClick={handleNext}>Next</Button>
          </div>
        )
      case 2:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Define Your Rules</h2>
            {strategy.rules.map((rule, index) => (
              <Input
                key={index}
                placeholder={`Rule ${index + 1}`}
                value={rule}
                onChange={(e) => {
                  const newRules = [...strategy.rules]
                  newRules[index] = e.target.value
                  setStrategy({...strategy, rules: newRules})
                }}
                className="mb-2"
              />
            ))}
            <Button 
              onClick={() => setStrategy({...strategy, rules: [...strategy.rules, '']})}
              variant="outline"
              className="mb-4"
            >
              Add Rule
            </Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        )
      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Strategy Created</h2>
            <p className="text-gray-400 mb-6">Great job! You're all set to start journaling your trades.</p>
            <Button onClick={handleNext}>Start Journaling</Button>
          </div>
        )
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="mb-6">
        {steps.map((step, index) => (
          <div key={index} className={`inline-block w-1/4 text-center ${
            index <= currentStep ? 'text-blue-500' : 'text-gray-500'
          }`}>
            {step}
          </div>
        ))}
      </div>
      {renderStep()}
    </Card>
  )
}
