// convex/journals.ts
import { query } from "./_generated/server";

export const hasJournals = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return false;

    const journals = await db
      .query("journals")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return journals.length > 0;
  }
});
