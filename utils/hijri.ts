/**
 * Simple Gregorian to Hijri converter
 * Based on the mathematical Kuwaiti algorithm
 */

export function getHijriDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;

  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);

  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  let b2 = 0;
  if (jd > 2299160) {
    let a2 = Math.floor((jd - 1867216.25) / 36524.25);
    b2 = 1 + a2 - Math.floor(a2 / 4);
  }
  let bb = jd + b2 + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  let day_g = bb - dd - Math.floor(30.6001 * ee);
  let month_g = ee - 1;
  if (ee > 13) month_g = ee - 13;
  let year_g = cc - 4715;
  if (month_g > 2) year_g = cc - 4716;

  let wd = ((jd + 1) % 7) + 1;

  let iyear = 10631 / 30;
  let epoch_astro = 1948084;
  let shift1 = 8.01 / 60;

  let z = jd - epoch_astro;
  let cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  let j = Math.floor((z - shift1) / iyear);
  let iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  let id = z - Math.floor(29.5001 * im - 29);

  return {
    day: id,
    month: im, // 1-12
    year: iy,
    dayName: getDayNameAr(wd)
  };
}

function getDayNameAr(wd: number) {
  const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return names[wd - 1];
}

export const HIJRI_MONTH_NAMES_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export function formatHijri(h: { day: number, month: number, year: number }) {
  return `${h.day} ${HIJRI_MONTH_NAMES_AR[h.month - 1]} ${h.year} هـ`;
}
