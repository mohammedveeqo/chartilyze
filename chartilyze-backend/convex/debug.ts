// convex/debug.ts
import { query } from "./_generated/server";

export const whoAmI = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Debug - Auth check:", {
      hasIdentity: !!identity,
      identityDetails: identity,
      timestamp: new Date().toISOString()
    });
    return identity;
  },
});
