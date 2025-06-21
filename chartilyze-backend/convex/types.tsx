// convex/types.ts
import { Id } from "./_generated/dataModel";


export interface Journal {
  _id: Id<"journals">;
  userId: string;
  name: string;
  description?: string;
  strategy?: {
    name: string;
    rules: string[];
  };
  settings?: {
    defaultRiskPercentage: number;
    defaultPositionSize: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface JournalsQueryResult {
  hasJournals: boolean;
  journals: Journal[];
  total: number;
}


export type Trade = {
  _id: Id<"trades">;
  _creationTime: number;
  journalId: Id<"journals">;
  userId: string;
  symbol: string;
  entry: number;
  exit?: number;
  stopLoss: number;
  takeProfit: number;
  status: string;
  notes?: string;
  screenshots: string[];
  strategyAdherence?: boolean;
  metadata?: {
    timeframe: string;
    setup: string;
    tags: string[];
  };
  riskReward?: {
    planned: number;
    actual?: number;
  };
  createdAt: number;
  updatedAt: number;
};
