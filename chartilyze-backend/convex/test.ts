// chartilyze-backend/convex/test.ts
import { query } from "./_generated/server";

export const testAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Auth Identity:", identity); // This will show in your Convex logs
    return identity;
  },
});