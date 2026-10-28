export interface TenGodInfo {
  name: string
  /** 加权出现次数 */
  weight: number
}
export interface ShenShaInfo {
  name: string
}
export interface IndustryGroup {
  element: string
  reason: string
  industries: string[]
}
export interface BaziCareerReading {
  pillars: { stem: string; branch: string }[]
  dayStem: string
  dayElement: string
  strength: '偏强' | '偏弱' | '中和'
  strengthText: string
  favorable: string[]
  tenGods: TenGodInfo[]
  styleText: string
  styleCareers: string[]
  shensha: { name: string; meaning: string; careers: string[] }[]
  industryGroups: IndustryGroup[]
  recommendCareers: string[]
}
