import { query } from "./_generated/server";

export const whoami = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return "Not authenticated";
    }
    return `Authenticated as ${identity.subject}`;
  },
});
