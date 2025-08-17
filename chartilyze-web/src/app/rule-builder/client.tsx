"use client";

import { useState } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { StrategyFlowchart } from "@/components/rule-builder/strategy-flowchart";
import { useCurrentStrategy } from "@/app/hooks/use-strategy";
import type { StrategyComponent } from "@/types/strategy";

export default function RuleBuilderClient() {
  const { currentStrategy, isLoading } = useCurrentStrategy();
  const [selectedComponent, setSelectedComponent] = useState<StrategyComponent | null>(null);

  const handleComponentEdit = (component: StrategyComponent) => {
    setSelectedComponent(component);
    // TODO: Open component editing modal
    console.log("Editing component:", component);
  };

  const handleComponentAdd = () => {
    // TODO: Open add component modal
    console.log("Adding new component");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading strategy data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!currentStrategy) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">No Strategy Selected</h2>
            <p className="text-gray-400 mb-4">Please select a strategy from the sidebar to visualize its components.</p>
          </div>
        </main>
      </div>
    );
  }

  const strategyComponents = currentStrategy.components || [];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-1">Strategy Workflow</h1>
            <p className="text-gray-400">
              Visualizing <span className="text-blue-400 font-medium">{currentStrategy.name}</span> 
              {strategyComponents.length > 0 && (
                <span> • {strategyComponents.length} components</span>
              )}
            </p>
          </div>
          
          {/* Flowchart */}
          <div className="flex-1">
            {strategyComponents.length > 0 ? (
              <StrategyFlowchart 
                strategyComponents={strategyComponents}
                onComponentEdit={handleComponentEdit}
                onComponentAdd={handleComponentAdd}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white mb-2">No Components Found</h3>
                  <p className="text-gray-400 mb-4">
                    This strategy doesn't have any components yet.
                  </p>
                  <button
                    onClick={handleComponentAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Add First Component
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}