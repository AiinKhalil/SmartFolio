# AI Portfolio Doctor

> Paste your stock/ETF portfolio and get an instant, math-backed diagnosis of its risk, diversification, and health, plus plain-English recommendations.

![AI Portfolio Doctor](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- **Real Market Data** - Fetches actual historical prices from Yahoo Finance
- **Quantitative Analysis** - Computes real finance metrics (returns, volatility, Sharpe ratio, drawdown)
- **Diversification Metrics** - HHI index, sector allocation, concentration analysis
- **Risk Assessment** - Value at Risk (VaR), maximum drawdown, volatility analysis
- **Composite Health Score** - 0-100 score combining multiple risk/return factors
- **AI-Powered Insights** - Natural language explanations and recommendations (via OpenAI)
- **Beautiful Dashboard** - Modern, glassmorphic FinTech UI with interactive charts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, for AI explanations)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SmartFolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

> Note: The app works without an OpenAI key, but will show a fallback analysis instead of AI-generated insights.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Usage

Enter your portfolio holdings in the text area using this format:

```
AAPL 30%
NVDA 20%
VOO 50%
```

Or as decimals:
```
AAPL 0.3
MSFT 0.25
GOOGL 0.25
TLT 0.2
```

Click "Analyze Portfolio" to get your analysis!

## 🧮 Finance Math

All quantitative calculations are performed deterministically in TypeScript:

### Per-Asset Metrics
- **Daily Log Returns**: `r_t = ln(P_t / P_{t-1})`
- **Annualized Return**: `μ_annual = mean_daily_return × 252`
- **Annualized Volatility**: `σ_annual = std_daily × √252`

### Portfolio Metrics
- **Portfolio Return**: `μ_p = Σ(w_i × μ_i)`
- **Portfolio Volatility**: `σ_p = √(w^T × Σ × w)` (using covariance matrix)
- **Sharpe Ratio**: `(μ_p - r_f) / σ_p` (r_f = 4% assumed)
- **Maximum Drawdown**: Peak-to-trough decline from value series
- **HHI Index**: `Σ(w_i²)` for concentration measurement
- **Value at Risk (95%)**: `1.645 × σ_daily × portfolio_value`

### Health Score
Composite 0-100 score based on:
- Diversification score (30%)
- Volatility score (20%)
- Drawdown score (20%)
- Sharpe ratio score (30%)

## 🏗️ Project Structure

```
SmartFolio/
├── app/
│   ├── api/
│   │   └── analyzePortfolio/
│   │       └── route.ts      # Main API endpoint
│   ├── globals.css           # Tailwind + custom styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   ├── PortfolioInputCard.tsx
│   ├── MetricsOverview.tsx
│   ├── RiskGauge.tsx
│   ├── DiversificationChart.tsx
│   ├── SectorAllocationChart.tsx
│   ├── DrawdownChart.tsx
│   ├── DiagnosisPanel.tsx
│   ├── LoadingState.tsx
│   └── ErrorAlert.tsx
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── parser.ts             # Portfolio text parser
│   ├── finance.ts            # Finance math functions
│   ├── yahoo.ts              # Yahoo Finance integration
│   └── llm.ts                # OpenAI integration
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Market Data**: yahoo-finance2
- **AI**: OpenAI GPT-4o-mini

## ⚠️ Disclaimer

This tool is for **educational purposes only**. It is not financial advice. Past performance does not guarantee future results. Always consult a licensed financial advisor before making investment decisions.

## 📝 License

MIT License - feel free to use this for your portfolio projects!

---

Built with ❤️ as a portfolio project demonstrating full-stack development, quantitative finance, and product design skills.

