// chartilyze-backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_clerk_id", ["clerkId"]),

  journals: defineTable({
    userId: v.string(), // This will store the Clerk ID
    name: v.string(),
    description: v.optional(v.string()),
    strategy: v.optional(v.object({
      name: v.string(),
      rules: v.array(v.string())
    })),
    settings: v.optional(v.object({
      defaultRiskPercentage: v.number(),
      defaultPositionSize: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_user", ["userId"]),

  trades: defineTable({
    journalId: v.id("journals"),
    userId: v.string(), // This will store the Clerk ID
    symbol: v.string(),
    entry: v.number(),
    exit: v.optional(v.number()),
    stopLoss: v.number(),
    takeProfit: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    screenshots: v.array(v.string()),
    strategyAdherence: v.optional(v.boolean()),
    metadata: v.optional(v.object({
      timeframe: v.string(),
      setup: v.string(),
      tags: v.array(v.string())
    })),
    riskReward: v.object({
      planned: v.number(),
      actual: v.optional(v.number())
    }),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_journal", ["journalId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
});
