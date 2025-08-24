// components/homepage/CTA.tsx
import { Chrome } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/25 via-slate-900/20 to-blue-950/25 blur-3xl animate-pulse" style={{animationDuration: '7s'}} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/25 via-blue-950/15 to-slate-950/25 blur-2xl animate-bounce" style={{animationDuration: '8s'}} />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-950/20 via-transparent to-blue-950/20 blur-xl" style={{animation: 'float 9s ease-in-out infinite'}} />
      </div>
      
      <div className="mx-auto max-w-4xl px-6 text-center relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to level up your trading?
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of traders who've improved their consistency and psychology with Chartilyze.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Install Extension - Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
