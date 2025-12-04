/**
 * LLM Integration for Natural Language Diagnosis
 * Uses OpenAI to generate human-readable portfolio analysis
 */

import OpenAI from "openai";
import { HoldingMetric, PortfolioMetrics, SectorAllocation } from "./types";

/**
 * Generate a natural language diagnosis of the portfolio
 *
 * @param holdings - Individual holding metrics
 * @param portfolio - Aggregate portfolio metrics
 * @param sectors - Sector allocation breakdown
 * @returns Human-readable diagnosis string
 */
export async function generateDiagnosis(
  holdings: HoldingMetric[],
  portfolio: PortfolioMetrics,
  sectors: SectorAllocation[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return a fallback analysis without LLM
    return generateFallbackDiagnosis(holdings, portfolio, sectors);
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `You are a seasoned investment advisor providing an educational portfolio analysis. 
You are NOT providing personalized financial advice, just educational insights based on quantitative metrics.

Your tone should be:
- Professional but approachable
- Clear and jargon-free where possible
- Honest about risks and limitations
- Constructive with specific suggestions

Format your response with:
1. A brief overall assessment (2-3 sentences)
2. Risk analysis paragraph (volatility, drawdown, VaR if provided)
3. Diversification analysis paragraph (HHI, sector concentration)
4. Return vs risk analysis (Sharpe ratio interpretation)
5. Health score interpretation (1 sentence)
6. 3-5 bullet points with specific, actionable suggestions

IMPORTANT: 
- Only reference the exact numbers provided in the metrics
- Do NOT fabricate any statistics
- Always include the disclaimer that this is educational, not financial advice`;

  const metricsContext = {
    holdings: holdings.map((h) => ({
      ticker: h.ticker,
      weight: `${(h.weight * 100).toFixed(1)}%`,
      sector: h.sector,
      annualReturn: `${(h.annualReturn * 100).toFixed(1)}%`,
      annualVolatility: `${(h.annualVol * 100).toFixed(1)}%`,
    })),
    portfolio: {
      expectedAnnualReturn: `${(portfolio.expectedAnnualReturn * 100).toFixed(1)}%`,
      annualVolatility: `${(portfolio.annualVolatility * 100).toFixed(1)}%`,
      sharpeRatio: portfolio.sharpeRatio?.toFixed(2) || "N/A",
      maxDrawdown: `${(portfolio.maxDrawdown * 100).toFixed(1)}%`,
      diversificationHHI: portfolio.diversificationHHI.toFixed(3),
      diversificationScore: `${portfolio.diversificationScore.toFixed(0)}/100`,
      topHoldingWeight: `${(portfolio.topHoldingWeight * 100).toFixed(1)}%`,
      healthScore: `${portfolio.healthScore}/100`,
      numHoldings: portfolio.numHoldings,
      var95: portfolio.var95
        ? `$${portfolio.var95.toFixed(0)} (95% 1-day VaR)`
        : undefined,
    },
    sectorBreakdown: sectors.map((s) => ({
      sector: s.sector,
      weight: `${(s.weight * 100).toFixed(1)}%`,
    })),
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please analyze this portfolio and provide your assessment:\n\n${JSON.stringify(metricsContext, null, 2)}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content ||
      generateFallbackDiagnosis(holdings, portfolio, sectors)
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateFallbackDiagnosis(holdings, portfolio, sectors);
  }
}

/**
 * Generate a fallback diagnosis without LLM
 * Used when OpenAI API is not available
 */
function generateFallbackDiagnosis(
  holdings: HoldingMetric[],
  portfolio: PortfolioMetrics,
  sectors: SectorAllocation[]
): string {
  const lines: string[] = [];

  // Overall assessment
  lines.push("## Portfolio Analysis Summary\n");

  const healthRating =
    portfolio.healthScore >= 70
      ? "good"
      : portfolio.healthScore >= 50
        ? "moderate"
        : "needs attention";
  lines.push(
    `Your portfolio has a health score of **${portfolio.healthScore}/100**, which is ${healthRating}. ` +
      `With ${portfolio.numHoldings} holding(s), here's what the numbers tell us:\n`
  );

  // Risk analysis
  lines.push("### Risk Profile\n");
  const volLevel =
    portfolio.annualVolatility > 0.3
      ? "high"
      : portfolio.annualVolatility > 0.15
        ? "moderate"
        : "low";
  lines.push(
    `- **Annual Volatility:** ${(portfolio.annualVolatility * 100).toFixed(1)}% (${volLevel} risk)`
  );
  lines.push(
    `- **Maximum Drawdown:** ${(portfolio.maxDrawdown * 100).toFixed(1)}% (the largest peak-to-trough decline in the past year)`
  );
  if (portfolio.var95) {
    lines.push(
      `- **Value at Risk (95%):** On 5% of trading days, you could lose approximately $${portfolio.var95.toFixed(0)} or more\n`
    );
  }

  // Return analysis
  lines.push("### Return & Risk-Adjusted Performance\n");
  lines.push(
    `- **Expected Annual Return:** ${(portfolio.expectedAnnualReturn * 100).toFixed(1)}%`
  );
  if (portfolio.sharpeRatio !== null) {
    const sharpeQuality =
      portfolio.sharpeRatio > 1
        ? "good"
        : portfolio.sharpeRatio > 0.5
          ? "acceptable"
          : portfolio.sharpeRatio > 0
            ? "below average"
            : "negative (returns don't justify the risk)";
    lines.push(
      `- **Sharpe Ratio:** ${portfolio.sharpeRatio.toFixed(2)} (${sharpeQuality})\n`
    );
  }

  // Diversification
  lines.push("### Diversification\n");
  const divLevel =
    portfolio.diversificationScore > 70
      ? "well diversified"
      : portfolio.diversificationScore > 40
        ? "moderately diversified"
        : "concentrated";
  lines.push(
    `- **Diversification Score:** ${portfolio.diversificationScore.toFixed(0)}/100 (${divLevel})`
  );
  lines.push(
    `- **Top Holding Weight:** ${(portfolio.topHoldingWeight * 100).toFixed(1)}%`
  );
  lines.push(
    `- **HHI Index:** ${portfolio.diversificationHHI.toFixed(3)} (lower is more diversified)\n`
  );

  // Sector breakdown
  if (sectors.length > 0) {
    lines.push("### Sector Exposure\n");
    const topSector = sectors.reduce((a, b) => (a.weight > b.weight ? a : b));
    lines.push(
      `Your portfolio is most exposed to **${topSector.sector}** at ${(topSector.weight * 100).toFixed(1)}%.\n`
    );
  }

  // Suggestions
  lines.push("### Suggestions\n");

  if (portfolio.topHoldingWeight > 0.4) {
    lines.push(
      `- Consider reducing your largest position (${(portfolio.topHoldingWeight * 100).toFixed(0)}%) to lower concentration risk`
    );
  }

  if (portfolio.diversificationScore < 50 && portfolio.numHoldings < 10) {
    lines.push(
      "- Adding more positions could improve diversification and reduce idiosyncratic risk"
    );
  }

  if (portfolio.annualVolatility > 0.25) {
    lines.push(
      "- Consider adding some lower-volatility assets (bonds, dividend stocks) to reduce overall portfolio risk"
    );
  }

  if (sectors.length === 1 || sectors.filter((s) => s.weight > 0.5).length > 0) {
    lines.push(
      "- Your sector concentration is high—consider adding exposure to other sectors for better diversification"
    );
  }

  if (portfolio.sharpeRatio !== null && portfolio.sharpeRatio < 0.5) {
    lines.push(
      "- The risk-adjusted return could be improved by either increasing expected returns or reducing volatility"
    );
  }

  lines.push("\n---\n*This is an educational analysis based on historical data. Past performance does not guarantee future results. This is not personalized financial advice.*");

  return lines.join("\n");
}

