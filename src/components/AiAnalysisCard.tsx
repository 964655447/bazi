import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BaziChartResult, ApiConfig } from "../types";
import { Sparkles, Loader2, Copy, Check, FileText, Settings } from "lucide-react";
import { compileZiwei } from "../utils/ziwei";

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

interface AiAnalysisCardProps {
  baziResult: BaziChartResult;
  apiConfig: ApiConfig;
  onOpenApiSettings: () => void;
  name?: string;
  mode?: "bazi" | "ziwei";
}

const LOADING_STEPS = [
  "正在精确折算出生地经度真太阳时...",
  "正在校合立春交节，测算月柱分界...",
  "正在依据日主（日天干）推算生克十神...",
  "正在检索天乙贵人、福星煞曜...",
  "正在排算大运轨迹与流年交接...",
  "大宗师正在融汇八字局象，酝酿理法评注..."
];

const ZIWEI_LOADING_STEPS = [
  "正在精确定位出生时辰并折算太阳时...",
  "正在排定命身星座，锁定十二宫干起讫...",
  "正在精确测度水二局、火六局等纳音局度...",
  "正在安星南北斗十四主耀...",
  "正在布列青龙白虎以及旬空、天哭等副星...",
  "大宗师正在校正紫微乾坤盘，推算玄空妙解...",
  "正在构想紫微精妙印记与星体飞显四化..."
];

export default function AiAnalysisCard({ baziResult, apiConfig, onOpenApiSettings, name, mode = "bazi" }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

  // Clear previous analysis when mode switches
  useEffect(() => {
    setAnalysis("");
    setError("");
    setLoading(false);
  }, [mode]);

  const activeLoadingSteps = mode === "ziwei" ? ZIWEI_LOADING_STEPS : LOADING_STEPS;

  const buildUserPrompt = () => {
    if (!baziResult) return "";
    
    const formatHiddenStems = (pillarKey: "year" | "month" | "day" | "hour") => {
      const hidden = baziResult.fourPillars[pillarKey].branch.hiddenStems || [];
      return hidden.map((s: any) => `${s.name}(${s.tenGod || ""})`).join(", ") || "无";
    };

    const formatDaYunCycles = () => {
      const cycles = baziResult.daYun?.cycles || [];
      return cycles.slice(0, 5).map((c: any) => `自${c.startAge}岁起行 [${c.stem}${c.branch}] 运(十神: ${c.tenGod}, 纳音: ${c.nayin || "无"}, 星运: ${c.changsheng || "无"})`).join("；") || "无";
    };

    const compileZiweiText = () => {
      try {
        const zw = compileZiwei(baziResult.birthTimeG, baziResult.longitude, baziResult.cityName, baziResult.gender, name || "缘主");
        
        const fp = baziResult.fourPillars;
        const yearGan = zw.yearGanZhi.charAt(0);
        const yearZhi = zw.yearGanZhi.charAt(1);
        
        // Find Ming Gong and Shen Gong
        const mingPalace = zw.palaces.find(p => p.isOriginalPalace);
        const shenPalace = zw.palaces.find(p => p.isShenGong);
        
        const mingGongName = mingPalace ? mingPalace.branchName : "未知";
        const shenGongName = shenPalace ? shenPalace.branchName : "未知";
        
        // Extract month index of lunar date
        const monthMatch = zw.birthTimeL.match(/年\s*(.*?)月/);
        const monthCn = monthMatch ? monthMatch[1].trim() : "一";
        const CN_MONTHS: { [key: string]: number } = {
          "正": 1, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, 
          "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12, "腊": 12
        };
        const monthNum = CN_MONTHS[monthCn] || 1;
        
        // Hour index from Zi
        const hourMatch = zw.birthTimeL.match(/月.*?\s+(.*?)时/);
        const hourCn = hourMatch ? hourMatch[1].trim() : "子";
        const CN_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        const hourIdx = CN_BRANCHES.indexOf(hourCn) !== -1 ? CN_BRANCHES.indexOf(hourCn) : 0;
        
        const douJunIdx = ((monthNum - 1 - hourIdx + 12) % 12);
        const BOARD_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
        const douJunBranch = BOARD_BRANCHES[douJunIdx];
        
        // 身主 Mapping using Year Branch index in CN_BRANCHES
        const yearBranchIdx = CN_BRANCHES.indexOf(yearZhi) !== -1 ? CN_BRANCHES.indexOf(yearZhi) : 0;
        const SHEN_ZHU_MAP = ["天相", "天梁", "天同", "天机", "文昌", "火星", "天相", "天梁", "天同", "天机", "文昌", "火星"];
        const shenZhu = SHEN_ZHU_MAP[yearBranchIdx % 12];
        
        let txt = `文墨天机紫微斗数命盘\n`;
        txt += `│\n`;
        txt += `├API 版本 : 1.1.2\n`;
        txt += `├App版本 : 2.5.9\n`;
        txt += `├安星码 : C5VUC\n`;
        txt += `├符号定义\n`;
        txt += `│ ├(↓:离心自化)\n`;
        txt += `│ ├(↑:向心自化，从对宫化入)\n`;
        txt += `│ ├(┏ : 生日前小限)\n`;
        txt += `│ └( ┓: 生日后小限)\n`;
        txt += `│\n`;
        txt += `├基本信息\n`;
        txt += `│ │\n`;
        txt += `│ ├性别 : ${baziResult.gender}\n`;
        txt += `│ ├地理经度 : ${baziResult.longitude || 116.4}\n`;
        txt += `│ ├钟表时间 : ${baziResult.birthTimeG}\n`;
        txt += `│ ├真太阳时 : ${baziResult.birthTimeLST || baziResult.birthTimeG}\n`;
        txt += `│ ├农历时间 : ${zw.birthTimeL.replace("农历", "").trim()}\n`;
        
        const pillarsStr = `${fp.year.stem.name}${fp.year.branch.name} ${fp.month.stem.name}${fp.month.branch.name} ${fp.day.stem.name}${fp.day.branch.name} ${fp.hour.stem.name}${fp.hour.branch.name}`;
        txt += `│ ├节气四柱 : ${pillarsStr}\n`;
        txt += `│ ├非节气四柱 : ${pillarsStr}\n`;
        txt += `│ ├五行局数 : ${zw.mingJu}\n`;
        txt += `│ └身主:${shenZhu}; 命主:${zw.mingZhu}; 子年斗君:${douJunBranch}; 身宫:${shenGongName}\n`;
        txt += `│\n`;
        txt += `├命盘十二宫\n`;
        txt += `│ │ \n`;
        
        // Loop over houses in standard branch order starting from 子 BoardIdx 10 to 亥 BoardIdx 9
        const exportOrder = [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        exportOrder.forEach((pIdx, outerIdx) => {
          const p = zw.palaces.find(x => x.branchIdx === pIdx);
          if (!p) return;
          
          const isLastPalace = outerIdx === exportOrder.length - 1;
          const prefixPalace = isLastPalace ? " └" : " ├";
          const subPrefix = isLastPalace ? "  " : " │";
          
          let palaceHeader = `${p.palaceName}[${p.stemName}${p.branchName}]`;
          if (p.isShenGong) {
            palaceHeader += `[身宫]`;
          }
          
          txt += `│ ${prefixPalace}${palaceHeader}\n`;
          
          const formatStars = (starsList: any[], includeBrightness = false) => {
            if (starsList.length === 0) return "无";
            return starsList.map(s => {
              let sStr = s.name;
              if (includeBrightness && s.brightness) {
                sStr += `[${s.brightness}]`;
              }
              const m = getMutagen(s.name, yearGan);
              if (m) {
                const mapper: { [key: string]: string } = {
                  "化禄": "生年禄",
                  "化权": "生年权",
                  "化科": "生年科",
                  "化忌": "生年忌"
                };
                sStr += `[${mapper[m] || m}]`;
              }
              return sStr;
            }).join(", ");
          };
          
          const majorStarsStr = formatStars(p.majorStars, true);
          const minorStarsStr = formatStars(p.minorStars, false);
          const adjectiveStarsStr = formatStars(p.adjectiveStars, false);
          
          txt += `│ │ ${subPrefix}├主星 : ${majorStarsStr}\n`;
          txt += `│ │ ${subPrefix}├辅星 : ${minorStarsStr}\n`;
          txt += `│ │ ${subPrefix}├小星 : ${adjectiveStarsStr}\n`;
          
          // 神煞
          txt += `│ │ ${subPrefix}├神煞\n`;
          txt += `│ │ ${subPrefix}│ ├岁前星 : ${p.suiqian12}\n`;
          txt += `│ │ ${subPrefix}│ ├将前星 : ${p.jiangqian12}\n`;
          txt += `│ │ ${subPrefix}│ ├十二长生 : ${p.changsheng12}\n`;
          txt += `│ │ ${subPrefix}│ └太岁煞禄 : ${p.boshi12}\n`;
          
          // 大限, 小限, 流年, 限流叠宫
          txt += `│ │ ${subPrefix}├大限 : ${p.decadalStart} ~ ${p.decadalEnd}虚岁\n`;
          
          // Compute minor limits
          let startLimitIdx = 0;
          if ([2, 6, 10].includes(yearBranchIdx)) startLimitIdx = 2;
          else if ([8, 0, 4].includes(yearBranchIdx)) startLimitIdx = 8;
          else if ([5, 9, 1].includes(yearBranchIdx)) startLimitIdx = 5;
          else if ([11, 3, 7].includes(yearBranchIdx)) startLimitIdx = 11;
          
          const stepDir = baziResult.gender === "男" ? 1 : -1;
          const palaceAges: number[] = [];
          for (let age = 1; age <= 120; age++) {
            const currentIdx = ((startLimitIdx + (age - 1) * stepDir) % 12 + 12) % 12;
            if (currentIdx === pIdx) {
              palaceAges.push(age);
            }
          }
          const smallLimitsStr = palaceAges.slice(0, 5).join(",") + "虚岁";
          
          // Compute flowing years
          const birthYearBoardIdx = BOARD_BRANCHES.indexOf(CN_BRANCHES[yearBranchIdx]);
          const flowingAges: number[] = [];
          for (let age = 1; age <= 120; age++) {
            const currentFlowIdx = ((birthYearBoardIdx + (age - 1)) % 12 + 12) % 12;
            if (currentFlowIdx === pIdx) {
              flowingAges.push(age);
            }
          }
          const flowingYearsStr = flowingAges.slice(0, 5).join(",") + "虚岁";
          
          txt += `│ │ ${subPrefix}├小限 : ${smallLimitsStr}\n`;
          txt += `│ │ ${subPrefix}├流年 : ${flowingYearsStr}\n`;
          txt += `│ │ ${subPrefix}└限流叠宫 : 无\n`;
          if (!isLastPalace) {
            txt += `│\n`;
          }
        });
        
        return txt;
      } catch (e) {
        console.error(e);
        return "";
      }
    };

    if (mode === "ziwei") {
      return `你现在是资深的国学易经术数领域专家，请详细分析下面这个文墨天机紫微斗数命盘，综合使用三合紫微、飞星紫微、河洛紫微、钦天四化等各流派紫微斗数的分析技法，对命盘十二宫星曜分布、限流叠宫和各宫位间的飞宫四化进行细致分析，进而对命主的健康、学业、事业、财运、人际关系、婚姻和感情等各个方面进行全面分析和总结，关键事件须给出发生时间范围、吉凶属性、事件对命主的影响程度等信息，并结合命主的自身特点给出针对性的解决方案和建议。另外，命盘信息里附带了十二个大限共一百二十个流年的信息，请对前八个大限的所有流年进行分析，给出每一年需要关注的重大事件和注意事项。最后，别忘了提醒用户上述分析仅限于研究或娱乐目的使用。

${compileZiweiText()}`;
    }

    // Default or Bazi Mode
    return `你是一位精通中国传统命理学（子平八字、八字神煞、格局推演、十神旺衰、大运流年）的专业八字命理学大宗师。
请基于以下排盘数据（生辰八字四柱与神煞气势），为缘主提供全面、温和、客观的深度八字命理分析报告：

【基本信息】
- 缘主姓名：${name || "未填写（请以'缘主'称呼）"}
- 性别：${baziResult.gender}
- 公历生日：${baziResult.birthTimeG}
- 真太阳时：${baziResult.birthTimeLST || baziResult.birthTimeG} (出生地经度: ${baziResult.longitude || 116.4}°E, 城市: ${baziResult.cityName || "北京"})

【四柱乾坤（生辰八字）】
- 年柱：${baziResult.fourPillars.year.stem.name}${baziResult.fourPillars.year.branch.name} (十神: ${baziResult.fourPillars.year.stem.tenGod || "无"}, 纳音: ${baziResult.fourPillars.year.nayin || "无"}, 空亡: ${baziResult.fourPillars.year.emptyVoid?.join(", ") || "无"}, 神煞: ${baziResult.fourPillars.year.shensha?.join(", ") || "无"})
- 月柱：${baziResult.fourPillars.month.stem.name}${baziResult.fourPillars.month.branch.name} (十神: ${baziResult.fourPillars.month.stem.tenGod || "无"}, 纳音: ${baziResult.fourPillars.month.nayin || "无"}, 神煞: ${baziResult.fourPillars.month.shensha?.join(", ") || "无"})
- 日柱：${baziResult.fourPillars.day.stem.name}${baziResult.fourPillars.day.branch.name} (日主(天干): ${baziResult.fourPillars.day.stem.name}, 纳音: ${baziResult.fourPillars.day.nayin || "无"}, 空亡: ${baziResult.fourPillars.day.emptyVoid?.join(", ") || "无"}, 神煞: ${baziResult.fourPillars.day.shensha?.join(", ") || "无"})
- 时柱：${baziResult.fourPillars.hour.stem.name}${baziResult.fourPillars.hour.branch.name} (十神: ${baziResult.fourPillars.hour.stem.tenGod || "无"}, 纳音: ${baziResult.fourPillars.hour.nayin || "无"}, 神煞: ${baziResult.fourPillars.hour.shensha?.join(", ") || "无"})

【地支藏干】
- 年支藏干：${formatHiddenStems("year")}
- 月支藏干：${formatHiddenStems("month")}
- 日支藏干：${formatHiddenStems("day")}
- 时支藏干：${formatHiddenStems("hour")}

【大运气势】
- 起运年纪：${baziResult.daYun?.transitAgeDescription || "无"} (交运公历时间：${baziResult.daYun?.transitExactDate || "无"})
- 大运前列：${formatDaYunCycles()}
- 当前流年：${baziResult.flowingTime?.year || "无"}
- 当前流月：${baziResult.flowingTime?.month || "无"} (十神: ${baziResult.flowingTime?.monthTenGod || "无"})
- 当前流日：${baziResult.flowingTime?.day || "无"} (十神: ${baziResult.flowingTime?.dayTenGod || "无"})

请务必按照以下严谨、温馨、开明大气的模块输出一份结构精美的 Markdown 报告，不要胡乱捏造，语言要富有国学精雅、哲学宽阔、科学理性的气派：

1. 🌌 **命局干支格局与喜忌神判定**：
   - 详细剖析日主天干心性（如${baziResult.fourPillars.day.stem.name}特点）与五行强弱分布（金木水火土相对分量）。
   - 判定原局属于何种格局（如正财格、偏官格等），解算燥湿寒暖，判定用神、喜神、忌神。
2. 💫 **地支藏干与神煞交辉**：
   - 融合地支藏干深藏之气与神煞（如天乙贵人、文昌、桃花、太极、空亡）来探究性格潜能、天资才气与缘分。
3. 💼 **事业宏图、十神财官禄位分析**：
   - 结合正官、七杀、正财、偏财、食神、伤官等十神的分布与气势，剖析适合的工作（商业、技术、艺术、行政等）及财气高低、防守建议。
4. 🩺 **五行宣泄与健康养生**：
   - 依据五行缺失与过旺状况，给出在经络体格方面的提示 and 调候平衡调理建议。
5. 🗺️ **大运流转与流岁当下的开释**：
   - 评点大运起伏（如交好运的时点），并针对当前流年（${baziResult.flowingTime?.year || "无"}）流月流日的天干地支生克，对命主当下的现实处境给出智慧启迪、修心建议。

请用古典宽厚、优雅亲切、理智客观的修心语气撰写，排版极为精美，善用 Markdown 分割线、表格和富有国学美感的区块（💡）。`;
  };

  const handleCopyPrompt = () => {
    const pText = buildUserPrompt();
    if (!pText) return;
    navigator.clipboard.writeText(pText);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setStepIdx(0);
      interval = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % activeLoadingSteps.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, activeLoadingSteps]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");
    try {
      const response = await fetch("/api/bazi-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          baziData: baziResult,
          apiConfig: apiConfig,
          customPrompt: buildUserPrompt()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "大宗师正在闭关，请稍后再试...");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "未能成功链接AI大宗师，请检查网络配置。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#e5e5d5] rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-[#4a4a40]" id="ai_analysis_section">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5d5] pb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#5a5a40] flex items-center gap-2">
            <span>◇</span> {mode === "ziwei" ? "智能 AI 紫微星命批注（大宗师星宿参合）" : "智能 AI 八字命理批注（大宗师深度解读）"}
          </h3>
          <p className="text-xs text-[#8a8a70] mt-1">
            {mode === "ziwei" 
              ? "依十四曜主星坐守、十二宫命运轨辙与飞星四化，作全维度深度星运推演" 
              : "融合子平五行旺衰、神煞星光、起运岁期，为您提供万字深度八字宏篇大论"}
          </p>
        </div>

        {!loading && !analysis && (
          <div className="flex gap-2">
            <button
              onClick={onOpenApiSettings}
              className="flex items-center gap-1.5 bg-[#ebebe0]/80 hover:bg-[#ebebe0] text-[#5a5a40] border border-[#dcdcc8] px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer"
              title="配置 AI 批释大引擎"
            >
              <Settings className="w-3.5 h-3.5" />
              配置引擎
            </button>
            <button
              onClick={fetchAnalysis}
              className="flex items-center gap-1.5 bg-[#5a5a40] hover:bg-[#4a4a40] text-[#f5f5f0] px-4 py-2 rounded-full font-bold text-xs md:text-sm shadow hover:shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {mode === "ziwei" ? "推演星曜" : "批览八字"}
            </button>
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#5a5a40] animate-spin" />
          <div className="space-y-1.5">
            <h4 className="text-[#4a4a40] font-serif font-bold text-lg">大宗师正在详推乾坤...</h4>
            <div className="text-sm text-[#8a8a70] font-serif animate-pulse max-w-md mx-auto transition-all duration-500">
              「 {activeLoadingSteps[stepIdx]} 」
            </div>
          </div>
          <p className="text-[10px] text-[#8a8a70]/60 max-w-xs font-mono">
            Approx transit times: 10-15 seconds as AI evaluates your elemental combinations
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="space-y-6">
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <p className="text-xs md:text-sm font-semibold text-rose-800 leading-relaxed">{error}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onOpenApiSettings}
                className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs px-5 py-2 rounded-full transition-colors cursor-pointer font-bold flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                ⚙️ 配置 AI 大引擎
              </button>
              <button
                onClick={() => {
                  if (
                    error.includes("密钥") || 
                    error.includes("API") || 
                    error.includes("API Key") || 
                    error.includes("apiKey") || 
                    error.includes("使用完") || 
                    error.includes("Key")
                  ) {
                    onOpenApiSettings();
                  } else {
                    fetchAnalysis();
                  }
                }}
                className="bg-rose-800 text-white text-xs px-5 py-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer font-bold"
              >
                {error.includes("密钥") || error.includes("API") || error.includes("使用完") || error.includes("Key") ? "⚙️ 打开 API 密钥设置" : "重新恭请解读"}
              </button>
            </div>
          </div>
          
          {/* Prompt Backup Section */}
          <div className="bg-[#ebebe0]/20 border border-[#dcdcc8] rounded-2xl p-5 md:p-6 space-y-4 max-w-xl mx-auto shadow-sm text-left">
            <div className="flex items-center gap-2 border-b border-[#e5e5d5] pb-2">
              <FileText className="w-5 h-5 text-[#5a5a40]" />
              <div>
                <h4 className="text-sm font-bold text-[#4a4a40] font-serif">📋 终极方案：一键生成并在外部 AI 中提问</h4>
                <p className="text-[10px] text-[#8a8a70]">
                  直接将生成后的排盘提示词粘贴发送给 豆包 (Doubao) 或 DeepSeek，可获得完全一致的大宗师解读成果！
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative bg-white p-3 rounded-xl border border-[#e5e5d5] max-h-36 overflow-y-auto">
                <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-[#5a5a40]">
                  {buildUserPrompt()}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs px-4 py-2.5 rounded-full font-bold cursor-pointer transition-all ${
                    promptCopied 
                      ? "bg-[#5a5a40] text-emerald-400" 
                      : "bg-[#5a5a40] text-[#f5f5f0] hover:bg-[#4a4a40]"
                  }`}
                >
                  {promptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {promptCopied ? "复制成功！快去粘贴问问豆包吧" : "一键复制大宗师提示词 (Prompt)"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] pt-1 border-t border-dashed border-[#dcdcc8]">
                <a
                  href="https://www.doubao.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 bg-white hover:bg-[#f5f5f0] border border-[#dcdcc8] rounded-full text-[#4a4a40] font-medium transition-colors"
                >
                  前往 👉 豆包 AI (免登录流畅)
                </a>
                <a
                  href="https://chat.deepseek.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 bg-white hover:bg-[#f5f5f0] border border-[#dcdcc8] rounded-full text-[#4a4a40] font-medium transition-colors"
                >
                  前往 👉 DeepSeek 客服端
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Output display */}
      {analysis && !loading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#ebebe0]/40 px-4 py-3 rounded-xl border border-[#dcdcc8]">
            <div className="flex items-center gap-2 text-xs text-[#5a5a40] font-serif font-bold">
              <FileText className="w-4 h-4 text-[#5a5a40]" />
              {mode === "ziwei" ? "紫微星曜神化命学大玄阅" : "八字神算解梦大玄阅"} ({apiConfig.provider === "system" ? "系统默认引擎" : `私有 API: ${apiConfig.provider.toUpperCase()}`})
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={onOpenApiSettings}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-[#5a5a40] hover:bg-[#ebebe0] bg-white border border-[#dcdcc8] rounded-full px-4 py-2 transition-colors cursor-pointer font-bold"
                title="配置 AI 批释大引擎"
              >
                <Settings className="w-3.5 h-3.5" />
                配置引擎
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-[#4a4a40] hover:bg-[#ebebe0] bg-white border border-[#dcdcc8] rounded-full px-4 py-2 transition-colors cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#5a5a40]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制报告"}
              </button>
              <button
                onClick={fetchAnalysis}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-4 py-2 transition-colors cursor-pointer font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重新解读
              </button>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-[#4a4a40] p-6 bg-white border border-[#e5e5d5] rounded-2xl leading-relaxed text-sm md:text-base font-serif space-y-4 shadow-inner">
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl md:text-2xl font-serif font-black text-[#5a5a40] border-b-2 border-[#e5e5d5] pb-2.5 mt-8 mb-5">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg md:text-xl font-serif font-black text-[#4a4a40] border-l-4 border-[#5a5a40] pl-4.5 mt-6 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base md:text-lg font-serif font-black text-[#5a5a40] mt-5 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="mb-5.5 leading-relaxed tracking-wide text-[#3a3a30] text-sm sm:text-[15.5px] md:text-base font-serif font-medium">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-5.5 space-y-2 text-sm sm:text-[15.5px] md:text-base font-serif font-medium text-[#3a3a30]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-5.5 space-y-2 text-sm sm:text-[15.5px] md:text-base font-serif font-medium text-[#3a3a30]">{children}</ol>,
                  li: ({ children }) => <li className="text-[#3a3a30]/90 font-serif font-medium">{children}</li>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-5 border border-[#e5e5d5] rounded-xl bg-[#f5f5f0]/40 shadow-sm">
                      <table className="min-w-full text-xs sm:text-sm md:text-base text-left font-serif">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-[#ebebe0]/60 border-b border-[#e5e5d5] font-black text-[#3a3a30]">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-[#e5e5d5]">{children}</tbody>,
                  tr: ({ children }) => <tr className="hover:bg-[#ebebe0]/15 transition-colors">{children}</tr>,
                  th: ({ children }) => <th className="p-3.5 font-bold text-xs sm:text-sm md:text-base text-stone-900">{children}</th>,
                  td: ({ children }) => <td className="p-3.5 font-serif text-xs sm:text-sm md:text-base text-stone-800 font-medium">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#5a5a40] bg-[#ebebe0]/30 p-4.5 rounded-r-xl italic my-5 text-[#3a3a30] text-sm sm:text-[15.5px] md:text-base font-serif font-medium shadow-2xs">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Guide if first loading */}
      {!analysis && !loading && (
        <div className="space-y-6">
          <div className="p-6 bg-[#ebebe0]/20 border border-dashed border-[#dcdcc8] rounded-2xl text-center max-w-xl mx-auto space-y-4">
            <div className="inline-flex p-3 bg-[#ebebe0]/60 border border-[#dcdcc8] rounded-full text-[#5a5a40]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#4a4a40] font-serif">{mode === "ziwei" ? "开启智能紫微星位批释" : "开启智能八字五行李法批释"}</h4>
              <p className="text-xs text-[#8a8a70] leading-relaxed font-sans px-4">
                {mode === "ziwei"
                  ? "点击上方“推演星曜”按钮，将岁干局度、十四主宿、吉煞曜宿分布与飞星四化输送给 AI 大宗师，为您写就一份上千字、深中肯綮的深度紫微命运星轨大报告。"
                  : "点击上方“批览八字”按钮，将原盘十神、地支藏干、二十四节气、神煞以及生肖大运输送给 AI 大宗师，为您写就一份上千字、深中肯綮的深度乾坤流年分析大报告。"}
              </p>
            </div>
          </div>

          {/* Prompt Backup Section */}
          <div className="bg-[#ebebe0]/20 border border-[#dcdcc8] rounded-2xl p-5 md:p-6 space-y-4 max-w-xl mx-auto shadow-sm text-left">
            <div className="flex items-center gap-2 border-b border-[#e5e5d5] pb-2">
              <FileText className="w-5 h-5 text-[#5a5a40]" />
              <div>
                <h4 className="text-sm font-bold text-[#4a4a40] font-serif">📋 线下备用：一键导出 AI 排盘提示词</h4>
                <p className="text-[10px] text-[#8a8a70]">
                  免 Key 终极方案：将排盘大数据打包为特制 Prompt，直接去 豆包 或 DeepSeek 粘贴提问！
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative bg-white p-3 rounded-xl border border-[#e5e5d5] max-h-36 overflow-y-auto">
                <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed text-[#5a5a40]">
                  {buildUserPrompt()}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs px-4 py-2.5 rounded-full font-bold cursor-pointer transition-all ${
                    promptCopied 
                      ? "bg-[#5a5a40] text-emerald-400" 
                      : "bg-[#5a5a40] text-[#f5f5f0] hover:bg-[#4a4a40]"
                  }`}
                >
                  {promptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {promptCopied ? "复制成功！快去粘贴问问大模型吧" : "一键复制大宗师提示词"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] pt-1 border-t border-dashed border-[#dcdcc8]">
                <a
                  href="https://www.doubao.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 bg-white hover:bg-[#f5f5f0] border border-[#dcdcc8] rounded-full text-[#4a4a40] font-medium transition-colors"
                >
                  前往 👉 豆包 AI (免费免Key)
                </a>
                <a
                  href="https://chat.deepseek.com"
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 bg-white hover:bg-[#f5f5f0] border border-[#dcdcc8] rounded-full text-[#4a4a40] font-medium transition-colors"
                >
                  前往 👉 DeepSeek 客户端
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
