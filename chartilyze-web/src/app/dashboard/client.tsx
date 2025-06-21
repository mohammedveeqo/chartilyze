"use client";

import { useEffect } from "react";
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
import { QuickActions } from "@/components/dashboard/quick-actions";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { DebugAuth } from "@/components/debug-auth";

export default function DashboardClient() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.storeUser);
  const journalsData = useQuery(api.journals.getUserJournals);

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

  // Show loading state while fetching journals
  if (journalsData === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading journals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {!journalsData.hasJournals && <OnboardingWizard />}

      {journalsData.hasJournals && (
            <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1"><QuickActions /></div>
          <div className="lg:col-span-3"><StatsCards /></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><PerformanceChart /></div>
          <div className="xl:col-span-1"><PsychologyInsights /></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2"><RecentTrades /></div>
          <div className="xl:col-span-1"><TradingCalendar /></div>
        </div>
      </div>
    </div>
      )}

    </div>
  );
}
