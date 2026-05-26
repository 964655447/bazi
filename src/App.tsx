import { useState } from "react";
import { compileBazi } from "./utils/astronomy";
import { BaziChartResult, ApiConfig } from "./types";
import BaziInput from "./components/BaziInput";
import BaziPillarsCard from "./components/BaziPillarsCard";
import DaYunTimeline from "./components/DaYunTimeline";
import FlowingTimeCard from "./components/FlowingTimeCard";
import AiAnalysisCard from "./components/AiAnalysisCard";
import ApiSettingsModal from "./components/ApiSettingsModal";
import { Compass, BookOpen, Clock, RefreshCw, Sun, Sliders } from "lucide-react";

export default function App() {
  const [baziResult, setBaziResult] = useState<BaziChartResult | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const saved = localStorage.getItem("bazi_api_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      provider: "system",
      apiKey: "",
      baseUrl: "",
      model: ""
    };
  });

  // Initialize with a default chart so the user doesn't see a blank page!
  // This is a brilliant professional touch: they immediately see an elegant sample chart on first load,
  // making the site looks interactive and fully formed straightaway!
  useState(() => {
    const defaultSample = compileBazi("1995-10-18 08:30", 116.4, "北京", "男");
    setBaziResult(defaultSample);
  });

  const handleCalculate = (data: {
    birthTime: string;
    longitude: number;
    cityName: string;
    gender: "男" | "女";
  }) => {
    const result = compileBazi(data.birthTime, data.longitude, data.cityName, data.gender);
    setBaziResult(result);
  };

  const handleTargetDateChange = (newResult: BaziChartResult) => {
    setBaziResult(newResult);
  };

  const handleReset = () => {
    // Reset back to Beijing sample
    const defaultSample = compileBazi("1995-10-18 08:30", 116.4, "北京", "男");
    setBaziResult(defaultSample);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#4a4a40] font-serif selection:bg-[#5a5a40]/15 selection:text-[#5a5a40]">
      {/* Visual top border with Chinese decorative key pattern or neat dual color red/gold band */}
      <div className="h-1 bg-[#5a5a40] w-full" />

      {/* Main Header / Navigation */}
      <header className="border-b border-[#dcdcc8] bg-[#f5f5f0]/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#5a5a40] text-[#f5f5f0] p-2 rounded-xl shadow-md rotate-3 hover:rotate-0 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black font-serif tracking-tight text-[#5a5a40]">生辰八字排盘大师</h1>
                <span className="text-[10px] bg-[#ebebe0] text-[#5a5a40] border border-[#dcdcc8] px-1.5 py-0.5 rounded font-extrabold font-sans">
                  专业精准版
                </span>
              </div>
              <p className="text-xs text-[#8a8a70] font-sans tracking-tight mt-0.5">
                精确经纬真太阳时折算 · 藏干副星神煞全析 · AI大师智能批释
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-[#5a5a40] hover:bg-[#5a5a40]/10 border border-dashed border-[#5a5a40] bg-transparent rounded-full px-4 py-1.5 font-bold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              API 大宗师设置
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#4a4a40] hover:bg-[#5a5a40] hover:text-[#f5f5f0] border border-[#5a5a40] bg-transparent rounded-full px-4 py-1.5 font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重置盘局
            </button>
            <a
              href="#bazi-input-panel"
              className="text-xs text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-4 py-1.5 font-bold transition-all shadow shadow-[#5a5a40]/10 cursor-pointer"
            >
              重新录入生日
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Banner with brief instructions */}
        <div className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm border border-[#e5e5d5] text-[#4a4a40]">
          {/* Decorative subtle sun symbol or background elements */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
            <Compass className="w-80 h-80 text-[#5a5a40] rotate-12" />
          </div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs bg-[#5a5a40] text-[#f5f5f0] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
              古天文学精演
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-serif leading-tight text-[#5a5a40]">
              差之双时，谬之千里。计算真太阳时对八字尤为要紧。
            </h2>
            <p className="text-[#8a8a70] text-sm leading-relaxed font-sans">
              我们日常使用的北京时间（东八区）对应的是东经120度。而中国疆域广大，真实的太阳运行时间（真太阳时）要由您出生地的精确经度，加上地球轨道因偏心率及倾角产生的均时差（Equation of Time）共同算定。本工具深度融合专业天文轨迹求解，为您复原纯正古法四柱。
            </p>
          </div>
        </div>

        {/* Layout Split: Left Input, Right Bazi Result */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Form (Takes up 4 cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            <BaziInput onCalculate={handleCalculate} />

            {/* Side-by-Side Astrology info references to make it educational and completed! */}
            <div className="bg-white border border-[#e5e5d5] rounded-2xl p-6 shadow-sm space-y-4 text-[#4a4a40]">
              <h4 className="font-serif font-bold text-[#5a5a40] border-b border-[#e5e5d5] pb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#5a5a40]" />
                八字速识指津
              </h4>
              <ul className="text-xs text-[#8a8a70] space-y-3 font-sans leading-relaxed">
                <li>
                  <strong>天干＆地支</strong>：天干主外、主表露；地支主内、主藏纳。
                </li>
                <li>
                  <strong>十神主星</strong>：日柱天干即是「日主」，其余七字均围绕日主生克计算（比肩、伤官、正官、偏财等）。
                </li>
                <li>
                  <strong>地支藏干</strong>：每个地支内部深藏着一到三分气（天干）。司局主事的称为「本气」，其余为余气、杂气。
                </li>
                <li>
                  <strong>神煞星光</strong>：神煞是古人总结的特殊气数。如「天乙贵人」主逢凶化吉多助；「文昌贵人」主天资绝顶利功名。
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Display Results (Takes up 7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-8">
            {baziResult ? (
              <div className="space-y-8">
                {/* 1. Four Pillars Main Matrix */}
                <BaziPillarsCard baziResult={baziResult} />

                {/* 2. Da Yun Timeline Details */}
                <DaYunTimeline baziResult={baziResult} />

                {/* 3. Flowing time / Current annual analysis */}
                <FlowingTimeCard baziResult={baziResult} onTargetDateChange={handleTargetDateChange} />

                {/* 4. Deep AI Bazi Interpretation */}
                <AiAnalysisCard 
                  baziResult={baziResult} 
                  apiConfig={apiConfig} 
                  onOpenApiSettings={() => setIsApiModalOpen(true)} 
                />
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#e5e5d5]">
                <p className="text-[#8a8a70]">请在左侧点击“开启生辰排盘”以生成您的专属八字大盘。</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Astro Educational Footer */}
      <footer className="bg-[#ebebe0] text-[#8a8a70] py-12 border-t border-[#dcdcc8] text-center space-y-4 mt-16 px-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-sm font-bold text-[#5a5a40] font-serif tracking-wider">千载国学 · 立法科学折算</p>
          <p className="text-xs leading-relaxed text-[#8a8a70] font-sans">
            本工具基于比利时天文学家 Jean Meeus 《Astronomical Algorithms》（天文算法）标准日相公式，结合太阳黄经精确求解二十四节气。真太阳时折算支持自定义和调节。AI大报告由 Gemini-3.5-flash 大模型全程解析。
          </p>
        </div>
        <div className="text-[10px] opacity-40 font-mono">
          &copy; React Bazi Calculator Master. All rights reserved.
        </div>
      </footer>

      {/* API Key configuration settings modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        config={apiConfig}
        onSave={(newConfig) => {
          setApiConfig(newConfig);
          localStorage.setItem("bazi_api_config", JSON.stringify(newConfig));
        }}
      />
    </div>
  );
}
