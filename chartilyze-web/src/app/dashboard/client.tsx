'use client';

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function DashboardClient() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the dashboard</h1>
      <UserButton afterSignOutUrl="/sign-in" />
      <Button className="mt-4">Get Started</Button>
    </div>
  );
}
