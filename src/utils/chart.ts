import { astro } from 'iztro'
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { Profile, HoroscopeMark } from '../types'

/** 用档案排盘,返回 iztro 的 IFunctionalAstrolabe */
export function castChart(profile: Profile): IFunctionalAstrolabe {
  const { calendar, date, timeIndex, gender, isLeapMonth } = profile
  return calendar === 'lunar'
    ? astro.byLunar(date, timeIndex, gender, isLeapMonth ?? false, true, 'zh-CN')
    : astro.bySolar(date, timeIndex, gender, true, 'zh-CN')
}

/** 取指定日期的运限标记(流年/流月/流日/小限),供命盘高亮 */
export function horoscopeMarks(
  astrolabe: IFunctionalAstrolabe,
  date: string,
): {
  yearly: HoroscopeMark
  monthly: HoroscopeMark
  daily: HoroscopeMark
  age: HoroscopeMark & { nominalAge: number }
  solarDate: string
  lunarDate: string
  decadal: { index: number; range: string; heavenlyStem: string; earthlyBranch: string }
} {
  const h = astrolabe.horoscope(date)
  return {
    solarDate: h.solarDate,
    lunarDate: h.lunarDate,
    decadal: {
      index: h.decadal.index,
      range: `${h.decadal.index}`,
      heavenlyStem: h.decadal.heavenlyStem,
      earthlyBranch: h.decadal.earthlyBranch,
    },
    age: {
      index: h.age.index,
      label: `小限 ${h.age.nominalAge} 岁`,
      nominalAge: h.age.nominalAge,
      mutagen: [],
    },
    yearly: {
      index: h.yearly.index,
      label: '流年',
      mutagen: h.yearly.mutagen as unknown as string[],
      heavenlyStem: h.yearly.heavenlyStem,
      earthlyBranch: h.yearly.earthlyBranch,
    },
    monthly: {
      index: h.monthly.index,
      label: '流月',
      mutagen: h.monthly.mutagen as unknown as string[],
      heavenlyStem: h.monthly.heavenlyStem,
      earthlyBranch: h.monthly.earthlyBranch,
    },
    daily: {
      index: h.daily.index,
      label: '流日',
      mutagen: h.daily.mutagen as unknown as string[],
      heavenlyStem: h.daily.heavenlyStem,
      earthlyBranch: h.daily.earthlyBranch,
    },
  }
}

/** 三方四正:本宫、对宫(+6)、三合(+4/+8),按宫索引返回 */
export function trineIndexes(index: number): number[] {
  return [index, (index + 4) % 12, (index + 6) % 12, (index + 8) % 12]
}
