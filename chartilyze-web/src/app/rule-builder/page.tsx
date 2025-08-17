import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RuleBuilderClient from "./client";

export default async function RuleBuilderPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <RuleBuilderClient />;
}