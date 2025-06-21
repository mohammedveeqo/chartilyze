import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    journalId: v.id("journals"),
    symbol: v.string(),
    entry: v.number(),
    stopLoss: v.number(),
    takeProfit: v.number(),
    notes: v.optional(v.string()),
    screenshots: v.array(v.string()),
    metadata: v.optional(v.object({
      timeframe: v.string(),
      setup: v.string(),
      tags: v.array(v.string())
    }))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    // Verify journal exists and belongs to user
    const journal = await ctx.db
      .query("journals")
      .filter(q => q.eq(q.field("_id"), args.journalId))
      .filter(q => q.eq(q.field("userId"), userId))
      .first();

    if (!journal) throw new Error("Journal not found");

    const planned = (args.takeProfit - args.entry) / (args.entry - args.stopLoss);

    return await ctx.db.insert("trades", {
      journalId: args.journalId,
      userId,
      symbol: args.symbol,
      entry: args.entry,
      stopLoss: args.stopLoss,
      takeProfit: args.takeProfit,
      status: "open",
      notes: args.notes,
      screenshots: args.screenshots,
      metadata: args.metadata,
      riskReward: {
        planned,
        actual: undefined
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});

export const listByJournal = query({
  args: { journalId: v.id("journals") },
  handler: async (ctx, { journalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("trades")
      .filter(q => q.eq(q.field("journalId"), journalId))
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();
  }
});

export const updateTrade = mutation({
  args: {
    id: v.id("trades"),
    exit: v.number(),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trade = await ctx.db.get(args.id);
    if (!trade || trade.userId !== identity.subject) {
      throw new Error("Trade not found");
    }

    const actual = (args.exit - trade.entry) / (trade.entry - trade.stopLoss);

    return await ctx.db.patch(args.id, {
      exit: args.exit,
      notes: args.notes,
      status: "closed",
      riskReward: {
        planned: trade.riskReward.planned,
        actual
      },
      updatedAt: Date.now()
    });
  }
});

export const getStats = query({
  args: { journalId: v.id("journals") },
  handler: async (ctx, { journalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trades = await ctx.db
      .query("trades")
      .filter(q => q.eq(q.field("journalId"), journalId))
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .filter(q => q.eq(q.field("status"), "closed"))
      .collect();

    const totalTrades = trades.length;
    if (totalTrades === 0) {
      return {
        winRate: 0,
        averageRR: 0,
        totalTrades: 0,
        profitableTrades: 0
      };
    }

    const profitableTrades = trades.filter(trade => 
      trade.riskReward.actual && trade.riskReward.actual > 0
    ).length;

    const totalRR = trades.reduce((sum, trade) => 
      sum + (trade.riskReward.actual || 0), 0
    );

    return {
      winRate: (profitableTrades / totalTrades) * 100,
      averageRR: totalRR / totalTrades,
      totalTrades,
      profitableTrades
    };
  }
});

export const listTrades = query({
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    return trades;
  },
});
