import { BaziChartResult } from "../types";

interface DaYunTimelineProps {
  baziResult: BaziChartResult;
}

export default function DaYunTimeline({ baziResult }: DaYunTimelineProps) {
  const { daYun } = baziResult;

  return (
    <div className="bg-white/95 border border-amber-900/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-amber-900/5 space-y-6">
      {/* Da Yun Header / Information block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-amber-900/10 pb-4 gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
            <span>◇</span> 大运起程气数 timeline
          </h3>
          <p className="text-xs text-amber-900/50 mt-1 font-sans">
            "一命运双行"：大运主管十年吉凶祸福势位
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300/30 rounded-xl px-5 py-3 text-sm text-amber-950 flex items-center gap-4">
          <div className="border-r border-amber-900/10 pr-4">
            <span className="text-[10px] uppercase font-sans tracking-wide text-amber-900/50 block">起运时间</span>
            <span className="font-extrabold text-[#b22222] text-base">{daYun.transitAgeDescription}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-sans tracking-wide text-amber-900/50 block">精确公历交运</span>
            <span className="font-bold text-amber-950 font-mono">{daYun.transitExactDate}</span>
          </div>
        </div>
      </div>

      {/* Da Yun Cycles Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {daYun.cycles.map((item) => (
          <div
            key={item.index}
            className="bg-[#fcfaf2]/30 border border-amber-900/10 rounded-xl p-3 text-center space-y-2.5 hover:border-[#b22222]/30 hover:bg-[#fcfaf2]/60 hover:shadow-md transition-all group"
          >
            {/* Number of Da Yun */}
            <div className="text-[10px] text-amber-900/40 uppercase font-sans tracking-tight">
              第 {item.index} 步大运
            </div>

            {/* Pillar Name */}
            <div className="space-y-0.5">
              <div className="text-2xl font-black font-serif text-amber-950 group-hover:text-[#b22222] transition-colors">
                {item.stem}{item.branch}
              </div>
              <div className="text-[10px] text-amber-900 bg-white/75 border border-amber-900/5 rounded-full inline-block px-2 py-0.5 font-bold scale-90">
                {item.tenGod}
              </div>
            </div>

            <div className="border-t border-dashed border-amber-900/5 pt-2 text-[10px] md:text-sm font-sans space-y-1">
              {/* Ages */}
              <div>
                <span className="text-[9px] text-amber-900/40 block leading-tight">起运岁数</span>
                <span className="font-extrabold text-[#b22222] font-mono">{item.startAge} 岁</span>
              </div>
              
              {/* Year */}
              <div>
                <span className="text-[9px] text-amber-900/40 block leading-tight">起运西元</span>
                <span className="font-bold text-amber-950/80 font-mono">{item.startYear} 年</span>
              </div>

              {/* Star Fortune (十二长生) */}
              <div className="border-t border-amber-900/5 pt-1.5 mt-1.5 space-y-0.5">
                <span className="text-[9px] text-amber-900/40 block leading-none">星运</span>
                <span className="text-amber-900 font-serif font-extrabold text-[11px] block">{item.changsheng}</span>
              </div>

              {/* Nayin (纳音) */}
              <div className="text-[9px] text-amber-900/50 font-serif truncate" title={item.nayin}>
                {item.nayin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
