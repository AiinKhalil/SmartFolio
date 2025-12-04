/**
 * Types for the AI Portfolio Doctor application
 * All interfaces used across the app for type safety
 */

// ============================================
// INPUT TYPES
// ============================================

/** A single holding parsed from user input */
export interface ParsedHolding {
  ticker: string;
  weight: number;
}

/** Request body for the analyze portfolio API */
export interface AnalyzePortfolioRequest {
  holdingsText: string;
  portfolioValue?: number;
  horizonYears?: number;
}

// ============================================
// METRICS TYPES
// ============================================

/** Metrics for an individual holding */
export interface HoldingMetric {
  ticker: string;
  weight: number;
  sector?: string;
  industry?: string;
  name?: string;
  annualReturn: number;
  annualVol: number;
}

/** Aggregate portfolio-level metrics */
export interface PortfolioMetrics {
  expectedAnnualReturn: number;
  annualVolatility: number;
  sharpeRatio: number | null;
  maxDrawdown: number;
  diversificationHHI: number;
  diversificationScore: number;
  topHoldingWeight: number;
  healthScore: number;
  var95?: number;
  numHoldings: number;
}

/** Sector allocation breakdown */
export interface SectorAllocation {
  sector: string;
  weight: number;
}

/** Time series data for charts */
export interface TimeSeriesData {
  dates: string[];
  portfolioValues: number[];
  drawdowns: number[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

/** Successful analysis response */
export interface AnalysisResponse {
  holdings: HoldingMetric[];
  portfolio: PortfolioMetrics;
  sectors: SectorAllocation[];
  timeseries: TimeSeriesData;
  diagnosis: string;
}

/** Error response from API */
export interface ErrorResponse {
  error: string;
  details?: string;
}

// ============================================
// COMPONENT PROPS TYPES
// ============================================

/** Props for the portfolio input card */
export interface PortfolioInputCardProps {
  onAnalyze: (holdingsText: string, portfolioValue: number) => void;
  isLoading: boolean;
}

/** Props for the metrics overview component */
export interface MetricsOverviewProps {
  portfolio: PortfolioMetrics;
}

/** Props for the risk gauge component */
export interface RiskGaugeProps {
  healthScore: number;
  volatility: number;
}

/** Props for the diversification chart */
export interface DiversificationChartProps {
  holdings: HoldingMetric[];
}

/** Props for the sector allocation chart */
export interface SectorAllocationChartProps {
  sectors: SectorAllocation[];
}

/** Props for the drawdown chart */
export interface DrawdownChartProps {
  timeseries: TimeSeriesData;
}

/** Props for the diagnosis panel */
export interface DiagnosisPanelProps {
  diagnosis: string;
}

/** Props for the error alert */
export interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

// ============================================
// INTERNAL COMPUTATION TYPES
// ============================================

/** Historical price data for a single ticker */
export interface HistoricalData {
  date: Date;
  adjClose: number;
}

/** Yahoo Finance quote summary data */
export interface QuoteSummary {
  ticker: string;
  name?: string;
  sector?: string;
  industry?: string;
}

/** Daily returns matrix for portfolio computation */
export interface ReturnsMatrix {
  dates: Date[];
  returns: Map<string, number[]>;
}

/** Individual score components for health calculation */
export interface HealthScoreComponents {
  diversificationScore: number;
  volatilityScore: number;
  drawdownScore: number;
  sharpeScore: number;
}

