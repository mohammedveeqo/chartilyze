// components/homepage/CTA.tsx
import { Chrome } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="py-32 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to level up your trading?
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of traders who&rsquove improved their consistency and psychology with Chartilyze.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Install Extension - Free
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-gray-600 hover:border-emerald-500 hover:bg-emerald-500/10"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
