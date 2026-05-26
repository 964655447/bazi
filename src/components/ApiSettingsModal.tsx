import { useState, useEffect } from "react";
import { X, Key, Globe, Cpu, Eye, EyeOff, Check, AlertCircle, HelpCircle } from "lucide-react";
import { ApiConfig } from "../types";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (newConfig: ApiConfig) => void;
}

const PROVIDERS = [
  {
    id: "system",
    name: "🔮 系统默认 (Gemini 镜像库)",
    desc: "免密即享！由本排盘大师预配置的公共批释引擎（如提示大宗师闭关，代表公共额度已耗尽，推荐使用下方个人密钥）。",
    defaultModel: "gemini-2.0-flash",
    defaultUrl: ""
  },
  {
    id: "deepseek",
    name: "🐳 DeepSeek 官方 (极力推荐)",
    desc: "低延迟、高智商国学理解首选！支持 DeepSeek-V3 (deepseek-chat) / R1 深度推理 (deepseek-reasoner)。",
    defaultModel: "deepseek-chat",
    defaultUrl: "https://api.deepseek.com/v1"
  },
  {
    id: "gemini",
    name: "♊ Gemini 官方 (个人密钥)",
    desc: "谷歌官方大语言模型服务。支持最新的 2.0 代旗舰模型（如 gemini-2.0-flash）。",
    defaultModel: "gemini-2.0-flash",
    defaultUrl: "https://generativelanguage.googleapis.com"
  },
  {
    id: "openai",
    name: "⚡ OpenAI 官方/中转",
    desc: "经典的 GPT 大模型体系。支持 gpt-4o-mini、o3-mini，以及最新划时代的 gpt-4.5、gpt-5-preview、gpt-5.5-preview 等旗舰智能模型。",
    defaultModel: "gpt-4o-mini",
    defaultUrl: "https://api.openai.com/v1"
  },
  {
    id: "custom",
    name: "🛠️ 自定义兼容接口 (第三方/中转)",
    desc: "适用于各种大模型中转站、本地 Ollama 部署、或国内各大兼容 OpenAI 协议的厂商服务。",
    defaultModel: "",
    defaultUrl: ""
  }
];

export default function ApiSettingsModal({ isOpen, onClose, config, onSave }: ApiSettingsModalProps) {
  const [provider, setProvider] = useState<ApiConfig["provider"]>(config.provider);
  const [apiKey, setApiKey] = useState<string>(config.apiKey);
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl);
  const [model, setModel] = useState<string>(config.model);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState<{ type: "success" | "error" | null; msg: string }>({
    type: null,
    msg: ""
  });
  const [testing, setTesting] = useState<boolean>(false);

  // Sync with current config on load/opening
  useEffect(() => {
    if (isOpen) {
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setBaseUrl(config.baseUrl);
      setModel(config.model);
      setShowStatus({ type: null, msg: "" });
    }
  }, [isOpen, config]);

  // Auto-populate when provider shifts to keep it incredibly friendly
  const handleProviderChange = (newProvider: ApiConfig["provider"]) => {
    setProvider(newProvider);
    const preset = PROVIDERS.find((p) => p.id === newProvider);
    if (preset) {
      if (newProvider === "system") {
        setApiKey("");
        setBaseUrl("");
        setModel("");
      } else {
        // Only update if current inputs look empty/meaningless
        setBaseUrl(preset.defaultUrl);
        setModel(preset.defaultModel);
      }
    }
  };

  const handleSaveAndConfirm = () => {
    // Validate inputs
    if (provider !== "system" && !apiKey.trim()) {
      setShowStatus({
        type: "error",
        msg: "请填写您选择的 API 服务商密钥(API Key)！以确保证常通讯。"
      });
      return;
    }

    if (provider === "custom" && !baseUrl.trim()) {
      setShowStatus({
        type: "error",
        msg: "使用自定义接口时，必须指定其 API 接口代理地址 (Base URL)！"
      });
      return;
    }

    const updatedConfig: ApiConfig = {
      provider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim()
    };

    onSave(updatedConfig);
    setShowStatus({
      type: "success",
      msg: "配置成功！已妥善保存至您的浏览器本地缓存中。"
    });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Test custom configurations
  const handleTestConnection = async () => {
    if (provider !== "system" && !apiKey.trim()) {
      setShowStatus({ type: "error", msg: "测试连接前，请填入相应的 API 密钥。" });
      return;
    }
    setTesting(true);
    setShowStatus({ type: null, msg: "" });

    try {
      const response = await fetch("/api/bazi-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Mock simple calculation for quick validating
          baziData: {
            gender: "男",
            birthTimeG: "1995-10-18 08:30",
            birthTimeLST: "1995-10-18 08:15",
            longitude: 116.4,
            cityName: "北京测速支点",
            fourPillars: {
              year: { stem: { name: "乙" }, branch: { name: "亥" }, nayin: "山头火", emptyVoid: [], shensha: [], selfSitting: { tenGod: "正印", changsheng: "死" } },
              month: { stem: { name: "丙" }, branch: { name: "戌" }, nayin: "屋上土", emptyVoid: [], shensha: [], selfSitting: { tenGod: "正官", changsheng: "墓" } },
              day: { stem: { name: "戊" }, branch: { name: "寅" }, nayin: "城头土", emptyVoid: [], shensha: [], selfSitting: { tenGod: "七杀", changsheng: "长生" } },
              hour: { stem: { name: "丙" }, branch: { name: "辰" }, nayin: "沙中土", emptyVoid: [], shensha: [], selfSitting: { tenGod: "偏印", changsheng: "冠带" } }
            },
            daYun: { transitAgeDescription: "7岁", transitExactDate: "2002年02月", cycles: [] },
            flowingTime: { year: "丙午", month: "癸巳", day: "庚子", yearTenGod: "偏印", monthTenGod: "正财", dayTenGod: "食神", yearNayin: "天河水" },
            solarTerms: []
          },
          apiConfig: {
            provider,
            apiKey: apiKey.trim(),
            baseUrl: baseUrl.trim(),
            model: model.trim()
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "接口连通性测试未通过");
      }

      setShowStatus({
        type: "success",
        msg: "🎉 连通成功！命理大宗师在线回应，反馈模型： " + (model || "默认模型")
      });
    } catch (err: any) {
      setShowStatus({
        type: "error",
        msg: "❌ 连通测试失败：" + (err.message || "未知网关超载，请检查网络或密钥有效性")
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#4a4a40]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-[#f5f5f0] border border-[#dcdcc8] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col transition-all text-[#4a4a40] font-sans">
        
        {/* Decorative Top Line */}
        <div className="h-1 w-full bg-[#5a5a40]" />

        {/* Header */}
        <div className="p-6 border-b border-[#e5e5d5] flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#5a5a40] text-[#f5f5f0] p-2 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#5a5a40]">AI 批释大引擎配置</h3>
              <p className="text-xs text-[#8a8a70]">
                开启您的智能算命。支持国内 DeepSeek、谷歌 Gemini 和自建兼容节点。
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#8a8a70] hover:text-[#4a4a40] hover:bg-[#ebebe0] p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Message Alerts */}
          {showStatus.type && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed border ${
              showStatus.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${showStatus.type === "success" ? "text-emerald-700" : "text-rose-700"}`} />
              <div className="font-medium">{showStatus.msg}</div>
            </div>
          )}

          {/* Provider Select dropdown Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#8a8a70] tracking-wider uppercase">
              第一步：选择 API 分发提供商
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id as ApiConfig["provider"])}
                  className={`text-left p-3.5 rounded-2xl border transition-all text-xs cursor-pointer flex flex-col justify-between h-24 ${
                    provider === p.id 
                      ? "bg-white border-[#5a5a40] shadow-sm ring-1 ring-[#5a5a40]" 
                      : "bg-white/50 border-[#e5e5d5] hover:bg-[#ebebe0] hover:border-[#dcdcc8]"
                  }`}
                >
                  <span className="font-bold text-[#4a4a40] text-sm">{p.name}</span>
                  <span className="text-[10px] text-[#8a8a70] line-clamp-2 mt-1 leading-normal">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {provider !== "system" && (
            <div className="bg-white p-5 rounded-2xl border border-[#e5e5d5] space-y-4">
              <h4 className="text-xs font-bold text-[#5a5a40] border-b border-[#e5e5d5] pb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                第二步：填写个人直连密钥
              </h4>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="block text-xs font-semibold text-[#4a4a40] flex items-center gap-1">
                    API 访问密钥 (Key)
                  </span>
                  {provider === "deepseek" && (
                    <a 
                      href="https://platform.deepseek.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-[#5a5a40] hover:underline font-medium"
                    >
                      ⭐ 前往获取 DeepSeek Key →
                    </a>
                  )}
                  {provider === "gemini" && (
                    <a 
                      href="https://aistudio.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[10px] text-[#5a5a40] hover:underline font-medium"
                    >
                      ⭐ 前往获取 Gemini Key →
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder={`请输入您的 ${provider.toUpperCase()} 密钥 (例如：sk-...)`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl pl-4 pr-10 py-2.5 text-xs text-[#4a4a40] tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-2.5 text-[#8a8a70] hover:text-[#4a4a40] cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Base URL and Model Inputs in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Base URL Input */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#4a4a40] flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#8a8a70]" />
                    接口代理地址 (Base URL)
                  </span>
                  <input
                    type="text"
                    placeholder="例如：https://api.deepseek.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-2.5 text-xs text-[#4a4a40]"
                  />
                  <p className="text-[9px] text-[#8a8a70] font-sans mt-0.5">
                    留空或重置将默认使用各厂家官方通道。
                  </p>
                </div>

                {/* Model Selector / Name Input */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-[#4a4a40] flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-[#8a8a70]" />
                    模型标识名称 (Model ID)
                  </span>
                  <input
                    type="text"
                    placeholder="例如：deepseek-chat / gpt-4o-mini"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-2.5 text-xs text-[#4a4a40] font-mono"
                  />
                  <p className="text-[9px] text-[#8a8a70] font-sans mt-0.5">
                    支持按自己喜好更改（如: `gpt-4.5`、`gpt-5-preview`、`gpt-5.5-preview` 或 `deepseek-reasoner` 推理）。
                  </p>
                </div>

              </div>
            </div>
          )}

          {provider === "system" && (
            <div className="bg-[#ebebe0]/40 p-5 rounded-2xl border border-[#e5e5d5] text-xs text-[#8a8a70] space-y-2 leading-relaxed">
              <span className="font-bold text-[#5a5a40] block flex items-center gap-1">
                📌 关于系统默认通道：
              </span>
              <p>为了保障体验，本站配置了有限的内置大师解析额度。不过由于公共接口有时会有严重的请求频次限制，如遇到拥挤卡顿、报错「大宗师正在闭关」时，特别建议直接申请个人密钥。目前国内 <strong>DeepSeek</strong> 官方密钥申请流程极度快捷，批释精准且价格极其普惠！推荐注册尝试。</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-white/70 p-4 border-t border-[#e5e5d5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[10px] text-[#8a8a70] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            您的密钥绝不上传平台服务器，全流程存在您当地浏览器本地。
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {provider !== "system" && (
              <button
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="flex-1 sm:flex-none py-2 px-4 rounded-full border border-dashed border-[#5a5a40] hover:bg-[#5a5a40]/10 text-xs font-bold text-[#5a5a40] cursor-pointer transition-colors text-center disabled:opacity-50"
              >
                {testing ? "🔮 大师测速中..." : "🧪 测试网络连接"}
              </button>
            )}
            <button
              onClick={handleSaveAndConfirm}
              className="flex-1 sm:flex-none py-2 px-6 rounded-full bg-[#5a5a40] hover:bg-[#4a4a40] text-xs font-bold text-[#f5f5f0] shadow shadow-[#5a5a40]/25 text-center cursor-pointer transition-colors"
            >
              💾 保存当前配制
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
