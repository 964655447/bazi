export interface StemInfo {
  name: string;        // e.g. "甲"
  index: number;       // 0 - 9
  element: string;     // "木", "火", "土", "金", "水"
  polarity: "阳" | "阴";
  tenGod: string;      // e.g. "比肩", relative to Day Stem
}

export interface BranchInfo {
  name: string;        // e.g. "子"
  index: number;       // 0 - 11
  element: string;     // "水", "土", etc
  polarity: "阳" | "阴";
  changsheng: string;  // Twelve Changsheng stage relative to Day Stem
  hiddenStems: HiddenStemInfo[];
}

export interface HiddenStemInfo {
  name: string;
  index: number;
  tenGod: string;
  isPrincipal: boolean; // whether it is the main Qi
}

export interface Pillar {
  stem: StemInfo;
  branch: BranchInfo;
  nayin: string;
  emptyVoid: string[]; // List of empty void branches
  shensha: string[];   // List of symbolic stars
  selfSitting: {
    tenGod: string;      // Self-sitting branch main Qi's Ten God
    changsheng: string;  // Self-sitting branch's Changsheng relative to self stem
  };
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface DaYunCycle {
  index: number;
  startAge: number;
  startYear: number;
  stem: string;
  branch: string;
  nayin: string;
  changsheng: string;
  tenGod: string;
}

export interface DaYunInfo {
  transitAgeDescription: string; // e.g., "7岁4个月10天"
  transitExactDate: string;      // e.g., "Gregorian Date"
  cycles: DaYunCycle[];
}

export interface SolarTermRecord {
  name: string;
  timeStr: string;
  jd: number;
}

export interface FlowingTimeInfo {
  year: string;  // e.g., "丙午"
  month: string; // e.g., "癸巳"
  day: string;   // e.g., "庚子"
  yearTenGod: string;
  monthTenGod: string;
  dayTenGod: string;
  yearNayin: string;
}

export interface BaziChartResult {
  birthTimeG: string;        // Gregorian Birth time
  birthTimeLST: string;      // True Solar Time
  longitude: number;
  cityName: string;
  gender: "男" | "女";
  fourPillars: FourPillars;
  daYun: DaYunInfo;
  flowingTime: FlowingTimeInfo;
  solarTerms: SolarTermRecord[];
}
