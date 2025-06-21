// convex/journals.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";

// Types
type Journal = Doc<"journals">;

// Individual exports instead of default export
export const getUserJournals = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasJournals: false, journals: [] };
    }

    const journals = await ctx.db
      .query("journals")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      hasJournals: journals.length > 0,
      journals
    };
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const userId = identity.subject;
    const limit = args.limit ?? 10;

    const journals = await ctx.db
      .query("journals")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(limit);

    const total = await ctx.db
      .query("journals")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect()
      .then(all => all.length);

    return {
      journals,
      total,
      hasMore: journals.length === limit
    };
  }
});

export const getById = query({
  args: { id: v.id("journals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const journal = await ctx.db.get(args.id);
    if (!journal || journal.userId !== identity.subject) {
      throw new ConvexError("Journal not found or access denied");
    }

    return journal;
  }
});

export const update = mutation({
  args: {
    id: v.id("journals"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    strategy: v.optional(v.object({
      name: v.string(),
      rules: v.array(v.string())
    })),
    settings: v.optional(v.object({
      defaultRiskPercentage: v.number(),
      defaultPositionSize: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const journal = await ctx.db.get(args.id);
    if (!journal || journal.userId !== identity.subject) {
      throw new ConvexError("Journal not found or access denied");
    }

    const updates: Partial<Journal> = {
      updatedAt: Date.now()
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.strategy !== undefined) updates.strategy = args.strategy;
    if (args.settings !== undefined) updates.settings = args.settings;

    return await ctx.db.patch(args.id, updates);
  }
});

export const deleteJournal = mutation({
  args: { id: v.id("journals") },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new ConvexError("Not authenticated");

      const journal = await ctx.db.get(args.id);
      if (!journal || journal.userId !== identity.subject) {
        throw new ConvexError("Journal not found or access denied");
      }

      const trades = await ctx.db
        .query("trades")
        .filter(q => q.eq(q.field("journalId"), args.id))
        .collect();

      for (const trade of trades) {
        await ctx.db.delete(trade._id);
      }

      await ctx.db.delete(args.id);
      return { success: true };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError("Failed to delete journal");
    }
  }
});

//

// convex/journals.ts
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    strategy: v.optional(
      v.object({
        name: v.string(),
        rules: v.array(v.string())
      })
    ),
    settings: v.optional(
      v.object({
        defaultRiskPercentage: v.number(),
        defaultPositionSize: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    // Add detailed logging
    console.log("Starting journal creation...");
    
    const identity = await ctx.auth.getUserIdentity();
    console.log("Auth identity in create:", identity); // Log the identity

    if (!identity) {
      console.log("No identity found in create mutation");
      throw new ConvexError("You must be logged in to create a journal");
    }

    try {
      const journal = await ctx.db.insert("journals", {
        userId: identity.subject,
        name: args.name,
        description: args.description,
        strategy: args.strategy,
        settings: args.settings ?? {
          defaultRiskPercentage: 1,
          defaultPositionSize: 100
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log("Journal created successfully:", journal);
      return journal;
    } catch (error) {
      console.error("Error creating journal:", error);
      throw new ConvexError("Failed to create journal");
    }
  }
});






