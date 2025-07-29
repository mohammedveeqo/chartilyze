"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../chartilyze-backend/convex/_generated/api";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { TradingCalendar } from "@/components/dashboard/trading-calendar";
import { PsychologyInsights } from "@/components/dashboard/psychology-insights";
import { Sidebar } from "@/components/navigation/sidebar";
import { StrategyModal } from "@/components/navigation/strategy-selector/strategy-modal";
import { EmptyJournalState } from "@/components/dashboard/empty-journal-state";
import { DebugAuth } from "@/components/debug-auth";
import TradeDetails from "@/components/dashboard/trade-details";

export default function DashboardClient() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.storeUser);
  const journalsData = useQuery(api.journals.getUserJournals);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Store user in Convex when component mounts
  useEffect(() => {
    const initializeUser = async () => {
      if (!user?.id) return;

      try {
        await storeUser({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? "",
          name: user.fullName ?? "Unknown",
        });
      } catch (error) {
        console.error("Failed to store user in Convex:", error);
        toast.error("Failed to initialize user data");
      }
    };

    initializeUser();
  }, [user, storeUser]);

  // Show welcome modal for new users instead of blocking onboarding
  useEffect(() => {
    if (journalsData && !journalsData.hasJournals) {
      setShowWelcomeModal(true);
    }
  }, [journalsData]);

  // Show loading state while fetching journals
  if (journalsData === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading journals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Always show dashboard */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Show empty state for new users */}
        {!journalsData.hasJournals ? (
          <EmptyJournalState onCreateStrategy={() => setShowWelcomeModal(true)} />
        ) : (
          <>
            <StatsCards />
            <TradeDetails />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PerformanceChart />
              </div>
              <div className="xl:col-span-1">
                <PsychologyInsights />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <RecentTrades />
              </div>
              <div className="xl:col-span-1">
                <TradingCalendar />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Welcome Modal for new users */}
      {showWelcomeModal && (
        <StrategyModal 
          isCreatingNew={true} 
          onClose={() => setShowWelcomeModal(false)}
          isWelcomeFlow={true}
        />
      )}
    </div>
  );
}
