import { Id } from "./_generated/dataModel";

// Flowchart Types
export interface FlowchartNode {
  id: string;
  name: string;
  shape: 'oval' | 'rectangle' | 'diamond';
  icon: string;
  color: string;
  group?: string;
}

export interface FlowchartGroup {
  name: string;
  icon: string;
  color: string;
  nodes: string[];
}

export interface FlowchartRelationship {
  from: string;
  to: string;
  condition: string;
}

// Strategy Types
export interface Strategy {
  name: string;
  rules: string[];
  flowchart?: {
    nodes: FlowchartNode[];
    groups: FlowchartGroup[];
    relationships: FlowchartRelationship[];
  };
  globalTags?: string[];
}

// Journal Types
export interface Journal {
  _id: Id<"journals">;
  userId: string;
  name: string;
  description?: string;
  strategy?: Strategy;
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

// Trade Types
export interface Trade {
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
}