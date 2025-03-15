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
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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
    <main className="min-h-screen p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <h1 className="text-5xl font-extrabold text-center mb-10 tracking-tight">📊 ETF Sector Heatmap</h1>

      {/* 📘 설명 영역 */}
      <div className="text-center text-base text-gray-300 max-w-4xl mx-auto mb-14 leading-relaxed">
        <p>
          이 시각화는 각 ETF의 주요 종목 시세와 변동성 데이터를 바탕으로 금융공학의 핵심 이론인 <span className="font-semibold text-white">Black-Scholes 모델</span>을 적용하여 이론 옵션 가격을 도출한 것입니다.
          옵션 가격은 기대 수익률보다 변동성과 무위험이자율의 함수로 계산되며, 시장 참여자들의 심리 및 리스크 프리미엄을 반영하는 정량적 지표입니다.
        </p>
        <div className="mt-6 bg-gray-800 p-6 rounded-xl shadow-inner text-left text-sm text-gray-100">
          <p className="mb-3 font-medium text-lg text-white">📐 Black-Scholes Option Pricing Formula:</p>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
Call Option Price = S × N(d₁) - K × e^(-rT) × N(d₂)
Put Option Price  = K × e^(-rT) × N(-d₂) - S × N(-d₁)

where,
d₁ = [ln(S/K) + (r + σ² / 2) × T] / (σ√T)
d₂ = d₁ - σ√T
          </pre>
          <p className="mt-3 text-xs text-gray-400 italic">
            ※ 해당 모델은 유럽형 옵션에 한정되며, 시장이 완전히 효율적이고 거래비용이 없다는 가정 하에 작동합니다.
          </p>
        </div>
      </div>

      {/* 🕐 로딩 애니메이션 */}
      {loading ? (
        <div className="flex justify-center items-center h-[300px] animate-pulse">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">데이터 로딩 중입니다... 잠시만 기다려 주세요구르트</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedBySector).map(([sector, etfs]) => (
            <div key={sector} className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col h-full border border-gray-700 hover:border-white/40 transition">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2 text-center text-white tracking-wide">
                {sector}
              </h2>
              <div className="flex flex-col gap-4">
                {etfs.map((etfItem, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-xl p-4 flex flex-col justify-between transition hover:scale-[1.03] cursor-pointer ${getColor(etfItem.optionPrice)} shadow-inner`}
                  >
                    <div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight">{etfItem.etf}</h3>
                      <p className="text-sm text-white/90">옵션가: ${etfItem.optionPrice.toFixed(2)}</p>
                      <p className="text-xs mt-1 text-white/80">
                        {etfItem.etf}는 {sector} 섹터의 핵심 종목에 투자하는 ETF로, 옵션가는 해당 자산군의 기대 변동성과 시장 리스크 반영도를 보여줍니다.
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-90 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 p-4 z-10 text-xs flex flex-col justify-center items-center text-white backdrop-blur-sm">
                      <p className="font-semibold mb-2 text-white">📌 대표 종목 구성</p>
                      <ul className="list-disc list-inside text-center">
                        {etfItem.topHoldings.map((stock, i) => (
                          <li key={i}>{stock}</li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[11px] text-gray-300 text-center">
                        이들 종목은 해당 ETF의 옵션가격 결정에 있어 실질적인 민감도를 좌우하는 주요 자산입니다.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}