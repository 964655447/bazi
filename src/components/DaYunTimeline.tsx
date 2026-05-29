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
          <h3 className="text-lg md:text-xl font-serif font-black text-amber-950 flex items-center gap-2">
            <span>◇</span> 大运起程气数历程
          </h3>
          <p className="text-xs md:text-sm text-amber-900/60 mt-1 font-semibold font-sans">
            "一命运双行"：大运主管十年吉凶祸福势位
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300/35 rounded-xl px-5 py-3 text-sm text-amber-950 flex items-center gap-4">
          <div className="border-r border-amber-900/15 pr-4">
            <span className="text-xs uppercase font-sans tracking-wide text-amber-900/60 block font-bold">起运时间</span>
            <span className="font-extrabold text-[#b22222] text-base md:text-lg">{daYun.transitAgeDescription}</span>
          </div>
          <div>
            <span className="text-xs uppercase font-sans tracking-wide text-amber-900/60 block font-bold">精确公历交运</span>
            <span className="font-black text-amber-950 font-mono text-xs md:text-sm">{daYun.transitExactDate}</span>
          </div>
        </div>
      </div>

      {/* Da Yun Cycles Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {daYun.cycles.map((item) => (
          <div
            key={item.index}
            className="bg-[#fcfaf2]/30 border border-amber-900/15 rounded-xl p-3.5 text-center space-y-3 hover:border-[#b22222]/30 hover:bg-[#fcfaf2]/60 hover:shadow-md transition-all group"
          >
            {/* Number of Da Yun */}
            <div className="text-xs text-amber-900/60 uppercase font-sans tracking-tight font-extrabold">
              第 {item.index} 步大运
            </div>

            {/* Pillar Name */}
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-black font-serif text-amber-950 group-hover:text-[#b22222] transition-colors">
                {item.stem}{item.branch}
              </div>
              <div className="text-xs text-amber-900 bg-white border border-amber-900/10 rounded-full inline-block px-2.5 py-0.5 font-bold shadow-2xs">
                {item.tenGod}
              </div>
            </div>

            <div className="border-t border-dashed border-amber-900/10 pt-2 text-xs md:text-sm font-sans space-y-1.5">
              {/* Ages */}
              <div>
                <span className="text-[10.5px] font-bold text-amber-900/60 block leading-tight">起运岁数</span>
                <span className="font-black text-[#b22222] font-mono block text-xs md:text-sm mt-0.5">{item.startAge} 岁</span>
              </div>
              
              {/* Year */}
              <div>
                <span className="text-[10.5px] font-bold text-amber-900/60 block leading-tight">起运西元</span>
                <span className="font-black text-amber-950/90 font-mono block text-xs md:text-sm mt-0.5">{item.startYear} 年</span>
              </div>

              {/* Star Fortune (十二长生) */}
              <div className="border-t border-amber-900/10 pt-2 mt-2 space-y-0.5">
                <span className="text-[10.5px] font-bold text-amber-900/60 block leading-none">星运</span>
                <span className="text-[#b22222] font-serif font-black text-xs md:text-sm block mt-0.5">{item.changsheng}</span>
              </div>

              {/* Nayin (纳音) */}
              <div className="text-xs text-amber-900/70 font-serif truncate font-bold pt-1.5" title={item.nayin}>
                {item.nayin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
