// /pages/api/etf-data.ts
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { subDays } from 'date-fns';
import { blackScholes } from '@/utils/blackScholes';

export async function GET() {
  const r = 0.03;
  const T = 0.5;

  const etfList = [
    { sector: 'Technology', etf: 'XLK', holdings: ['AAPL', 'MSFT', 'NVDA'] },
    { sector: 'Healthcare', etf: 'XLV', holdings: ['JNJ', 'PFE', 'UNH'] },
    { sector: 'Finance', etf: 'XLF', holdings: ['JPM', 'BAC', 'WFC'] },
    { sector: 'Energy', etf: 'XLE', holdings: ['XOM', 'CVX', 'SLB'] },
    { sector: 'Consumer Discretionary', etf: 'XLY', holdings: ['AMZN', 'TSLA', 'HD'] },
    { sector: 'Communication', etf: 'XLC', holdings: ['GOOGL', 'META', 'VZ'] },
    { sector: 'Consumer Staples', etf: 'XLP', holdings: ['PG', 'KO', 'PEP'] },
    { sector: 'Industrials', etf: 'XLI', holdings: ['HON', 'UPS', 'CAT'] },
    { sector: 'Real Estate', etf: 'XLRE', holdings: ['PLD', 'O', 'AMT'] },
    { sector: 'Utilities', etf: 'XLU', holdings: ['NEE', 'DUK', 'SO'] },
    { sector: 'Large Cap', etf: 'SPY', holdings: ['AAPL', 'MSFT', 'AMZN'] },
  ];

  type EtfResult = {
    sector: string;
    etf: string;
    optionPrice: number;
    topHoldings: string[];
  };
  
  const result: EtfResult[] = [];
  const endDate = new Date();
  const startDate = subDays(endDate, 30);

  for (const etf of etfList) {
    let avgOptionPrice = 0;
    const topHoldings: string[] = [];

    for (const symbol of etf.holdings) {
      try {
        const quote = await yahooFinance.quote(symbol);
        const history = await yahooFinance.historical(symbol, {
          period1: startDate,
          period2: endDate,
        });

        const S = quote?.regularMarketPrice || 100;
        const K = S * 1.05;
        const sigma = calculateVolatility(history.map((h) => h.close));
        const optionPrice = blackScholes(S, K, T, r, sigma);

        avgOptionPrice += optionPrice;
        topHoldings.push(symbol);
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e);
      }
    }

    avgOptionPrice /= etf.holdings.length;

    result.push({
      sector: etf.sector,
      etf: etf.etf,
      optionPrice: avgOptionPrice,
      topHoldings,
    });
  }

  return NextResponse.json(result);
}

// 일일 로그 수익률 기반 변동성 계산 함수
function calculateVolatility(prices: number[]): number {
  if (!prices || prices.length < 2) return 0.2; // fallback
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const ret = Math.log(prices[i] / prices[i - 1]);
    returns.push(ret);
  }
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance * 252); // 연율화 (252일 기준)
}
