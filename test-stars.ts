
const BOARD_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

console.log('验证紫微星计算（1995年例）：');
const lDay = 24;
const juNumber = 3;
let x = 0;
while ((lDay + x) % juNumber !== 0) x++;
const y = (lDay + x) / juNumber;
console.log('lDay:', lDay, 'x:', x, 'y:', y);
let ziweiBoardIdx: number;
if (x % 2 === 0) {
  ziweiBoardIdx = (Math.floor(y + x) - 1 + 12) % 12;
  console.log('x偶数，ziweiBoardIdx:', ziweiBoardIdx);
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
console.log('紫微星在:', BOARD_BRANCHES[ziweiBoardIdx], '(', ziweiBoardIdx, ')');

console.log('\n紫微星系（逆时针）：');
const tianji = (ziweiBoardIdx - 1 + 12) % 12;
const taiyang = (ziweiBoardIdx - 2 + 12) % 12;
const wuqu = (ziweiBoardIdx - 3 + 12) % 12;
const tiantong = (ziweiBoardIdx - 4 + 12) % 12;
const lianzhen = (ziweiBoardIdx - 6 + 12) % 12;
console.log(`天机: ${BOARD_BRANCHES[tianji]} (${tianji})`);
console.log(`太阳: ${BOARD_BRANCHES[taiyang]} (${taiyang})`);
console.log(`武曲: ${BOARD_BRANCHES[wuqu]} (${wuqu})`);
console.log(`天同: ${BOARD_BRANCHES[tiantong]} (${tiantong})`);
console.log(`廉贞: ${BOARD_BRANCHES[lianzhen]} (${lianzhen})`);

console.log('\n天府星系（与紫微对称）：');
const tianfu = (ziweiBoardIdx + 6) % 12;
console.log(`天府: ${BOARD_BRANCHES[tianfu]} (${tianfu})`);
const taiyin = (tianfu + 1) % 12;
const tanlang = (tianfu + 2) % 12;
const jumen = (tianfu + 3) % 12;
const tianxiang = (tianfu + 4) % 12;
const tianliang = (tianfu + 5) % 12;
const qisha = (tianfu + 6) % 12;
const pojun = (tianfu + 8) % 12;
console.log(`太阴: ${BOARD_BRANCHES[taiyin]} (${taiyin})`);
console.log(`贪狼: ${BOARD_BRANCHES[tanlang]} (${tanlang})`);
console.log(`巨门: ${BOARD_BRANCHES[jumen]} (${jumen})`);
console.log(`天相: ${BOARD_BRANCHES[tianxiang]} (${tianxiang})`);
console.log(`天梁: ${BOARD_BRANCHES[tianliang]} (${tianliang})`);
console.log(`七杀: ${BOARD_BRANCHES[qisha]} (${qisha})`);
console.log(`破军: ${BOARD_BRANCHES[pojun]} (${pojun})`);
