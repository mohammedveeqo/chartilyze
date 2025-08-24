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
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/35 via-slate-800/25 to-slate-900/35 blur-3xl animate-pulse" style={{animationDuration: '6s'}} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-slate-900/15 to-blue-950/20 blur-2xl animate-bounce" style={{animationDuration: '7s'}} />
        <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/30 via-transparent to-slate-900/30 blur-xl" style={{animation: 'float 8s ease-in-out infinite'}} />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple,
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent"> transparent </span>
            pricing
          </h2>
          <p className="text-xl text-slate-400">Start free, upgrade when you're ready to level up your trading.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-sm ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-950/60 via-blue-900/40 to-slate-950/80 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/25 hover:shadow-blue-400/30' 
                  : 'bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-950/80 border border-slate-700/50 hover:border-slate-600/70 hover:shadow-xl hover:shadow-slate-500/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold mb-3 text-white">{plan.name}</CardTitle>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${
                    plan.popular ? 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent' : 'text-white'
                  }`}>{plan.price}</span>
                  <span className="text-slate-400 ml-2 text-lg">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                        plan.popular ? 'text-blue-400' : 'text-slate-400'
                      }`} />
                      <span className="text-slate-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-blue-500/30 border-0'
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600/50 hover:border-slate-500/70'
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
