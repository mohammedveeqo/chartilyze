// components/homepage/Pricing.tsx
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["10 trades per month", "Basic AI analysis", "Chart screenshots", "Personal journal"],
    popular: false,
    description: "Perfect for beginners"
  },
  {
    name: "Pro Trader",
    price: "$19",
    period: "per month",
    features: ["Unlimited trades", "Advanced AI insights", "Psychology tracking", "Rule adherence monitoring", "Performance analytics", "Priority support"],
    popular: true,
    description: "Most popular for serious traders"
  },
  {
    name: "Trading Team",
    price: "$49",
    period: "per month",
    features: ["Everything in Pro", "Team collaboration", "Shared strategies", "Group analytics", "Custom integrations", "Dedicated support"],
    popular: false,
    description: "For trading groups & firms"
  }
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple,
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> transparent </span>
            pricing
          </h2>
          <p className="text-xl text-gray-400">Start free, upgrade when you&rsquore ready to level up your trading.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular 
                  ? 'bg-gradient-to-b from-emerald-900/30 to-emerald-900/10 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20' 
                  : 'bg-gradient-to-b from-gray-900/50 to-gray-900/20 border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-xl hover:shadow-emerald-500/25'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {index === 0 ? 'Start Free' : 'Start Trial'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
