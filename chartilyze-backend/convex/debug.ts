// convex/debug.ts
import { query } from "./_generated/server";

export const whoAmI = query(async ({ auth }) => {
  const identity = await auth.getUserIdentity();
  console.log("Convex sees identity:", identity);
  return identity;
});
