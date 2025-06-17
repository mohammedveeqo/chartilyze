import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/app/dashboard/client"; 
import '@/app/globals copy.css'; // Ensure global styles are imported

export default async function DashboardPage() {
  const { userId } = await auth(); // ✅ add `await`

  if (!userId) redirect("/sign-in");

  return <DashboardClient />;
}
