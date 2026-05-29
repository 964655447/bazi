import { Solar } from "lunar-javascript";

const solar = Solar.fromYmdHms(2004, 4, 7, 17, 16, 0);
const lunar = solar.getLunar();

console.log("Gregorian Date: 2004-04-07 17:16");
console.log("Lunar Year:", lunar.getYear());
console.log("Lunar Month:", lunar.getMonth());
console.log("Lunar Day:", lunar.getDay());
console.log("Lunar Year In GanZhi:", lunar.getYearInGanZhi());
console.log("Lunar Month In GanZhi:", lunar.getMonthInGanZhi());
console.log("Lunar Day In GanZhi:", lunar.getDayInGanZhi());
console.log("Lunar Leap Month:", lunar.getYearShengXiao());
console.log("Year ShengXiao:", lunar.getYearShengXiao());
console.log("Full Chinese Date:", lunar.toString());
