import { compileZiwei } from "./src/utils/ziwei";
import { compileBazi } from "./src/utils/astronomy";

// Test case: 1995-10-18 8:30, longitude 120.000, male
const bazi = compileBazi("1995-10-18 8:30", 120.000, "测试", "男");
console.log("== Bazi results ==");
console.log("Year:", bazi.fourPillars.year.stem.name, bazi.fourPillars.year.branch.name);
console.log("Month:", bazi.fourPillars.month.stem.name, bazi.fourPillars.month.branch.name);
console.log("Day:", bazi.fourPillars.day.stem.name, bazi.fourPillars.day.branch.name);
console.log("Hour:", bazi.fourPillars.hour.stem.name, bazi.fourPillars.hour.branch.name);

const zwds = compileZiwei("1995-10-18 8:30", 120.000, "测试", "男", "文墨天机");
console.log("\n== Ziwei Doushu results ==");
console.log("Ming Ju (Bureau):", zwds.mingJu);  // Should be 木三局
console.log("Ming Zhu:", zwds.mingZhu);        // Should be 破军
console.log("Shen Zhi:", zwds.shenZhi);        // Should be 天机

const ziweiPalace = zwds.palaces.find(p => p.majorStars.some(s => s.name === "紫微"));
console.log("Ziwei palace:", ziweiPalace?.branchName, "PalaceName:", ziweiPalace?.palaceName);

const mingPalace = zwds.palaces.find(p => p.isMingGong);
console.log("Ming Gong:", mingPalace?.stemName, mingPalace?.branchName, "BoardIdx:", mingPalace?.branchIdx);

console.log("\n== Twelve Palaces (sorted by BoardIdx) ==");
const sortedPalaces = [...zwds.palaces].sort((a, b) => a.branchIdx - b.branchIdx);
for (const p of sortedPalaces) {
  const majorStr = p.majorStars.map(s => s.name).join(",");
  const minorStr = p.minorStars.map(s => s.name).join(",");
  const adjStr = p.adjectiveStars.map(s => s.name).join(",");
  console.log(`BoardIdx[${p.branchIdx}] Palace [${p.stemName}${p.branchName}] - ${p.palaceName}: Major:[${majorStr}] Minor:[${minorStr}] Adj:[${adjStr}]`);
}

console.log("\n== Expected from WenMoTianJi ==");
console.log("命宫[壬午]: 太阳");
console.log("田宅宫[乙酉]: 紫微, 贪狼");
console.log("迁移宫[戊子]: 天梁");
console.log("疾厄宫[己丑]: 廉贞, 七杀");
console.log("财帛宫[戊寅][身宫]: 无");
console.log("子女宫[己卯]: 无");
console.log("夫妻宫[庚辰]: 天同");
console.log("兄弟宫[辛巳]: 武曲, 破军");
console.log("父母宫[癸未]: 天府");
console.log("福德宫[甲申]: 天机, 太阴");
console.log("官禄宫[丙戌]: 巨门");
console.log("交友宫[丁亥]: 天相");
