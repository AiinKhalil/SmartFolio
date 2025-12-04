/**
 * Finance Math Library
 * All quantitative finance computations for portfolio analysis
 *
 * This module contains deterministic, mathematically sound implementations of:
 * - Daily log returns
 * - Annualized return and volatility
 * - Portfolio covariance and volatility
 * - Sharpe ratio
 * - Maximum drawdown
 * - Herfindahl-Hirschman Index (HHI)
 * - Value at Risk (VaR)
 * - Composite health score
 */

import {
  HoldingMetric,
  PortfolioMetrics,
  TimeSeriesData,
  HealthScoreComponents,
} from "./types";

// ============================================
// CONSTANTS
// ============================================

/** Trading days per year for annualization */
const TRADING_DAYS_PER_YEAR = 252;

/** Risk-free rate (annualized) - using ~4% as current T-bill rate approximation */
const RISK_FREE_RATE = 0.04;

/** Z-score for 95% confidence level (one-tailed) */
const Z_SCORE_95 = 1.645;

// ============================================
// BASIC RETURN CALCULATIONS
// ============================================

/**
 * Calculate daily log returns from price series
 *
 * Formula: r_t = ln(P_t / P_{t-1})
 *
 * @param prices - Array of adjusted close prices (chronological order)
 * @returns Array of daily log returns (length = prices.length - 1)
 */
export function calculateLogReturns(prices: number[]): number[] {
  if (prices.length < 2) {
    return [];
  }

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  return returns;
}

/**
 * Calculate mean of an array
 *
 * @param values - Array of numbers
 * @returns Mean value
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation of an array (sample std dev)
 *
 * Formula: sqrt(sum((x_i - mean)^2) / (n - 1))
 *
 * @param values - Array of numbers
 * @returns Sample standard deviation
 */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;

  const avg = mean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Annualize daily return
 *
 * Formula: mu_annual = mean_daily * 252
 *
 * @param dailyReturn - Average daily return
 * @returns Annualized return
 */
export function annualizeReturn(dailyReturn: number): number {
  return dailyReturn * TRADING_DAYS_PER_YEAR;
}

/**
 * Annualize daily volatility
 *
 * Formula: sigma_annual = sigma_daily * sqrt(252)
 *
 * @param dailyVol - Daily volatility (standard deviation)
 * @returns Annualized volatility
 */
export function annualizeVolatility(dailyVol: number): number {
  return dailyVol * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

// ============================================
// PORTFOLIO CALCULATIONS
// ============================================

/**
 * Calculate covariance between two return series
 *
 * Formula: cov(X, Y) = sum((x_i - mean_x)(y_i - mean_y)) / (n - 1)
 *
 * @param returns1 - First return series
 * @param returns2 - Second return series
 * @returns Covariance value
 */
export function covariance(returns1: number[], returns2: number[]): number {
  const n = Math.min(returns1.length, returns2.length);
  if (n < 2) return 0;

  const mean1 = mean(returns1.slice(0, n));
  const mean2 = mean(returns2.slice(0, n));

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (returns1[i] - mean1) * (returns2[i] - mean2);
  }

  return sum / (n - 1);
}

/**
 * Build covariance matrix from multiple return series
 *
 * @param returnsMatrix - Map of ticker -> returns array
 * @param tickers - Ordered list of tickers
 * @returns 2D covariance matrix (annualized)
 */
export function buildCovarianceMatrix(
  returnsMatrix: Map<string, number[]>,
  tickers: string[]
): number[][] {
  const n = tickers.length;
  const matrix: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const returns1 = returnsMatrix.get(tickers[i]) || [];
      const returns2 = returnsMatrix.get(tickers[j]) || [];

      // Daily covariance, then annualize
      const dailyCov = covariance(returns1, returns2);
      matrix[i][j] = dailyCov * TRADING_DAYS_PER_YEAR;
    }
  }

  return matrix;
}

/**
 * Calculate portfolio volatility using matrix algebra
 *
 * Formula: sigma_p = sqrt(w^T * Sigma * w)
 *
 * @param weights - Weight vector
 * @param covMatrix - Covariance matrix (annualized)
 * @returns Portfolio annualized volatility
 */
export function calculatePortfolioVolatility(
  weights: number[],
  covMatrix: number[][]
): number {
  const n = weights.length;
  if (n === 0 || covMatrix.length !== n) return 0;

  // w^T * Sigma * w
  let portfolioVariance = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      portfolioVariance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }

  // Handle numerical errors
  if (portfolioVariance < 0) portfolioVariance = 0;

  return Math.sqrt(portfolioVariance);
}

/**
 * Calculate portfolio expected return
 *
 * Formula: mu_p = sum(w_i * mu_i)
 *
 * @param weights - Weight vector
 * @param assetReturns - Annualized return for each asset
 * @returns Portfolio expected annualized return
 */
export function calculatePortfolioReturn(
  weights: number[],
  assetReturns: number[]
): number {
  if (weights.length !== assetReturns.length) return 0;

  let portfolioReturn = 0;
  for (let i = 0; i < weights.length; i++) {
    portfolioReturn += weights[i] * assetReturns[i];
  }

  return portfolioReturn;
}

/**
 * Calculate Sharpe Ratio
 *
 * Formula: Sharpe = (mu_p - rf) / sigma_p
 *
 * @param portfolioReturn - Annualized expected return
 * @param portfolioVol - Annualized volatility
 * @param riskFreeRate - Risk-free rate (default 4%)
 * @returns Sharpe ratio, or null if volatility is 0
 */
export function calculateSharpeRatio(
  portfolioReturn: number,
  portfolioVol: number,
  riskFreeRate: number = RISK_FREE_RATE
): number | null {
  if (portfolioVol === 0) return null;

  return (portfolioReturn - riskFreeRate) / portfolioVol;
}

// ============================================
// DRAWDOWN CALCULATIONS
// ============================================

/**
 * Simulate portfolio value series from returns
 *
 * @param portfolioReturns - Array of daily portfolio returns
 * @param initialValue - Starting value (default 1.0)
 * @returns Array of portfolio values
 */
export function simulatePortfolioValues(
  portfolioReturns: number[],
  initialValue: number = 1.0
): number[] {
  const values: number[] = [initialValue];

  for (const ret of portfolioReturns) {
    // Convert log return to simple return for value calculation
    const simpleReturn = Math.exp(ret) - 1;
    values.push(values[values.length - 1] * (1 + simpleReturn));
  }

  return values;
}

/**
 * Calculate drawdown series from portfolio values
 *
 * Formula: drawdown_t = value_t / running_max_t - 1
 *
 * @param values - Portfolio value series
 * @returns Array of drawdown values (negative numbers)
 */
export function calculateDrawdownSeries(values: number[]): number[] {
  if (values.length === 0) return [];

  const drawdowns: number[] = [];
  let runningMax = values[0];

  for (const value of values) {
    if (value > runningMax) {
      runningMax = value;
    }
    const drawdown = value / runningMax - 1;
    drawdowns.push(drawdown);
  }

  return drawdowns;
}

/**
 * Calculate maximum drawdown from portfolio values
 *
 * @param values - Portfolio value series
 * @returns Maximum drawdown (a negative number, e.g., -0.15 = -15%)
 */
export function calculateMaxDrawdown(values: number[]): number {
  const drawdowns = calculateDrawdownSeries(values);
  if (drawdowns.length === 0) return 0;

  return Math.min(...drawdowns);
}

// ============================================
// DIVERSIFICATION METRICS
// ============================================

/**
 * Calculate Herfindahl-Hirschman Index (HHI)
 *
 * Formula: HHI = sum(w_i^2)
 *
 * Range: 1/n (perfectly diversified) to 1 (fully concentrated)
 *
 * @param weights - Portfolio weights
 * @returns HHI value between 0 and 1
 */
export function calculateHHI(weights: number[]): number {
  return weights.reduce((sum, w) => sum + w * w, 0);
}

/**
 * Calculate diversification score from HHI
 *
 * Formula: score = (1 - HHI) / (1 - 1/n) * 100
 *
 * Normalized so that:
 * - Perfectly equal-weighted portfolio = 100
 * - Single-asset portfolio = 0
 *
 * @param weights - Portfolio weights
 * @returns Diversification score 0-100
 */
export function calculateDiversificationScore(weights: number[]): number {
  const n = weights.length;
  if (n <= 1) return 0;

  const hhi = calculateHHI(weights);
  const minHHI = 1 / n; // Perfect diversification
  const maxHHI = 1; // Full concentration

  // Normalize to 0-100 scale
  const score = ((1 - hhi) / (1 - minHHI)) * 100;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Get weight of top N holdings
 *
 * @param weights - Portfolio weights
 * @param n - Number of top holdings to sum
 * @returns Combined weight of top N holdings
 */
export function topNWeight(weights: number[], n: number = 1): number {
  const sorted = [...weights].sort((a, b) => b - a);
  return sorted.slice(0, n).reduce((sum, w) => sum + w, 0);
}

// ============================================
// VALUE AT RISK (VaR)
// ============================================

/**
 * Calculate parametric Value at Risk (VaR) at 95% confidence
 *
 * Formula: VaR_95 = z * sigma_daily * sqrt(horizon) * portfolio_value
 *
 * Assumes normal distribution of returns (simplified model)
 *
 * @param portfolioVolatility - Annualized portfolio volatility
 * @param portfolioValue - Total portfolio value in dollars
 * @param horizonDays - VaR time horizon in days (default 1)
 * @returns VaR amount in dollars (positive number)
 */
export function calculateVaR95(
  portfolioVolatility: number,
  portfolioValue: number,
  horizonDays: number = 1
): number {
  // Convert annual vol to daily
  const dailyVol = portfolioVolatility / Math.sqrt(TRADING_DAYS_PER_YEAR);

  // Scale for horizon
  const horizonVol = dailyVol * Math.sqrt(horizonDays);

  // VaR = z * sigma * value
  return Z_SCORE_95 * horizonVol * portfolioValue;
}

// ============================================
// COMPOSITE HEALTH SCORE
// ============================================

/**
 * Calculate component scores for health calculation
 *
 * Each component is normalized to 0-100 scale
 */
export function calculateHealthComponents(
  diversificationScore: number,
  annualVolatility: number,
  maxDrawdown: number,
  sharpeRatio: number | null
): HealthScoreComponents {
  // Diversification score is already 0-100
  const divScore = diversificationScore;

  // Volatility score: penalize very high volatility
  // 10% vol = 100, 30% vol = 60, 50%+ vol = 0
  // Using a linear decay from 10% to 50%
  let volScore: number;
  if (annualVolatility <= 0.1) {
    volScore = 100;
  } else if (annualVolatility >= 0.5) {
    volScore = 0;
  } else {
    volScore = 100 - ((annualVolatility - 0.1) / 0.4) * 100;
  }

  // Drawdown score: less negative is better
  // 0% drawdown = 100, -10% = 80, -30% = 40, -50%+ = 0
  let ddScore: number;
  const absDrawdown = Math.abs(maxDrawdown);
  if (absDrawdown <= 0) {
    ddScore = 100;
  } else if (absDrawdown >= 0.5) {
    ddScore = 0;
  } else {
    ddScore = 100 - (absDrawdown / 0.5) * 100;
  }

  // Sharpe score: higher is better
  // Sharpe < 0 = 20, Sharpe 0 = 40, Sharpe 1 = 70, Sharpe 2+ = 100
  let sharpeScore: number;
  if (sharpeRatio === null) {
    sharpeScore = 50; // Unknown, give neutral score
  } else if (sharpeRatio < 0) {
    sharpeScore = Math.max(0, 20 + sharpeRatio * 20); // Negative Sharpe penalized
  } else if (sharpeRatio >= 2) {
    sharpeScore = 100;
  } else {
    // Linear from 40 (Sharpe=0) to 100 (Sharpe=2)
    sharpeScore = 40 + (sharpeRatio / 2) * 60;
  }

  return {
    diversificationScore: Math.max(0, Math.min(100, divScore)),
    volatilityScore: Math.max(0, Math.min(100, volScore)),
    drawdownScore: Math.max(0, Math.min(100, ddScore)),
    sharpeScore: Math.max(0, Math.min(100, sharpeScore)),
  };
}

/**
 * Calculate composite health score from components
 *
 * Weighted average:
 * - Diversification: 30%
 * - Volatility: 20%
 * - Drawdown: 20%
 * - Sharpe: 30%
 *
 * @returns Health score 0-100
 */
export function calculateHealthScore(components: HealthScoreComponents): number {
  const weights = {
    diversification: 0.3,
    volatility: 0.2,
    drawdown: 0.2,
    sharpe: 0.3,
  };

  const score =
    weights.diversification * components.diversificationScore +
    weights.volatility * components.volatilityScore +
    weights.drawdown * components.drawdownScore +
    weights.sharpe * components.sharpeScore;

  return Math.round(Math.max(0, Math.min(100, score)));
}

// ============================================
// PORTFOLIO RETURNS CALCULATION
// ============================================

/**
 * Calculate weighted portfolio returns from individual asset returns
 *
 * @param returnsMatrix - Map of ticker -> daily returns
 * @param weights - Map of ticker -> weight
 * @param tickers - Ordered list of tickers
 * @returns Array of daily portfolio returns
 */
export function calculatePortfolioDailyReturns(
  returnsMatrix: Map<string, number[]>,
  weights: Map<string, number>,
  tickers: string[]
): number[] {
  // Find the minimum length of all return series
  let minLength = Infinity;
  for (const ticker of tickers) {
    const returns = returnsMatrix.get(ticker);
    if (returns) {
      minLength = Math.min(minLength, returns.length);
    }
  }

  if (minLength === Infinity || minLength === 0) {
    return [];
  }

  // Calculate weighted portfolio returns for each day
  const portfolioReturns: number[] = [];

  for (let i = 0; i < minLength; i++) {
    let dailyReturn = 0;
    for (const ticker of tickers) {
      const returns = returnsMatrix.get(ticker);
      const weight = weights.get(ticker) || 0;
      if (returns && returns[i] !== undefined) {
        dailyReturn += weight * returns[i];
      }
    }
    portfolioReturns.push(dailyReturn);
  }

  return portfolioReturns;
}

