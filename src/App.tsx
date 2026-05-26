import { useState } from "react";
import { compileBazi } from "./utils/astronomy";
import { BaziChartResult, ApiConfig } from "./types";
import BaziInput from "./components/BaziInput";
import BaziPillarsCard from "./components/BaziPillarsCard";
import DaYunTimeline from "./components/DaYunTimeline";
import FlowingTimeCard from "./components/FlowingTimeCard";
import AiAnalysisCard from "./components/AiAnalysisCard";
import ApiSettingsModal from "./components/ApiSettingsModal";
import { Compass, BookOpen, Clock, RefreshCw, Sun, Sliders, BookmarkPlus } from "lucide-react";

export default function App() {
  const [baziResult, setBaziResult] = useState<BaziChartResult | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [currentName, setCurrentName] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
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

  // Initialize with a default chart reference
  useState(() => {
    const defaultSample = compileBazi("1995-10-18 08:30", 116.4, "北京", "男");
    setBaziResult(defaultSample);
    setCurrentName("");
    setIsSaved(false);
  });

  const handleCalculate = (data: {
    name?: string;
    birthTime: string;
    longitude: number;
    cityName: string;
    gender: "男" | "女";
  }) => {
    const result = compileBazi(data.birthTime, data.longitude, data.cityName, data.gender);
    setBaziResult(result);
    setCurrentName(data.name || "");
    setShowResult(true);
    setIsSaved(false);
  };

  const handleSaveFromResults = () => {
    if (!baziResult) return;
    
    // Parse date and time
    const [date, time] = baziResult.birthTimeG.split(" ");
    
    // Check if we are custom or preset LNG
    const PRESETS = [
      { name: "北京", lng: 116.4 },
      { name: "上海", lng: 121.5 },
      { name: "广州", lng: 113.3 },
      { name: "深圳", lng: 114.1 },
      { name: "成都", lng: 104.1 },
      { name: "杭州", lng: 120.2 },
      { name: "重庆", lng: 106.5 },
      { name: "拉萨", lng: 91.1 },
      { name: "乌鲁木齐", lng: 87.6 },
      { name: "哈尔滨", lng: 126.6 },
      { name: "西安", lng: 108.9 }
    ];
    
    const matchedPreset = PRESETS.find(p => p.name === baziResult.cityName && Math.abs(p.lng - baziResult.longitude) < 0.1);
    const isCustomLng = !matchedPreset;

    const recordName = currentName.trim() || `缘主 (${date})`;
    
    const newRecord = {
      id: Date.now().toString(),
      name: recordName,
      date,
      time,
      gender: baziResult.gender,
      cityName: baziResult.cityName,
      lng: baziResult.longitude,
      isCustomLng
    };

    // Load existing records to merge
    let existing: any[] = [];
    const saved = localStorage.getItem("bazi_library_records");
    if (saved) {
      try {
        existing = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    const updated = [newRecord, ...existing.filter(r => r.name !== recordName || r.date !== date)];
    localStorage.setItem("bazi_library_records", JSON.stringify(updated));
    setIsSaved(true);
  };

  const handleTargetDateChange = (newResult: BaziChartResult) => {
    setBaziResult(newResult);
  };

  const handleReset = () => {
    // Reset back to Beijing sample and inputs
    const defaultSample = compileBazi("1995-10-18 08:30", 116.4, "北京", "男");
    setBaziResult(defaultSample);
    setShowResult(false);
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
              重置测算
            </button>
            {showResult && (
              <button
                onClick={() => setShowResult(false)}
                className="text-xs text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-4 py-1.5 font-bold transition-all shadow shadow-[#5a5a40]/10 cursor-pointer flex items-center gap-1"
              >
                ← 返回修改生辰
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-[fadeIn_0.3s_ease-out]">
        {!showResult ? (
          /* 1. Input Screen: centered single-column for focus and simplicity */
          <div className="max-w-2xl mx-auto space-y-6">
            <BaziInput onCalculate={handleCalculate} />

            {/* Banner with brief instructions */}
            <div className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-sm border border-[#e5e5d5] text-[#4a4a40]">
              {/* Decorative subtle sun symbol or background elements */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
                <Compass className="w-48 h-48 text-[#5a5a40] rotate-12" />
              </div>

              <div className="space-y-3 relative z-10">
                <span className="text-[10px] bg-[#5a5a40] text-[#f5f5f0] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
                  古天文学精演
                </span>
                <h2 className="text-base font-bold font-serif leading-snug text-[#5a5a40]">
                  差之双时，谬之千里。<br />计算真太阳时对平算八字尤为要紧。
                </h2>
                <p className="text-[#8a8a70] text-xs leading-relaxed font-sans mt-1">
                  日常所用北京时间对应东经120度。由于中国疆域辽阔，而真实的命主受气时辰（真太阳时）须依据您出生地的精确经度，再结合地球公转产生的真平太阳时差共同算定。本系统深度集成古算历法解算，为您还原精准四柱。
                </p>
              </div>
            </div>

            {/* Side-by-Side Astrology info references */}
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
        ) : (
          /* 2. Results Screen: full width detailed layout */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Navigation back and header metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/65 p-4 border border-[#e5e5d5] rounded-2xl shadow-sm">
              <div>
                <span className="text-xs bg-[#5a5a40] text-[#f5f5f0] px-3 py-1 rounded-full font-bold">
                  ☯️ 乾坤排盘已定
                </span>
                <span className="ml-3 text-xs text-[#5a5a40] font-sans">
                  缘主姓名: <strong className="text-[#5a5a40] font-bold font-serif">{currentName || "未名缘主"}</strong> &middot; 性别: <strong className="text-[#5a5a40] font-bold font-serif">{baziResult?.gender}</strong> &middot; 出生时间: {baziResult?.birthTimeG}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveFromResults}
                  className={`flex items-center justify-center gap-1.5 text-xs rounded-full px-4 py-2.5 font-bold transition-all shadow-sm cursor-pointer border ${
                    isSaved
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-[#ebebe0]/80 hover:bg-[#ebebe0] text-[#5a5a40] border-[#dcdcc8]"
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  {isSaved ? "已存入命理库" : "存入本地命理库"}
                </button>
                <button
                  onClick={() => setShowResult(false)}
                  className="flex items-center justify-center gap-1.5 text-xs text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-4 py-2.5 font-bold transition-all shadow shadow-[#5a5a40]/10 cursor-pointer"
                >
                  ← 返回修改生辰
                </button>
              </div>
            </div>

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
                  name={currentName}
                />

                {/* Bottom Back Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowResult(false)}
                    className="flex items-center gap-2 text-sm text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-8 py-3.5 font-bold transition-all shadow-md shadow-[#5a5a40]/15 cursor-pointer font-serif"
                  >
                    ← 返回重新录入先天命符
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-[#e5e5d5]">
                <p className="text-[#8a8a70]">未能成功加载排盘数据，请返回重新测算。</p>
                <button
                  onClick={() => setShowResult(false)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#f5f5f0] bg-[#5a5a40] hover:bg-[#4a4a40] rounded-full px-4 py-2 font-bold transition-all cursor-pointer"
                >
                  返回输入界面
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Astro Educational Footer */}
      <footer className="bg-[#ebebe0] text-[#8a8a70] py-12 border-t border-[#dcdcc8] text-center space-y-4 mt-16 px-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-sm font-bold text-[#5a5a40] font-serif tracking-wider">千载国学 · 立法科学折算</p>
          <p className="text-xs leading-relaxed text-[#8a8a70] font-sans">
            本工具基于天文学标准日相公式，结合黄经精确求解二十四节气。真太阳时折算支持自定义和调节。AI大报告由预设大语言模型全程解析。
          </p>
        </div>
        <div className="text-[10px] opacity-40 font-mono">
          &copy; 2026 生辰八字排盘大宗师. 保留所有权利。
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
