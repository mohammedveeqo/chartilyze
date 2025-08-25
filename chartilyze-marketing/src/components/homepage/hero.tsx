"use client";

import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";
import { useEffect, useRef } from "react";

const Hero = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Delay particle creation to sync with other animations
    setTimeout(() => {
      // Create floating particles with CSS animations
      const createParticles = () => {
        if (!particlesRef.current) return;
        
        for (let i = 0; i < 25; i++) {
          const particle = document.createElement('div');
          const size = Math.random() * 6 + 3;
          particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(59, 130, 246, 0.6);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            filter: blur(1px);
            opacity: 0;
            animation-fill-mode: forwards;
          `;
          particlesRef.current.appendChild(particle);
        }
      };

      // Create large animated orbs
      const createOrbs = () => {
        if (!orbsRef.current) return;
        
        const colors = [
          'rgba(59, 130, 246, 0.3)',
          'rgba(147, 51, 234, 0.3)',
          'rgba(6, 182, 212, 0.3)',
          'rgba(168, 85, 247, 0.3)'
        ];
        
        for (let i = 0; i < 4; i++) {
          const orb = document.createElement('div');
          const size = Math.random() * 150 + 100;
          orb.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${colors[i]} 0%, transparent 70%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: orbFloat ${6 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
            filter: blur(20px);
            opacity: 0;
            animation-fill-mode: forwards;
          `;
          orbsRef.current.appendChild(orb);
        }
      };

      createParticles();
      createOrbs();
    }, 300); // Delay to sync with content loading
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated background layers - start hidden and fade in */}
      <div className="absolute inset-0 opacity-0 animate-background-delayed">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900 to-purple-900/40 animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-900/30 via-transparent to-blue-900/30" style={{animation: 'gradientShift 8s ease-in-out infinite'}} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 via-purple-800/25 to-cyan-800/20" style={{animation: 'gradientWave 12s ease-in-out infinite'}} />
      </div>

      {/* Large animated orbs - delayed */}
      <div ref={orbsRef} className="absolute inset-0 z-0" />

      {/* Animated floating particles - delayed */}
      <div ref={particlesRef} className="absolute inset-0 z-0" />

      {/* Morphing gradient overlay - delayed */}
      <div className="absolute inset-0 z-0 bg-gradient-radial from-blue-500/30 via-purple-500/10 to-transparent opacity-0 animate-background-delayed" style={{animation: 'morphGradient 6s ease-in-out infinite', animationDelay: '0.4s'}} />
    
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
      
        {/* Dashboard Preview - delayed to load after content */}
        <div className="relative w-full max-w-5xl mx-auto animate-slide-up">
          <DashboardPreview />
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px) scale(1.1);
            opacity: 1;
          }
          50% { 
            transform: translateY(-10px) translateX(-15px) scale(0.9);
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-30px) translateX(5px) scale(1.05);
            opacity: 0.9;
          }
        }
        
        @keyframes orbFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
            opacity: 0.4;
          }
          33% { 
            transform: translateY(-40px) translateX(30px) scale(1.2) rotate(120deg);
            opacity: 0.7;
          }
          66% { 
            transform: translateY(20px) translateX(-25px) scale(0.8) rotate(240deg);
            opacity: 0.5;
          }
        }
        
        @keyframes gradientShift {
          0%, 100% { 
            transform: translateX(0px) translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translateX(20px) translateY(-15px) scale(1.1);
            opacity: 0.5;
          }
        }
        
        @keyframes gradientWave {
          0%, 100% { 
            transform: translateX(0px) translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          33% { 
            transform: translateX(-15px) translateY(10px) rotate(2deg);
            opacity: 0.4;
          }
          66% { 
            transform: translateX(10px) translateY(-5px) rotate(-2deg);
            opacity: 0.3;
          }
        }
        
        @keyframes morphGradient {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.3) rotate(180deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
