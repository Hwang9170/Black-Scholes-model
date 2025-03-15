"use client";

import { useEffect, useState } from "react";

// 🎯 ETF 데이터 타입 정의
type EtfItem = {
  sector: string;
  etf: string;
  optionPrice: number;
  topHoldings: string[];
};

export default function Page() {
  const [data, setData] = useState<EtfItem[]>([]);

  // 📡 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/etf-data");
        const json = await res.json();
        console.log("[DEBUG] ETF DATA:", json);
        setData(json);
      } catch (error) {
        console.error("ETF API fetch error:", error);
      }
    };
    fetchData();
  }, []);

  // 🎨 옵션 가격 기반 색상
  const getColor = (value: number) => {
    if (value > 15) return "bg-red-600";
    if (value > 10) return "bg-orange-500";
    if (value > 7) return "bg-yellow-400";
    return "bg-green-500";
  };

  // 📊 섹터 기준 그룹핑
  const groupedBySector: { [sector: string]: EtfItem[] } = {};
  data.forEach((item) => {
    if (!groupedBySector[item.sector]) groupedBySector[item.sector] = [];
    groupedBySector[item.sector].push(item);
  });

  return (
    <main className="min-h-screen p-10 bg-gray-900 text-white font-sans">
      <h1 className="text-4xl font-bold text-center mb-6">📊 ETF Sector Heatmap</h1>

      {/* 📘 설명 영역 */}
      <div className="text-center text-sm text-gray-300 max-w-3xl mx-auto mb-10">
        <p>
          본 히트맵은 ETF별 대표 종목들의 시세 및 변동성을 기반으로 <span className="font-semibold">Black-Scholes 모델</span>을 이용해 옵션 가격을 계산한 결과를 시각화한 것입니다.
        </p>
        <div className="mt-4 text-sm bg-gray-800 p-4 rounded-lg text-gray-100">
          <p className="mb-2">📐 <span className="underline">Black-Scholes Option Pricing Formula:</span></p>
          <pre className="whitespace-pre-wrap text-sm">
Call Option Price = S × N(d₁) - K × e^(-rT) × N(d₂)
Put Option Price  = K × e^(-rT) × N(-d₂) - S × N(-d₁)

여기서,
d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)
d₂ = d₁ - σ√T
          </pre>
        </div>
      </div>

      {/* 📦 히트맵 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(groupedBySector).map(([sector, etfs]) => (
          <div key={sector} className="bg-gray-800 p-4 rounded-2xl shadow-md h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">{sector}</h2>
            <div className="grid grid-cols-1 gap-3">
              {etfs.map((etfItem, idx) => (
                <div
                  key={idx}
                  className={`relative group w-full rounded-xl p-4 transition transform hover:scale-105 shadow-lg flex flex-col justify-between ${getColor(etfItem.optionPrice)}`}
                >
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight">{etfItem.etf}</h3>
                    <p className="text-sm">옵션가: ${etfItem.optionPrice.toFixed(2)}</p>
                    <p className="text-xs mt-1 text-gray-100">
                      {etfItem.etf}는 {sector} 섹터를 대표하는 ETF로, 주요 종목들의 변동성에 따라 시장 기대감을 반영합니다.
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-90 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 p-4 z-10 text-xs flex flex-col justify-center items-center text-white">
                    <p className="font-semibold mb-1">📌 대표 종목</p>
                    <ul className="list-disc list-inside text-center mb-2">
                      {etfItem.topHoldings.map((stock, i) => (
                        <li key={i}>{stock}</li>
                      ))}
                    </ul>
                  
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}