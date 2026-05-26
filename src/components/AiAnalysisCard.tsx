import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BaziChartResult } from "../types";
import { Sparkles, Loader2, Copy, Check, FileText } from "lucide-react";

interface AiAnalysisCardProps {
  baziResult: BaziChartResult;
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

export default function AiAnalysisCard({ baziResult }: AiAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

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
        body: JSON.stringify({ baziData: baziResult })
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
    <div className="bg-white/95 border border-amber-900/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-amber-900/5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/10 pb-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-amber-950 flex items-center gap-2">
            <span>◇</span> 智能 AI 命理批注（大宗师深度解读）
          </h3>
          <p className="text-xs text-amber-900/50 mt-1">
            融合古典《渊海子平》、《三命通会》精髓与大语言模型算力，作多维度剖析
          </p>
        </div>

        {!loading && !analysis && (
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-[#b22222] text-[#fcfaf2] px-5 py-2.5 rounded-xl font-medium text-sm hover:brightness-110 shadow-md shadow-red-900/10 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            批览八字
          </button>
        )}
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#b22222] animate-spin" />
          <div className="space-y-1.5">
            <h4 className="text-amber-950 font-serif font-bold text-lg">大宗师正在详推乾坤...</h4>
            <div className="text-sm text-amber-900/60 font-serif animate-pulse max-w-md mx-auto transition-all duration-500">
              「 {LOADING_STEPS[stepIdx]} 」
            </div>
          </div>
          <p className="text-[10px] text-amber-950/30 max-w-xs font-mono">
            Approx transit times: 10-15 seconds as Gemini evaluates your elemental combinations
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={fetchAnalysis}
            className="bg-[#b22222] text-white text-xs px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            重新恭请解读
          </button>
        </div>
      )}

      {/* Analysis Output display */}
      {analysis && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#fcfaf2]/60 px-4 py-2.5 rounded-xl border border-amber-900/10">
            <div className="flex items-center gap-2 text-xs text-amber-950 font-serif font-bold">
              <FileText className="w-4 h-4 text-amber-900" />
              八字神算解梦大玄阅
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-amber-900 hover:text-[#b22222] bg-white border border-amber-900/10 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制报告"}
              </button>
              <button
                onClick={fetchAnalysis}
                className="flex items-center gap-1.5 text-xs text-[#b22222] hover:text-red-800 bg-white border border-amber-900/10 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重新解读
              </button>
            </div>
          </div>

          <div className="prose prose-amber max-w-none text-amber-950 p-6 bg-[#fcfaf2]/50 border border-amber-900/5 rounded-2xl leading-relaxed text-sm md:text-base font-serif space-y-4 shadow-inner">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-xl md:text-2xl font-serif font-extrabold text-[#b22222] border-b border-amber-900/10 pb-2 mt-6 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg md:text-xl font-serif font-extrabold text-amber-950 border-l-4 border-[#b22222] pl-3 mt-5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base md:text-lg font-serif font-bold text-amber-950 mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed tracking-wide text-amber-950/90">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-amber-950/80">{children}</li>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-amber-900/10 rounded-xl bg-white shadow-sm">
                    <table className="min-w-full text-xs sm:text-sm text-left">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-[#fcfaf2] border-b border-amber-900/10 font-bold text-amber-950">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-amber-900/5">{children}</tbody>,
                tr: ({ children }) => <tr className="hover:bg-amber-50/25 transition-colors">{children}</tr>,
                th: ({ children }) => <th className="p-3 font-semibold">{children}</th>,
                td: ({ children }) => <td className="p-3 font-serif">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-600/40 bg-[#fcfaf2] p-4 rounded-r-xl italic my-4 text-amber-900/80">
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
        <div className="p-6 bg-[#fcfaf2]/40 border border-dashed border-amber-900/10 rounded-2xl text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-amber-50 border border-amber-200/50 rounded-full text-amber-950">
            <Sparkles className="w-6 h-6 text-[#b22222]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950 font-serif">开启智能解命批释</h4>
            <p className="text-xs text-amber-900/60 leading-relaxed font-sans px-4">
              点击上方“批览八字”按钮，将原盘十神、地支藏干、二十四节气、神煞以及生肖大运输送给AI大宗师，为您写就一份上千字、深中肯綮的深度乾坤流年分析大报告。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
