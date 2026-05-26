import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BaziChartResult, ApiConfig } from "../types";
import { Sparkles, Loader2, Copy, Check, FileText } from "lucide-react";

interface AiAnalysisCardProps {
  baziResult: BaziChartResult;
  apiConfig: ApiConfig;
  onOpenApiSettings: () => void;
}

const LOADING_STEPS = [
  "正在精确折算出生地经度真太阳时...",
  "正在校合立春交节，测算月柱分界...",
  "正在依据日主（日天干）推算生克十神...",
  "正在检索天乙贵人、驿马、桃花等神煞星盘...",
  "正在校准大运起运岁数及交运流年气势...",
  "正在结合当前流年、流月与四柱原局形成会照度...",
  "正在恭请AI命理大宗师深度融汇批注..."
];

export default function AiAnalysisCard({ baziResult, apiConfig, onOpenApiSettings }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

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

    return `你是一位精通中国传统命理学（八字神煞、大运流年、格局强弱）的专业命理学大师。请基于以下排盘数据，为缘主提供全面、温和、客观的深度命理分析报告：

【基本信息】
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

【当前运势流转（今日运学）】
- 当前流年：${baziResult.flowingTime?.year || "无"} (十神: ${baziResult.flowingTime?.yearTenGod || "无"}, 纳音: ${baziResult.flowingTime?.yearNayin || "无"})
- 当前流月：${baziResult.flowingTime?.month || "无"} (十神: ${baziResult.flowingTime?.monthTenGod || "无"})
- 当前流日：${baziResult.flowingTime?.day || "无"} (十神: ${baziResult.flowingTime?.dayTenGod || "无"})

请务必按照以下严谨、温馨、大器的模块输出一份结构精美的 Markdown 报告，不要胡乱编造，语言要富有国学韵味和哲学内涵：

1. 🌌 **命局格局与五行强弱分析**：详细剖析缘主的日主心性（如${baziResult.fourPillars.day.stem.name}特点）、八字五行分布（金木水火土相对强弱），判定原局的燥湿寒暖与格局（如正印格、食神格、建禄格等），给出力气和调候用神、喜神、忌神建议。
2. 💫 **神煞印记与性格本源**：结合盘中的主要神煞（如天乙贵人、文昌贵人、驿马、桃花等）对性格、天资、精神世界进行细致解读。
3. 💼 **事业宏图与财运指南**：从十神财官禄位出发，分析事业适合方向（学术、企管、创意、商贸等）、财源状态、一生财运高低波动及守财建议。
4. 🩺 **健康关怀与平安指引**：依据五行盛盛衰强，提供养生和身体器官预防保养指引。
5. 🗺️ **大运流年深度解惑与改运建议**：
   - 评点排盘中前列大运行运的起伏（哪段运势利事业，哪段利积累）。
   - 结合当前的流年（${baziResult.flowingTime?.year || "无"}）以及流日流月，给出应对当前运势时局的应对心境、趋利避害的修心建议。
   - 提供极具中国哲理的人生开导。

请用古典沉稳、鼓励乐观的语气回复，排版精美，擅用 Markdown 表格和区块。`;
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
        setStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

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
          apiConfig: apiConfig
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
    <div className="bg-white border border-[#e5e5d5] rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-[#4a4a40]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5d5] pb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#5a5a40] flex items-center gap-2">
            <span>◇</span> 智能 AI 命理批注（大宗师深度解读）
          </h3>
          <p className="text-xs text-[#8a8a70] mt-1">
            融合古典《渊海子平》、《三命通会》精髓与大语言模型算力，作多维度剖析
          </p>
        </div>

        {!loading && !analysis && (
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 bg-[#5a5a40] hover:bg-[#4a4a40] text-[#f5f5f0] px-5 py-2.5 rounded-full font-bold text-sm shadow hover:shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            批览八字
          </button>
        )}
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#5a5a40] animate-spin" />
          <div className="space-y-1.5">
            <h4 className="text-[#4a4a40] font-serif font-bold text-lg">大宗师正在详推乾坤...</h4>
            <div className="text-sm text-[#8a8a70] font-serif animate-pulse max-w-md mx-auto transition-all duration-500">
              「 {LOADING_STEPS[stepIdx]} 」
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
            <button
              onClick={() => {
                // Open Settings Modal directly if the error looks like it needs keys
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
              八字神算解梦大玄阅 ({apiConfig.provider === "system" ? "系统默认引擎" : `私有 API: ${apiConfig.provider.toUpperCase()}`})
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
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
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-lg md:text-xl font-serif font-extrabold text-[#5a5a40] border-b border-[#e5e5d5] pb-2 mt-6 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base md:text-lg font-serif font-extrabold text-[#4a4a40] border-l-4 border-[#5a5a40] pl-3 mt-5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm md:text-base font-serif font-bold text-[#5a5a40] mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed tracking-wide text-[#4a4a40]/90 text-xs md:text-sm">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-xs md:text-sm">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-xs md:text-sm">{children}</ol>,
                li: ({ children }) => <li className="text-[#4a4a40]/80">{children}</li>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-[#e5e5d5] rounded-xl bg-[#f5f5f0]/30 shadow-sm">
                    <table className="min-w-full text-xs sm:text-sm text-left">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-[#ebebe0]/50 border-b border-[#e5e5d5] font-bold text-[#4a4a40]">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-[#e5e5d5]">{children}</tbody>,
                tr: ({ children }) => <tr className="hover:bg-[#ebebe0]/10 transition-colors">{children}</tr>,
                th: ({ children }) => <th className="p-3 font-semibold text-xs">{children}</th>,
                td: ({ children }) => <td className="p-3 font-serif text-xs">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#5a5a40]/60 bg-[#ebebe0]/40 p-4 rounded-r-xl italic my-4 text-[#4a4a40]/85 text-xs md:text-sm">
                    {children}
                  </blockquote>
                )
              }}
            >
              {analysis}
            </ReactMarkdown>
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
              <h4 className="text-sm font-bold text-[#4a4a40] font-serif">开启智能解命批释</h4>
              <p className="text-xs text-[#8a8a70] leading-relaxed font-sans px-4">
                点击上方“批览八字”按钮，将原盘十神、地支藏干、二十四节气、神煞以及生肖大运输送给 AI 大宗师，为您写就一份上千字、深中肯綮的深度乾坤流年分析大报告。
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
