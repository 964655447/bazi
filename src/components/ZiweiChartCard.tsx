import { useState, useEffect } from "react";
import { BaziChartResult } from "../types";
import { compileZiwei, ZWDSChart, ZWDSPalace } from "../utils/ziwei";
import { Compass, Sparkles, BookOpen, Clock, Activity, Calendar, HelpCircle, ArrowRight, Grid, Moon } from "lucide-react";

interface ZiweiChartCardProps {
  baziResult: BaziChartResult;
  name: string;
}

// Coordinate mapping for each of the 12 palaces in a 4x4 grid.
// Each cell represents a 25% * 25% section on the 100% stage,
// so the center is offset by (col + 0.5)*25 and (row + 0.5)*25.
const PALACE_CENTERS = [
  { x: 12.5, y: 87.5 }, // 0 (寅): c=0, r=3
  { x: 12.5, y: 62.5 }, // 1 (卯): c=0, r=2
  { x: 12.5, y: 37.5 }, // 2 (辰): c=0, r=1
  { x: 12.5, y: 12.5 }, // 3 (巳): c=0, r=0
  { x: 37.5, y: 12.5 }, // 4 (午): c=1, r=0
  { x: 62.5, y: 12.5 }, // 5 (未): c=2, r=0
  { x: 87.5, y: 12.5 }, // 6 (申): c=3, r=0
  { x: 87.5, y: 37.5 }, // 7 (酉): c=3, r=1
  { x: 87.5, y: 62.5 }, // 8 (戌): c=3, r=2
  { x: 87.5, y: 87.5 }, // 9 (亥): c=3, r=3
  { x: 62.5, y: 87.5 }, // 10 (子): c=2, r=3
  { x: 37.5, y: 87.5 }  // 11 (丑): c=1, r=3
];

const BOARD_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

const getBoshiStarColor = (starName: string): string => {
  switch (starName) {
    case "博士": return "text-indigo-800 bg-indigo-50 border border-indigo-200/50";
    case "力士": return "text-amber-800 bg-amber-50 border border-amber-200/50";
    case "青龙": return "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
    case "小耗": return "text-orange-700 bg-orange-50 border border-orange-200/40";
    case "将军": return "text-red-700 bg-red-50 border border-red-200/50";
    case "奏书": return "text-fuchsia-800 bg-fuchsia-50 border border-fuchsia-200/40";
    case "飞廉": return "text-cyan-800 bg-cyan-50 border border-cyan-200/40";
    case "喜神": return "text-pink-700 bg-pink-50 border border-pink-200/40";
    case "病符": return "text-stone-600 bg-stone-100 border border-stone-200/40";
    case "大耗": return "text-rose-800 bg-rose-50 border border-rose-200/50";
    case "伏兵": return "text-slate-600 bg-slate-50 border border-slate-200/40";
    case "官府": return "text-violet-800 bg-violet-50 border border-violet-200/50";
    default: return "text-stone-750 bg-stone-50 border border-stone-200";
  }
};

const getJiangqianStarColor = (starName: string): string => {
  switch (starName) {
    case "将星": return "text-rose-700 bg-rose-50 border border-rose-200/50 font-serif";
    case "攀鞍": return "text-amber-700 bg-amber-50 border border-amber-200/40 font-serif";
    case "岁驿": return "text-emerald-700 bg-emerald-50 border border-emerald-200/40 font-serif";
    case "息神": return "text-slate-600 bg-slate-100 border border-slate-200/30 font-serif";
    case "华盖": return "text-indigo-700 bg-indigo-50 border border-indigo-200/40 font-serif";
    case "劫煞": case "灾煞": case "天煞": return "text-red-700 bg-red-50 border border-red-200/40 font-serif";
    case "指背": return "text-orange-700 bg-orange-50 border border-orange-200/30 font-serif";
    case "咸池": return "text-pink-600 bg-pink-50 border border-pink-200/35 font-serif";
    case "月煞": return "text-violet-700 bg-violet-50 border border-violet-200/30 font-serif";
    case "亡神": return "text-teal-700 bg-teal-50 border border-teal-200/30 font-serif";
    default: return "text-blue-700 bg-blue-50 border border-blue-200/30 font-serif";
  }
};

const getSuiqianStarColor = (starName: string): string => {
  switch (starName) {
    case "岁建": return "text-red-700 bg-red-50 border border-red-200/50 font-serif";
    case "晦气": return "text-indigo-800 bg-indigo-50 border border-indigo-200/30 font-serif";
    case "丧门": case "贯索": return "text-slate-600 bg-slate-100 border border-slate-200/30 font-serif";
    case "官府": return "text-violet-700 bg-violet-50 border border-violet-200/40 font-serif";
    case "小耗": return "text-orange-750 bg-orange-50 border border-orange-200/30 font-serif";
    case "大耗": case "岁破": return "text-rose-850 bg-rose-50 border border-rose-200/50 font-serif";
    case "龙德": return "text-emerald-700 bg-emerald-50 border border-emerald-200/40 font-serif";
    case "白虎": return "text-amber-800 bg-amber-50 border border-amber-200/45 font-serif";
    case "天德": return "text-amber-600 bg-amber-50 border border-amber-200/35 font-serif";
    case "吊客": return "text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200/45 font-serif";
    case "病符": return "text-teal-700 bg-teal-50 border border-teal-200/40 font-serif";
    default: return "text-rose-700 bg-rose-50 border border-rose-200/35 font-serif";
  }
};

// Stable traditional brightness (庙旺平陷) rules
const getMiaoWang = (star: string, branchName: string): string => {
  if (star === "紫微") {
    if (["子", "午", "寅", "申", "巳", "亥"].includes(branchName)) return "庙";
    if (["卯", "酉", "辰", "戌", "丑", "未"].includes(branchName)) return "旺";
    return "平";
  }
  if (star === "天机") {
    if (["子", "午", "卯", "酉"].includes(branchName)) return "庙";
    if (["寅", "申"].includes(branchName)) return "得";
    return "陷";
  }
  if (star === "太阳") {
    if (["寅", "卯", "辰", "巳", "午", "未"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "武曲") {
    if (["子", "午", "辰", "戌", "丑", "未"].includes(branchName)) return "庙";
    return "平";
  }
  if (star === "天同") {
    if (["卯", "酉", "亥", "子", "巳"].includes(branchName)) return "庙";
    return "平";
  }
  if (star === "廉贞") {
    if (["寅", "申", "未", "丑"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "天府") {
    if (["子", "午", "寅", "申", "辰", "戌"].includes(branchName)) return "庙";
    return "旺";
  }
  if (star === "太阴") {
    if (["酉", "戌", "亥", "子", "丑"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "贪狼") {
    if (["子", "午", "寅", "申", "辰", "戌"].includes(branchName)) return "庙";
    return "平";
  }
  if (star === "巨门") {
    if (["子", "午", "寅", "申"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "天相") {
    if (["子", "午", "寅", "申"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "天梁") {
    if (["子", "午", "寅", "申", "辰", "戌"].includes(branchName)) return "庙";
    return "平";
  }
  if (star === "七杀") {
    if (["寅", "申", "子", "午"].includes(branchName)) return "庙";
    return "陷";
  }
  if (star === "破军") {
    if (["子", "午", "辰", "戌", "丑", "未"].includes(branchName)) return "庙";
    return "平";
  }
  const stableHash = (star.charCodeAt(0) + branchName.charCodeAt(0)) % 4;
  return ["庙", "旺", "平", "陷"][stableHash];
};

// Five Elements color class mapping
const getElementColorClass = (element: string) => {
  switch (element) {
    case "木": return "text-emerald-700 bg-emerald-50 border-emerald-100";
    case "火": return "text-rose-700 bg-rose-50 border-rose-100";
    case "土": return "text-amber-700 bg-amber-50 border-amber-100";
    case "金": return "text-zinc-600 bg-zinc-100 border-zinc-200";
    case "水": return "text-blue-700 bg-blue-50 border-blue-100";
    default: return "text-gray-700 bg-gray-50 border-gray-100";
  }
};

const getStemElement = (stem: string) => {
  if (["甲", "乙"].includes(stem)) return "木";
  if (["丙", "丁"].includes(stem)) return "火";
  if (["戊", "己"].includes(stem)) return "土";
  if (["庚", "辛"].includes(stem)) return "金";
  return "水";
};

const getBranchElement = (branch: string) => {
  if (["寅", "卯"].includes(branch)) return "木";
  if (["巳", "午"].includes(branch)) return "火";
  if (["辰", "戌", "丑", "未"].includes(branch)) return "土";
  if (["申", "酉"].includes(branch)) return "金";
  return "水";
};

const SIHUA_TABLE: { [key: string]: { lu: string; quan: string; ke: string; ji: string } } = {
  "甲": { lu: "廉贞", quan: "破军", ke: "武曲", ji: "太阳" },
  "乙": { lu: "天机", quan: "天梁", ke: "紫微", ji: "太阴" },
  "丙": { lu: "天同", quan: "天机", ke: "文昌", ji: "廉贞" },
  "丁": { lu: "太阴", quan: "天同", ke: "天机", ji: "巨门" },
  "戊": { lu: "贪狼", quan: "太阴", ke: "右弼", ji: "天机" },
  "己": { lu: "武曲", quan: "贪狼", ke: "天梁", ji: "文曲" },
  "庚": { lu: "太阳", quan: "武曲", ke: "太阴", ji: "天同" },
  "辛": { lu: "巨门", quan: "太阳", ke: "文曲", ji: "文昌" },
  "壬": { lu: "天梁", quan: "紫微", ke: "左辅", ji: "武曲" },
  "癸": { lu: "破军", quan: "巨门", ke: "太阴", ji: "贪狼" }
};

const getMutagen = (starName: string, yearGan: string): string | undefined => {
  const sihua = SIHUA_TABLE[yearGan];
  if (!sihua) return undefined;
  if (sihua.lu === starName) return "化禄";
  if (sihua.quan === starName) return "化权";
  if (sihua.ke === starName) return "化科";
  if (sihua.ji === starName) return "化忌";
  return undefined;
};

// Stable helper to convert Stem-Branch year of flowingTime into absolute calendar year based on birthYear
const getYearFromStemBranch = (gz: string, birthYear: number): number => {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const sIdx = stems.indexOf(gz.charAt(0));
  const bIdx = branches.indexOf(gz.charAt(1));
  if (sIdx === -1 || bIdx === -1) return 2026;
  
  for (let y = birthYear; y < birthYear + 100; y++) {
    const calcStem = (0 + (y - 2004) % 10 + 10) % 10;
    const calcBranch = (8 + (y - 2004) % 12 + 12) % 12;
    if (calcStem === sIdx && calcBranch === bIdx) {
      return y;
    }
  }
  return 2026;
};

export default function ZiweiChartCard({ baziResult, name }: ZiweiChartCardProps) {
  const chartData: ZWDSChart = compileZiwei(
    baziResult.birthTimeG,
    baziResult.longitude,
    baziResult.cityName,
    baziResult.gender,
    name || "未名缘主"
  );

  // Calculate dynamic polarity parameters
  const isYangYear = ["甲", "丙", "戊", "庚", "壬"].includes(chartData.yearGanZhi.charAt(0));
  const isClockwise = (chartData.gender === "男" && isYangYear) || (chartData.gender === "女" && !isYangYear);
  const mingBoardIdx = chartData.palaces.find((p) => p.isMingGong)?.branchIdx ?? 5;
  const birthBranch = chartData.yearGanZhi.slice(-1);
  const ybBoardIdx = BOARD_BRANCHES.indexOf(birthBranch) !== -1 ? BOARD_BRANCHES.indexOf(birthBranch) : 6;

  // 小限1岁所在宫位（根据出生年支查表，iztro规则）
  // BOARD_BRANCHES 索引: 0=寅,1=卯,2=辰,3=巳,4=午,5=未,6=申,7=酉,8=戌,9=亥,10=子,11=丑
  const getAge1Index = (birthBranchIdx: number): number => {
    // 寅午戌年 -> 辰宫(2); 申子辰年 -> 戌宫(8); 巳酉丑年 -> 未宫(5); 亥卯未年 -> 丑宫(11)
    if ([0, 4, 8].includes(birthBranchIdx)) return 2; // 寅午戌
    if ([6, 10, 2].includes(birthBranchIdx)) return 8; // 申子辰
    if ([3, 7, 11].includes(birthBranchIdx)) return 5; // 巳酉丑
    return 11; // 亥卯未
  };

  const age1Idx = getAge1Index(ybBoardIdx);

  // Safe read birthYear & currentTargetYear
  const birthYear = parseInt(baziResult.birthTimeG.split("-")[0]) || 1995;
  const currentTargetYear = getYearFromStemBranch(baziResult.flowingTime?.year || "丙午", birthYear);

  // Decades limits timeline starting at Ming Gong
  const decadalTimeline: { ageRange: string; gongName: string; limitName: string; palaceIdx: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const bIdx = isClockwise ? (mingBoardIdx + i) % 12 : (mingBoardIdx - i + 12) % 12;
    const pal = chartData.palaces.find((p) => p.branchIdx === bIdx);
    if (pal) {
      decadalTimeline.push({
        ageRange: `${pal.decadalStart}~${pal.decadalEnd}`,
        gongName: pal.palaceName.split("·")[0],
        limitName: `${pal.stemName}${pal.branchName}限`,
        palaceIdx: bIdx
      });
    }
  }

  // Initialize selectedPalace to Ming Gong so lines and details display by default
  const [selectedPalace, setSelectedPalace] = useState<ZWDSPalace | null>(() => {
    return chartData.palaces.find((p) => p.isMingGong) || chartData.palaces[0];
  });

  // Independent timeline selections & active focus level
  const [activeLevel, setActiveLevel] = useState<"board" | "decade" | "year" | "month" | "day" | "hour">("board");
  const [selectedDecadeIdx, setSelectedDecadeIdx] = useState<number | null>(null);
  const [selectedYearIdx, setSelectedYearIdx] = useState<number | null>(null);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number | null>(null);

  const [showFlowMonthDisclaimer, setShowFlowMonthDisclaimer] = useState<boolean>(false);

  // Calculate annualTimeline comprising the exactly 10 years of the selected Decade Limit or nominal current decade
  const targetVirtualAge = currentTargetYear - birthYear + 1;
  const nominalDecadeIdx = decadalTimeline.findIndex((item) => {
    const [start, end] = item.ageRange.split("~").map(Number);
    return targetVirtualAge >= start && targetVirtualAge <= end;
  });
  const activeDecadeForYears = selectedDecadeIdx !== null
    ? decadalTimeline[selectedDecadeIdx]
    : (nominalDecadeIdx !== -1 ? decadalTimeline[nominalDecadeIdx] : decadalTimeline[0]);

  const annualTimeline: { yearNum: number; gz: string; age: number; palaceIdx: number }[] = [];
  if (activeDecadeForYears) {
    const [startAge, endAge] = activeDecadeForYears.ageRange.split("~").map(Number);
    for (let age = startAge; age <= endAge; age++) {
      const yr = birthYear + age - 1;
      const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
      const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
      
      const sIdx = (0 + (yr - 2004) % 10 + 10) % 10;
      const bIdxFromZi = (8 + (yr - 2004) % 12 + 12) % 12;
      const branchChar = branches[bIdxFromZi];
      const bIdxBoard = BOARD_BRANCHES.indexOf(branchChar) !== -1 ? BOARD_BRANCHES.indexOf(branchChar) : 6;
      
      annualTimeline.push({
        yearNum: yr,
        gz: `${stems[sIdx]}${branchChar}`,
        age: age,
        palaceIdx: bIdxBoard
      });
    }
  }

  // Synchronize timelines to appropriate values when birthYear / targets change
  useEffect(() => {
    setSelectedDecadeIdx(null);
    setSelectedYearIdx(null);
    setSelectedMonthIdx(null);
    setSelectedDayIdx(null);
    setSelectedHourIdx(null);
    setActiveLevel("board");
  }, [baziResult, currentTargetYear]);

  // Sync selectedPalace if baziResult changes
  useEffect(() => {
    const mg = chartData.palaces.find((p) => p.isMingGong);
    if (mg) {
      setSelectedPalace(mg);
    }
  }, [baziResult]);

  // Determine activePalace based on active level of selection with cascading fallbacks
  const activePalace = (() => {
    if (activeLevel === "hour" && selectedHourIdx !== null) {
      const idx = (mingBoardIdx + selectedHourIdx) % 12;
      return chartData.palaces.find((p) => p.branchIdx === idx) || chartData.palaces[0];
    }
    if ((activeLevel === "day" || activeLevel === "hour") && selectedDayIdx !== null) {
      const idx = (mingBoardIdx + selectedDayIdx) % 12;
      return chartData.palaces.find((p) => p.branchIdx === idx) || chartData.palaces[0];
    }
    if ((activeLevel === "month" || activeLevel === "day" || activeLevel === "hour") && selectedMonthIdx !== null) {
      const idx = (mingBoardIdx + selectedMonthIdx) % 12;
      return chartData.palaces.find((p) => p.branchIdx === idx) || chartData.palaces[0];
    }
    if ((activeLevel === "year" || activeLevel === "month" || activeLevel === "day" || activeLevel === "hour") && selectedYearIdx !== null) {
      const idx = annualTimeline[selectedYearIdx]?.palaceIdx;
      return chartData.palaces.find((p) => p.branchIdx === idx) || chartData.palaces[0];
    }
    if ((activeLevel === "decade" || activeLevel === "year" || activeLevel === "month" || activeLevel === "day" || activeLevel === "hour") && selectedDecadeIdx !== null) {
      const idx = decadalTimeline[selectedDecadeIdx]?.palaceIdx;
      return chartData.palaces.find((p) => p.branchIdx === idx) || chartData.palaces[0];
    }
    return selectedPalace || chartData.palaces.find((p) => p.isMingGong) || chartData.palaces[0];
  })();

  // Calculate the San He (三合) and Dui Gong (对宫) indexes for the active palace
  const actIdx = activePalace.branchIdx;
  const oppositeIdx = (actIdx + 6) % 12;
  const alliedIdx1 = (actIdx + 4) % 12;
  const alliedIdx2 = (actIdx + 8) % 12;

  // Coordinates in percentage
  const ptA = PALACE_CENTERS[actIdx];
  const ptD = PALACE_CENTERS[oppositeIdx];
  const ptB = PALACE_CENTERS[alliedIdx1];
  const ptC = PALACE_CENTERS[alliedIdx2];

  // Helper detailed interpretations
  const getPalaceReading = (palace: ZWDSPalace) => {
    let reading = "";
    if (palace.majorStars.length === 0) {
      reading = `此【${palace.palaceName}】坐落于「${palace.branchName}」宫，没有极品主星入驻，属于中国传统命本理气中的「对宫借星」奇拔局。需要兼参对角即 ${BOARD_BRANCHES[(palace.branchIdx+6)%12]} 宫天盘能量之生合加持。`;
    } else {
      reading = `此【${palace.palaceName}】落于「${palace.branchName}」宫。岁干天盘坐守星曜：${palace.majorStars.join("、")}等主星同度合会，并带有「${palace.stemName}」干之先天使运与理气法则。`;
    }

    if (palace.isMingGong) {
      reading += " 命宫为命谱的核心，统御一身精气、性情格调、天资高低、以及一生的成败趋势。";
    } else if (palace.palaceName.includes("夫妻")) {
      reading += " 夫妻宫主宰命主的情感归宿、配偶相貌秉性、以及婚姻维系的深浅与福报。";
    } else if (palace.palaceName.includes("财帛")) {
      reading += " 财帛宫是先天然的财气港湾，主天赋求财模式、投资理智、成富等级及守财实力。";
    } else if (palace.palaceName.includes("官禄")) {
      reading += " 官禄宫代表事业官位、声名显露、行政专长、以及中老年求名创业的升降起落。";
    } else if (palace.palaceName.includes("福德")) {
      reading += " 福德宫主精神追求、安享清福的能力、福慧基础、以及精神情绪情志的舒缓与执念。";
    } else if (palace.palaceName.includes("迁移")) {
      reading += " 迁移宫主外出动静吉凶，社会外交、商贸差旅、以及在异乡求职安家的顺利与否。";
    } else if (palace.palaceName.includes("疾厄")) {
      reading += " 疾厄宫主管体魄状况、先天经络强弱，以及由于五行气血偏旺导致的调养预警。";
    }

    // Detail Sihua tags - get from major stars with mutagen
    const activeSihua = palace.majorStars
      .map(ms => ({ star: ms.name, mutagen: getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) }))
      .filter(s => s.mutagen)
      .map(s => `${s.star}${s.mutagen}`);
    if (activeSihua.length > 0) {
      reading += ` 在生辰天机交界中，此宫引动四化星曜：${activeSihua.join("、")}，主因果枢纽倾斜、名禄纠葛、属于重中之重的气机变化点。`;
    }

    return reading;
  };

  // Safe read bazi parameters
  const yearStem = baziResult.fourPillars?.year?.stem?.name || "甲";
  const yearBranch = baziResult.fourPillars?.year?.branch?.name || "申";
  const monthStem = baziResult.fourPillars?.month?.stem?.name || "戊";
  const monthBranch = baziResult.fourPillars?.month?.branch?.name || "辰";
  const dayStem = baziResult.fourPillars?.day?.stem?.name || "丙";
  const dayBranch = baziResult.fourPillars?.day?.branch?.name || "辰";
  const hourStem = baziResult.fourPillars?.hour?.stem?.name || "丁";
  const hourBranch = baziResult.fourPillars?.hour?.branch?.name || "酉";

  return (
    <div className="bg-[#FCFAF4] border-2 border-[#b0b095] rounded-3xl p-4 md:p-6 shadow-md space-y-6 text-[#4a4a40]" id="zwds_wenmo_layout">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#b0b095] pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-800 text-white font-serif text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-semibold shadow-xs">
              文墨大天盘
            </span>
            <h3 className="text-base md:text-lg font-serif font-extrabold text-[#5a5a40]">
              紫微十二命宫主宿三合大演盘
            </h3>
          </div>
          <p className="text-[11px] text-[#8a8a70] font-sans leading-relaxed">
            极化五行理数，点击任意宫位自动描摹 <strong className="text-amber-800">三方四正</strong> 天盘交界轨迹，融合星耀心性神断。
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF9F0] border border-[#d3d3b8] rounded-xl text-xs font-serif text-[#5a5a40] shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
          <span>{chartData.birthTimeL} (经度: E{baziResult.longitude.toFixed(1)}°)</span>
        </div>
      </div>

      {/* Grid stage covering 12 palaces + SVG overlay */}
      <div className="relative overflow-x-auto pb-6" id="ziwei_interactive_plane">
        <div className="min-w-[780px] max-w-[960px] mx-auto relative bg-[#FCFAF4] border-2 border-[#8a8a70] p-1.5 rounded-2xl aspect-square select-none">
          
          {/* SVG Overlay behind text, on top of central block to display connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow-opposite" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" opacity="0.6"/>
              </marker>
              <marker id="arrow-poly" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" opacity="0.5"/>
              </marker>
            </defs>

            {/* Polygon depicting the San He alliance triangle */}
            <polygon
              points={`${ptA.x}%,${ptA.y}% ${ptB.x}%,${ptB.y}% ${ptC.x}%,${ptC.y}%`}
              fill="rgba(139, 92, 246, 0.05)"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Line depicting direct opposition axis (对宫) */}
            <line
              x1={`${ptA.x}%`}
              y1={`${ptA.y}%`}
              x2={`${ptD.x}%`}
              y2={`${ptD.y}%`}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 3"
              markerEnd="url(#arrow-opposite)"
            />

            {/* Nodes highlighting vertices */}
            <circle cx={`${ptA.x}%`} cy={`${ptA.y}%`} r="6" fill="#8b5cf6" className="animate-pulse" />
            <circle cx={`${ptD.x}%`} cy={`${ptD.y}%`} r="5" fill="#ef4444" />
            <circle cx={`${ptB.x}%`} cy={`${ptB.y}%`} r="5" fill="#8b5cf6" />
            <circle cx={`${ptC.x}%`} cy={`${ptC.y}%`} r="5" fill="#8b5cf6" />
          </svg>

          {/* Twelve Palaces (巳 to 丑 border ring) */}
          <div className="absolute inset-1 grid grid-cols-4 grid-rows-4 gap-1 z-10">
            {chartData.palaces.map((palace) => {
              const hasSelected = activePalace?.branchIdx === palace.branchIdx;

              // Compute Twelve Chang Sheng status
              let csStartIdx = 6; // starts at 申 for 水二 and 土五
              if (chartData.mingJu.includes("木")) csStartIdx = 9; // 亥
              else if (chartData.mingJu.includes("金")) csStartIdx = 3; // 巳
              else if (chartData.mingJu.includes("火")) csStartIdx = 0; // 寅

              const stepsDiff = (palace.branchIdx - csStartIdx + 12) % 12;
              const csIdx = isClockwise ? stepsDiff : (12 - stepsDiff) % 12;
              const CHANG_SHENG_STEPS = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
              const csName = CHANG_SHENG_STEPS[csIdx];

              // Computes ages matrix
              // 流年：用流年地支每年逆时针递推一宫
              const yearBranchIdx = BOARD_BRANCHES.indexOf(yearBranch);
              const liunianBase = yearBranchIdx;

              const lAges = [];
              for (let j = 0; j < 6; j++) { // 显示6个流年年龄段
                lAges.push((palace.branchIdx - liunianBase + 12) % 12 + 1 + 12 * j);
              }

              // 小限：先为每个i从0-11生成age数组，再根据性别分配给宫位
              // 男性顺时针，女性逆时针
              const xAges = [];
              for (let i = 0; i < 12; i++) {
                // 计算当前i对应的宫位索引
                const idx = chartData.gender === "男"
                  ? (age1Idx + i + 12) % 12  // 男性：ageIdx+i 顺时针
                  : (age1Idx - i + 12) % 12; // 女性：ageIdx-i 逆时针
                
                if (idx === palace.branchIdx) {
                  for (let j = 0; j < 6; j++) { // 显示6个小限年龄段
                    xAges.push(12 * j + i + 1);
                  }
                  break;
                }
              }

              return (
                <button
                  key={palace.branchIdx}
                  type="button"
                  onClick={() => {
                    setSelectedPalace(palace);
                    setActiveLevel("board");
                  }}
                  style={{
                    gridRowStart: palace.gridPos.r + 1,
                    gridColumnStart: palace.gridPos.c + 1
                  }}
                  className={`flex flex-col justify-between p-2 rounded-xl text-left border cursor-pointer transition-all min-h-0 select-none relative ${
                    hasSelected
                      ? "bg-[#FAF7E8] border-[#9d4edd] shadow-md ring-2 ring-[#9d4edd]/20 z-10"
                      : "bg-white hover:bg-[#FCFBF8] border-[#c0c0ac] hover:scale-[1.01]"
                  } ${
                    palace.isMingGong
                      ? "bg-rose-50/15"
                      : ""
                  }`}
                >
                  {/* Upper portion: Columns of Vertical Stars */}
                  <div className="flex flex-row gap-1.5 select-none h-[100px] overflow-hidden pt-4">
                    {/* Column 1: Major Stars (Red/Vibrant, Bold) */}
                    {palace.majorStars.map((ms, msIdx) => {
                      const mw = ms.brightness || "平";
                      return (
                        <div key={msIdx} className="flex flex-col items-center border-r border-[#e5e5d5] last:border-0 pr-0.8 select-none font-serif">
                          <span className="font-black text-[#b91c1c] text-[13px] md:text-sm flex flex-col items-center justify-start leading-[13px] tracking-wide text-center">
                            {ms.name.split('').map((char, charIdx) => <span key={charIdx}>{char}</span>)}
                          </span>
                          <span className="text-[10.5px] font-black text-amber-900 leading-none mt-1.5 font-sans bg-amber-50 px-0.5 rounded-sm">
                            {mw}
                          </span>
                          {getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) && (
                            <span className={`text-[10px] font-sans font-bold leading-none w-4 h-4 flex items-center justify-center rounded-sm text-white mt-1.5 shadow-sm ${
                              getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化禄" ? "bg-emerald-600" :
                              getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化权" ? "bg-orange-600" :
                              getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化科" ? "bg-blue-600" :
                              "bg-rose-900"
                            }`}>
                              {getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化禄" ? "禄" :
                               getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化权" ? "权" :
                               getMutagen(ms.name, chartData.yearGanZhi.charAt(0)) === "化科" ? "科" : "忌"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {palace.majorStars.length === 0 && (
                      <span className="text-[#8a8a70]/60 text-[10.5px] font-serif font-bold italic self-center pl-2">
                        对宫借星
                      </span>
                    )}

                    {/* Column 2: Minor Stars - Soft/Auxiliary (Teal / Blue, Vertical) */}
                    {palace.minorStars.filter(s => s.type === "soft" || s.type === "lucun" || s.type === "tianma").map((ls, lsIdx) => {
                      return (
                        <div key={lsIdx} className="flex flex-col items-center pr-0.8 select-none font-serif">
                          <span className="font-extrabold text-[#15803d] text-[11.5px] md:text-xs flex flex-col items-center justify-start leading-[11px] tracking-normal">
                            {ls.name.split('').map((char, charIdx) => <span key={charIdx}>{char}</span>)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Column 3: Minor Stars - Tough/Harm (Dark Indigo/Orange, Vertical) */}
                    {palace.minorStars.filter(s => s.type === "tough").map((hs, hsIdx) => {
                      return (
                        <div key={hsIdx} className="flex flex-col items-center pr-0.8 select-none font-serif">
                          <span className="font-bold text-[#4f46e5] text-[11px] md:text-xs flex flex-col items-center justify-start leading-[11px] tracking-normal">
                            {hs.name.split('').map((char, charIdx) => <span key={charIdx}>{char}</span>)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Column 4: Adjective Stars (37/38杂星) - Small vertical text on the right */}
                    {palace.adjectiveStars.length > 0 && (
                      <div className="flex flex-row ml-auto pl-1 border-l border-[#e5e5d5]/50 gap-0.5 overflow-hidden">
                        {palace.adjectiveStars.map((as, asIdx) => (
                          <div key={asIdx} className="flex flex-col items-center select-none font-sans scale-[0.9] origin-top">
                            <span className="font-medium text-[#7c7c64] text-[9.5px] md:text-[10px] flex flex-col items-center justify-start leading-[9px] tracking-tight">
                              {as.name.split('').map((char, charIdx) => <span key={charIdx} className="leading-[9.5px]">{char}</span>)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 流年小限 - 放在星辰和分隔线之间，分两行 */}
                  <div className="flex flex-col text-[9px] text-[#5a5a4c] font-mono select-none px-1 mt-1 gap-0.5">
                    <span className="text-emerald-700 font-bold">流年:{lAges.join(",")}</span>
                    <span className="text-amber-700 font-bold">小限:{xAges.join(",")}</span>
                  </div>

                  {/* Cell footer: Decadal ages range, Palace Name, Chang Sheng step & coords */}
                  <div className="border-t border-[#e5e5d5] pt-1.5 mt-auto w-full">
                    {/* Palace Name and age range */}
                    <div className="flex items-baseline justify-between select-none">
                      <span className="text-xs md:text-[13.5px] font-serif font-black tracking-wide select-none text-rose-950">
                        {palace.palaceName === "命宫·身宫" ? "命 宫" : palace.palaceName}
                      </span>
                      <span className="text-xs md:text-[13px] font-mono font-black text-gray-800 tracking-tight">
                        {palace.decadalStart}~{palace.decadalEnd}
                      </span>
                    </div>

                    {/* Footer values: Chang sheng & Doctor & Jiangqian & Suiqian & Stem-Branch coordinate */}
                    <div className="flex justify-between items-center text-[10px] sm:text-[10.5px] md:text-xs text-[#5a5a40] mt-1 select-none leading-none gap-0.5">
                      <div className="flex flex-wrap items-center gap-0.5 max-w-[130px] sm:max-w-[155px] md:max-w-[185px]">
                        <span className="font-serif font-black text-[#16a34a] bg-stone-100/80 border border-stone-200/40 px-0.5 py-0.5 rounded-xs text-[9px] sm:text-[9.5px] md:text-[10px] leading-none select-none">
                          {csName}
                        </span>
                        {palace.boshi12 && (
                          <span className={`font-serif font-black px-0.5 py-0.5 rounded-xs text-[9px] sm:text-[9.5px] md:text-[10px] leading-none select-none ${getBoshiStarColor(palace.boshi12)}`}>
                            {palace.boshi12}
                          </span>
                        )}
                        {palace.jiangqian12 && (
                          <span className={`font-serif font-black px-0.5 py-0.5 rounded-xs text-[9px] sm:text-[9.5px] md:text-[10px] leading-none select-none ${getJiangqianStarColor(palace.jiangqian12)}`}>
                            {palace.jiangqian12}
                          </span>
                        )}
                        {palace.suiqian12 && (
                          <span className={`font-serif font-black px-0.5 py-0.5 rounded-xs text-[9px] sm:text-[9.5px] md:text-[10px] leading-none select-none ${getSuiqianStarColor(palace.suiqian12)}`}>
                            {palace.suiqian12}
                          </span>
                        )}
                      </div>
                      <span className="font-serif font-bold tracking-tight text-stone-700 shrink-0 text-[10px] sm:text-xs">
                        {palace.stemName}{palace.branchName}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Middle 2x2 Cell: Birth Info Block (中堂) nested strictly inside grid to respect row-start / col-start tracks */}
            <div className="col-span-2 row-span-2 col-start-2 row-start-2 bg-[#F6F5EE] border-2 border-dashed border-[#b0b095] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden z-10 shadow-inner">
              <div className="absolute -right-6 -bottom-6 opacity-3 pointer-events-none">
                <Compass className="w-36 h-36 text-[#5a5a40]" />
              </div>



              {/* Interactive Bazi Four Pillars Block directly inside Center Panel */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-amber-900/5 rounded-lg border border-[#e3e3cb] z-10">
                {/* Year Pillar */}
                <div className="flex flex-col items-center text-center font-serif py-1.5 rounded border border-dashed bg-white border-[#ebebe2] shadow-2xs">
                  <span className={`text-sm font-bold px-1 rounded-sm ${getElementColorClass(getStemElement(yearStem))}`}>
                    {yearStem}
                  </span>
                  <span className={`text-sm font-bold px-1 rounded-sm mt-0.5 ${getElementColorClass(getBranchElement(yearBranch))}`}>
                    {yearBranch}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-none font-bold">年柱</span>
                </div>
                
                {/* Month Pillar */}
                <div className="flex flex-col items-center text-center font-serif py-1.5 rounded border border-dashed bg-white border-[#ebebe2] shadow-2xs">
                  <span className={`text-sm font-bold px-1 rounded-sm ${getElementColorClass(getStemElement(monthStem))}`}>
                    {monthStem}
                  </span>
                  <span className={`text-sm font-bold px-1 rounded-sm mt-0.5 ${getElementColorClass(getBranchElement(monthBranch))}`}>
                    {monthBranch}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-none font-bold">月柱</span>
                </div>

                {/* Day Pillar */}
                <div className="flex flex-col items-center text-center font-serif py-1.5 rounded border border-dashed bg-white border-[#ebebe2] shadow-2xs">
                  <span className={`text-sm font-bold px-1 rounded-sm ${getElementColorClass(getStemElement(dayStem))}`}>
                    {dayStem}
                  </span>
                  <span className={`text-sm font-bold px-1 rounded-sm mt-0.5 ${getElementColorClass(getBranchElement(dayBranch))}`}>
                    {dayBranch}
                  </span>
                  <span className="text-[10px] text-rose-800 mt-1 leading-none font-extrabold">日坐</span>
                </div>

                {/* Hour Pillar */}
                <div className="flex flex-col items-center text-center font-serif py-1.5 rounded border border-dashed bg-white border-[#ebebe2] shadow-2xs">
                  <span className={`text-sm font-bold px-1 rounded-sm ${getElementColorClass(getStemElement(hourStem))}`}>
                    {hourStem}
                  </span>
                  <span className={`text-sm font-bold px-1 rounded-sm mt-0.5 ${getElementColorClass(getBranchElement(hourBranch))}`}>
                    {hourBranch}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-1 leading-none font-bold">时柱</span>
                </div>
              </div>

              {/* Basic Info Elements */}
              <div className="text-[11.5px] md:text-xs font-serif text-[#4a4a40] space-y-1.5 px-2 py-1.5 rounded bg-[#FAF9F0] border border-[#ebebe2]">
                <div className="flex justify-between font-bold">
                  <span>缘主: <strong className="text-amber-950 font-black">{chartData.name}</strong> ({chartData.gender === "男" ? "至坚乾造" : "温厚坤造"})</span>
                  <span>局命: <strong className="text-rose-900 font-extrabold">{chartData.mingJu}</strong></span>
                </div>
                <div className="flex justify-between text-gray-800 font-medium">
                  <span>命守护: <strong className="text-emerald-800 font-bold">{chartData.mingZhu}</strong></span>
                  <span>身守护: <strong className="text-emerald-800 font-bold">{chartData.shenZhi}</strong></span>
                </div>
                <div className="text-[11px] text-gray-600 truncate border-t border-dashed border-[#ebebe2] pt-1 mt-0.5">
                  生肖纳音: {chartData.yearGanZhi}年
                </div>
              </div>

              {/* Self-transformation flowchart indicator (自化图示) strictly drawn in the bottom center */}
              <div className="text-xs text-center bg-white/60 p-1.5 rounded border border-[#ebebe2] select-none font-serif flex items-center justify-center gap-1.5 font-bold">
                <span className="text-gray-600">自化图示</span>
                <span className="text-emerald-600 font-black">禄→</span>
                <span className="text-orange-600 font-black">权→</span>
                <span className="text-blue-600 font-black">科→</span>
                <span className="text-rose-900 font-black">忌</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Selected Palace Detailed Interpretation drawer */}
      <div className="bg-[#FAF9F2] border-2 border-[#b0b095] rounded-2xl p-4 md:p-5 transition-all shadow-xs leading-normal">
        {activePalace ? (
          <div className="space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
            <h5 className="font-serif font-bold text-[#5a5a40] flex items-center gap-2 text-sm border-b border-[#e5e5d5] pb-2">
              <Sparkles className="w-4 h-4 text-rose-800 shrink-0" />
              <span>「{activePalace.palaceName === "命宫·身宫" ? "命宫" : activePalace.palaceName}」星宫合会玄极注解（于 {activePalace.stemName}{activePalace.branchName} 宫）</span>
            </h5>
            <p className="text-xs md:text-sm text-[#4a4a40] leading-relaxed font-serif">
              {getPalaceReading(activePalace)}
            </p>
            {activePalace.majorStars.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {activePalace.majorStars.map((ms) => (
                  <span key={ms.name} className="text-[10px] bg-white border border-[#c0c0ac] rounded px-2.5 py-0.5 text-rose-950 font-serif font-bold shadow-2xs">
                    🌌 【主星耀】{ms.name}：{getMiaoWang(ms.name, activePalace.branchName)}位坐守，主持该宫五行造化运势气度。
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-xs md:text-sm text-[#8a8a70] flex items-center justify-center gap-1.5 font-serif">
            <BookOpen className="w-4 h-4 text-[#8a8a70]" />
            提示：在大天盘上任意选择宫格，或点击下方大限/流年，即可激活三方对宫连线与星命详解。
          </div>
        )}
      </div>

      {/* 📜 Timeline Scrolling Panels strictly matching the bottom tables of "文墨天机" */}
      <div className="space-y-4 border-t border-dashed border-[#b0b095] pt-5">
        <h4 className="text-xs font-serif font-bold text-[#5a5a40] flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#5a5a40]" />
          <span>时运大盘推演名谱（大限 · 流年 · 流月 · 流日 · 流时）</span>
        </h4>

        <div className="space-y-2 text-xs" id="wenmo_timeline_bars">
          
          {/* 1. 大限 Timeline Row */}
          <div className="flex items-center">
            <div className={`w-18 md:w-24 font-serif font-black py-3.5 px-2 text-center rounded-l-lg border text-sm md:text-base select-none shrink-0 transition-colors ${activeLevel === "decade" && selectedDecadeIdx !== null ? "bg-amber-800 text-white border-amber-800" : "bg-[#ebebe0]/80 border-[#c0c0ac] text-gray-800"}`}>
              {activeLevel === "decade" && selectedDecadeIdx !== null && <span className="mr-1 text-[11px] animate-pulse">▶</span>}大限
            </div>
            <div className="flex-1 flex overflow-x-auto gap-1 p-1.5 bg-white border-y border-r border-[#c0c0ac] rounded-r-lg scrollbar-thin">
              {decadalTimeline.map((item, idx) => {
                const isSelected = selectedDecadeIdx === idx;
                const isCurrentActive = activeLevel === "decade" && isSelected;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (selectedDecadeIdx === idx) {
                        setSelectedDecadeIdx(null);
                        setSelectedYearIdx(null);
                        setSelectedMonthIdx(null);
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel("board");
                      } else {
                        setSelectedDecadeIdx(idx);
                        setSelectedYearIdx(null);
                        setSelectedMonthIdx(null);
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel("decade");
                      }
                    }}
                    className={`px-3.5 py-2.5 text-center shrink-0 min-w-[100px] rounded-md border text-xs md:text-sm font-serif transition-colors cursor-pointer ${
                      isCurrentActive
                        ? "bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd] font-extrabold ring-2 ring-[#9d4edd]/20"
                        : isSelected
                        ? "bg-[#9d4edd]/5 text-[#9d4edd] border-purple-300 font-bold"
                        : "bg-[#FDFDFB] hover:bg-[#FAF9F2] text-[#4a4a40] border-gray-200 font-bold"
                    }`}
                  >
                    <div className="font-extrabold leading-none">{item.ageRange}岁</div>
                    <div className="text-xs opacity-90 mt-1 leading-none font-bold">{item.limitName} ({item.gongName})</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 流年 Timeline Row */}
          <div className="flex items-center">
            <div className={`w-18 md:w-24 font-serif font-black py-3.5 px-2 text-center rounded-l-lg border text-sm md:text-base select-none shrink-0 transition-colors ${activeLevel === "year" && selectedYearIdx !== null ? "bg-amber-800 text-white border-amber-800" : "bg-[#ebebe0]/80 border-[#c0c0ac] text-gray-800"}`}>
              {activeLevel === "year" && selectedYearIdx !== null && <span className="mr-1 text-[11px] animate-pulse">▶</span>}流年/小限
            </div>
            <div className="flex-1 flex overflow-x-auto gap-1 p-1.5 bg-white border-y border-r border-[#c0c0ac] rounded-r-lg scrollbar-thin">
              {annualTimeline.map((item, idx) => {
                const isSelected = selectedYearIdx === idx;
                const isCurrentActive = activeLevel === "year" && isSelected;
                const isToday_Yr = item.yearNum === currentTargetYear;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (selectedYearIdx === idx) {
                        setSelectedYearIdx(null);
                        setSelectedMonthIdx(null);
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel(selectedDecadeIdx !== null ? "decade" : "board");
                      } else {
                        setSelectedYearIdx(idx);
                        setSelectedMonthIdx(null);
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel("year");
                      }
                    }}
                    className={`px-3.5 py-2.5 text-center shrink-0 min-w-[100px] rounded-md border text-xs md:text-sm font-serif transition-colors cursor-pointer ${
                      isCurrentActive
                        ? "bg-[#8b5cf6]/20 text-[#7c3aed] border-[#8b5cf6] font-extrabold ring-2 ring-[#8b5cf6]/20"
                        : isSelected
                        ? "bg-[#8b5cf6]/10 text-[#7c3aed] border-[#8b5cf6] font-bold"
                        : isToday_Yr
                        ? "bg-amber-500/10 text-amber-900 border-amber-600 font-extrabold shadow-2xs"
                        : "bg-[#FDFDFB] hover:bg-[#FAF9F2] text-[#4a4a40] border-gray-200 font-bold"
                    }`}
                  >
                    <div className="font-extrabold leading-none">{item.yearNum}年</div>
                    <div className="text-xs mt-1 leading-none font-sans font-bold text-stone-700">
                      {item.gz}宫 / {item.age}岁
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 流月 Timeline Row */}
          <div className="flex items-center">
            <div className={`w-18 md:w-24 font-serif font-black py-3.5 px-2 text-center rounded-l-lg border text-sm md:text-base select-none shrink-0 transition-colors ${activeLevel === "month" && selectedMonthIdx !== null ? "bg-amber-800 text-white border-amber-800" : "bg-[#ebebe0]/80 border-[#c0c0ac] text-gray-800"} flex items-center justify-center gap-1`}>
              {activeLevel === "month" && selectedMonthIdx !== null && <span className="mr-1 text-[11px] animate-pulse">▶</span>}
              <span>流月</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFlowMonthDisclaimer(true);
                }}
                className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-500/15 hover:bg-amber-500/35 border border-amber-500/40 text-amber-900 dark:text-amber-800 text-[10px] font-sans ml-1 transition-colors cursor-pointer shrink-0"
                title="流月排盘说明"
              >
                ?
              </button>
            </div>
            <div className="flex-1 flex overflow-x-auto gap-1 p-1.5 bg-white border-y border-r border-[#c0c0ac] rounded-r-lg scrollbar-thin">
              {["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "腊月"].map((month, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const isCurrentActive = activeLevel === "month" && isSelected;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (selectedMonthIdx === idx) {
                        setSelectedMonthIdx(null);
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel("year");
                      } else {
                        setSelectedMonthIdx(idx);
                        setActiveLevel("month");
                      }
                    }}
                    className={`px-4 py-2 text-center shrink-0 rounded-md border text-xs md:text-sm font-serif transition-all cursor-pointer ${
                      isCurrentActive
                        ? "bg-[#8b5cf6]/20 text-[#7c3aed] border-[#8b5cf6] font-extrabold ring-2 ring-[#8b5cf6]/20"
                        : isSelected
                        ? "bg-[#8b5cf6]/10 text-[#7c3aed] border-[#8b5cf6] font-bold"
                        : "bg-[#FDFDFB] hover:bg-[#FAF9F2] text-gray-700 border-gray-100 font-bold"
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 流日 Timeline Row */}
          <div className="flex items-center">
            <div className={`w-18 md:w-24 font-serif font-black py-3.5 px-2 text-center rounded-l-lg border text-sm md:text-base select-none shrink-0 transition-colors ${activeLevel === "day" && selectedDayIdx !== null ? "bg-amber-800 text-white border-amber-800" : "bg-[#ebebe0]/80 border-[#c0c0ac] text-gray-800"}`}>
              {activeLevel === "day" && selectedDayIdx !== null && <span className="mr-1 text-[11px] animate-pulse">▶</span>}流日
            </div>
            <div className="flex-1 flex overflow-x-auto gap-1 p-1.5 bg-white border-y border-r border-[#c0c0ac] rounded-r-lg scrollbar-thin">
              {Array.from({ length: 30 }, (_, dIdx) => {
                const dayNumName = [
                  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
                  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
                ][dIdx] || `初${dIdx + 1}`;
                
                const isSelected = selectedDayIdx === dIdx;
                const isCurrentActive = activeLevel === "day" && isSelected;
                return (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => {
                      if (selectedDayIdx === dIdx) {
                        setSelectedDayIdx(null);
                        setSelectedHourIdx(null);
                        setActiveLevel(selectedMonthIdx !== null ? "month" : "year");
                      } else {
                        setSelectedDayIdx(dIdx);
                        setActiveLevel("day");
                      }
                    }}
                    className={`px-3.5 py-2 text-center shrink-0 rounded-md border text-xs md:text-sm font-serif transition-all cursor-pointer ${
                      isCurrentActive
                        ? "bg-[#8b5cf6]/20 text-[#7c3aed] border-[#8b5cf6] font-extrabold ring-2 ring-[#8b5cf6]/20"
                        : isSelected
                        ? "bg-[#8b5cf6]/10 text-[#7c3aed] border-[#8b5cf6] font-bold"
                        : "bg-[#FDFDFB] hover:bg-[#FAF9F2] text-gray-700 border-gray-100 font-bold"
                    }`}
                  >
                    {dayNumName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. 流时 Timeline Row */}
          <div className="flex items-center">
            <div className={`w-18 md:w-24 font-serif font-black py-3.5 px-2 text-center rounded-l-lg border text-sm md:text-base select-none shrink-0 transition-colors ${activeLevel === "hour" && selectedHourIdx !== null ? "bg-amber-800 text-white border-amber-800" : "bg-[#ebebe0]/80 border-[#c0c0ac] text-gray-800"}`}>
              {activeLevel === "hour" && selectedHourIdx !== null && <span className="mr-1 text-[11px] animate-pulse">▶</span>}流时
            </div>
            <div className="flex-1 flex overflow-x-auto gap-1 p-1.5 bg-white border-y border-r border-[#c0c0ac] rounded-r-lg scrollbar-thin">
              {["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"].map((shi, idx) => {
                const isSelected = selectedHourIdx === idx;
                const isCurrentActive = activeLevel === "hour" && isSelected;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (selectedHourIdx === idx) {
                        setSelectedHourIdx(null);
                        setActiveLevel(selectedDayIdx !== null ? "day" : selectedMonthIdx !== null ? "month" : "year");
                      } else {
                        setSelectedHourIdx(idx);
                        setActiveLevel("hour");
                      }
                    }}
                    className={`px-4 py-2 text-center shrink-0 rounded-md border text-xs md:text-sm font-serif transition-all cursor-pointer ${
                      isCurrentActive
                        ? "bg-[#8b5cf6]/20 text-[#7c3aed] border-[#8b5cf6] font-extrabold ring-2 ring-[#8b5cf6]/20"
                        : isSelected
                        ? "bg-[#8b5cf6]/10 text-[#7c3aed] border-[#8b5cf6] font-bold"
                        : "bg-[#FDFDFB] hover:bg-[#FAF9F2] text-gray-700 border-gray-100 font-bold"
                    }`}
                  >
                    {shi}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action button bar similar to the decorative footer tabs in Wenmo Tianji */}
        <div className="grid grid-cols-3 gap-2 pr-1" id="wenmo_decorative_tabs">
          <div className="py-2.5 text-center rounded-lg border border-[#c0c0ac] bg-amber-900/5 hover:bg-amber-900/10 transition-colors font-serif font-bold text-xs cursor-default">
            🔀 飞星四化宫位合会
          </div>
          <div className="py-2.5 text-center rounded-lg border border-[#c0c0ac] bg-amber-900/5 hover:bg-amber-900/10 transition-colors font-serif font-bold text-xs cursor-default">
            🔺 三合对照三方星变
          </div>
          <div className="py-2.5 text-center rounded-lg border border-[#c0c0ac] bg-amber-900/5 hover:bg-amber-900/10 transition-colors font-serif font-bold text-xs cursor-default">
            ☯️ 庚辛生克乾坤图变
          </div>
        </div>
      </div>

      {/* Flow Month Calculation Controversy Modal (Exactly mimicking professional software) */}
      {showFlowMonthDisclaimer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-[#FCFAF4] border-4 border-[#b0b095] rounded-3xl w-full max-w-md shadow-2xl p-6 relative font-serif text-[#4a4a40] animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center pb-3 border-b-2 border-dashed border-[#b0b095] mb-4">
              <h4 className="text-amber-800 font-extrabold text-lg tracking-widest flex items-center justify-center gap-2">
                <span>☯️ 学术排盘提示</span>
              </h4>
            </div>
            
            <div className="space-y-4 text-sm md:text-base leading-relaxed text-stone-700 font-medium">
              <p>
                在紫微斗数与八字推演设计中，<strong>流月排盘方法</strong>在易学业界存在一些技术争议与流派分歧：
              </p>
              <div className="bg-amber-900/5 p-3.5 rounded-xl border border-[#e3e3cb] text-xs md:text-sm space-y-2.5 text-amber-950 font-sans leading-relaxed">
                <p>
                  • <strong>本系统采用：</strong>目前业界最广为采纳主流观点的<strong>『非节气干支法』</strong>来推演排定流月四化与运势星曜。
                </p>
                <p>
                  • <strong>未来规划：</strong>后续高级排盘设定中，将择机增加节气干支等不同流派的排法选项，支持用户自主微调配置。
                </p>
              </div>
              <p className="text-xs text-stone-500 leading-normal">
                欢迎业界学者及易学专家给予我们更多的启发性建议与回执反馈，共同推进中国传统易学数理模型的规范化与数字化！
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-dashed border-[#c0c0ac]">
              <button
                type="button"
                onClick={() => setShowFlowMonthDisclaimer(false)}
                className="py-2.5 px-3 text-center border-2 border-stone-300 rounded-lg hover:bg-stone-150 font-sans font-bold text-xs text-stone-500 transition-colors cursor-pointer"
              >
                30天内不再提示
              </button>
              <button
                type="button"
                onClick={() => setShowFlowMonthDisclaimer(false)}
                className="py-2.5 px-4 text-center bg-amber-800 text-white rounded-lg hover:bg-amber-900 font-sans font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                确定与返回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
