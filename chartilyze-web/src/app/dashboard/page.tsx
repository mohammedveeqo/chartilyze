import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/app/dashboard/client"; // 👈 this must exist

export default async function DashboardPage() {
  const { userId } = await auth(); // ✅ add `await`

  if (!userId) redirect("/sign-in");

  return <DashboardClient />;
}
