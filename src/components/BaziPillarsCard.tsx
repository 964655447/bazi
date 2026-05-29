import { BaziChartResult, Pillar } from "../types";

interface BaziPillarsCardProps {
  baziResult: BaziChartResult;
}

// Map five elements to Tailwind colors for professional visual tracking
const getElementStyle = (element: string) => {
  switch (element) {
    case "木":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/50";
    case "火":
      return "bg-rose-50 text-rose-800 border-rose-200/50";
    case "土":
      return "bg-amber-100/50 text-amber-900 border-amber-300/40";
    case "金":
      return "bg-zinc-100 text-zinc-800 border-zinc-300/60";
    case "水":
      return "bg-sky-50 text-sky-800 border-sky-200/50";
    default:
      return "bg-gray-50 text-gray-800 border-gray-200";
  }
};

export default function BaziPillarsCard({ baziResult }: BaziPillarsCardProps) {
  const { fourPillars, gender } = baziResult;

  const pillarsList = [
    { key: "year", label: "年柱", pillar: fourPillars.year, mainField: "根基 / 祖先" },
    { key: "month", label: "月柱", pillar: fourPillars.month, mainField: "气象 / 父母" },
    { key: "day", label: "日柱", pillar: fourPillars.day, mainField: "殿堂 / 己身 (命主)" },
    { key: "hour", label: "时柱", pillar: fourPillars.hour, mainField: "子息 / 晚景" }
  ];

  return (
    <div className="bg-white/95 border border-amber-900/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-amber-900/5 space-y-6">
      {/* Time overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfaf2]/60 border border-amber-900/10 rounded-xl p-4 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-950 text-[#fcfaf2] px-2 py-0.5 rounded font-bold font-serif">公历</span>
            <span className="text-sm font-bold text-amber-950 font-mono">{baziResult.birthTimeG}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#b22222] text-[#fcfaf2] px-2 py-0.5 rounded font-bold font-serif">真太阳时</span>
            <span className="text-sm font-extrabold text-[#b22222] font-mono">{baziResult.birthTimeLST}</span>
          </div>
        </div>
        <div className="text-xs md:text-right text-amber-900/70 space-y-0.5 font-sans">
          <p>
            经纬校正：<strong className="text-amber-950 font-mono">{baziResult.longitude.toFixed(2)}°E</strong> ({baziResult.cityName})
          </p>
          <p>
            格局属性：<strong className="text-amber-950 font-serif">{gender === "男" ? "乾造 (阳男命)" : "坤造 (阴女命)"}</strong>
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div>
        <h3 className="text-lg font-serif font-bold text-amber-950 mb-4 flex items-center gap-2">
          <span>◇</span> 生辰命理八字大盘
        </h3>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-5">
          {pillarsList.map((col, idx) => {
            const isDayMaster = col.key === "day";
            const elementStyleS = getElementStyle(col.pillar.stem.element);
            const elementStyleB = getElementStyle(col.pillar.branch.element);

            return (
              <div
                key={col.key}
                className={`border rounded-2xl flex flex-col overflow-hidden text-center transition-all ${
                  isDayMaster
                    ? "border-[#b22222] bg-red-50/10 ring-2 ring-[#b22222]/10 shadow-lg"
                    : "border-amber-900/10 bg-white"
                }`}
              >
                {/* Pillar Header */}
                <div className={`py-3 text-xs md:text-sm font-serif font-black ${
                  isDayMaster ? "bg-[#b22222] text-[#fcfaf2]" : "bg-amber-950 text-[#fcfaf2]"
                }`}>
                  {col.label}
                  <span className="block text-[11px] opacity-90 font-bold font-sans mt-0.5">{col.mainField}</span>
                </div>

                {/* Main Star (Ten God) */}
                <div className="py-3 border-b border-dashed border-amber-900/10 text-xs sm:text-sm md:text-base font-black text-amber-950 bg-amber-50/10">
                  {isDayMaster ? <span className="text-[#b22222] font-serif underline decoration-wavy">日主 (己身)</span> : col.pillar.stem.tenGod}
                </div>

                {/* Heavenly Stem Display */}
                <div className={`p-4 md:p-5 border-b border-dashed border-amber-900/10 flex flex-col items-center gap-1.5 ${elementStyleS}`}>
                  <span className="text-3xl md:text-5xl font-black font-serif tracking-tight">{col.pillar.stem.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-white/70 text-amber-950 font-bold leading-none">
                    {col.pillar.stem.polarity}{col.pillar.stem.element}
                  </span>
                </div>

                {/* Earthly Branch Display */}
                <div className={`p-4 md:p-5 border-b border-dashed border-amber-900/10 flex flex-col items-center gap-1.5 ${elementStyleB}`}>
                  <span className="text-3xl md:text-5xl font-black font-serif tracking-tight">{col.pillar.branch.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-white/70 text-amber-950 font-bold leading-none">
                    {col.pillar.branch.polarity}{col.pillar.branch.element}
                  </span>
                </div>

                {/* Celestial Fortune Stage (星运) */}
                <div className="py-3 bg-amber-50/20 text-xs sm:text-sm text-amber-950 font-extrabold border-b border-dashed border-amber-900/10">
                  <span className="text-[11px] font-bold text-amber-900/60 block leading-none mb-1">十二星运</span>
                  <span className="text-[#b22222] font-serif font-black text-xs sm:text-sm">{col.pillar.branch.changsheng}</span>
                </div>

                {/* Earthly Branch Hidden Stems (地支藏干) */}
                <div className="p-2 sm:p-3 border-b border-dashed border-amber-900/10 space-y-2 text-left text-xs text-amber-950 font-sans min-h-[105px] flex flex-col justify-start">
                  <span className="text-[11px] font-bold text-amber-900/60 text-center block mb-1">藏干副星</span>
                  {col.pillar.branch.hiddenStems.map((hs, hidx) => (
                    <div
                      key={hidx}
                      className={`flex justify-between items-center text-xs px-2 py-0.5 rounded ${
                        hs.isPrincipal 
                          ? "bg-amber-100 border border-amber-900/20 font-black text-amber-950" 
                          : "text-amber-900 font-medium"
                      }`}
                    >
                      <span className="font-serif font-black">{hs.name} <span className="font-bold opacity-80 text-[10px]">{hs.isPrincipal && "主"}</span></span>
                      <span className="font-semibold">{hs.tenGod}</span>
                    </div>
                  ))}
                </div>

                {/* Self Sitting (自坐) */}
                <div className="py-3 bg-[#fcfaf2]/40 text-left px-2 sm:px-3 border-b border-dashed border-amber-900/10 text-xs text-amber-900 space-y-1.5 font-sans font-medium">
                  <div>
                    <span className="text-[11px] font-bold text-amber-900/60 block leading-tight">自坐星运</span>
                    <span className="font-black text-amber-950 font-serif leading-none mt-0.5 block">{col.pillar.selfSitting.changsheng}</span>
                  </div>
                  {!isDayMaster && (
                    <div>
                      <span className="text-[11px] font-bold text-amber-900/60 block leading-tight">自坐本气</span>
                      <span className="font-black text-amber-950 font-serif leading-none mt-0.5 block">{col.pillar.selfSitting.tenGod}</span>
                    </div>
                  )}
                </div>

                {/* Nayin (纳音) */}
                <div className="py-3 bg-[#fcfaf2]/20 border-b border-dashed border-amber-900/10 text-xs sm:text-sm font-serif font-black text-amber-950">
                  <span className="text-[11px] font-sans font-bold text-amber-900/60 block leading-none mb-1">纳音</span>
                  {col.pillar.nayin}
                </div>

                {/* Empty Void (空亡) */}
                <div className="py-3 bg-white text-xs sm:text-sm text-amber-800 font-extrabold border-b border-dashed border-amber-900/10">
                  <span className="text-[11px] font-sans font-bold text-amber-900/60 block leading-none mb-1">旬空</span>
                  {col.pillar.emptyVoid.length > 0 ? (
                    <span className="bg-red-50 text-red-800 px-1.5 py-0.5 rounded font-mono font-black border border-red-200">
                      {col.pillar.emptyVoid.join(", ")}
                    </span>
                  ) : (
                    "无"
                  )}
                </div>

                {/* Shensha (神煞) */}
                <div className="p-2 sm:p-3 bg-[#fcfaf2]/20 flex-1 flex flex-col justify-start gap-1.5 min-h-[150px]">
                  <span className="text-[11px] font-sans font-bold text-amber-900/60 text-center block mb-1">神煞印记</span>
                  {col.pillar.shensha.length > 0 ? (
                    col.pillar.shensha.map((s, sidx) => (
                      <span
                        key={sidx}
                        className="text-xs text-amber-950 bg-amber-100/50 border border-amber-900/10 py-1.5 px-2 rounded-md text-center block leading-tight font-serif font-bold truncate"
                        title={s}
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-amber-900/30 text-center block mt-2 font-mono italic">平和</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
