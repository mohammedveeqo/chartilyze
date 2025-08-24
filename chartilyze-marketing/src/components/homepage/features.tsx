// app/components/homepage/Features.tsx
import { 
  CheckCircle, 
  X, 
  Brain, 
  Camera, 
  TrendingUp, 
  Users, 
  BarChart3
} from 'lucide-react';
import { mainFeatures, comparisonFeatures } from '@/constants/features';

export default function Features() {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-800/30 to-slate-900/40 blur-3xl animate-pulse" style={{animationDuration: '5s'}} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-900/20 to-slate-950/30 blur-2xl animate-bounce" style={{animationDuration: '6s'}} />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-950/15 via-transparent to-blue-950/15 blur-xl" style={{animation: 'float 7s ease-in-out infinite'}} />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              What makes Chartilyze
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> unique?</span>
            </h2>
            
            <div className="space-y-6">
              {mainFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-6 rounded-xl transition-all duration-300 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-b from-gray-900/50 to-gray-900/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 text-center">Chartilyze vs Others</h3>
              <div className="space-y-4">
                {comparisonFeatures.map((row, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
                    <span className="text-gray-300 text-sm flex-1">{row.feature}</span>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        {row.tradilyze ? (
                          <CheckCircle className="w-5 h-5 text-blue-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500 mx-auto" />
                        )}
                      </div>
                      <div className="text-center">
                        {row.others ? (
                          <CheckCircle className="w-5 h-5 text-blue-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500 mx-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-6 px-4">
                <span>Chartilyze</span>
                <span>Other Journals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extension Features Grid */}
      <div className="mt-32 mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> trade better</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our browser extension seamlessly integrates with TradingView to provide you with powerful trading insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Automatic Trade Capture",
              description: "Every trade is automatically logged with chart screenshots and your annotations.",
              icon: <Camera className="w-6 h-6" />
            },
            {
              title: "AI Psychology Analysis",
              description: "Get insights into your trading mindset and emotional patterns.",
              icon: <Brain className="w-6 h-6" />
            },
            {
              title: "Performance Analytics",
              description: "Track your progress with detailed statistics and trend analysis.",
              icon: <TrendingUp className="w-6 h-6" />
            },
            {
              title: "Community Insights",
              description: "Learn from other traders and share your experiences anonymously.",
              icon: <Users className="w-6 h-6" />
            },
            {
              title: "Smart Alerts",
              description: "Get notified when you're deviating from your trading plan.",
              icon: <CheckCircle className="w-6 h-6" />
            },
            {
              title: "Real-time Analysis",
              description: "Get instant feedback on your trades as you make them.",
              icon: <BarChart3 className="w-6 h-6" />
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-800/20 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
