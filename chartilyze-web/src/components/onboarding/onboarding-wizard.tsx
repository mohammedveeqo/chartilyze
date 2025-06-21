// components/onboarding/onboarding-wizard.tsx
"use client";

import { useState } from 'react'
import { useUser } from "@clerk/nextjs";
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import { api } from "../../../../chartilyze-backend/convex/_generated/api";

const steps = [
  'Welcome',
  'Create Journal',
  'Define Strategy',
  'Set Rules',
  'Review'
]


interface FormData {
  journal: {
    name: string;
    description: string;
  };
  strategy: {
    name: string;
    rules: string[];
  };
  settings: {
    defaultRiskPercentage: number;
    defaultPositionSize: number;
  };
}


export function OnboardingWizard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const createJournal = useMutation(api.journals.create);
  const journalsQuery = useQuery(api.journals.getUserJournals);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    journal: {
      name: '',
      description: ''
    },
    strategy: {
      name: '',
      rules: ['']
    },
    settings: {
      defaultRiskPercentage: 1,
      defaultPositionSize: 100
    }
  });

  const handleNext = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to continue');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    try {
      setIsSubmitting(true);
      const validRules = formData.strategy.rules.filter(rule => rule.trim() !== '');
      
      const journalPayload = {
        name: formData.journal.name,
        description: formData.journal.description,
        ...(formData.strategy.name && validRules.length > 0 && {
          strategy: {
            name: formData.strategy.name,
            rules: validRules
          }
        }),
        settings: {
          defaultRiskPercentage: formData.settings.defaultRiskPercentage,
          defaultPositionSize: formData.settings.defaultPositionSize
        }
      };

      await createJournal(journalPayload);
      toast.success('Journal created successfully!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error creating journal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create journal');
    } finally {
      setIsSubmitting(false);
    }
  };

// components/onboarding/onboarding-wizard.tsx
const handleSkip = async () => {
  console.log("Skip clicked, user:", user); // Add this log
  try {
    setIsSubmitting(true);
    console.log("Creating default journal..."); // Add this log
    const result = await createJournal({
      name: "My Trading Journal",
      description: "Default trading journal",
      settings: {
        defaultRiskPercentage: 1,
        defaultPositionSize: 100
      }
    });
    console.log("Journal created:", result); // Add this log
    toast.success('Basic journal created!');
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error creating journal: yeah', error);
    toast.error('Failed to create journal yeah');
  } finally {
    setIsSubmitting(false);
  }
};


  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show sign in message if not authenticated
  if (!isSignedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="text-white">Please sign in to continue</div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Chartilyze</h2>
            <p className="text-gray-400 mb-6">
              Let's set up your trading journal and strategy to help you become a more disciplined trader.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Skip for now'}
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Create Your Journal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Journal Name
                </label>
                <Input
                  placeholder="e.g., My Forex Trading Journal"
                  value={formData.journal.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    journal: { ...formData.journal, name: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <Textarea
                  placeholder="Brief description of your trading journal..."
                  value={formData.journal.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    journal: { ...formData.journal, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!formData.journal.name || isSubmitting}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Define Your Trading Strategy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Strategy Name
                </label>
                <Input
                  placeholder="e.g., Price Action Breakout"
                  value={formData.strategy.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    strategy: { ...formData.strategy, name: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Default Risk Per Trade (%)
                </label>
                <Input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={formData.settings.defaultRiskPercentage}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { 
                      ...formData.settings, 
                      defaultRiskPercentage: parseFloat(e.target.value) 
                    }
                  })}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!formData.strategy.name || isSubmitting}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Define Your Trading Rules</h2>
            <p className="text-gray-400 mb-4">
              Add the specific rules that define your trading strategy.
            </p>
            <div className="space-y-3">
              {formData.strategy.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Rule ${index + 1}, e.g., "Only trade with trend"`}
                    value={rule}
                    onChange={(e) => {
                      const newRules = [...formData.strategy.rules]
                      newRules[index] = e.target.value
                      setFormData({
                        ...formData,
                        strategy: { ...formData.strategy, rules: newRules }
                      })
                    }}
                  />
                  {index > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const newRules = formData.strategy.rules.filter((_, i) => i !== index)
                        setFormData({
                          ...formData,
                          strategy: { ...formData.strategy, rules: newRules }
                        })
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setFormData({
                ...formData,
                strategy: {
                  ...formData.strategy,
                  rules: [...formData.strategy.rules, '']
                }
              })}
              variant="outline"
              className="mt-4"
              disabled={isSubmitting}
            >
              Add Rule
            </Button>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!formData.strategy.rules[0] || isSubmitting}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Review Your Setup</h2>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Journal Details</h3>
                <p className="text-gray-400">Name: {formData.journal.name}</p>
                <p className="text-gray-400">Description: {formData.journal.description}</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-white mb-2">Strategy Details</h3>
                <p className="text-gray-400">Name: {formData.strategy.name}</p>
                <p className="text-gray-400">Risk per Trade: {formData.settings.defaultRiskPercentage}%</p>
                <div className="mt-2">
                  <p className="text-white font-semibold mb-1">Rules:</p>
                  <ul className="list-disc list-inside text-gray-400">
                    {formData.strategy.rules
                      .filter(rule => rule.trim() !== '')
                      .map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full bg-gray-900">
        <div className="mb-6 flex gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        {renderStep()}
      </Card>
    </div>
  );
}
