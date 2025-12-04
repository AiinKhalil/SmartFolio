/**
 * Portfolio Analysis API Route
 * POST /api/analyzePortfolio
 *
 * Accepts portfolio holdings, fetches market data, computes metrics,
 * and returns a comprehensive analysis with LLM-generated diagnosis.
 */

import { NextRequest, NextResponse } from "next/server";
import { parseHoldingsText } from "@/lib/parser";
import {
  calculateLogReturns,
  mean,
  stdDev,
  annualizeReturn,
  annualizeVolatility,
  buildCovarianceMatrix,
  calculatePortfolioVolatility,
  calculatePortfolioReturn,
  calculateSharpeRatio,
  calculatePortfolioDailyReturns,
  simulatePortfolioValues,
  calculateMaxDrawdown,
  calculateDrawdownSeries,
  calculateHHI,
  calculateDiversificationScore,
  topNWeight,
  calculateVaR95,
  calculateHealthComponents,
  calculateHealthScore,
} from "@/lib/finance";
import {
  fetchAllHistoricalPrices,
  fetchAllMetadata,
  alignPriceData,
} from "@/lib/yahoo";
import { generateDiagnosis } from "@/lib/llm";
import {
  AnalyzePortfolioRequest,
  AnalysisResponse,
  HoldingMetric,
  PortfolioMetrics,
  SectorAllocation,
  TimeSeriesData,
  ErrorResponse,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as AnalyzePortfolioRequest;
    const { holdingsText, portfolioValue = 10000, horizonYears = 1 } = body;

    // Validate inputs
    if (!holdingsText || typeof holdingsText !== "string") {
      return NextResponse.json<ErrorResponse>(
        { error: "Holdings text is required" },
        { status: 400 }
      );
    }

    // Step 1: Parse holdings
    let parsedHoldings;
    try {
      parsedHoldings = parseHoldingsText(holdingsText);
    } catch (err) {
      return NextResponse.json<ErrorResponse>(
        { error: "Failed to parse holdings", details: (err as Error).message },
        { status: 400 }
      );
    }

    if (parsedHoldings.length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "No valid holdings found" },
        { status: 400 }
      );
    }

    const tickers = parsedHoldings.map((h) => h.ticker);
    const weightsMap = new Map(parsedHoldings.map((h) => [h.ticker, h.weight]));

    // Step 2: Fetch historical price data
    let pricesMap;
    try {
      pricesMap = await fetchAllHistoricalPrices(tickers, horizonYears);
    } catch (err) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Failed to fetch market data",
          details: (err as Error).message,
        },
        { status: 500 }
      );
    }

    // Filter to only tickers we got data for
    const validTickers = Array.from(pricesMap.keys());
    if (validTickers.length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Could not fetch data for any of the provided tickers" },
        { status: 400 }
      );
    }

    // Recalculate weights for valid tickers only
    const totalValidWeight = validTickers.reduce(
      (sum, t) => sum + (weightsMap.get(t) || 0),
      0
    );
    const adjustedWeights = new Map<string, number>();
    for (const ticker of validTickers) {
      adjustedWeights.set(
        ticker,
        (weightsMap.get(ticker) || 0) / totalValidWeight
      );
    }

    // Step 3: Fetch metadata (sector, industry, name)
    const metadataMap = await fetchAllMetadata(validTickers);

    // Step 4: Align price data across tickers
    const { dates, alignedPrices } = alignPriceData(pricesMap);

    if (dates.length < 20) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Insufficient historical data",
          details: `Only ${dates.length} common trading days found. Need at least 20.`,
        },
        { status: 400 }
      );
    }

    // Step 5: Calculate returns for each ticker
    const returnsMatrix = new Map<string, number[]>();
    const assetAnnualReturns: number[] = [];
    const assetAnnualVols: number[] = [];

    for (const ticker of validTickers) {
      const prices = alignedPrices.get(ticker) || [];
      const returns = calculateLogReturns(prices);
      returnsMatrix.set(ticker, returns);

      const dailyMean = mean(returns);
      const dailyStd = stdDev(returns);

      assetAnnualReturns.push(annualizeReturn(dailyMean));
      assetAnnualVols.push(annualizeVolatility(dailyStd));
    }

    // Step 6: Build covariance matrix and calculate portfolio metrics
    const weights = validTickers.map((t) => adjustedWeights.get(t) || 0);
    const covMatrix = buildCovarianceMatrix(returnsMatrix, validTickers);

    const portfolioVol = calculatePortfolioVolatility(weights, covMatrix);
    const portfolioReturn = calculatePortfolioReturn(weights, assetAnnualReturns);
    const sharpeRatio = calculateSharpeRatio(portfolioReturn, portfolioVol);

    // Step 7: Calculate portfolio daily returns and drawdown
    const portfolioDailyReturns = calculatePortfolioDailyReturns(
      returnsMatrix,
      adjustedWeights,
      validTickers
    );
    const portfolioValues = simulatePortfolioValues(portfolioDailyReturns, 1.0);
    const drawdowns = calculateDrawdownSeries(portfolioValues);
    const maxDrawdown = calculateMaxDrawdown(portfolioValues);

    // Step 8: Calculate diversification metrics
    const hhi = calculateHHI(weights);
    const diversificationScore = calculateDiversificationScore(weights);
    const topWeight = topNWeight(weights, 1);

    // Step 9: Calculate VaR
    const var95 = calculateVaR95(portfolioVol, portfolioValue, 1);

    // Step 10: Calculate health score
    const healthComponents = calculateHealthComponents(
      diversificationScore,
      portfolioVol,
      maxDrawdown,
      sharpeRatio
    );
    const healthScore = calculateHealthScore(healthComponents);

    // Step 11: Build holdings metrics
    const holdingsMetrics: HoldingMetric[] = validTickers.map((ticker, i) => {
      const metadata = metadataMap.get(ticker);
      return {
        ticker,
        weight: adjustedWeights.get(ticker) || 0,
        sector: metadata?.sector,
        industry: metadata?.industry,
        name: metadata?.name,
        annualReturn: assetAnnualReturns[i],
        annualVol: assetAnnualVols[i],
      };
    });

    // Step 12: Build sector allocations
    const sectorMap = new Map<string, number>();
    for (const holding of holdingsMetrics) {
      const sector = holding.sector || "Unknown";
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + holding.weight);
    }
    const sectors: SectorAllocation[] = Array.from(sectorMap.entries())
      .map(([sector, weight]) => ({ sector, weight }))
      .sort((a, b) => b.weight - a.weight);

    // Step 13: Build portfolio metrics object
    const portfolioMetrics: PortfolioMetrics = {
      expectedAnnualReturn: portfolioReturn,
      annualVolatility: portfolioVol,
      sharpeRatio,
      maxDrawdown,
      diversificationHHI: hhi,
      diversificationScore,
      topHoldingWeight: topWeight,
      healthScore,
      var95,
      numHoldings: validTickers.length,
    };

    // Step 14: Build time series data for charts
    // Use the dates that correspond to returns (one less than prices)
    const returnDates = dates.slice(1);
    const timeseries: TimeSeriesData = {
      dates: returnDates.map((d) => d.toISOString().split("T")[0]),
      portfolioValues: portfolioValues.slice(1), // Remove initial value
      drawdowns: drawdowns.slice(1),
    };

    // Step 15: Generate LLM diagnosis
    const diagnosis = await generateDiagnosis(
      holdingsMetrics,
      portfolioMetrics,
      sectors
    );

    // Build response
    const response: AnalysisResponse = {
      holdings: holdingsMetrics,
      portfolio: portfolioMetrics,
      sectors,
      timeseries,
      diagnosis,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in analyzePortfolio:", error);
    return NextResponse.json<ErrorResponse>(
      {
        error: "An unexpected error occurred",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

