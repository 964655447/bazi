import { compileZiwei } from "./src/utils/ziwei";
import { compileBazi } from "./src/utils/astronomy";

const bazi = compileBazi("2004-04-07 17:16", 121.433, "测试", "男");
console.log("== Bazi results ==");
console.log("Year:", bazi.fourPillars.year.stem.name, bazi.fourPillars.year.branch.name);
console.log("Month:", bazi.fourPillars.month.stem.name, bazi.fourPillars.month.branch.name);
console.log("Day:", bazi.fourPillars.day.stem.name, bazi.fourPillars.day.branch.name);
console.log("Hour:", bazi.fourPillars.hour.stem.name, bazi.fourPillars.hour.branch.name);

const zwds = compileZiwei("2004-04-07 17:16", 121.433, "测试", "男", "文墨天机");
console.log("\n== Ziwei Doushu results ==");
console.log("Ming Ju (Bureau):", zwds.mingJu);
console.log("Ming Zhu:", zwds.mingZhu);
console.log("Shen Zhi:", zwds.shenZhi);

const ziweiPalace = zwds.palaces.find(p => p.majorStars.includes("紫微"));
console.log("Ziwei palace:", ziweiPalace?.branchName, "PalaceName:", ziweiPalace?.palaceName);

console.log("\n== Twelve Palaces ==");
for (const p of zwds.palaces) {
  console.log(`Palace [${p.stemName}${p.branchName}] - ${p.palaceName}: Major:[${p.majorStars.join(",")}] Lucky:[${p.luckyStars.join(",")}] Harm:[${p.harmStars.join(",")}] Sihua:[${JSON.stringify(p.sihua)}]`);
}
