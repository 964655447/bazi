import { useState } from "react";
import { BaziChartResult } from "../types";
import { compileBazi } from "../utils/astronomy";

interface FlowingTimeCardProps {
  baziResult: BaziChartResult;
  onTargetDateChange: (newBaziResult: BaziChartResult) => void;
}

export default function FlowingTimeCard({ baziResult, onTargetDateChange }: FlowingTimeCardProps) {
  const { flowingTime, birthTimeG, longitude, cityName, gender } = baziResult;

  const [testDate, setTestDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  const handleTestDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDate) return;
    
    // Maintain the same birth coordinates and gender, but calculate flowing years/months/days for this selected testDate!
    const parts = testDate.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    // Create UTC Noon date representation to prevent offset issues
    const targetDateObj = new Date(y, m - 1, d, 12, 0, 0);
    const recompiled = compileBazi(birthTimeG, longitude, cityName, gender, targetDateObj);
    onTargetDateChange(recompiled);
  };

  return (
    <div className="bg-white/95 border border-amber-900/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-amber-900/5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-amber-900/10 pb-4 gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-serif font-black text-amber-950 flex items-center gap-2">
            <span>◇</span> 岁运流转（流年、流月、流日）
          </h3>
          <p className="text-xs md:text-sm text-amber-900/60 mt-1 font-semibold font-sans">
            "流年为天，流月为辅"：观察大运与当前时间的互动关系
          </p>
        </div>

        {/* Date Selector to test target day fortunes */}
        <form onSubmit={handleTestDateSubmit} className="flex flex-wrap items-center gap-2.5">
          <label className="text-xs md:text-sm font-bold text-amber-900/70">评测目标公历：</label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="bg-[#fcfaf2] border border-amber-900/20 rounded-lg px-3 py-2 text-xs md:text-sm text-amber-950 max-w-[155px]"
          />
          <button
            type="submit"
            className="bg-[#b22222] hover:bg-red-800 text-white text-xs md:text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer font-bold"
          >
            校准此时
          </button>
        </form>
      </div>

      {/* Grid displaying the flows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Flowing Year */}
        <div className="bg-[#fcfaf2]/40 border border-amber-900/20 rounded-xl p-5 md:p-6 space-y-4 flex flex-col justify-between hover:border-amber-900/30 hover:shadow-sm transition-all text-center">
          <div className="text-xs font-extrabold text-amber-900/70 uppercase tracking-widest font-sans">
            流年运宿
          </div>
          <div className="space-y-1.5">
            <div className="text-4xl md:text-5xl font-black font-serif text-amber-950">
              {flowingTime.year}
            </div>
            <div className="text-xs md:text-sm bg-amber-50 rounded-full border border-amber-900/20 text-amber-950 px-3.5 py-1 inline-block font-extrabold shadow-2xs">
              {flowingTime.yearTenGod}
            </div>
          </div>
          <div className="border-t border-dashed border-amber-900/20 pt-3 text-xs md:text-sm text-amber-900/80 font-serif font-bold">
            纳音意象：{flowingTime.yearNayin}
          </div>
        </div>

        {/* Flowing Month */}
        <div className="bg-[#fcfaf2]/40 border border-amber-900/20 rounded-xl p-5 md:p-6 space-y-4 flex flex-col justify-between hover:border-amber-900/30 hover:shadow-sm transition-all text-center">
          <div className="text-xs font-extrabold text-amber-900/70 uppercase tracking-widest font-sans">
            流月起运
          </div>
          <div className="space-y-1.5">
            <div className="text-4xl md:text-5xl font-black font-serif text-amber-950">
              {flowingTime.month}
            </div>
            <div className="text-xs md:text-sm bg-amber-50 rounded-full border border-amber-900/20 text-amber-950 px-3.5 py-1 inline-block font-extrabold shadow-2xs">
              {flowingTime.monthTenGod}
            </div>
          </div>
          <div className="border-t border-dashed border-amber-900/20 pt-3 text-xs md:text-sm text-amber-900/80 font-serif font-bold">
            本月地支司职，主情绪意觉
          </div>
        </div>

        {/* Flowing Day */}
        <div className="bg-[#fcfaf2]/40 border border-amber-900/20 rounded-xl p-5 md:p-6 space-y-4 flex flex-col justify-between hover:border-amber-900/30 hover:shadow-sm transition-all text-center">
          <div className="text-xs font-extrabold text-amber-900/70 uppercase tracking-widest font-sans">
            流日司局
          </div>
          <div className="space-y-1.5">
            <div className="text-4xl md:text-5xl font-black font-serif text-amber-950">
              {flowingTime.day}
            </div>
            <div className="text-xs md:text-sm bg-amber-50 rounded-full border border-amber-900/20 text-amber-950 px-3.5 py-1 inline-block font-extrabold shadow-2xs">
              {flowingTime.dayTenGod}
            </div>
          </div>
          <div className="border-t border-dashed border-amber-900/20 pt-3 text-xs md:text-sm text-amber-900/80 font-serif font-bold">
            值日主事，主事端感应、交友行为
          </div>
        </div>
      </div>
    </div>
  );
}
