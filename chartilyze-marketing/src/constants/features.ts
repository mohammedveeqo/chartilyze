import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  Chrome,
  Camera,
  Users,
  TrendingUp,
  BarChart3,
  Target,
} from 'lucide-react';

interface WorkStep {
  step: string;
  label: string;
  icon: LucideIcon;
}

interface ProcessStep {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

interface ComparisonFeature {
  feature: string;
  tradilyze: boolean;
  others: boolean;
}

export const mainFeatures = [
  {
    title: "TradingView Integration",
    description: "Browser extension captures everything automatically - no manual entry needed",
    icon: Chrome
  },
  {
    title: "AI-Powered Psychology",
    description: "Get insights into your trading mindset and emotional patterns",
    icon: Brain
  },
  {
    title: "Visual Trade Journal",
    description: "Chart screenshots with your annotations, not just boring spreadsheets",
    icon: Camera
  },
  {
    title: "Community Learning",
    description: "Share trades anonymously and learn from other successful traders",
    icon: Users
  }
];

export const howItWorksSteps: WorkStep[] = [
  {
    step: "1",
    label: "Place Trade",
    icon: TrendingUp
  },
  {
    step: "2",
    label: "Auto Capture",
    icon: Camera
  },
  {
    step: "3",
    label: "AI Analysis",
    icon: Brain
  },
  {
    step: "4",
    label: "Get Insights",
    icon: BarChart3
  },
  {
    step: "5",
    label: "Improve",
    icon: Target
  }
];

export const processSteps: ProcessStep[] = [
  {
    title: "Connect & Trade",
    description: "Install our extension and trade normally on TradingView. We'll handle the rest automatically.",
    icon: Chrome,
    features: [
      "One-click installation",
      "Works with TradingView",
      "Automatic trade capture"
    ]
  },
  {
    title: "AI Analysis",
    description: "Our AI analyzes your trades in real-time, providing deep insights into your trading patterns.",
    icon: Brain,
    features: [
      "Psychology analysis",
      "Pattern recognition",
      "Risk management checks"
    ]
  },
  {
    title: "Improve & Scale",
    description: "Use data-driven insights to refine your strategy and become a better trader.",
    icon: TrendingUp,
    features: [
      "Performance tracking",
      "Actionable insights",
      "Progress monitoring"
    ]
  }
];

export const comparisonFeatures: ComparisonFeature[] = [
  { feature: "Browser extension auto-logging", tradilyze: true, others: false },
  { feature: "TradingView integration", tradilyze: true, others: false },
  { feature: "AI trade analysis", tradilyze: true, others: false },
  { feature: "Psychology tracking", tradilyze: true, others: false },
  { feature: "Visual chart capture", tradilyze: true, others: false },
  { feature: "Community feedback", tradilyze: true, others: false }
];

export default {
  mainFeatures,
  howItWorksSteps,
  processSteps,
  comparisonFeatures
};
