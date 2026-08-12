"use client";

import { useState } from "react";

export default function SizeChartsPage() {
  const [activeTab, setActiveTab] = useState<"footwear" | "apparel">("footwear");

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased select-none pb-24">
      {/* Header Banner */}
      <div className="relative bg-zinc-950 text-white py-16 md:py-24 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-16 relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#507c68] mb-2">Shopping Assistant</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            PRISTTO SIZE CHARTS
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-xl font-medium">
            Compare international sizing measurements to ensure you choose the perfect fit.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-10 md:mt-14">
        {/* Tab selector */}
        <div className="flex gap-2 justify-center border-b border-zinc-100 pb-6 mb-8">
          <button
            onClick={() => setActiveTab("footwear")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold border uppercase tracking-wider transition cursor-pointer ${
              activeTab === "footwear"
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-500 border-zinc-300 hover:border-black"
            }`}
          >
            Footwear (Shoes)
          </button>
          <button
            onClick={() => setActiveTab("apparel")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold border uppercase tracking-wider transition cursor-pointer ${
              activeTab === "apparel"
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-500 border-zinc-300 hover:border-black"
            }`}
          >
            Apparel (T-Shirts / Tops)
          </button>
        </div>

        {/* Charts tables */}
        {activeTab === "footwear" ? (
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase text-black">Footwear Sizing Comparison</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6">US (Men)</th>
                    <th className="py-4 px-6">UK</th>
                    <th className="py-4 px-6">EU</th>
                    <th className="py-4 px-6 text-right">Heel-to-Toe (CM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium text-zinc-700">
                  <tr>
                    <td className="py-4 px-6">7.0</td>
                    <td className="py-4 px-6">6.0</td>
                    <td className="py-4 px-6">40.0</td>
                    <td className="py-4 px-6 text-right">25.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6">8.0</td>
                    <td className="py-4 px-6">7.0</td>
                    <td className="py-4 px-6">41.0</td>
                    <td className="py-4 px-6 text-right">26.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6">9.0</td>
                    <td className="py-4 px-6">8.0</td>
                    <td className="py-4 px-6">42.5</td>
                    <td className="py-4 px-6 text-right">27.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6">10.0</td>
                    <td className="py-4 px-6">9.0</td>
                    <td className="py-4 px-6">44.0</td>
                    <td className="py-4 px-6 text-right">28.0 cm</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6">11.0</td>
                    <td className="py-4 px-6">10.0</td>
                    <td className="py-4 px-6">45.0</td>
                    <td className="py-4 px-6 text-right">29.0 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase text-black">Apparel Tops Sizing</h2>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <th className="py-4 px-6">Size Tag</th>
                    <th className="py-4 px-6">Chest (Inches)</th>
                    <th className="py-4 px-6">Waist (Inches)</th>
                    <th className="py-4 px-6 text-right">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium text-zinc-700">
                  <tr>
                    <td className="py-4 px-6 font-bold text-black">S</td>
                    <td className="py-4 px-6">35 - 37</td>
                    <td className="py-4 px-6">29 - 31</td>
                    <td className="py-4 px-6 text-right">27.5"</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-black">M</td>
                    <td className="py-4 px-6">38 - 40</td>
                    <td className="py-4 px-6">32 - 34</td>
                    <td className="py-4 px-6 text-right">28.5"</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-black">L</td>
                    <td className="py-4 px-6">41 - 43</td>
                    <td className="py-4 px-6">35 - 37</td>
                    <td className="py-4 px-6 text-right">29.5"</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-black">XL</td>
                    <td className="py-4 px-6">44 - 46</td>
                    <td className="py-4 px-6">38 - 40</td>
                    <td className="py-4 px-6 text-right">30.5"</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-bold text-black">XXL</td>
                    <td className="py-4 px-6">47 - 49</td>
                    <td className="py-4 px-6">41 - 43</td>
                    <td className="py-4 px-6 text-right">31.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
