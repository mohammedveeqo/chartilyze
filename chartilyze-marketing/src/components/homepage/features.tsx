// app/components/homepage/Features.tsx
'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
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
  const sectionRef = useRef<HTMLElement>(null);
  const mainFeaturesRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            
            // Animate main features with stagger
            if (mainFeaturesRef.current) {
              const mainFeatureItems = mainFeaturesRef.current.querySelectorAll('.main-feature-item');
              animate(mainFeatureItems, {
                translateY: [50, 0],
                opacity: [0, 1],
                duration: 800,
                delay: stagger(150),
                easing: 'easeOutCubic'
              });
            }
            
            // Animate feature cards with stagger
            if (featureCardsRef.current) {
              const featureCards = featureCardsRef.current.querySelectorAll('.feature-card');
              animate(featureCards, {
                translateY: [60, 0],
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 900,
                delay: stagger(120, {start: 400}),
                easing: 'easeOutExpo'
              });
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-32 relative overflow-hidden">
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
            
            <div ref={mainFeaturesRef} className="space-y-6">
              {mainFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="main-feature-item flex items-start gap-4 p-6 rounded-xl transition-all duration-300 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-blue-500/10 opacity-0"
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
            <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Chartilyze
                </span>
                {' vs '}
                <span className="text-gray-400">Traditional Methods</span>
              </h3>
              
              <div className="space-y-4">
                {comparisonFeatures.map((feature, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 py-3 border-b border-gray-700/30 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature.feature}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {feature.others ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-500">
                        {feature.others ? 'Available' : 'Not available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"> master trading</span>
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps you identify patterns, improve discipline, and build consistent trading habits.
            </p>
          </div>

          <div ref={featureCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="feature-card p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-800/20 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 opacity-0"
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
      </div>
    </section>
  );
}
