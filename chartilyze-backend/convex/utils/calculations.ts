export const calculateRiskRewardRatio = (
  entry: number,
  stopLoss: number,
  takeProfit: number
): number => {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  return reward / risk;
};

export const calculatePositionSize = (
  accountSize: number,
  riskPercentage: number,
  entry: number,
  stopLoss: number
): number => {
  const riskAmount = accountSize * (riskPercentage / 100);
  const riskPerShare = Math.abs(entry - stopLoss);
  return riskAmount / riskPerShare;
};

export const calculateProfitLoss = (
  entry: number,
  exit: number,
  positionSize: number
): number => {
  return (exit - entry) * positionSize;
};

export const calculateWinRate = (
  wins: number,
  totalTrades: number
): number => {
  if (totalTrades === 0) return 0;
  return (wins / totalTrades) * 100;
};
