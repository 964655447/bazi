import { Solar } from "lunar-javascript";
import { getNayin } from "./astronomy";

export interface ZWDSPalace {
  branchIdx: number;     // 0-11 for 寅 to 丑
  branchName: string;   // e.g. "寅"
  stemName: string;     // e.g. "甲"
  palaceName: string;   // e.g. "命宫", "夫妻宫"
  isMingGong: boolean;
  isShenGong: boolean;
  decadalStart: number;
  decadalEnd: number;
  majorStars: string[];
  luckyStars: string[];   // Left Assistant, Right Assistant, Wenchang, Wenqu, Tiankui, Tianyue, Lucun, Tianma
  harmStars: string[];    // Qingyang, Tuoluo, Dikong, Dijie
  sihua: { [star: string]: "化禄" | "化权" | "化科" | "化忌" }; // Sihua tags
  gridPos: { r: number; c: number }; // Grid coordinates on a 4x4 layout
}

export interface ZWDSChart {
  birthTimeG: string;
  birthTimeL: string;     // Lunar date string
  name: string;
  gender: "男" | "女";
  yearGanZhi: string;
  mingJu: string;         // e.g. "木三局"
  mingZhu: string;        // 命主 star, e.g. "武曲"
  shenZhi: string;        // 身主 star, e.g. "天相"
  palaces: ZWDSPalace[];  // Coordinates and details for all 12 cells
}

// Map from Natural Zi branch index to board layout starting at 寅
const ziToBoardIdx = (ziIdx: number) => (ziIdx - 2 + 12) % 12;

// Map board index 0-11 (寅 to 丑) to natural Branch index starting at 子
const boardToNaturalIdx = (boardIdx: number) => (boardIdx + 2) % 12;

const CHINESE_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const CHINESE_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BOARD_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

const KUI_MAP = [11, 10, 9, 9, 11, 10, 11, 0, 1, 1]; // relative to 寅 (0)
const YUE_MAP = [5, 6, 7, 7, 5, 6, 5, 4, 3, 3];     // relative to 寅 (0)
const LUCUN_MAP = [0, 1, 3, 4, 3, 4, 6, 7, 9, 10];   // relative to 寅 (0)

const GRID_COORDS = [
  { r: 3, c: 0 }, // 寅 (0)
  { r: 2, c: 0 }, // 卯 (1)
  { r: 1, c: 0 }, // 辰 (2)
  { r: 0, c: 0 }, // 巳 (3)
  { r: 0, c: 1 }, // 午 (4)
  { r: 0, c: 2 }, // 未 (5)
  { r: 0, c: 3 }, // 申 (6)
  { r: 1, c: 3 }, // 酉 (7)
  { r: 2, c: 3 }, // 戌 (8)
  { r: 3, c: 3 }, // 亥 (9)
  { r: 3, c: 2 }, // 子 (10)
  { r: 3, c: 1 }  // 丑 (11)
];

// 命主 calculation mapper (based on Ming Gong's Branch index)
// 命主: 子-贪狼, 丑-巨门, 寅-存禄, 卯-文曲, 辰-廉贞, 巳-武曲, 午-破军, 未-武曲, 申-廉贞, 酉-文曲, 戌-存禄, 亥-巨门
const MING_ZHU_MAP = [
  "存禄", // 寅 (0)
  "文曲", // 卯 (1)
  "廉贞", // 辰 (2)
  "武曲", // 巳 (3)
  "破军", // 午 (4)
  "武曲", // 未 (5)
  "廉贞", // 申 (6)
  "文曲", // 酉 (7)
  "存禄", // 戌 (8)
  "巨门", // 亥 (9)
  "贪狼", // 子 (10)
  "巨门"  // 丑 (11)
];

// 身主 calculation mapper (based on Year Earthly Branch index)
// 子-火星, 丑-天相, 寅-天梁, 卯-天同, 辰-文昌, 巳-天机, 午-火星, 未-天相, 申-天梁, 酉-天同, 戌-文昌, 亥-天机
const SHEN_ZHI_MAP = [
  "天梁", // 寅 (0)
  "天同", // 卯 (1)
  "文昌", // 辰 (2)
  "天机", // 巳 (3)
  "火星", // 午 (4)
  "天相", // 未 (5)
  "天梁", // 申 (6)
  "天同", // 酉 (7)
  "文昌", // 戌 (8)
  "天机", // 亥 (9)
  "火星", // 子 (10)
  "天相"  // 丑 (11)
];

export function compileZiwei(
  gregorianDateStr: string,
  longitude: number,
  cityName: string,
  gender: "男" | "女",
  name: string = "缘主"
): ZWDSChart {
  // 1. Parse date mapping
  const [datePart, timePart] = gregorianDateStr.split(" ");
  const [yearStr, monthStr, dayStr] = datePart.split("-");
  const [hourStr, minStr] = timePart.split(":");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const hour = parseInt(hourStr);
  const min = parseInt(minStr);

  const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
  const lunar = solar.getLunar();

  // 2. Compute true lunar parameters
  let lMonth = lunar.getMonth();
  const isLeap = lMonth < 0;
  if (isLeap) {
    lMonth = Math.abs(lMonth);
  }
  let finalMonthForZwi = lMonth;
  // If in a leap month and birth is after the 15th, count as the next month for ZWDS
  if (isLeap && lunar.getDay() > 15) {
    finalMonthForZwi = (lMonth % 12) + 1;
  }
  const lDay = lunar.getDay();

  // Hour branch index starting at 子 as 0
  const hourIdxFromZi = Math.floor((hour + 1) / 2) % 12;

  // Year Heavenly Stem and Earthly Branch indices
  const yearStemIdx = CHINESE_STEMS.indexOf(lunar.getYearGan());
  const yearBranchIdx = CHINESE_BRANCHES.indexOf(lunar.getYearZhi());
  const yearBranchIdxBoard = ziToBoardIdx(yearBranchIdx);

  // 3. Find Ming Gong and Shen Gong
  // Start from 寅 (board index 0)
  // Clockwise count by month, then counter-clockwise count by hour branch idx
  const startIdx = finalMonthForZwi - 1;
  const mingBoardIdx = (startIdx - hourIdxFromZi + 12) % 12;

  // Clockwise count by month, then clockwise count by hour branch idx for Shen Gong
  const shenBoardIdx = (startIdx + hourIdxFromZi) % 12;

  // 4. Palace Stems (using Five Tigers song)
  const tigerStartStem = (yearStemIdx % 5) * 2 + 2; // starting stem for 寅 (index 0)

  // 5. Determine element phase (Wu Xing Ju)
  const mingStemIdx = (tigerStartStem + mingBoardIdx) % 10;
  const mingNaturalBranchIdx = boardToNaturalIdx(mingBoardIdx);
  const nayinStr = getNayin(mingStemIdx, mingNaturalBranchIdx);

  let juName = "水二局";
  let juNumber = 2;
  if (nayinStr.includes("水")) {
    juName = "水二局";
    juNumber = 2;
  } else if (nayinStr.includes("木")) {
    juName = "木三局";
    juNumber = 3;
  } else if (nayinStr.includes("金")) {
    juName = "金四局";
    juNumber = 4;
  } else if (nayinStr.includes("土")) {
    juName = "土五局";
    juNumber = 5;
  } else if (nayinStr.includes("火")) {
    juName = "火六局";
    juNumber = 6;
  }

  // 6. Placement of 14 Major Stars
  // A. Zi Weiの位置
  const Q = Math.ceil(lDay / juNumber);
  const R = Q * juNumber - lDay;
  let ziweiBoardIdx = 0;
  if (R % 2 === 0) {
    ziweiBoardIdx = (Q - R + 12) % 12;
  } else {
    ziweiBoardIdx = (Q + R + 12) % 12;
  }

  // B. Zi Wei Group positions
  const tianjiBoardIdx = (ziweiBoardIdx - 1 + 12) % 12;
  const taiyangBoardIdx = (ziweiBoardIdx - 3 + 12) % 12;
  const wuquBoardIdx = (ziweiBoardIdx - 4 + 12) % 12;
  const tiantongBoardIdx = (ziweiBoardIdx - 5 + 12) % 12;
  const lianzhenBoardIdx = (ziweiBoardIdx - 8 + 12) % 12;

  // C. Tian Fu position (symmetrical to Zi Wei across 寅-申 axis)
  const tianfuBoardIdx = (12 - ziweiBoardIdx) % 12;

  // D. Tian Fu Group positions
  const taiyinBoardIdx = (tianfuBoardIdx + 1) % 12;
  const tanlangBoardIdx = (tianfuBoardIdx + 2) % 12;
  const jumenBoardIdx = (tianfuBoardIdx + 3) % 12;
  const tianxiangBoardIdx = (tianfuBoardIdx + 4) % 12;
  const tianliangBoardIdx = (tianfuBoardIdx + 5) % 12;
  const qishaBoardIdx = (tianfuBoardIdx + 6) % 12;
  const pojunBoardIdx = (tianfuBoardIdx + 10) % 12;

  // 7. Place Auxiliary and Shadow Stars
  const zuofuIdx = (2 + finalMonthForZwi - 1) % 12;
  const youbiIdx = (8 - finalMonthForZwi + 1 + 12) % 12;

  const wenchangIdx = (8 - hourIdxFromZi + 12) % 12;
  const wenquIdx = (2 + hourIdxFromZi) % 12;

  const tiankuiIdx = KUI_MAP[yearStemIdx];
  const tianyueIdx = YUE_MAP[yearStemIdx];

  const lucunIdx = LUCUN_MAP[yearStemIdx];
  const qingyangIdx = (lucunIdx + 1) % 12;
  const tuoluoIdx = (lucunIdx - 1 + 12) % 12;

  // Tian Ma (天马): based on Year earthly branch index (from Zi)
  let tianmaIdx = 0;
  // Year branch from Zi: 申子辰->寅, 寅午戌->申, 巳酉丑->亥, 亥卯未->巳
  if ([8, 0, 4].includes(yearBranchIdx)) tianmaIdx = 0; // 寅 (0)
  else if ([2, 6, 10].includes(yearBranchIdx)) tianmaIdx = 6; // 申 (6)
  else if ([5, 9, 1].includes(yearBranchIdx)) tianmaIdx = 9; // 亥 (9)
  else if ([11, 3, 7].includes(yearBranchIdx)) tianmaIdx = 3; // 巳 (3)

  // Di Jie (地劫) and Di Kong (地空)
  const dijieIdx = (9 + hourIdxFromZi) % 12;
  const dikongIdx = (9 - hourIdxFromZi + 12) % 12;

  // 8. Sihua Mapping (化禄 化权 化科 化忌)
  const SIHUA_TABLE = [
    { lu: "廉贞", quan: "破军", ke: "武曲", ji: "太阳" }, // 甲 (0)
    { lu: "天机", quan: "天梁", ke: "紫微", ji: "太阴" }, // 乙 (1)
    { lu: "天同", quan: "天机", ke: "文昌", ji: "廉贞" }, // 丙 (2)
    { lu: "太阴", quan: "天同", ke: "天机", ji: "巨门" }, // 丁 (3)
    { lu: "贪狼", quan: "太阴", ke: "右弼", ji: "天机" }, // 戊 (4)
    { lu: "武曲", quan: "贪狼", ke: "天梁", ji: "文曲" }, // 己 (5)
    { lu: "太阳", quan: "武曲", ke: "太阴", ji: "天同" }, // 庚 (6)
    { lu: "巨门", quan: "太阳", ke: "文曲", ji: "文昌" }, // 辛 (7)
    { lu: "天梁", quan: "紫微", ke: "左辅", ji: "武曲" }, // 壬 (8)
    { lu: "破军", quan: "巨门", ke: "太阴", ji: "贪狼" }, // 癸 (9)
  ];
  const sihuaMapping = SIHUA_TABLE[yearStemIdx];

  // Gender polarity and Year stem polarity for Decadal direction
  const isYangYear = yearStemIdx % 2 === 0;
  const isClockwise = (gender === "男" && isYangYear) || (gender === "女" && !isYangYear);

  // 9. Construct the 12 Palaces list
  const PALACE_NAMES = [
    "命宫",
    "兄弟宫",
    "夫妻宫",
    "子女宫",
    "财帛宫",
    "疾厄宫",
    "迁移宫",
    "交友宫",
    "官禄宫",
    "田宅宫",
    "福德宫",
    "父母宫"
  ];

  const palaces: ZWDSPalace[] = [];

  // Generate placeholders for all twelve board cells (0 to 11 for 寅 to 丑)
  for (let bIdx = 0; bIdx < 12; bIdx++) {
    const branchName = BOARD_BRANCHES[bIdx];
    const stemIdx = (tigerStartStem + bIdx) % 10;
    const stemName = CHINESE_STEMS[stemIdx];

    // Find custom name for this palace
    // Formula: pIdx = (mingBoardIdx - bIdx + 12) % 12
    const pIdx = (mingBoardIdx - bIdx + 12) % 12;
    let palaceName = PALACE_NAMES[pIdx];

    const isMingGong = bIdx === mingBoardIdx;
    const isShenGong = bIdx === shenBoardIdx;
    if (isShenGong) {
      palaceName += "·身宫";
    }

    // Decadal range calculation
    // Starts at juNumber for Ming Gong, and cycles outwards relative to direction
    const stepDiff = (bIdx - mingBoardIdx + 12) % 12;
    // steps in the direction of progression
    const stepsInProgression = isClockwise ? stepDiff : (12 - stepDiff) % 12;
    const decadalStart = juNumber + stepsInProgression * 10;
    const decadalEnd = decadalStart + 9;

    const majorStars: string[] = [];
    const luckyStars: string[] = [];
    const harmStars: string[] = [];
    const sihua: { [star: string]: "化禄" | "化权" | "化科" | "化忌" } = {};

    // Helper to push star and check Sihua
    const addMajorStar = (idx: number, starName: string) => {
      if (idx === bIdx) {
        majorStars.push(starName);
        if (sihuaMapping.lu === starName) sihua[starName] = "化禄";
        else if (sihuaMapping.quan === starName) sihua[starName] = "化权";
        else if (sihuaMapping.ke === starName) sihua[starName] = "化科";
        else if (sihuaMapping.ji === starName) sihua[starName] = "化忌";
      }
    };

    const addLuckyStar = (idx: number, starName: string) => {
      if (idx === bIdx) {
        luckyStars.push(starName);
        if (sihuaMapping.lu === starName) sihua[starName] = "化禄";
        else if (sihuaMapping.quan === starName) sihua[starName] = "化权";
        else if (sihuaMapping.ke === starName) sihua[starName] = "化科";
        else if (sihuaMapping.ji === starName) sihua[starName] = "化忌";
      }
    };

    const addHarmStar = (idx: number, starName: string) => {
      if (idx === bIdx) {
        harmStars.push(starName);
      }
    };

    // Major Stars
    addMajorStar(ziweiBoardIdx, "紫微");
    addMajorStar(tianjiBoardIdx, "天机");
    addMajorStar(taiyangBoardIdx, "太阳");
    addMajorStar(wuquBoardIdx, "武曲");
    addMajorStar(tiantongBoardIdx, "天同");
    addMajorStar(lianzhenBoardIdx, "廉贞");
    addMajorStar(tianfuBoardIdx, "天府");
    addMajorStar(taiyinBoardIdx, "太阴");
    addMajorStar(tanlangBoardIdx, "贪狼");
    addMajorStar(jumenBoardIdx, "巨门");
    addMajorStar(tianxiangBoardIdx, "天相");
    addMajorStar(tianliangBoardIdx, "天梁");
    addMajorStar(qishaBoardIdx, "七杀");
    addMajorStar(pojunBoardIdx, "破军");

    // Lucky Stars
    addLuckyStar(zuofuIdx, "左辅");
    addLuckyStar(youbiIdx, "右弼");
    addLuckyStar(wenchangIdx, "文昌");
    addLuckyStar(wenquIdx, "文曲");
    addLuckyStar(tiankuiIdx, "天魁");
    addLuckyStar(tianyueIdx, "天钺");
    addLuckyStar(lucunIdx, "禄存");
    addLuckyStar(tianmaIdx, "天马");

    // Harm Stars
    addHarmStar(qingyangIdx, "擎羊");
    addHarmStar(tuoluoIdx, "陀罗");
    addHarmStar(dikongIdx, "地空");
    addHarmStar(dijieIdx, "地劫");

    palaces.push({
      branchIdx: bIdx,
      branchName,
      stemName,
      palaceName,
      isMingGong,
      isShenGong,
      decadalStart,
      decadalEnd,
      majorStars,
      luckyStars,
      harmStars,
      sihua,
      gridPos: GRID_COORDS[bIdx]
    });
  }

  // 10. Secondary statistics (命主 and 身主)
  const mingZhu = MING_ZHU_MAP[mingBoardIdx];
  const shenZhi = SHEN_ZHI_MAP[yearBranchIdxBoard];

  const lunarYearStr = lunar.getYearInGanZhi();
  const lunarMonthStr = lunar.getMonthInChinese();
  const lunarDayStr = lunar.getDayInChinese();
  const lunarTimeStr = CHINESE_BRANCHES[hourIdxFromZi] + "时";

  return {
    birthTimeG: gregorianDateStr,
    birthTimeL: `农历 ${lunarYearStr}年 ${lunarMonthStr}月${lunarDayStr} ${lunarTimeStr}`,
    name,
    gender,
    yearGanZhi: lunarYearStr,
    mingJu: juName,
    mingZhu,
    shenZhi,
    palaces
  };
}
