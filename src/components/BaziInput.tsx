import { useState } from "react";

interface BaziInputProps {
  onCalculate: (data: {
    birthTime: string; // ISO or YYYY-MM-DD HH:mm
    longitude: number;
    cityName: string;
    gender: "男" | "女";
  }) => void;
}

const PRESET_CITIES = [
  { name: "北京", lng: 116.4 },
  { name: "上海", lng: 121.5 },
  { name: "广州", lng: 113.3 },
  { name: "深圳", lng: 114.1 },
  { name: "杭州", lng: 120.2 },
  { name: "成都", lng: 104.1 },
  { name: "重庆", lng: 106.5 },
  { name: "武汉", lng: 114.3 },
  { name: "西安", lng: 108.9 },
  { name: "郑州", lng: 113.7 },
  { name: "南京", lng: 118.8 },
  { name: "长沙", lng: 112.9 },
  { name: "济南", lng: 117.0 },
  { name: "沈阳", lng: 123.4 },
  { name: "乌鲁木齐", lng: 87.6 },
  { name: "拉萨", lng: 91.1 },
  { name: "昆明", lng: 102.7 },
  { name: "台北", lng: 121.5 },
  { name: "香港", lng: 114.2 }
];

export default function BaziInput({ onCalculate }: BaziInputProps) {
  // Default to a typical date-time, say 1995-10-18 08:30
  const [date, setDate] = useState("1995-10-18");
  const [time, setTime] = useState("08:30");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [customLng, setCustomLng] = useState<number>(116.4);
  const [isCustomLng, setIsCustomLng] = useState(false);
  const [customCityName, setCustomCityName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCityName = isCustomLng ? (customCityName || "自定义城市") : PRESET_CITIES[selectedCityIdx].name;
    const finalLng = isCustomLng ? customLng : PRESET_CITIES[selectedCityIdx].lng;
    
    onCalculate({
      birthTime: `${date} ${time}`,
      longitude: finalLng,
      cityName: finalCityName,
      gender
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustomLng(true);
    } else {
      setIsCustomLng(false);
      const idx = parseInt(val, 10);
      setSelectedCityIdx(idx);
      setCustomLng(PRESET_CITIES[idx].lng);
    }
  };

  return (
    <div id="bazi-input-panel" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e5e5d5] text-[#4a4a40]">
      <div className="flex items-center gap-3 mb-6 border-b border-[#e5e5d5] pb-4">
        <div className="bg-[#5a5a40] text-[#f5f5f0] px-3 py-1.5 rounded-full font-bold text-sm">庚</div>
        <div>
          <h2 className="text-xl font-bold text-[#5a5a40] font-sans tracking-tight">先天命符输入</h2>
          <p className="text-xs text-[#8a8a70] font-mono mt-0.5">Please provide birth details to plot the natal chart</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Birth Date */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">出生公历日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-3 text-[#4a4a40] transition-colors cursor-pointer"
            />
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">出生时间（北京时间）</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-3 text-[#4a4a40] transition-colors cursor-pointer font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gender Select */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">性别（乾坤阴阳）</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("男")}
                className={`py-3 rounded-full font-medium border transition-all ${
                  gender === "男"
                    ? "bg-[#5a5a40] text-[#f5f5f0] border-[#5a5a40] shadow-sm"
                    : "bg-[#ebebe0]/50 text-[#8a8a70] border-[#dcdcc8] hover:bg-[#ebebe0]"
                }`}
              >
                乾造 (男命)
              </button>
              <button
                type="button"
                onClick={() => setGender("女")}
                className={`py-3 rounded-full font-medium border transition-all ${
                  gender === "女"
                    ? "bg-[#5a5a40] text-[#f5f5f0] border-[#5a5a40] shadow-sm"
                    : "bg-[#ebebe0]/50 text-[#8a8a70] border-[#dcdcc8] hover:bg-[#ebebe0]"
                }`}
              >
                坤造 (女命)
              </button>
            </div>
          </div>

          {/* Location Select */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">出生省市地点(计算太阳时)</label>
            <select
              onChange={handleCityChange}
              className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-3 text-[#4a4a40] cursor-pointer"
            >
              {PRESET_CITIES.map((c, idx) => (
                <option key={idx} value={idx}>
                  {c.name} ({c.lng.toFixed(1)}°E)
                </option>
              ))}
              <option value="custom">✍️ 手动输入经度地区</option>
            </select>
          </div>
        </div>

        {/* Custom Longitude coordinates fine-tuning */}
        <div className="p-4 bg-[#ebebe0]/40 border border-[#e5e5d5] rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#8a8a70] uppercase font-sans tracking-wider">真太阳时经度校验</span>
            <span className="text-sm font-extrabold text-[#5a5a40] font-mono bg-white px-2.5 py-1 rounded border border-[#dcdcc8]">
              {customLng.toFixed(2)}° E
            </span>
          </div>

          {isCustomLng && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <input
                type="text"
                placeholder="城市名称 (例如：洛阳)"
                value={customCityName}
                onChange={(e) => setCustomCityName(e.target.value)}
                className="bg-white border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-3 py-2 text-sm text-[#4a4a40]"
              />
              <span className="text-xs text-[#8a8a70] self-center">精确转换经纬度能极大校准月份分界交界时的八字柱位哦</span>
            </div>
          )}

          <input
            type="range"
            min="70"
            max="135"
            step="0.01"
            value={customLng}
            onChange={(e) => {
              setCustomLng(parseFloat(e.target.value));
              if (!isCustomLng) {
                setIsCustomLng(true);
                setCustomCityName("经度调节区");
              }
            }}
            className="w-full h-1.5 bg-[#dcdcc8] rounded-lg appearance-none cursor-pointer accent-[#5a5a40]"
          />
          <div className="flex justify-between text-[10px] text-[#8a8a70] font-mono">
            <span>西部 70.0°（喀什地区）</span>
            <span>中部 105°（西安附近）</span>
            <span>东部 135.0° (抚远)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-[#5a5a40] hover:bg-[#4a4a40] text-[#f5f5f0] font-bold py-4 rounded-full shadow hover:shadow-md transition-all cursor-pointer text-center text-lg tracking-widest font-serif"
        >
          ☯️ 开启生辰排盘
        </button>
      </form>
    </div>
  );
}
