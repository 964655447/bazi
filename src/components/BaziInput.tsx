import { useState, useEffect } from "react";
import { FolderHeart, Trash2, BookmarkPlus } from "lucide-react";

interface BaziInputProps {
  onCalculate: (data: {
    name?: string;
    birthTime: string; // ISO or YYYY-MM-DD HH:mm
    longitude: number;
    cityName: string;
    gender: "男" | "女";
  }) => void;
}

interface SavedRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  gender: "男" | "女";
  cityName: string;
  lng: number;
  isCustomLng: boolean;
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
  const [name, setName] = useState("");
  // Default to a typical date-time, say 1995-10-18 08:30
  const [date, setDate] = useState("1995-10-18");
  const [time, setTime] = useState("08:30");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [customLng, setCustomLng] = useState<number>(116.4);
  const [isCustomLng, setIsCustomLng] = useState(false);
  const [customCityName, setCustomCityName] = useState("");

  // Load saved records
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>(() => {
    const saved = localStorage.getItem("bazi_library_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCityName = isCustomLng ? (customCityName || "自定义城市") : PRESET_CITIES[selectedCityIdx].name;
    const finalLng = isCustomLng ? customLng : PRESET_CITIES[selectedCityIdx].lng;
    
    onCalculate({
      name: name.trim() || undefined,
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

  // Save current form to the library
  const handleSaveToLibrary = () => {
    const finalCityName = isCustomLng ? (customCityName || "自定义城市") : PRESET_CITIES[selectedCityIdx].name;
    const finalLng = isCustomLng ? customLng : PRESET_CITIES[selectedCityIdx].lng;
    const recordName = name.trim() || `缘主 (${date})`;
    
    // Check if we already have a record with same details to overwrite, or just create a new one
    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      name: recordName,
      date,
      time,
      gender,
      cityName: finalCityName,
      lng: finalLng,
      isCustomLng
    };

    const updated = [newRecord, ...savedRecords.filter(r => r.name !== recordName || r.date !== date)];
    setSavedRecords(updated);
    localStorage.setItem("bazi_library_records", JSON.stringify(updated));
    setName(recordName);
  };

  // Load a record from the library
  const handleLoadRecord = (record: SavedRecord) => {
    setName(record.name);
    setDate(record.date);
    setTime(record.time);
    setGender(record.gender);
    
    // Find city index or custom setup
    const presetIdx = PRESET_CITIES.findIndex(c => c.name === record.cityName && Math.abs(c.lng - record.lng) < 0.1);
    if (presetIdx !== -1 && !record.isCustomLng) {
      setSelectedCityIdx(presetIdx);
      setIsCustomLng(false);
      setCustomLng(PRESET_CITIES[presetIdx].lng);
    } else {
      setIsCustomLng(true);
      setCustomLng(record.lng);
      setCustomCityName(record.cityName);
    }
  };

  // Delete a record from the library
  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading when clicking delete
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    localStorage.setItem("bazi_library_records", JSON.stringify(updated));
  };

  return (
    <div id="bazi-input-panel" className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e5e5d5] text-[#4a4a40]">
      <div className="flex items-center gap-3 mb-6 border-b border-[#e5e5d5] pb-4">
        <div className="bg-[#5a5a40] text-[#f5f5f0] px-3 py-1.5 rounded-full font-bold text-sm">庚</div>
        <div>
          <h2 className="text-xl font-bold text-[#5a5a40] font-sans tracking-tight">先天命符输入</h2>
          <p className="text-xs text-[#8a8a70] mt-0.5">请录入生辰信息以精准测算个人先天八字排盘命脉</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">缘主姓名</label>
            <input
              type="text"
              placeholder="请输入姓名（如：张三，选填）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-3 text-[#4a4a40] transition-colors"
            />
          </div>

          {/* Gender Select */}
          <div>
            <label className="block text-sm font-semibold text-[#4a4a40] mb-2">性别（乾坤阴阳）</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("男")}
                className={`py-3 rounded-full font-medium border text-sm transition-all cursor-pointer ${
                  gender === "男"
                    ? "bg-[#5a5a40] text-[#f5f5f0] border-[#5a5a40] shadow-sm font-bold"
                    : "bg-[#ebebe0]/50 text-[#8a8a70] border-[#dcdcc8] hover:bg-[#ebebe0]"
                }`}
              >
                乾造 (男命)
              </button>
              <button
                type="button"
                onClick={() => setGender("女")}
                className={`py-3 rounded-full font-medium border text-sm transition-all cursor-pointer ${
                  gender === "女"
                    ? "bg-[#5a5a40] text-[#f5f5f0] border-[#5a5a40] shadow-sm font-bold"
                    : "bg-[#ebebe0]/50 text-[#8a8a70] border-[#dcdcc8] hover:bg-[#ebebe0]"
                }`}
              >
                坤造 (女命)
              </button>
            </div>
          </div>
        </div>

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

        {/* Location Select */}
        <div>
          <label className="block text-sm font-semibold text-[#4a4a40] mb-2">出生省市地点(计算太阳时)</label>
          <select
            value={isCustomLng ? "custom" : selectedCityIdx}
            onChange={handleCityChange}
            className="w-full bg-[#f5f5f0]/50 border border-[#dcdcc8] focus:border-[#5a5a40] focus:ring-1 focus:ring-[#5a5a40] rounded-xl px-4 py-3 text-[#4a4a40] cursor-pointer"
          >
            {PRESET_CITIES.map((c, idx) => (
              <option key={idx} value={idx}>
                {c.name} (东经 {c.lng.toFixed(1)} 度)
              </option>
            ))}
            <option value="custom">✍️ 手动输入经度地区</option>
          </select>
        </div>

        {/* Custom Longitude coordinates fine-tuning */}
        <div className="p-4 bg-[#ebebe0]/40 border border-[#e5e5d5] rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#8a8a70] uppercase font-sans tracking-wider">真太阳时经度校验</span>
            <span className="text-sm font-extrabold text-[#5a5a40] font-mono bg-white px-2.5 py-1 rounded border border-[#dcdcc8]">
              东经 {customLng.toFixed(2)} 度
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-[2] bg-[#5a5a40] hover:bg-[#4a4a40] text-[#f5f5f0] font-bold py-4 rounded-full shadow hover:shadow-md transition-all cursor-pointer text-center text-sm md:text-lg tracking-widest font-serif"
          >
            ☯️ 开启生辰排盘
          </button>
          
          <button
            type="button"
            onClick={handleSaveToLibrary}
            className="flex-1 bg-[#ebebe0]/80 hover:bg-[#ebebe0] text-[#5a5a40] border border-[#dcdcc8] font-bold py-4 rounded-full shadow-sm transition-all cursor-pointer text-xs md:text-sm text-center flex items-center justify-center gap-1.5"
            title="将当前信息保存至本地，下次可快速载入"
          >
            <BookmarkPlus className="w-4 h-4" />
            存入命理库
          </button>
        </div>

        {/* 📜 古籍命理库 (Local Storage Library) */}
        {savedRecords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-dashed border-[#dcdcc8]">
            <div className="flex items-center gap-2 mb-3">
              <FolderHeart className="w-4 h-4 text-[#5a5a40]" />
              <h3 className="text-sm font-bold text-[#5a5a40] font-serif">📜 先天阁内珍藏命谱</h3>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {savedRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleLoadRecord(record)}
                  className="flex items-center gap-2 bg-[#fcfaf2]/50 hover:bg-[#ebebe0]/80 border border-[#dcdcc8] rounded-lg px-3 py-2 text-xs cursor-pointer transition-all hover:scale-[1.01] shadow-sm select-none group"
                >
                  <span className="font-bold text-[#4a4a40]">
                    {record.name} ({record.gender === "男" ? "乾" : "坤"})
                  </span>
                  <span className="text-[10px] text-[#8a8a70] font-sans">
                    {record.date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteRecord(record.id, e)}
                    className="text-[#8a8a70]/50 hover:text-rose-600 transition-colors p-0.5 rounded"
                    title="移出此命谱"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#8a8a70] font-sans mt-2 ml-1 leading-normal">
              提示：该名册完全储存在个人电脑/手机本地缓存，绝不上传云端，十足隐私，安全称心。
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
