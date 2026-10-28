import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { TenGodInfo, ShenShaInfo } from './baziCareerTypes'

/** 天干:甲0 乙1 丙2 丁3 戊4 己5 庚6 辛7 壬8 癸9;元素 = idx>>1(0木1火2土3金4水),偶数为阳 */
const STEMS = '甲乙丙丁戊己庚辛壬癸'
/** 地支:子0 丑1 寅2 卯3 辰4 巳5 午6 未7 申8 酉9 戌10 亥11 */
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'
const ELEMENT_NAMES = ['木', '火', '土', '金', '水'] as const
/** 相生序:木→火→土→金→水→木 */
export const ELEMENT_COLOR: Record<string, string> = {
  木: '#8fd39a',
  火: '#f0907e',
  土: '#d4af37',
  金: '#cfd8e3',
  水: '#7fb5e8',
}

const STEM_ELEMENT = (ch: string) => STEMS.indexOf(ch) >> 1
const STEM_YANG = (ch: string) => STEMS.indexOf(ch) % 2 === 0
/** 天干 → 五行色 */
export function stemColor(ch: string): string {
  return ELEMENT_COLOR[ELEMENT_NAMES[STEM_ELEMENT(ch)]]
}
/** 地支 → 五行色 */
export function branchColor(ch: string): string {
  return ELEMENT_COLOR[ELEMENT_NAMES[BRANCH_ELEMENT(ch)]]
}
const BRANCH_ELEMENT = (ch: string): number => {
  const i = BRANCHES.indexOf(ch)
  // 子水 亥水,寅卯木,巳午火,申酉金,辰戌丑未土
  if (i === 0 || i === 11) return 4
  if (i === 2 || i === 3) return 0
  if (i === 5 || i === 6) return 1
  if (i === 8 || i === 9) return 3
  return 2
}
const BRANCH_HIDDEN: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
}

/** 以日干为基准判定十神 */
export function tenGodOf(dayStem: string, otherStem: string): string {
  const eD = STEM_ELEMENT(dayStem)
  const eO = STEM_ELEMENT(otherStem)
  const samePolarity = STEM_YANG(dayStem) === STEM_YANG(otherStem)
  const diff = (eO - eD + 5) % 5
  if (diff === 0) return samePolarity ? '比肩' : '劫财'
  if (diff === 1) return samePolarity ? '食神' : '伤官'
  if (diff === 2) return samePolarity ? '偏财' : '正财'
  if (diff === 3) return samePolarity ? '七杀' : '正官'
  return samePolarity ? '偏印' : '正印'
}

/** 三合局查神煞:申子辰 / 寅午戌 / 巳酉丑 / 亥卯未 */
function triadOf(branch: string): '申子辰' | '寅午戌' | '巳酉丑' | '亥卯未' | null {
  if ('申子辰'.includes(branch)) return '申子辰'
  if ('寅午戌'.includes(branch)) return '寅午戌'
  if ('巳酉丑'.includes(branch)) return '巳酉丑'
  if ('亥卯未'.includes(branch)) return '亥卯未'
  return null
}
const SANSHA_TABLE: Record<string, { 驿马: string; 华盖: string; 桃花: string }> = {
  申子辰: { 驿马: '寅', 华盖: '辰', 桃花: '酉' },
  寅午戌: { 驿马: '申', 华盖: '戌', 桃花: '卯' },
  巳酉丑: { 驿马: '亥', 华盖: '丑', 桃花: '午' },
  亥卯未: { 驿马: '巳', 华盖: '未', 桃花: '子' },
}
const WENCHANG_TABLE: Record<string, string> = {
  甲: '巳', 乙: '午', 丙: '申', 戊: '申', 丁: '酉',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
}
const TIANYI_TABLE: Record<string, string[]> = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['午', '寅'],
}

export interface BaziData {
  pillars: { stem: string; branch: string }[]
  dayStem: string
  dayElement: string
  strength: '偏强' | '偏弱' | '中和'
  /** 支撑比(同类+生我 加权占比) */
  supportRatio: number
  /** 喜用元素 */
  favorable: string[]
  tenGods: TenGodInfo[]
  shensha: ShenShaInfo[]
}

/** 从排盘的干支四柱计算八字职业数据 */
export function computeBazi(astrolabe: IFunctionalAstrolabe): BaziData | null {
  const parts = (astrolabe.chineseDate ?? '').trim().split(/\s+/)
  if (parts.length !== 4 || parts.some((p) => p.length !== 2)) return null
  const pillars = parts.map((p) => ({ stem: p[0], branch: p[1] }))
  const dayStem = pillars[2].stem
  const eD = STEM_ELEMENT(dayStem)

  // ── 加权统计:同我/生我 为扶,我生/我克/克我 为泄 ──
  let support = 0
  let drain = 0
  const elementCount = new Array(5).fill(0)
  const godCount = new Map<string, number>()
  const addGod = (g: string, w: number) => godCount.set(g, (godCount.get(g) ?? 0) + w)

  pillars.forEach((p, i) => {
    // 地支权重:月支3 日支2 年/时支1;藏干本气全重,余气减半
    const branchWeight = i === 1 ? 3 : i === 2 ? 2 : 1
    const hidden = BRANCH_HIDDEN[p.branch]
    hidden.forEach((h, j) => {
      const w = branchWeight * (j === 0 ? 1 : 0.5)
      const e = STEM_ELEMENT(h)
      elementCount[e] += w
      const g = tenGodOf(dayStem, h)
      addGod(g, w)
      if (e === eD || (e - eD + 5) % 5 === 4) support += w
      else drain += w
    })
    // 天干权重(日干自身除外):1
    if (i !== 2) {
      const e = STEM_ELEMENT(p.stem)
      elementCount[e] += 1
      const g = tenGodOf(dayStem, p.stem)
      addGod(g, 1)
      if (e === eD || (e - eD + 5) % 5 === 4) support += 1
      else drain += 1
    }
  })

  const supportRatio = support / (support + drain)
  const strength: BaziData['strength'] = supportRatio > 0.58 ? '偏强' : supportRatio < 0.42 ? '偏弱' : '中和'

  // ── 喜用神:弱喜印比(生我/同我),强喜食伤财官(我生/我克/克我),中和取最缺 ──
  let favorable: string[]
  if (strength === '偏弱') {
    favorable = [ELEMENT_NAMES[(eD + 4) % 5], ELEMENT_NAMES[eD]]
  } else if (strength === '偏强') {
    favorable = [ELEMENT_NAMES[(eD + 1) % 5], ELEMENT_NAMES[(eD + 2) % 5], ELEMENT_NAMES[(eD + 3) % 5]]
      // 取命局中最缺的两类,平衡为要
      .sort((a, b) => elementCount[ELEMENT_NAMES.indexOf(a as '木')] - elementCount[ELEMENT_NAMES.indexOf(b as '木')])
      .slice(0, 2)
  } else {
    favorable = ELEMENT_NAMES.map((n, i) => ({ n, c: elementCount[i] }))
      .sort((a, b) => a.c - b.c)
      .slice(0, 2)
      .map((x) => x.n)
  }

  // ── 十神排序(按权重) ──
  const tenGods: TenGodInfo[] = [...godCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, weight]) => ({ name, weight: Math.round(weight * 10) / 10 }))

  // ── 神煞(以年支、日支两套查,全集) ──
  const allBranches = pillars.map((p) => p.branch)
  const shensha: ShenShaInfo[] = []
  const found = new Set<string>()
  for (const anchor of [pillars[0].branch, pillars[2].branch]) {
    const triad = triadOf(anchor)
    if (!triad) continue
    const t = SANSHA_TABLE[triad]
    if (allBranches.includes(t.驿马)) found.add('驿马')
    if (allBranches.includes(t.华盖)) found.add('华盖')
    if (allBranches.includes(t.桃花)) found.add('桃花')
  }
  if (allBranches.includes(WENCHANG_TABLE[dayStem])) found.add('文昌')
  if (TIANYI_TABLE[dayStem].some((b) => allBranches.includes(b))) found.add('天乙贵人')
  for (const name of found) shensha.push({ name })

  return { pillars, dayStem, dayElement: ELEMENT_NAMES[eD], strength, supportRatio, favorable, tenGods, shensha }
}
