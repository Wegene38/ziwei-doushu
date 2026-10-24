export type Gender = '男' | '女'
export type Calendar = 'solar' | 'lunar'

/** 一份出生档案 */
export interface Profile {
  id: string
  name: string
  gender: Gender
  calendar: Calendar
  /** 日期串:solar 为 2000-8-16;lunar 为 2000-7-17 */
  date: string
  /** 时辰序号 0~12(0 早子时,12 晚子时) */
  timeIndex: number
  /** 农历且生月为闰月时为 true */
  isLeapMonth?: boolean
}

export interface HoroscopeMark {
  /** 运限所在本命宫索引 */
  index: number
  label: string
  /** 四化星名,顺序为 禄权科忌 */
  mutagen: string[]
  heavenlyStem?: string
  earthlyBranch?: string
}
