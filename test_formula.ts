// Run diagnostic loops for Ziwei star formulas
import { log } from "console";

const BOARD_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

function getZiweiIndex(lDay: number, juNumber: number): number {
  const Q = Math.ceil(lDay / juNumber);
  const R = Q * juNumber - lDay;
  let idx = 0;
  if (R % 2 === 0) {
    idx = (Q - R + 12) % 12;
  } else {
    idx = (Q + R + 12) % 12;
  }
  return idx;
}

console.log("--- Scanning for Ziwei Star at 未 (index 5) ---");
for (let ju = 2; ju <= 6; ju++) {
  const matchingDays: number[] = [];
  for (let day = 1; day <= 30; day++) {
    const idx = getZiweiIndex(day, ju);
    if (idx === 5) {
      matchingDays.push(day);
    }
  }
  console.log(`Bureau ${ju}: days that place Ziwei at 未:`, matchingDays.join(", "));
}
