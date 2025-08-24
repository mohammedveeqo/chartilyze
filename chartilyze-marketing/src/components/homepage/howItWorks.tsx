// components/homepage/HowItWorks.tsx
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { howItWorksSteps, processSteps } from '@/constants/features';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-24">
          <span className="text-sm font-semibold text-blue-500 tracking-wider uppercase mb-4 block">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Start improving your trading in
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> minutes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From analysis to insights, we've automated everything so you can focus on what matters - trading.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {processSteps.map((step, index) => (
            <div 
              key={index} 
              className="relative p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-800/20 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{step.title}</h3>
              </div>
              
              <p className="text-gray-400 mb-8 text-lg">
                {step.description}
              </p>
              
              <ul className="space-y-3">
                {step.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="relative mt-32 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-800/20 border border-gray-700/50 p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {howItWorksSteps.map((item, index) => (
              <div key={index} className="flex items-center gap-4 relative">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </div>
                {index < 4 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
