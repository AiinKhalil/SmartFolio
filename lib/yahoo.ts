/**
 * Yahoo Finance Data Fetching
 * Fetches historical prices and metadata for tickers
 */

import yahooFinance from "yahoo-finance2";
import { HistoricalData, QuoteSummary } from "./types";

// Suppress the yahoo-finance2 warning about community license
yahooFinance.suppressNotices(["yahooSurvey"]);

/**
 * Fetch historical adjusted close prices for a ticker
 *
 * @param ticker - Stock/ETF ticker symbol
 * @param yearsBack - Number of years of historical data (default 1)
 * @returns Array of historical price data
 */
export async function fetchHistoricalPrices(
  ticker: string,
  yearsBack: number = 1
): Promise<HistoricalData[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - yearsBack);

  try {
    const result = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: "1d",
    });

    // Map to our format, filtering out any null/undefined values
    const data: HistoricalData[] = result
      .filter((row) => row.adjClose != null && row.date != null)
      .map((row) => ({
        date: new Date(row.date),
        adjClose: row.adjClose as number,
      }));

    // Sort by date ascending
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    return data;
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    throw new Error(
      `Failed to fetch historical data for ${ticker}. Please check if the ticker is valid.`
    );
  }
}

/**
 * Fetch metadata (sector, industry, name) for a ticker
 *
 * @param ticker - Stock/ETF ticker symbol
 * @returns Quote summary with metadata
 */
export async function fetchQuoteSummary(ticker: string): Promise<QuoteSummary> {
  try {
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ["assetProfile", "quoteType"],
    });

    return {
      ticker,
      name: result.quoteType?.longName || result.quoteType?.shortName || ticker,
      sector: result.assetProfile?.sector || "Unknown",
      industry: result.assetProfile?.industry || "Unknown",
    };
  } catch (error) {
    console.warn(`Could not fetch metadata for ${ticker}:`, error);
    // Return defaults if metadata fetch fails
    return {
      ticker,
      name: ticker,
      sector: "Unknown",
      industry: "Unknown",
    };
  }
}

/**
 * Batch fetch historical prices for multiple tickers
 *
 * @param tickers - Array of ticker symbols
 * @param yearsBack - Number of years of historical data
 * @returns Map of ticker -> historical data
 */
export async function fetchAllHistoricalPrices(
  tickers: string[],
  yearsBack: number = 1
): Promise<Map<string, HistoricalData[]>> {
  const results = new Map<string, HistoricalData[]>();
  const errors: string[] = [];

  // Fetch in parallel with error handling for each
  const promises = tickers.map(async (ticker) => {
    try {
      const data = await fetchHistoricalPrices(ticker, yearsBack);
      if (data.length < 20) {
        errors.push(`${ticker}: Insufficient historical data (only ${data.length} days)`);
        return null;
      }
      return { ticker, data };
    } catch (err) {
      errors.push(`${ticker}: ${(err as Error).message}`);
      return null;
    }
  });

  const settled = await Promise.all(promises);

  for (const result of settled) {
    if (result) {
      results.set(result.ticker, result.data);
    }
  }

  // If we couldn't fetch any data, throw an error
  if (results.size === 0) {
    throw new Error(
      `Could not fetch data for any tickers:\n${errors.join("\n")}`
    );
  }

  // Warn but continue if some tickers failed
  if (errors.length > 0) {
    console.warn("Some tickers had errors:", errors);
  }

  return results;
}

/**
 * Batch fetch metadata for multiple tickers
 *
 * @param tickers - Array of ticker symbols
 * @returns Map of ticker -> quote summary
 */
export async function fetchAllMetadata(
  tickers: string[]
): Promise<Map<string, QuoteSummary>> {
  const results = new Map<string, QuoteSummary>();

  // Fetch in parallel
  const promises = tickers.map(async (ticker) => {
    const summary = await fetchQuoteSummary(ticker);
    return { ticker, summary };
  });

  const settled = await Promise.all(promises);

  for (const result of settled) {
    results.set(result.ticker, result.summary);
  }

  return results;
}

/**
 * Align historical data across multiple tickers to common dates
 *
 * This ensures all tickers have prices for the same dates,
 * which is required for covariance calculation.
 *
 * @param pricesMap - Map of ticker -> historical data
 * @returns Map of ticker -> aligned prices (just adjClose values)
 */
export function alignPriceData(
  pricesMap: Map<string, HistoricalData[]>
): { dates: Date[]; alignedPrices: Map<string, number[]> } {
  // Find common dates across all tickers
  const tickers = Array.from(pricesMap.keys());
  if (tickers.length === 0) {
    return { dates: [], alignedPrices: new Map() };
  }

  // Create date -> price maps for each ticker
  const dateMaps: Map<string, Map<number, number>> = new Map();

  for (const [ticker, data] of pricesMap) {
    const dateMap = new Map<number, number>();
    for (const point of data) {
      dateMap.set(point.date.getTime(), point.adjClose);
    }
    dateMaps.set(ticker, dateMap);
  }

  // Find dates that exist in all tickers
  const firstTicker = tickers[0];
  const firstData = pricesMap.get(firstTicker) || [];

  const commonDates: Date[] = [];

  for (const point of firstData) {
    const dateTime = point.date.getTime();
    let allHave = true;

    for (const ticker of tickers) {
      if (!dateMaps.get(ticker)?.has(dateTime)) {
        allHave = false;
        break;
      }
    }

    if (allHave) {
      commonDates.push(point.date);
    }
  }

  // Sort dates
  commonDates.sort((a, b) => a.getTime() - b.getTime());

  // Build aligned price arrays
  const alignedPrices = new Map<string, number[]>();

  for (const ticker of tickers) {
    const dateMap = dateMaps.get(ticker)!;
    const prices: number[] = [];

    for (const date of commonDates) {
      prices.push(dateMap.get(date.getTime())!);
    }

    alignedPrices.set(ticker, prices);
  }

  return { dates: commonDates, alignedPrices };
}

