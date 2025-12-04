/**
 * Portfolio Parser
 * Parses user-provided holdings text into structured data
 *
 * Supported formats:
 *   AAPL 30%
 *   NVDA 0.25
 *   MSFT 25
 *   VOO (no weight - will be equal-weighted)
 */

import { ParsedHolding } from "./types";

/**
 * Parse holdings text input into an array of holdings with normalized weights
 *
 * @param text - Raw text input from user with one holding per line
 * @returns Array of parsed holdings with weights normalized to sum to 1.0
 * @throws Error if parsing fails completely or no valid holdings found
 */
export function parseHoldingsText(text: string): ParsedHolding[] {
  if (!text || typeof text !== "string") {
    throw new Error("Holdings text is required");
  }

  // Split into lines and filter out empty lines
  const lines = text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("No holdings provided. Please enter at least one ticker.");
  }

  const holdings: ParsedHolding[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    try {
      const parsed = parseLine(line);
      if (parsed) {
        // Check for duplicate tickers
        const existingIdx = holdings.findIndex(
          (h) => h.ticker === parsed.ticker
        );
        if (existingIdx >= 0) {
          // Merge weights for duplicates
          holdings[existingIdx].weight += parsed.weight;
        } else {
          holdings.push(parsed);
        }
      }
    } catch (err) {
      errors.push(`Line "${line}": ${(err as Error).message}`);
    }
  }

  if (holdings.length === 0) {
    throw new Error(
      `No valid holdings found.\n${errors.join("\n")}\n\nExample format:\nAAPL 30%\nNVDA 20%\nVOO 50%`
    );
  }

  // Normalize weights to sum to 1.0
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  if (totalWeight <= 0) {
    // If no weights were provided, make equal-weighted
    const equalWeight = 1 / holdings.length;
    holdings.forEach((h) => (h.weight = equalWeight));
  } else {
    // Normalize to sum to 1.0
    holdings.forEach((h) => (h.weight = h.weight / totalWeight));
  }

  // Final validation
  const finalSum = holdings.reduce((sum, h) => sum + h.weight, 0);
  if (Math.abs(finalSum - 1.0) > 0.001) {
    throw new Error("Internal error: weights do not sum to 1.0");
  }

  return holdings;
}

/**
 * Parse a single line of holdings text
 *
 * @param line - A single line like "AAPL 30%" or "MSFT 0.25"
 * @returns ParsedHolding or null if line should be skipped
 */
function parseLine(line: string): ParsedHolding | null {
  // Remove comments (anything after #)
  const cleanLine = line.split("#")[0].trim();
  if (!cleanLine) return null;

  // Regex to match: TICKER followed by optional number and optional %
  // Ticker: 1-5 uppercase letters/numbers (e.g., AAPL, BRK.B, SPY)
  // Weight: optional decimal number with optional % sign
  const regex = /^([A-Z][A-Z0-9.]{0,9})\s*(\d*\.?\d*)\s*(%)?$/i;
  const match = cleanLine.match(regex);

  if (!match) {
    throw new Error(`Invalid format. Expected "TICKER" or "TICKER weight%"`);
  }

  const ticker = match[1].toUpperCase();
  const numberStr = match[2];
  const hasPercent = match[3] === "%";

  // Validate ticker
  if (!isValidTicker(ticker)) {
    throw new Error(`Invalid ticker symbol: ${ticker}`);
  }

  // Parse weight
  let weight = 0;

  if (!numberStr || numberStr === "") {
    // No weight provided - will be equal-weighted later
    weight = 0;
  } else {
    const num = parseFloat(numberStr);

    if (isNaN(num) || num < 0) {
      throw new Error(`Invalid weight: ${numberStr}`);
    }

    if (hasPercent) {
      // Percentage like "30%"
      weight = num / 100;
    } else if (num > 1) {
      // Number > 1 treated as percentage like "30"
      weight = num / 100;
    } else {
      // Decimal like "0.3"
      weight = num;
    }
  }

  // Cap individual weight at 100%
  if (weight > 1) {
    weight = 1;
  }

  return { ticker, weight };
}

/**
 * Validate a ticker symbol
 *
 * @param ticker - Ticker symbol to validate
 * @returns true if valid
 */
function isValidTicker(ticker: string): boolean {
  // Basic validation: 1-10 chars, starts with letter, alphanumeric + dots
  if (!ticker || ticker.length < 1 || ticker.length > 10) {
    return false;
  }
  // Must start with letter
  if (!/^[A-Z]/.test(ticker)) {
    return false;
  }
  // Only alphanumeric and dots allowed
  if (!/^[A-Z0-9.]+$/.test(ticker)) {
    return false;
  }
  return true;
}

/**
 * Format holdings for display or debugging
 *
 * @param holdings - Array of parsed holdings
 * @returns Formatted string representation
 */
export function formatHoldings(holdings: ParsedHolding[]): string {
  return holdings
    .map((h) => `${h.ticker}: ${(h.weight * 100).toFixed(2)}%`)
    .join("\n");
}

