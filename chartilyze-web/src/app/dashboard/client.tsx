"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../chartilyze-backend/convex/_generated/api";



import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { TradingCalendar } from "@/components/dashboard/trading-calendar";
import { PsychologyInsights } from "@/components/dashboard/psychology-insights";
import { QuickActions } from "@/components/dashboard/quick-actions";
import TestComponent from "./test";
import { useQuery } from "convex/react";


import "@/app/globals copy.css";

export default function DashboardClient() {
  const { user, isSignedIn } = useUser();
  const storeUser = useMutation(api.users.storeUser);
  const identity = useQuery(api.debug.whoAmI); // ✅ Safe hook usage

  useEffect(() => {
    if (isSignedIn && user?.id && user?.emailAddresses[0]?.emailAddress) {
      storeUser({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName ?? "Unknown",
      }).catch((err) => {
        console.error("Failed to store user in Convex:", err);
      });
    }
  }, [isSignedIn, user, storeUser]);

  useEffect(() => {
    console.log("Convex sees identity:", identity);
  }, [identity]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div>
        <h1>Dashboard</h1>
        <TestComponent />
      </div>
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
  );
}