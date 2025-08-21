// chartilyze-backend/convex/users.ts
import { mutation,query } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists first
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) return existingUser._id;

    // Create new user
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});


// Query for getting user info
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Get User - Auth Check:", {
      hasIdentity: !!identity,
      identity,
      requestedClerkId: args.clerkId
    });

    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});

// Add this new function that the extension is looking for
export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), args.userId))
      .first();
  },
});

    