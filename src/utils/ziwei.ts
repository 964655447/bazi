import { Solar } from "lunar-javascript";
import { getNayin } from "./astronomy";

export interface Star {
  name: string;
  type: "major" | "soft" | "tough" | "lucun" | "tianma" | "flower" | "adjective" | "helper";
  brightness?: string;
  scope: "origin";
}

export interface ZWDSPalace {
  branchIdx: number;
  branchName: string;
  stemName: string;
  palaceName: string;
  isMingGong: boolean;
  isShenGong: boolean;
  isOriginalPalace: boolean;
  decadalStart: number;
  decadalEnd: number;
  majorStars: Star[];
  minorStars: Star[];
  adjectiveStars: Star[];
  changsheng12: string;
  boshi12: string;
  gridPos: { r: number; c: number };
  suiqian12: string;
  jiangqian12: string;
}

export interface ZWDSChart {
  birthTimeG: string;
  birthTimeL: string;
  name: string;
  gender: "男" | "女";
  yearGanZhi: string;
  mingJu: string;
  mingZhu: string;
  shenZhi: string;
  palaces: ZWDSPalace[];
  yearlyDate?: string;
}

const CHINESE_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const CHINESE_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BOARD_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

const GRID_COORDS = [
  { r: 3, c: 0 },
  { r: 2, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 0, c: 3 },
  { r: 1, c: 3 },
  { r: 2, c: 3 },
  { r: 3, c: 3 },
  { r: 3, c: 2 },
  { r: 3, c: 1 }
];

const MING_ZHU_MAP: { [key: number]: string } = {
  0: "禄存",   // 寅
  1: "文曲",   // 卯
  2: "廉贞",   // 辰
  3: "武曲",   // 巳
  4: "破军",   // 午
  5: "武曲",   // 未
  6: "廉贞",   // 申
  7: "文曲",   // 酉
  8: "禄存",   // 戌
  9: "巨门",   // 亥
  10: "贪狼",  // 子
  11: "巨门"   // 丑
};

const SHEN_ZHU_MAP = [
  "天相", "天梁", "天同", "天机", "文昌", "火星",
  "天相", "天梁", "天同", "天机", "文昌", "火星"
];

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

const BRIGHTNESS_RULES: { [star: string]: string[] } = {
  "紫微": ["旺", "旺", "得", "旺", "庙", "庙", "旺", "旺", "得", "旺", "平", "庙"],
  "天机": ["得", "旺", "利", "平", "庙", "陷", "得", "旺", "利", "平", "庙", "陷"],
  "太阳": ["旺", "庙", "旺", "旺", "旺", "得", "得", "陷", "不", "陷", "不", "不"],
  "武曲": ["得", "利", "庙", "平", "旺", "庙", "得", "利", "庙", "平", "旺", "庙"],
  "天同": ["利", "平", "平", "庙", "陷", "不", "旺", "平", "平", "庙", "旺", "不"],
  "廉贞": ["庙", "平", "利", "陷", "平", "利", "庙", "平", "利", "陷", "平", "利"],
  "天府": ["庙", "得", "庙", "得", "旺", "庙", "得", "旺", "庙", "得", "庙", "庙"],
  "太阴": ["旺", "陷", "陷", "陷", "不", "不", "利", "不", "旺", "庙", "庙", "庙"],
  "贪狼": ["平", "利", "庙", "陷", "旺", "庙", "平", "利", "庙", "陷", "旺", "庙"],
  "巨门": ["庙", "庙", "陷", "旺", "旺", "不", "庙", "庙", "陷", "旺", "旺", "不"],
  "天相": ["庙", "陷", "得", "得", "庙", "得", "庙", "陷", "得", "得", "庙", "庙"],
  "天梁": ["庙", "庙", "庙", "陷", "庙", "旺", "陷", "得", "庙", "陷", "庙", "旺"],
  "七杀": ["庙", "旺", "庙", "平", "旺", "庙", "庙", "庙", "庙", "平", "旺", "庙"],
  "破军": ["得", "陷", "旺", "平", "庙", "旺", "得", "陷", "旺", "平", "庙", "旺"]
};

const CHANG_SHENG_12 = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];

const BOSHI_12 = ["博士", "力士", "青龙", "小耗", "将军", "奏书", "飞廉", "喜神", "病符", "大耗", "伏兵", "官府"];

const fixIndex = (idx: number): number => ((idx % 12) + 12) % 12;

const getBrightness = (starName: string, branchIdx: number): string => {
  const rules = BRIGHTNESS_RULES[starName];
  if (!rules) return "平";
  return rules[branchIdx % 12] || "平";
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

const getHuoLingIndex = (yearBranchIdx: number, timeIdx: number): { huoIdx: number; lingIdx: number } => {
  let huoIdx = 0;
  let lingIdx = 0;
  if ([2, 6, 10].includes(yearBranchIdx)) {
    huoIdx = 11 + timeIdx;
    lingIdx = 1 + timeIdx;
  } else if ([8, 0, 4].includes(yearBranchIdx)) {
    huoIdx = 0 + timeIdx;
    lingIdx = 8 + timeIdx;
  } else if ([5, 9, 1].includes(yearBranchIdx)) {
    huoIdx = 1 + timeIdx;
    lingIdx = 8 + timeIdx;
  } else {
    huoIdx = 7 + timeIdx;
    lingIdx = 8 + timeIdx;
  }
  return { huoIdx: fixIndex(huoIdx), lingIdx: fixIndex(lingIdx) };
};

const SUIQIAN12_NAMES = ["岁建", "晦气", "丧门", "贯索", "官符", "小耗", "岁破", "龙德", "白虎", "天德", "吊客", "病符"];

const JIANGQIAN12_NAMES = ["将星", "攀鞍", "岁驿", "息神", "华盖", "劫煞", "灾煞", "天煞", "指背", "咸池", "月煞", "亡神"];

const getSuiqian12 = (yearBranchIdx: number): string[] => {
  const boardIdx = fixIndex(yearBranchIdx - 2);
  const result: string[] = [];
  for (let i = 0; i < 12; i++) {
    const idx = fixIndex(boardIdx + i);
    result[idx] = SUIQIAN12_NAMES[i];
  }
  return result;
};

const getJiangqian12StartIndex = (yearBranchIdx: number): number => {
  if ([2, 6, 10].includes(yearBranchIdx)) return 4;
  if ([8, 0, 4].includes(yearBranchIdx)) return 10;
  if ([5, 9, 1].includes(yearBranchIdx)) return 7;
  if ([11, 3, 7].includes(yearBranchIdx)) return 1;
  return 0;
};

const getJiangqian12 = (yearBranchIdx: number): string[] => {
  const startIdx = getJiangqian12StartIndex(yearBranchIdx);
  const result: string[] = [];
  for (let i = 0; i < 12; i++) {
    const idx = fixIndex(startIdx + i);
    result[idx] = JIANGQIAN12_NAMES[i];
  }
  return result;
};

export function compileZiwei(
  gregorianDateStr: string,
  longitude: number,
  cityName: string,
  gender: "男" | "女",
  name: string = "缘主"
): ZWDSChart {
  const [datePart, timePart] = gregorianDateStr.split(" ");
  const [yearStr, monthStr, dayStr] = datePart.split("-");
  const [hourStr] = timePart.split(":");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const hour = parseInt(hourStr);

  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();

  const lMonthRaw = lunar.getMonth();
  const isLeap = lMonthRaw < 0;
  const lMonthAbs = Math.abs(lMonthRaw);
  let finalMonthForZwi = lMonthAbs;
  if (isLeap) {
    finalMonthForZwi = lMonthAbs + 1;
  }
  const lDay = lunar.getDay();
  const yearGan = lunar.getYearGan();
  const yearZhi = lunar.getYearZhi();
  const yearStemIdx = CHINESE_STEMS.indexOf(yearGan);
  const yearBranchIdx = CHINESE_BRANCHES.indexOf(yearZhi);

  const hourIdxFromZi = Math.floor((hour + 1) / 2) % 12;
  const hourBranch = CHINESE_BRANCHES[hourIdxFromZi];

  const PALACE_NAMES = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫",
    "财帛宫", "疾厄宫", "迁移宫", "交友宫",
    "官禄宫", "田宅宫", "福德宫", "父母宫"
  ];

  let tigerStartStemIdx = 0;
  if (yearStemIdx === 0 || yearStemIdx === 5) tigerStartStemIdx = 2;
  else if (yearStemIdx === 1 || yearStemIdx === 6) tigerStartStemIdx = 4;
  else if (yearStemIdx === 2 || yearStemIdx === 7) tigerStartStemIdx = 6;
  else if (yearStemIdx === 3 || yearStemIdx === 8) tigerStartStemIdx = 8;
  else if (yearStemIdx === 4 || yearStemIdx === 9) tigerStartStemIdx = 0;

  const mingBoardIdx = (finalMonthForZwi - 1 - hourIdxFromZi + 12) % 12;

  const mingStemIdx = (tigerStartStemIdx + mingBoardIdx) % 10;
  const mingBranchIdx = (mingBoardIdx + 2) % 12;
  const mingGanZhi = CHINESE_STEMS[mingStemIdx] + CHINESE_BRANCHES[mingBranchIdx];
  const nayin = getNayin(mingStemIdx, mingBranchIdx);

  let juNumber = 2;
  let juName = "水二局";
  if (nayin.includes("木")) { juNumber = 3; juName = "木三局"; }
  else if (nayin.includes("金")) { juNumber = 4; juName = "金四局"; }
  else if (nayin.includes("土")) { juNumber = 5; juName = "土五局"; }
  else if (nayin.includes("火")) { juNumber = 6; juName = "火六局"; }

  let x = 0;
  while ((lDay + x) % juNumber !== 0) x++;
  const y = (lDay + x) / juNumber;

  let ziweiBoardIdx: number;
  if (x % 2 === 0) {
    ziweiBoardIdx = (Math.floor(y + x) - 1 + 12) % 12;
  } else {
    const diff = y - x;
    if (diff > 0) {
      ziweiBoardIdx = (Math.floor(diff) - 1 + 12) % 12;
    } else {
      if (diff === 0) ziweiBoardIdx = 10;
      else if (diff === -1) ziweiBoardIdx = 9;
      else if (diff === -2) ziweiBoardIdx = 8;
      else if (diff === -3) ziweiBoardIdx = 7;
      else if (diff === -4) ziweiBoardIdx = 6;
      else ziweiBoardIdx = (Math.floor(diff) - 1 + 12) % 12;
    }
  }

  const tianjiBoardIdx = (ziweiBoardIdx - 1 + 12) % 12;
  const taiyangBoardIdx = (ziweiBoardIdx - 3 + 12) % 12; // 隔一太阳，跳过1个宫位
  const wuquBoardIdx = (ziweiBoardIdx - 4 + 12) % 12;
  const tiantongBoardIdx = (ziweiBoardIdx - 5 + 12) % 12;
  const lianzhenBoardIdx = (ziweiBoardIdx - 8 + 12) % 12; // 空二宫，跳过2个宫位（天同之后再跳2）

  let tianfuBoardIdx: number;
  if (ziweiBoardIdx === 0) tianfuBoardIdx = 0; // 寅申同位
  else if (ziweiBoardIdx === 6) tianfuBoardIdx = 6;
  else if (ziweiBoardIdx === 1) tianfuBoardIdx = 11; // 丑卯相更迭
  else if (ziweiBoardIdx === 11) tianfuBoardIdx = 1;
  else if (ziweiBoardIdx === 2) tianfuBoardIdx = 10; // 子辰蹀躞
  else if (ziweiBoardIdx === 10) tianfuBoardIdx = 2;
  else if (ziweiBoardIdx === 3) tianfuBoardIdx = 9; // 巳亥交驰
  else if (ziweiBoardIdx === 9) tianfuBoardIdx = 3;
  else if (ziweiBoardIdx === 4) tianfuBoardIdx = 8; // 午戌往来
  else if (ziweiBoardIdx === 8) tianfuBoardIdx = 4;
  else if (ziweiBoardIdx === 5) tianfuBoardIdx = 7; // 未酉互为根
  else if (ziweiBoardIdx === 7) tianfuBoardIdx = 5;
  else tianfuBoardIdx = (ziweiBoardIdx + 6) % 12;

  const taiyinBoardIdx = (tianfuBoardIdx + 1) % 12;
  const tanlangBoardIdx = (tianfuBoardIdx + 2) % 12;
  const jumenBoardIdx = (tianfuBoardIdx + 3) % 12;
  const tianxiangBoardIdx = (tianfuBoardIdx + 4) % 12;
  const tianliangBoardIdx = (tianfuBoardIdx + 5) % 12;
  const qishaBoardIdx = (tianfuBoardIdx + 6) % 12;
  const pojunBoardIdx = (qishaBoardIdx + 4) % 12; // 七杀空三，跳过3个宫位

  const zuofuIdx = (1 + finalMonthForZwi) % 12;
  const youbiIdx = (9 - finalMonthForZwi + 12) % 12;

  const wenchangIdx = (8 - hourIdxFromZi + 12) % 12;
  const wenquIdx = (2 + hourIdxFromZi) % 12;

  const KUI_MAP = [11, 10, 9, 9, 11, 10, 11, 4, 1, 1];
  const YUE_MAP = [5, 6, 7, 7, 5, 6, 5, 0, 3, 3];
  const tiankuiIdx = KUI_MAP[yearStemIdx];
  const tianyueIdx = YUE_MAP[yearStemIdx];

  const LUCUN_MAP = [0, 1, 3, 4, 3, 4, 6, 7, 9, 10];
  const lucunIdx = LUCUN_MAP[yearStemIdx];

  const qingyangIdx = (lucunIdx + 1) % 12;
  const tuoluoIdx = (lucunIdx - 1 + 12) % 12;

  let tianmaIdx = 0;
  if ([8, 0, 4].includes(yearBranchIdx)) tianmaIdx = 0;
  else if ([2, 6, 10].includes(yearBranchIdx)) tianmaIdx = 6;
  else if ([5, 9, 1].includes(yearBranchIdx)) tianmaIdx = 9;
  else if ([11, 3, 7].includes(yearBranchIdx)) tianmaIdx = 3;

  const dijieIdx = (9 + hourIdxFromZi) % 12;
  const dikongIdx = (9 - hourIdxFromZi + 12) % 12;

  const isYangYear = yearStemIdx % 2 === 0;
  const isClockwise = (gender === "男" && isYangYear) || (gender === "女" && !isYangYear);

  const createStar = (name: string, type: Star["type"], branchIdx: number): Star => ({
    name,
    type,
    brightness: getBrightness(name, branchIdx),
    scope: "origin"
  });

  const addStarToPalace = (
    palace: ZWDSPalace,
    idx: number,
    name: string,
    starType: Star["type"],
    branchIdx: number
  ) => {
    if (idx === branchIdx) {
      const star = createStar(name, starType, branchIdx);
      if (starType === "major") {
        palace.majorStars.push(star);
      } else if (starType === "soft" || starType === "tough" || starType === "lucun" || starType === "tianma") {
        palace.minorStars.push(star);
      } else {
        palace.adjectiveStars.push(star);
      }
    }
  };

  const huoLingIdx = getHuoLingIndex(yearBranchIdx, hourIdxFromZi);

  // --- Adjective Stars (37/38 杂星) Calculations matching reference iztro-2.5.8 ---

  // 红鸾 & 天喜
  const hongLuanIdx = fixIndex(1 - yearBranchIdx);
  const tianXiIdx = (hongLuanIdx + 6) % 12;

  // 华盖 & 咸池
  let huaGaiIdx = -1;
  let xianChiIdx = -1;
  if ([2, 6, 10].includes(yearBranchIdx)) { // 寅(2), 午(6), 戌(10)
    huaGaiIdx = 8; // 戌
    xianChiIdx = 1; // 卯
  } else if ([8, 0, 4].includes(yearBranchIdx)) { // 申(8), 子(0), 辰(4)
    huaGaiIdx = 2; // 辰
    xianChiIdx = 7; // 酉
  } else if ([5, 9, 1].includes(yearBranchIdx)) { // 巳(5), 酉(9), 丑(1)
    huaGaiIdx = 11; // 丑
    xianChiIdx = 4; // 午
  } else { // 亥(11), 未(7), 卯(3)
    huaGaiIdx = 5; // 未
    xianChiIdx = 10; // 子
  }

  // 孤辰 & 寡宿
  let guChenIdx = -1;
  let guaSuIdx = -1;
  if ([2, 3, 4].includes(yearBranchIdx)) { // 寅(2), 卯(3), 辰(4)
    guChenIdx = 3; // 巳
    guaSuIdx = 11; // 丑
  } else if ([5, 6, 7].includes(yearBranchIdx)) { // 巳(5), 午(6), 未(7)
    guChenIdx = 6; // 申
    guaSuIdx = 2; // 辰
  } else if ([8, 9, 10].includes(yearBranchIdx)) { // 申(8), 酉(9), 戌(10)
    guChenIdx = 9; // 亥
    guaSuIdx = 5; // 未
  } else { // 亥(11), 子(0), 丑(1)
    guChenIdx = 0; // 寅
    guaSuIdx = 8; // 戌
  }

  // 天才 & 天寿 (dependent on exact Ming and Shen Gong index relative to 寅)
  const shenBoardIdx = (finalMonthForZwi - 1 + hourIdxFromZi) % 12;
  const tianCaiIdx = fixIndex(mingBoardIdx + yearBranchIdx);
  const tianShouIdx = fixIndex(shenBoardIdx + yearBranchIdx);

  // 天德 & 月德
  const tianDeIdx = (7 + yearBranchIdx) % 12;
  const yueDeIdx = (3 + yearBranchIdx) % 12;

  // 天姚
  const tianYaoIdx = fixIndex(10 + finalMonthForZwi);

  // 解神 (月解)与年解
  const jieshenIdx = [6, 8, 10, 0, 2, 4][Math.floor((finalMonthForZwi - 1) / 2)];
  const nianJieIdx = fixIndex(8 - yearBranchIdx);
  
  // 三台, 八座, 恩光, 天贵
  const dayIndex = lDay - 1; // standard dayIdx
  const sanTaiIdx = fixIndex((zuofuIdx + dayIndex) % 12);
  const baZuoIdx = fixIndex((youbiIdx - dayIndex + 12) % 12);
  const enGuangIdx = fixIndex((wenchangIdx + dayIndex - 1 + 12) % 12);
  const tianGuiIdx = fixIndex((wenquIdx + dayIndex - 1 + 12) % 12);
  
  // 龙池 & 凤阁
  const longChiIdx = fixIndex(2 + yearBranchIdx);
  const fengGeIdx = fixIndex(8 - yearBranchIdx);
  
  // 台辅 & 封诰
  const taiFuIdx = fixIndex(4 + hourIdxFromZi);
  const fengGaoIdx = fixIndex(0 + hourIdxFromZi);
  
  // 天巫
  const tianWuIdx = [3, 6, 0, 9][(finalMonthForZwi - 1) % 4];

  // 天官, 天福, 天厨
  const tianGuanIdx = [5, 2, 3, 0, 1, 7, 9, 7, 8, 4][yearStemIdx];
  const tianFuIdx = [7, 6, 10, 9, 1, 0, 4, 3, 4, 3][yearStemIdx];
  const tianChuIdx = [3, 4, 10, 3, 4, 6, 0, 4, 7, 9][yearStemIdx];

  // 天月, 天空, 旬空
  const tianYueIdx = [8, 3, 2, 0, 5, 1, 9, 5, 0, 4, 8, 0][finalMonthForZwi - 1];
  const tianKongIdx = fixIndex(yearBranchIdx - 1);
  let xunKongIdx = fixIndex(yearBranchIdx - yearStemIdx + 8);
  const yinyang = yearBranchIdx % 2;
  if (yinyang !== xunKongIdx % 2) {
    xunKongIdx = fixIndex(xunKongIdx + 1);
  }
  
  // 截路 & 空亡
  const jieLuIdx = [6, 4, 2, 0, 10][yearStemIdx % 5];
  const kongWangIdx = [7, 5, 3, 1, 11][yearStemIdx % 5];
  
  // 蜚廉 & 破碎
  const feiLianIdx = [6, 7, 8, 3, 4, 5, 0, 1, 2, 9, 10, 11][yearBranchIdx];
  const poSuiIdx = [3, 11, 7][yearBranchIdx % 3];
  
  // 天刑 & 阴煞
  const tianXingIdx = fixIndex(7 + (finalMonthForZwi - 1));
  const yinShaIdx = [0, 10, 8, 6, 4, 2][(finalMonthForZwi - 1) % 6];
  
  // 天哭 & 天虚
  const tianKuIdx = fixIndex(4 - yearBranchIdx);
  const tianXuIdx = fixIndex(4 + yearBranchIdx);
  
  // 天伤 & 天使 (Friends / Health relative to Ming Palace index)
  const tianShangIdx = fixIndex(mingBoardIdx + 5);
  const tianShiIdx = fixIndex(mingBoardIdx + 7);

  const palaces: ZWDSPalace[] = [];

  for (let bIdx = 0; bIdx < 12; bIdx++) {
    const branchName = BOARD_BRANCHES[bIdx];
    const stemIdx = (tigerStartStemIdx + bIdx) % 10;
    const stemName = CHINESE_STEMS[stemIdx];

    const pIdx = (mingBoardIdx - bIdx + 12) % 12;
    let palaceName = PALACE_NAMES[pIdx];

    const isMingGong = bIdx === mingBoardIdx;
    const isShenGong = bIdx === shenBoardIdx;

    const stepDiff = (bIdx - mingBoardIdx + 12) % 12;
    const stepsInProgression = isClockwise ? stepDiff : (12 - stepDiff) % 12;
    const decadalStart = juNumber + stepsInProgression * 10;
    const decadalEnd = decadalStart + 9;

    // Calculate Changsheng 12
    const getChangsheng12StartIndex = (jn: number): number => {
      if (jn === 2) return 6; // 水二局 starts at 申
      if (jn === 3) return 9; // 木三局 starts at 亥
      if (jn === 4) return 3; // 金四局 starts at 巳
      if (jn === 5) return 6; // 土五局 starts at 申
      if (jn === 6) return 0; // 火六局 starts at 寅
      return 0;
    };
    const csStartIdx = getChangsheng12StartIndex(juNumber);
    const changshengIdx = isClockwise
      ? (bIdx - csStartIdx + 12) % 12
      : (csStartIdx - bIdx + 12) % 12;
    const changsheng12 = CHANG_SHENG_12[changshengIdx];

    // Calculate Boshi 12 starting from lucunIdx (direction matches isClockwise)
    const boshiIdx = isClockwise
      ? (bIdx - lucunIdx + 12) % 12
      : (lucunIdx - bIdx + 12) % 12;
    const boshi12 = BOSHI_12[boshiIdx];

    const majorStars: Star[] = [];
    const minorStars: Star[] = [];
    const adjectiveStars: Star[] = [];

    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, ziweiBoardIdx, "紫微", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianjiBoardIdx, "天机", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, taiyangBoardIdx, "太阳", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, wuquBoardIdx, "武曲", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tiantongBoardIdx, "天同", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, lianzhenBoardIdx, "廉贞", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianfuBoardIdx, "天府", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, taiyinBoardIdx, "太阴", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tanlangBoardIdx, "贪狼", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, jumenBoardIdx, "巨门", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianxiangBoardIdx, "天相", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianliangBoardIdx, "天梁", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, qishaBoardIdx, "七杀", "major", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, pojunBoardIdx, "破军", "major", bIdx);

    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, zuofuIdx, "左辅", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, youbiIdx, "右弼", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, wenchangIdx, "文昌", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, wenquIdx, "文曲", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tiankuiIdx, "天魁", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianyueIdx, "天钺", "soft", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, lucunIdx, "禄存", "lucun", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianmaIdx, "天马", "tianma", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, huoLingIdx.huoIdx, "火星", "tough", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, huoLingIdx.lingIdx, "铃星", "tough", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, qingyangIdx, "擎羊", "tough", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tuoluoIdx, "陀罗", "tough", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, dijieIdx, "地劫", "tough", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, dikongIdx, "地空", "tough", bIdx);

    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, hongLuanIdx, "红鸾", "flower", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianXiIdx, "天喜", "flower", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, huaGaiIdx, "华盖", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, xianChiIdx, "咸池", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, guChenIdx, "孤辰", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, guaSuIdx, "寡宿", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianDeIdx, "天德", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, yueDeIdx, "月德", "adjective", bIdx);

    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianYaoIdx, "天姚", "flower", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, jieshenIdx, "解神", "helper", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, nianJieIdx, "年解", "helper", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, sanTaiIdx, "三台", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, baZuoIdx, "八座", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, enGuangIdx, "恩光", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianGuiIdx, "天贵", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, longChiIdx, "龙池", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, fengGeIdx, "凤阁", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianCaiIdx, "天才", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianShouIdx, "天寿", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, taiFuIdx, "台辅", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, fengGaoIdx, "封诰", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianWuIdx, "天巫", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianGuanIdx, "天官", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianFuIdx, "天福", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianChuIdx, "天厨", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianYueIdx, "天月", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianKongIdx, "天空", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, xunKongIdx, "旬空", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, jieLuIdx, "截路", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, kongWangIdx, "空亡", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, feiLianIdx, "蜚廉", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, poSuiIdx, "破碎", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianXingIdx, "天刑", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, yinShaIdx, "阴煞", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianKuIdx, "天哭", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianXuIdx, "天虚", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianShiIdx, "天使", "adjective", bIdx);
    addStarToPalace({ majorStars, minorStars, adjectiveStars } as ZWDSPalace, tianShangIdx, "天伤", "adjective", bIdx);

    const suiqian12List = getSuiqian12(yearBranchIdx);
    const jiangqian12List = getJiangqian12(yearBranchIdx);

    palaces.push({
      branchIdx: bIdx,
      branchName,
      stemName,
      palaceName,
      isMingGong,
      isShenGong,
      isOriginalPalace: bIdx === mingBoardIdx,
      decadalStart,
      decadalEnd,
      majorStars,
      minorStars,
      adjectiveStars,
      changsheng12,
      boshi12,
      gridPos: GRID_COORDS[bIdx],
      suiqian12: suiqian12List[bIdx],
      jiangqian12: jiangqian12List[bIdx]
    });
  }

  const mingZhuObj = palaces[mingBoardIdx];
  const mingZhu = mingZhuObj.majorStars.length > 0 ? mingZhuObj.majorStars[0].name : "";

  return {
    birthTimeG: gregorianDateStr,
    birthTimeL: `农历 ${yearGan}${yearZhi}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${hourBranch}时`,
    name,
    gender,
    yearGanZhi: yearGan + yearZhi,
    mingJu: juName,
    mingZhu,
    shenZhi: yearZhi,
    palaces
  };
}