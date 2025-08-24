"use client";

import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Subtle animated gradient backgrounds */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-900 to-purple-900/30" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-900/20 via-transparent to-blue-900/20 animate-pulse" style={{animationDuration: '8s'}} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/10 via-purple-800/15 to-cyan-800/10" style={{animation: 'subtleFloat 12s ease-in-out infinite'}} />
      </div>

      {/* Gentle overlay gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent" style={{animation: 'gentleGlow 10s ease-in-out infinite alternate'}} />
    
      {/* Hero Content */}
      <div className="relative z-10 w-full px-6 text-center">
        <div className="mx-auto max-w-6xl animate-fade-in">
          <div className="transition-all duration-1000">
            <div className="inline-flex items-center gap-2 mb-6">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-blue-400 font-semibold text-lg">Chartilyze</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 bg-clip-text text-transparent">
                Master Your
              </span>
              <br />
              <span className="text-white">Trading Journey</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate trading journal platform that helps you track, analyze, and improve your trading performance. 
              Turn every trade into a learning opportunity with powerful analytics and insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      
        {/* Dashboard Preview */}
        <div className="relative w-full max-w-5xl mx-auto animate-slide-up">
          <DashboardPreview />
        </div>
      </div>
      
      {/* Subtle custom animations */}
      <style jsx>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-10px) translateX(5px); opacity: 0.4; }
          66% { transform: translateY(5px) translateX(-3px); opacity: 0.35; }
        }
        
        @keyframes gentleGlow {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.2; transform: scale(1.05); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
