
const BOARD_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const lDay = 2;
const juNumber = 5;
console.log('1977年例验证：');
console.log('lDay:', lDay, 'juNumber:', juNumber);
let x = juNumber;
while ((lDay + x) % juNumber !== 0) x += juNumber;
const y = (lDay + x) / juNumber;
console.log('x:', x, 'y:', y);
console.log('x%2:', x % 2);
const diff = y - x;
console.log('y-x:', diff);
let ziweiBoardIdx: number;
if (x % 2 === 0) {
  ziweiBoardIdx = Math.floor(y + x) % 12;
  console.log('x偶数, y+x=%d, ziweiBoardIdx=%d', y+x, ziweiBoardIdx);
} else {
  if (diff > 0) {
    ziweiBoardIdx = Math.floor(diff) % 12;
    console.log('x奇数, diff>0, ziweiBoardIdx=%d', ziweiBoardIdx);
  } else {
    if (diff === 0) ziweiBoardIdx = 11;
    else if (diff === -1) ziweiBoardIdx = 10;
    else if (diff === -2) ziweiBoardIdx = 9;
    else if (diff === -3) ziweiBoardIdx = 8;
    else if (diff === -4) ziweiBoardIdx = 7;
    else ziweiBoardIdx = (Math.floor(diff) % 12 + 12) % 12;
    console.log('x奇数, diff<=0, ziweiBoardIdx=%d', ziweiBoardIdx);
  }
}
console.log('紫微星在:', BOARD_BRANCHES[ziweiBoardIdx], '(', ziweiBoardIdx, ')');
