import { BaziChartResult, FourPillars, Pillar, StemInfo, BranchInfo, HiddenStemInfo, DaYunInfo, SolarTermRecord, FlowingTimeInfo } from "../types";

// Standard lists
export const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const ELEMENTS = ["木", "火", "土", "金", "水"]; // 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水
export const BRANCH_ELEMENTS = [
  "水", // 子
  "土", // 丑
  "木", // 寅
  "木", // 卯
  "土", // 辰
  "火", // 巳
  "火", // 午
  "土", // 未
  "金", // 申
  "金", // 酉
  "土", // 戌
  "水"  // 亥
];

// Earth's solar terms and longitude structure
export interface SolarTerm {
  name: string;
  longitude: number;
}

export const SOLAR_TERMS: SolarTerm[] = [
  { name: "春分", longitude: 0 },
  { name: "清明", longitude: 15 },
  { name: "谷雨", longitude: 30 },
  { name: "立夏", longitude: 45 },
  { name: "小满", longitude: 60 },
  { name: "芒种", longitude: 75 },
  { name: "夏至", longitude: 90 },
  { name: "小暑", longitude: 105 },
  { name: "大暑", longitude: 120 },
  { name: "立秋", longitude: 135 },
  { name: "处暑", longitude: 150 },
  { name: "白露", longitude: 165 },
  { name: "秋分", longitude: 180 },
  { name: "寒露", longitude: 195 },
  { name: "霜降", longitude: 210 },
  { name: "立冬", longitude: 225 },
  { name: "小雪", longitude: 240 },
  { name: "大雪", longitude: 255 },
  { name: "冬至", longitude: 270 },
  { name: "小寒", longitude: 285 },
  { name: "大寒", longitude: 300 },
  { name: "立春", longitude: 315 },
  { name: "雨水", longitude: 330 },
  { name: "惊蛰", longitude: 345 }
];

// 60 Jiazi Nayin
export const NAYIN_TABLE = [
  "海中金", "海中金", "炉中火", "炉中火", "大林木", "大林木", "路旁土", "路旁土", "剑锋金", "剑锋金",
  "山头火", "山头火", "涧下水", "涧下水", "城头土", "城头土", "白蜡金", "白蜡金", "杨柳木", "杨柳木",
  "泉中水", "泉中水", "屋上土", "屋上土", "霹雳火", "霹雳火", "松柏木", "松柏木", "长流水", "长流水",
  "沙中金", "沙中金", "山下火", "山下火", "平地木", "平地木", "壁上土", "壁上土", "金箔金", "金箔金",
  "覆灯火", "覆灯火", "天河水", "天河水", "大驿土", "大驿土", "钗钏金", "钗钏金", "桑柘木", "桑柘木",
  "大溪水", "大溪水", "沙中土", "沙中土", "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海s" // Note: let's write completed strings
];

export const NAYIN_COMPLETED_TABLE = [
  "海中金", "海中金", "炉中火", "炉中火", "大林木", "大林木", "路旁土", "路旁土", "剑锋金", "剑锋金",
  "山头火", "山头火", "涧下水", "涧下水", "城头土", "城头土", "白蜡金", "白蜡金", "杨柳木", "杨柳木",
  "泉中水", "泉中水", "屋上土", "屋上土", "霹雳火", "霹雳火", "松柏木", "松柏木", "长流水", "长流水",
  "沙中金", "沙中金", "山下火", "山下火", "平地木", "平地木", "壁上土", "壁上土", "金箔金", "金箔金",
  "覆灯火", "覆灯火", "天河水", "天河水", "大驿土", "大驿土", "钗钏金", "钗钏金", "桑柘木", "桑柘木",
  "大溪水", "大溪水", "沙中土", "沙中土", "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海水"
];

// Hidden Stems inside Branches (藏干: 子丑寅卯辰巳午未申酉戌亥)
// Earthly Branch Index -> List of { StemIndex, IsPrincipal }
export const HIDDEN_STEMS: { stem: number; isPrincipal: boolean }[][] = [
  [{ stem: 9, isPrincipal: true }], // 子: 癸
  [{ stem: 5, isPrincipal: true }, { stem: 9, isPrincipal: false }, { stem: 7, isPrincipal: false }], // 丑: 己癸辛
  [{ stem: 0, isPrincipal: true }, { stem: 2, isPrincipal: false }, { stem: 4, isPrincipal: false }], // 寅: 甲丙戊
  [{ stem: 1, isPrincipal: true }], // 卯: 乙
  [{ stem: 4, isPrincipal: true }, { stem: 1, isPrincipal: false }, { stem: 9, isPrincipal: false }], // 辰: 戊乙癸
  [{ stem: 2, isPrincipal: true }, { stem: 6, isPrincipal: false }, { stem: 4, isPrincipal: false }], // 巳: 丙庚戊
  [{ stem: 3, isPrincipal: true }, { stem: 5, isPrincipal: false }], // 午: 丁己
  [{ stem: 5, isPrincipal: true }, { stem: 3, isPrincipal: false }, { stem: 1, isPrincipal: false }], // 未: 己丁乙
  [{ stem: 6, isPrincipal: true }, { stem: 8, isPrincipal: false }, { stem: 4, isPrincipal: false }], // 申: 庚壬戊
  [{ stem: 7, isPrincipal: true }], // 酉: 辛
  [{ stem: 4, isPrincipal: true }, { stem: 7, isPrincipal: false }, { stem: 3, isPrincipal: false }], // 戌: 戊辛丁
  [{ stem: 8, isPrincipal: true }, { stem: 0, isPrincipal: false }]  // 亥: 壬甲
];

// Julian Date Calculations
export function dateToJD(year: number, month: number, day: number, hour: number = 12, minute: number = 0, second: number = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + (hour + minute/60 + second/3600)/24 + B - 1524.5;
  return jd;
}

export function jdToDate(jd: number): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const dayWithDecimal = B - D - Math.floor(30.6001 * E) + f;
  const day = Math.floor(dayWithDecimal);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  const hourDecimal = (dayWithDecimal - day) * 24;
  const hour = Math.floor(hourDecimal);
  const minuteDecimal = (hourDecimal - hour) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);

  return { year, month, day, hour, minute, second };
}

// Low-precision Sun position formula from Astronomical Algorithms (Jean Meeus)
// Returns solar geocentric longitude λ (ecliptic longitude of Sun) in degrees (0 - 360)
export function getSolarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Mean longitude of Sun
  let L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Mean anomaly
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  
  L = L % 360;
  if (L < 0) L += 360;
  
  const M_rad = (M % 360) * Math.PI / 180;
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad)
          + 0.000289 * Math.sin(3 * M_rad);
          
  let lambda = L + C;
  lambda = lambda % 360;
  if (lambda < 0) lambda += 360;
  return lambda;
}

// Bisect to find the exact Julian Date when solar longitude = TargetLongitude
export function findSolarTermJD(year: number, targetLong: number, approxMonth: number, approxDay: number): number {
  let low = dateToJD(year, approxMonth, approxDay, 12, 0, 0) - 5;
  let high = low + 10;
  
  const diff = (a: number, b: number) => {
    let d = (a - b) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };
  
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    const L = getSolarLongitude(mid);
    const d = diff(L, targetLong);
    if (Math.abs(d) < 0.0000001) {
      return mid;
    }
    if (d > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}

// Fetch all 24 solar terms for a specific year sorted chronologically starting from early Jan
export function getSolarTermsForYear(year: number): SolarTermRecord[] {
  // Let's approximate date lookups:
  const order = [
    { name: "小寒", longitude: 285, month: 1, day: 5 },
    { name: "大寒", longitude: 300, month: 1, day: 20 },
    { name: "立春", longitude: 315, month: 2, day: 4 },
    { name: "雨水", longitude: 330, month: 2, day: 19 },
    { name: "惊蛰", longitude: 345, month: 3, day: 5 },
    { name: "春分", longitude: 0,   month: 3, day: 20 },
    { name: "清明", longitude: 15,  month: 4, day: 5 },
    { name: "谷雨", longitude: 30,  month: 4, day: 20 },
    { name: "立夏", longitude: 45,  month: 5, day: 5 },
    { name: "小满", longitude: 60,  month: 5, day: 21 },
    { name: "芒种", longitude: 75,  month: 6, day: 5 },
    { name: "夏至", longitude: 90,  month: 6, day: 21 },
    { name: "小暑", longitude: 105, month: 7, day: 7 },
    { name: "大暑", longitude: 120, month: 7, day: 23 },
    { name: "立秋", longitude: 135, month: 8, day: 7 },
    { name: "处暑", longitude: 150, month: 8, day: 23 },
    { name: "白露", longitude: 165, month: 9, day: 7 },
    { name: "秋分", longitude: 180, month: 9, day: 23 },
    { name: "寒露", longitude: 195, month: 10, day: 8 },
    { name: "霜降", longitude: 210, month: 10, day: 23 },
    { name: "立冬", longitude: 225, month: 11, day: 7 },
    { name: "小雪", longitude: 240, month: 11, day: 22 },
    { name: "大雪", longitude: 255, month: 12, day: 7 },
    { name: "冬至", longitude: 270, month: 12, day: 21 }
  ];

  return order.map(t => {
    const jd = findSolarTermJD(year, t.longitude, t.month, t.day);
    const dObj = jdToDate(jd);
    // Standard format
    const pad = (num: number) => String(num).padStart(2, '0');
    return {
      name: t.name,
      jd,
      timeStr: `${dObj.year}-${pad(dObj.month)}-${pad(dObj.day)} ${pad(dObj.hour)}:${pad(dObj.minute)}`
    };
  });
}

// Equation of Time (EoT) in Minutes for solar time adjustment
export function getEquationOfTime(year: number, month: number, day: number): number {
  // Simple algorithm
  // N is first day of year = 1
  const d1 = dateToJD(year, month, day, 12, 0, 0);
  const dStart = dateToJD(year, 1, 1, 12, 0,0);
  const N = Math.floor(d1 - dStart) + 1;
  const B = (360 * (N - 81)) / 365;
  const B_rad = B * Math.PI / 180;
  const eot = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad);
  return eot;
}

// Convert UTC+8 Birth Time and Longitude to True Solar Time (真太阳时)
// Beijing Time is centered on longitude 120°E.
export function calculateTrueSolarTime(
  gregorianDateStr: string, // e.g., "1990-05-15 14:30"
  longitude: number
): {
  trueSolarTime: Date;
  longitudeOffsetMin: number;
  eotMin: number;
} {
  const parts = gregorianDateStr.replace('T', ' ').split(/[- :]/);
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  const hour = parseInt(parts[3]) || 0;
  const minute = parseInt(parts[4]) || 0;
  
  // Beijing time (UTC+8) base Date
  const localDate = new Date(year, month - 1, day, hour, minute);
  
  // Longitude correction: 4 minutes per degree relative to 120E
  const longitudeOffset = (longitude - 120) * 4; // in minutes
  
  // Equation of Time correction
  const eot = getEquationOfTime(year, month, day); // in minutes
  
  // True Solar Time in minutes relative to Beijing time
  const totalOffsetMin = longitudeOffset + eot;
  
  const trueSolarTime = new Date(localDate.getTime() + totalOffsetMin * 60 * 1000);
  
  return {
    trueSolarTime,
    longitudeOffsetMin: longitudeOffset,
    eotMin: eot
  };
}

// Calculate Twelve Changsheng
export function getChangsheng(stemIdx: number, branchIdx: number): string {
  const stages = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
  const starts = [
    11, // 甲 -> 亥
    6,  // 乙 -> 午
    2,  // 丙 -> 寅
    9,  // 丁 -> 酉
    2,  // 戊 -> 寅
    9,  // 己 -> 酉
    5,  // 庚 -> 巳
    0,  // 辛 -> 子
    8,  // 壬 -> 申
    3   // 癸 -> 卯
  ];
  const isYang = stemIdx % 2 === 0;
  const startBranch = starts[stemIdx];
  let offset = 0;
  if (isYang) {
    offset = (branchIdx - startBranch + 12) % 12;
  } else {
    offset = (startBranch - branchIdx + 12) % 12;
  }
  return stages[offset];
}

// Calculate Ten Gods relative to Day Stem
export function getTenGod(dayStemIdx: number, targetStemIdx: number): string {
  if (dayStemIdx < 0 || targetStemIdx < 0) return "";
  const pDS = dayStemIdx % 2;
  const pS = targetStemIdx % 2;
  const samePolarity = pDS === pS;
  
  const eDS = Math.floor(dayStemIdx / 2);
  const eS = Math.floor(targetStemIdx / 2);
  
  const rel = (eS - eDS + 5) % 5;
  
  switch (rel) {
    case 0: // 比劫
      return samePolarity ? "比肩" : "劫财";
    case 1: // 食伤
      return samePolarity ? "食神" : "伤官";
    case 2: // 财星
      return samePolarity ? "偏财" : "正财";
    case 3: // 官杀
      return samePolarity ? "七杀" : "正官";
    case 4: // 印星
      return samePolarity ? "偏印" : "正印";
    default:
      return "";
  }
}

// Empty Void (空亡) calculation: branches that are empty
export function getEmptyVoid(stemIdx: number, branchIdx: number): string[] {
  // First, find the starting branch offset of the current xun (旬)
  // Distance to stem 0 (甲)
  const offset = (branchIdx - stemIdx + 12) % 12;
  // The two empty branches are the two preceding branches of 甲 (or preceding the xun starting branch)
  const emptyVal1 = (offset - 2 + 12) % 12;
  const emptyVal2 = (offset - 1 + 12) % 12;
  return [EARTHLY_BRANCHES[emptyVal1], EARTHLY_BRANCHES[emptyVal2]];
}

// Compute Nayin
export function getNayin(stemIdx: number, branchIdx: number): string {
  // Map stem and branch index to 60 Jiazi index (0 - 59)
  // We can solve x = stemIndex (mod 10) and x = branchIndex (mod 12)
  // Using Chinese Remainder Theorem:
  // x = (6 * stemIndex - 5 * branchIndex) mod 60
  let jiaziIdx = (6 * stemIdx - 5 * branchIdx) % 60;
  if (jiaziIdx < 0) jiaziIdx += 60;
  return NAYIN_COMPLETED_TABLE[jiaziIdx];
}

// Calculate Shensha for Year/Month/Day/Hour branch based on Day Stem and Day Branch
export function calculateShensha(
  branchIdx: number,
  dayStemIdx: number,
  dayBranchIdx: number,
  yearStemIdx: number,
  yearBranchIdx: number
): string[] {
  const list: string[] = [];

  // 1. 天乙贵人: 甲戊庚 -> 丑未, 乙己 -> 子申, 丙丁 -> 亥酉, 辛 -> 寅午, 壬癸 -> 卯巳
  const tianyiMap = [
    [1, 7], // 甲 -> 丑未
    [0, 8], // 乙 -> 子申
    [11, 9], // 丙 -> 亥酉
    [11, 9], // 丁 -> 亥酉
    [1, 7], // 戊 -> 丑未
    [0, 8], // 己 -> 子申
    [1, 7], // 庚 -> 丑未
    [2, 6], // 辛 -> 寅午
    [3, 5], // 壬 -> 卯巳
    [3, 5]  // 癸 -> 卯巳
  ];
  if (tianyiMap[dayStemIdx].includes(branchIdx)) list.push("天乙贵人");

  // 2. 太极贵人: 甲乙 -> 子午, 丙丁 -> 卯酉, 戊己 -> 辰戌丑未, 庚辛 -> 寅亥, 壬癸 -> 巳申
  const taijiMap = [
    [0, 6], // 甲
    [0, 6], // 乙
    [3, 9], // 丙
    [3, 9], // 丁
    [1, 4, 7, 10], // 戊
    [1, 4, 7, 10], // 己
    [2, 11], // 庚
    [2, 11], // 辛
    [5, 8], // 壬
    [5, 8]  // 癸
  ];
  if (taijiMap[dayStemIdx].includes(branchIdx)) list.push("太极贵人");

  // 3. 文昌贵人: 甲 -> 巳, 乙 -> 午, 丙 -> 申, 丁 -> 酉, 戊 -> 申, 己 -> 酉, 庚 -> 亥, 辛 -> 子, 壬 -> 寅, 癸 -> 卯
  const wenchangMap = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
  if (wenchangMap[dayStemIdx] === branchIdx) list.push("文昌贵人");

  // 4. 驿马: 申子辰 -> 寅, 寅午戌 -> 申, 巳酉丑 -> 亥, 亥卯未 -> 巳 (based on day branch & year branch)
  const yimaMap = (b: number) => {
    if ([8, 0, 4].includes(b)) return 2; // 申子辰 -> 寅
    if ([2, 6, 10].includes(b)) return 8; // 寅午戌 -> 申
    if ([5, 9, 1].includes(b)) return 11; // 巳酉丑 -> 亥
    if ([11, 3, 7].includes(b)) return 5; // 亥卯未 -> 巳
    return -1;
  };
  if (yimaMap(dayBranchIdx) === branchIdx || yimaMap(yearBranchIdx) === branchIdx) list.push("驿马");

  // 5. 桃花 / 咸池: 申子辰 -> 酉, 寅午戌 -> 卯, 巳酉丑 -> 午, 亥卯未 -> 子
  const taohuaMap = (b: number) => {
    if ([8, 0, 4].includes(b)) return 9; // 申子辰 -> 酉
    if ([2, 6, 10].includes(b)) return 3; // 寅午戌 -> 卯
    if ([5, 9, 1].includes(b)) return 6; // 巳酉丑 -> 午
    if ([11, 3, 7].includes(b)) return 0; // 亥卯未 -> 子
    return -1;
  };
  if (taohuaMap(dayBranchIdx) === branchIdx || taohuaMap(yearBranchIdx) === branchIdx) list.push("桃花/咸池");

  // 6. 将星: 申子辰 -> 子, 寅午戌 -> 午, 巳酉丑 -> 酉, 亥卯未 -> 卯
  const jiangxingMap = (b: number) => {
    if ([8, 0, 4].includes(b)) return 0;
    if ([2, 6, 10].includes(b)) return 6;
    if ([5, 9, 1].includes(b)) return 9;
    if ([11, 3, 7].includes(b)) return 3;
    return -1;
  };
  if (jiangxingMap(dayBranchIdx) === branchIdx || jiangxingMap(yearBranchIdx) === branchIdx) list.push("将星");

  // 7. 华盖: 申子辰 -> 辰, 寅午戌 -> 戌, 巳酉丑 -> 丑, 亥卯未 -> 未
  const huagaiMap = (b: number) => {
    if ([8, 0, 4].includes(b)) return 4;
    if ([2, 6, 10].includes(b)) return 10;
    if ([5, 9, 1].includes(b)) return 1;
    if ([11, 3, 7].includes(b)) return 7;
    return -1;
  };
  if (huagaiMap(dayBranchIdx) === branchIdx || huagaiMap(yearBranchIdx) === branchIdx) list.push("华盖");

  // 8. 孤辰与寡宿 (based on year branch):
  // 寅卯辰(木) -> 巳(孤)丑(寡)
  // 巳午未(火) -> 申(孤)辰(寡)
  // 申酉戌(金) -> 亥(孤)未(寡)
  // 亥子丑(水) -> 寅(孤)戌(寡)
  const guchenMap = [
    10, // 子 -> 寅(孤) 戌(寡?) Wait: 子 is 亥子丑 -> 寅 is 孤 (index 2)
    10, // 丑
    2,  // 寅 -> 巳 is 孤 (5)
    2,  // 卯
    2,  // 辰
    5,  // 巳 -> 申 is 孤 (8)
    5,  // 午
    5,  // 未
    8,  // 申 -> 亥 is 孤 (11)
    8,  // 酉
    8,  // 戌
    11  // 亥 -> 寅 is 孤 (2)
  ];
  const guchenVal = (yb: number) => {
    if ([2, 3, 4].includes(yb)) return 5; // 寅卯辰 -> 巳
    if ([5, 6, 7].includes(yb)) return 8; // 巳午未 -> 申
    if ([8, 9, 10].includes(yb)) return 11; // 申酉戌 -> 亥
    if ([11, 0, 1].includes(yb)) return 2; // 亥子丑 -> 寅
    return -1;
  };
  const guasuVal = (yb: number) => {
    if ([2, 3, 4].includes(yb)) return 1; // 寅卯辰 -> 丑
    if ([5, 6, 7].includes(yb)) return 4; // 巳午未 -> 辰
    if ([8, 9, 10].includes(yb)) return 7; // 申酉戌 -> 未
    if ([11, 0, 1].includes(yb)) return 10; // 亥子丑 -> 戌
    return -1;
  };
  if (guchenVal(yearBranchIdx) === branchIdx) list.push("孤辰");
  if (guasuVal(yearBranchIdx) === branchIdx) list.push("寡宿");

  // 9. 羊刃 (Day Stem): 甲->卯, 丙->午, 戊->午, 庚->酉, 壬->子 (for Yang stems)
  const yangrenMap = [3, -1, 6, -1, 6, -1, 9, -1, 0, -1];
  if (yangrenMap[dayStemIdx] === branchIdx) list.push("羊刃");

  // 10. 国印贵人 (Day Stem): 甲->戌, 乙->亥, 丙->丑, 丁->寅, 戊->丑, 己->寅, 庚->辰, 辛->巳, 壬->未, 癸->申
  const guoyinMap = [10, 11, 1, 2, 1, 2, 4, 5, 7, 8];
  if (guoyinMap[dayStemIdx] === branchIdx) list.push("国印贵人");

  return list;
}

// Generate Full Bazi Results
export function compileBazi(
  gregorianDateStr: string, // e.g. "1990-05-15 14:30"
  longitude: number,
  cityName: string,
  gender: "男" | "女",
  flowingTargetDate?: Date
): BaziChartResult {
  // 1. Calculate True Solar Time
  const { trueSolarTime } = calculateTrueSolarTime(gregorianDateStr, longitude);
  
  // 2. Adjust for Late Zi Hour (23:00 - 24:00) of Day Change
  const originalYear = trueSolarTime.getFullYear();
  const originalMonth = trueSolarTime.getMonth() + 1;
  const originalDay = trueSolarTime.getDate();
  const originalHour = trueSolarTime.getHours();
  const originalMinute = trueSolarTime.getMinutes();
  
  // If hour >= 23, add 1 day for Day Pillar calculations: "时子换日"
  let adjustedDate = new Date(trueSolarTime.getTime());
  if (originalHour >= 23) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  }
  
  const adjYear = adjustedDate.getFullYear();
  const adjMonth = adjustedDate.getMonth() + 1;
  const adjDay = adjustedDate.getDate();

  // 3. JD and Solar longitude at birth moment
  const jd_moment = dateToJD(originalYear, originalMonth, originalDay, originalHour, originalMinute, 0);
  const solLongMoment = getSolarLongitude(jd_moment);

  // 4. Calculate Year Pillar
  // Year change boundary is exactly Lichun (315°). 
  // If solLongMoment is before 315° and calendar is early in the year (Jan/Feb), Bazi Year is TrueSolarYear - 1
  let baziYear = originalYear;
  if (solLongMoment < 315 && originalMonth <= 2) {
    baziYear = originalYear - 1;
  }
  let yearJiaziIdx = (baziYear - 4) % 60;
  if (yearJiaziIdx < 0) yearJiaziIdx += 60;
  const yearStemIdx = yearJiaziIdx % 10;
  const yearBranchIdx = yearJiaziIdx % 12;

  // 5. Calculate Month Pillar
  // The Month Branch is determined directly by Solar Longitude
  // 315 - 345: 寅 (2), 345 - 15: 卯 (3), 15 - 45: 辰 (4), etc.
  let monthBranchIdx = 2; // 寅
  if (solLongMoment >= 315 && solLongMoment < 345) monthBranchIdx = 2; // 寅
  else if (solLongMoment >= 345 || solLongMoment < 15) monthBranchIdx = 3; // 卯
  else if (solLongMoment >= 15 && solLongMoment < 45) monthBranchIdx = 4; // 辰
  else if (solLongMoment >= 45 && solLongMoment < 75) monthBranchIdx = 5; // 巳
  else if (solLongMoment >= 75 && solLongMoment < 105) monthBranchIdx = 6; // 午
  else if (solLongMoment >= 105 && solLongMoment < 135) monthBranchIdx = 7; // 未
  else if (solLongMoment >= 135 && solLongMoment < 165) monthBranchIdx = 8; // 申
  else if (solLongMoment >= 165 && solLongMoment < 195) monthBranchIdx = 9; // 酉
  else if (solLongMoment >= 195 && solLongMoment < 225) monthBranchIdx = 10; // 戌
  else if (solLongMoment >= 225 && solLongMoment < 255) monthBranchIdx = 11; // 亥
  else if (solLongMoment >= 255 && solLongMoment < 285) monthBranchIdx = 0; // 子
  else if (solLongMoment >= 285 && solLongMoment < 315) monthBranchIdx = 1; // 丑

  // Month Stem via Five Tigers Song:
  const monthTigerStarts = [2, 4, 6, 8, 0]; // Index of 丙(2), 戊(4), 庚(6), 壬(8), 甲(0)
  const monthStartStem = monthTigerStarts[yearStemIdx % 5];
  // distance from 寅 (index 2)
  const monthDist = (monthBranchIdx - 2 + 12) % 12;
  const monthStemIdx = (monthStartStem + monthDist) % 10;

  // 6. Calculate Day Pillar
  const jd_day = dateToJD(adjYear, adjMonth, adjDay, 12, 0, 0);
  let dayJiaziIdx = (Math.floor(jd_day + 0.5) + 49) % 60;
  if (dayJiaziIdx < 0) dayJiaziIdx += 60;
  const dayStemIdx = dayJiaziIdx % 10;
  const dayBranchIdx = dayJiaziIdx % 12;

  // 7. Calculate Hour Pillar
  // Hour Branch segments
  const hourBranchIdx = Math.floor((originalHour + 1) / 2) % 12;
  // Hour Stem via Five Rats Song:
  const hourRatStarts = [0, 2, 4, 6, 8]; // Index of 甲(0), 丙(2), 戊(4), 庚(6), 壬(8)
  const hourStartStem = hourRatStarts[dayStemIdx % 5];
  const hourStemIdx = (hourStartStem + hourBranchIdx) % 10;

  // 8. Construct Pillar Packages
  const compilePillar = (sIdx: number, bIdx: number): Pillar => {
    const isYangS = sIdx % 2 === 0 ? "阳" : "阴";
    const isYangB = bIdx % 2 === 0 ? "阳" : "阴";
    
    const hStems_raw = HIDDEN_STEMS[bIdx];
    const hStems: HiddenStemInfo[] = hStems_raw.map(hs => ({
      name: HEAVENLY_STEMS[hs.stem],
      index: hs.stem,
      tenGod: getTenGod(dayStemIdx, hs.stem),
      isPrincipal: hs.isPrincipal
    }));

    const stemDetails: StemInfo = {
      name: HEAVENLY_STEMS[sIdx],
      index: sIdx,
      element: ELEMENTS[Math.floor(sIdx / 2)],
      polarity: isYangS as "阳" | "阴",
      tenGod: getTenGod(dayStemIdx, sIdx)
    };

    const branchDetails: BranchInfo = {
      name: EARTHLY_BRANCHES[bIdx],
      index: bIdx,
      element: BRANCH_ELEMENTS[bIdx],
      polarity: isYangB as "阳" | "阴",
      changsheng: getChangsheng(dayStemIdx, bIdx),
      hiddenStems: hStems
    };

    const selfSatPrincipalStem = hStems.find(hs => hs.isPrincipal)?.index ?? -1;
    return {
      stem: stemDetails,
      branch: branchDetails,
      nayin: getNayin(sIdx, bIdx),
      emptyVoid: getEmptyVoid(dayStemIdx, dayBranchIdx), // Standard day void
      shensha: calculateShensha(bIdx, dayStemIdx, dayBranchIdx, yearStemIdx, yearBranchIdx),
      selfSitting: {
        tenGod: selfSatPrincipalStem >= 0 ? getTenGod(sIdx, selfSatPrincipalStem) : "",
        changsheng: getChangsheng(sIdx, bIdx)
      }
    };
  };

  const fourPillars: FourPillars = {
    year: compilePillar(yearStemIdx, yearBranchIdx),
    month: compilePillar(monthStemIdx, monthBranchIdx),
    day: compilePillar(dayStemIdx, dayBranchIdx),
    hour: compilePillar(hourStemIdx, hourBranchIdx)
  };

  // 9. Great Cycles (大运) Calculations
  // Direction:
  // Male + Yang Year, Female + Yin Year -> Forward (顺)
  // Male + Yin Year, Female + Yang Year -> Backward (逆)
  const isYangYear = yearStemIdx % 2 === 0;
  const isForwardField = (gender === "男" && isYangYear) || (gender === "女" && !isYangYear);

  // Transition Solar Term JD
  // If forward: look for the term immediately following the birth moment JD.
  // Actually, Months in Bazi are defined by the 12 primary solar terms (立春, 惊蛰, ...), which are monthly transitions.
  // We need to calculate the precise distance in hours to the index of neighboring primary solar terms.
  const allTermsInBirthYear = getSolarTermsForYear(originalYear);
  // Also get prev & next years terms just in case of boundaries
  const allPrevYearTerms = getSolarTermsForYear(originalYear - 1);
  const allNextYearTerms = getSolarTermsForYear(originalYear + 1);

  // Merge them and filter for the 12 primary terms (月之节: 立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒)
  // Standard list of primary terms (index is odd or even? Let's check our list:
  // SOLAR_TERMS starting from 春分 (0), 清明 (15 - prim), 谷雨 (30), 立夏 (45 - prim), 芒种 (75 - prim), 小暑 (105 - prim), 大暑 (120), 立秋 (135 - prim).
  // Actually, the primary terms (节) are: 立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪, 小寒.
  // The secondary terms (气) are: 雨水, 春分, 谷雨, 小满, 夏至, 大暑, 处暑, 秋分, 霜降, 小雪, 冬至, 大寒.
  // Let's filter for the primary solar terms:
  const PRIMARY_TERM_NAMES = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];
  
  const mergedPrimaryTerms = [
    ...allPrevYearTerms,
    ...allTermsInBirthYear,
    ...allNextYearTerms
  ].filter(t => PRIMARY_TERM_NAMES.includes(t.name))
   .sort((a, b) => a.jd - b.jd);

  // Find the closest preceding and succeeding primary solar terms relative to the birth moment
  let prevTerm = mergedPrimaryTerms[0];
  let nextTerm = mergedPrimaryTerms[mergedPrimaryTerms.length - 1];

  for (let i = 0; i < mergedPrimaryTerms.length - 1; i++) {
    if (mergedPrimaryTerms[i].jd <= jd_moment && mergedPrimaryTerms[i+1].jd > jd_moment) {
      prevTerm = mergedPrimaryTerms[i];
      nextTerm = mergedPrimaryTerms[i+1];
      break;
    }
  }

  const jdTarget = isForwardField ? nextTerm.jd : prevTerm.jd;
  const jdDiff = Math.abs(jdTarget - jd_moment); // diff in days
  const totalHours = jdDiff * 24;

  // Transit age: 3 days = 1 year, 1 day = 4 months, 1 hour = 5 days, 1 minute = 2 hours
  const preciseYears = totalHours / 72; // Since 72 hours = 3 days = 1 year
  
  const transitYears = Math.floor(preciseYears);
  const remainingHours = (preciseYears - transitYears) * 72;
  const transitMonths = Math.floor(remainingHours / 6); // 6 hours = 1 month
  const remainingHours2 = remainingHours % 6;
  const transitDays = Math.floor(remainingHours2 * 5); // 1 hour = 5 days

  const desc = `${transitYears}岁${transitMonths}个月${transitDays}天`;
  
  // Gregorian Transit exact date
  // birthDate + transitYears years, transitMonths months, transitDays days
  const birthDateObj = new Date(originalYear, originalMonth - 1, originalDay);
  const transitDate = new Date(birthDateObj.getTime());
  transitDate.setFullYear(transitDate.getFullYear() + transitYears);
  transitDate.setMonth(transitDate.getMonth() + transitMonths);
  transitDate.setDate(transitDate.getDate() + transitDays);
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const transitDateStr = `${transitDate.getFullYear()}-${pad(transitDate.getMonth() + 1)}-${pad(transitDate.getDate())}`;

  // Big Cycles (大运) List of pillars (60 Jiazi sequence)
  // Let's find Month Pillar 60 Jiazi index:
  let monthJiaziIdx = (6 * monthStemIdx - 5 * monthBranchIdx) % 60;
  if (monthJiaziIdx < 0) monthJiaziIdx += 60;

  const cycles: any[] = [];
  for (let idx = 1; idx <= 8; idx++) {
    // Determine target Jiazi index based on sorting direction
    const step = isForwardField ? idx : -idx;
    let targetJiaziIdx = (monthJiaziIdx + step) % 60;
    if (targetJiaziIdx < 0) targetJiaziIdx += 60;

    const tStemIdx = targetJiaziIdx % 10;
    const tBranchIdx = targetJiaziIdx % 12;

    const stemName = HEAVENLY_STEMS[tStemIdx];
    const branchName = EARTHLY_BRANCHES[tBranchIdx];

    const cycleStartAge = transitYears + (idx - 1) * 10;
    const cycleStartYear = transitDate.getFullYear() + (idx - 1) * 10;

    cycles.push({
      index: idx,
      startAge: cycleStartAge === 0 ? 1 : cycleStartAge, // Default to starts at age 1 if 0
      startYear: cycleStartYear,
      stem: stemName,
      branch: branchName,
      nayin: getNayin(tStemIdx, tBranchIdx),
      changsheng: getChangsheng(dayStemIdx, tBranchIdx),
      tenGod: getTenGod(dayStemIdx, tStemIdx)
    });
  }

  // 10. Flowing years parameters for CURRENT time (or user selected date-time)
  // Default to today
  const today = flowingTargetDate || new Date();
  const curYear = today.getFullYear();
  const curMonth = today.getMonth() + 1;
  const curDay = today.getDate();

  let curYearJiazi = (curYear - 4) % 60;
  if (curYearJiazi < 0) curYearJiazi += 60;
  const currYStem = curYearJiazi % 10;
  const currYBranch = curYearJiazi % 12;

  // Approx Month Branch for flow month (based on month 1-12)
  // Note: month branch is roughly (month) % 12... actually Month 1 (Jan) is 丑(1), Month 2 (Feb) is 寅(2), Month 3 is 卯(3)... Month 12 is 子(0)
  // Approx branch index:
  const curMonBranch = (curMonth) % 12;
  // Stem via Month starting rules:
  const curMonTigerStart = monthTigerStarts[currYStem % 5];
  const curMonDist = (curMonBranch - 2 + 12) % 12;
  const curMonStem = (curMonTigerStart + curMonDist) % 10;

  // Approx Day Branch for flow day
  const jd_today_day = dateToJD(curYear, curMonth, curDay, 12, 0, 0);
  let curDayJiazi = (Math.floor(jd_today_day + 0.5) + 49) % 60;
  if (curDayJiazi < 0) curDayJiazi += 60;
  const curDStem = curDayJiazi % 10;
  const curDBranch = curDayJiazi % 12;

  const flowingTime: FlowingTimeInfo = {
    year: `${HEAVENLY_STEMS[currYStem]}${EARTHLY_BRANCHES[currYBranch]}`,
    month: `${HEAVENLY_STEMS[curMonStem]}${EARTHLY_BRANCHES[curMonBranch]}`,
    day: `${HEAVENLY_STEMS[curDStem]}${EARTHLY_BRANCHES[curDBranch]}`,
    yearTenGod: getTenGod(dayStemIdx, currYStem),
    monthTenGod: getTenGod(dayStemIdx, curMonStem),
    dayTenGod: getTenGod(dayStemIdx, curDStem),
    yearNayin: getNayin(currYStem, currYBranch)
  };

  // 11. Format Output
  const padMin = (n: number) => String(n).padStart(2, '0');
  const birthTimeLSTStr = `${adjustedDate.getFullYear()}-${padMin(adjustedDate.getMonth() + 1)}-${padMin(adjustedDate.getDate())} ${padMin(originalHour)}:${padMin(originalMinute)}`;

  return {
    birthTimeG: gregorianDateStr,
    birthTimeLST: birthTimeLSTStr,
    longitude,
    cityName,
    gender,
    fourPillars,
    daYun: {
      transitAgeDescription: desc,
      transitExactDate: transitDateStr,
      cycles
    },
    flowingTime,
    solarTerms: allTermsInBirthYear
  };
}
