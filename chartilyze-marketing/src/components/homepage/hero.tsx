// src/components/homepage/Hero.tsx
import { Brain } from 'lucide-react';

// Create DashboardPreview as a separate component
const DashboardPreview = () => {
  return (
    <div className="relative animate-fade-in-up delay-300">
      <div className="mx-auto max-w-5xl">
        <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between bg-gray-800/50 px-6 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Chartilyze Dashboard</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Connected to TradingView
              </span>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="text-emerald-400 text-2xl font-bold">73.2%</div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="text-blue-400 text-2xl font-bold">2.3x</div>
                <div className="text-gray-400 text-sm">Avg R:R</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="text-purple-400 text-2xl font-bold">142</div>
                <div className="text-gray-400 text-sm">Trades Logged</div>
              </div>
            </div>

            <div className="bg-gray-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Recent Trade: EURUSD</h4>
                <span className="text-emerald-400 text-sm">+2.3R</span>
              </div>
              <div className="text-gray-400 text-sm">
                AI Analysis: &ldquo;Great patience waiting for the breakout confirmation. 
                Risk management was perfect - you followed your 1% rule.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-3000 via-gray-900 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-500/20 to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/20 to-transparent blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370d_1px,transparent_1px),linear-gradient(to_bottom,#1f29370d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-8">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">New: TradingView Browser Extension is Live</span>
          </div>

          <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight">
            Your AI-powered<br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              trading journal
            </span>
          </h1>

          <p className="mb-12 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Stop filling endless spreadsheets. Chartilyze automatically captures your TradingView trades, 
            analyzes your psychology, and turns your trading data into meaningful insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 mr-2" />
              Install Extension
            </button>
            <button className="border border-gray-600 hover:border-emerald-500 hover:bg-emerald-500/10 px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-lg text-white">
              View Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <DashboardPreview />
      </div>
    </section>
  );
};
