import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { Palace } from 'iztro/lib/data/types/palace'
import { COMBO_READING, MUTAGEN_PALACE, BRIGHTNESS_NOTE } from '../data/chartReading'
import { MAJOR_STAR_NOTES, PALACE_NOTES } from '../data/interpretations'

export interface PalaceReading {
  name: string
  ganzhi: string
  starText: string
  borrowed: boolean
  text: string
}
export interface PatternItem {
  name: string
  desc: string
  tag: '吉' | '凶'
}
export interface MutagenItem {
  star: string
  mutagen: string
  palace: string
  text: string
}
export interface ChartReading {
  overviewTitle: string
  overviewText: string
  constitution: string
  patterns: PatternItem[]
  mutagens: MutagenItem[]
  palaces: PalaceReading[]
  decadal: { title: string; text: string } | null
}

const TOUGH = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫']
const SOFT = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存', '天马']

function allStarNames(p: Palace): string[] {
  return [...p.majorStars, ...p.minorStars, ...p.adjectiveStars].map((s) => s.name)
}

function trinePalaces(palaces: Palace[], index: number): Palace[] {
  return [index, (index + 4) % 12, (index + 6) % 12, (index + 8) % 12].map((i) => palaces[i])
}

/** 宫位主星组合键;空宫返回对宫组合并标记 borrowed */
function comboOf(palaces: Palace[], p: Palace): { key: string; borrowed: boolean } {
  if (p.majorStars.length > 0) {
    return { key: p.majorStars.map((s) => s.name).join(''), borrowed: false }
  }
  const opp = palaces[(p.index + 6) % 12]
  return { key: opp.majorStars.map((s) => s.name).join(''), borrowed: true }
}

function comboText(key: string): { essence: string; traits: string; advice: string } {
  return (
    COMBO_READING[key] ?? {
      essence: key + '守御',
      traits: key.split('').map((n) => MAJOR_STAR_NOTES[n] ?? '').join(''),
      advice: '',
    }
  )
}

function brightnessOf(p: Palace): string {
  for (const s of [...p.majorStars, ...p.minorStars]) {
    if (s.brightness) return s.brightness
  }
  return ''
}

/** 生成完整解读 */
export function readChart(astrolabe: IFunctionalAstrolabe): ChartReading {
  const palaces = astrolabe.palaces
  const soul = palaces.find((p) => p.name === '命宫')!
  const trine = trinePalaces(palaces, soul.index)
  const trineStarSet = new Set(trine.flatMap(allStarNames))
  const { key: soulKey, borrowed } = comboOf(palaces, soul)
  const combo = comboText(soulKey)

  // ── 命格总论 ──
  const overviewTitle = `${astrolabe.fiveElementsClass} · ${soulKey}${borrowed ? '(空宫借对宫)' : ''} 守命`
  const overviewText =
    `${combo.traits} ${combo.advice} ` +
    `命主${astrolabe.soul}、身主${astrolabe.body};身宫落${astrolabe.earthlyBranchOfBodyPalace}宫,` +
    `${astrolabe.earthlyBranchOfBodyPalace === astrolabe.earthlyBranchOfSoulPalace ? '与命宫同宫,先天后天合一,主观意识强。' : '后天趋向另有侧重,人生层次更丰富。'}`

  // ── 三方四正构成 ──
  const softMet = SOFT.filter((s) => trineStarSet.has(s))
  const toughMet = TOUGH.filter((s) => trineStarSet.has(s))
  const parts: string[] = [`命宫三方四正会${trine.length}宫。`]
  parts.push(
    softMet.length
      ? `会吉星【${softMet.join('、')}】,主贵人助力、逢凶有解,行事多一分顺遂。`
      : '吉星会照较少,凡事多靠自身努力,白手起家之象。',
  )
  parts.push(
    toughMet.length
      ? `见煞星【${toughMet.join('、')}】,波折与磨砺难免,亦是激发潜能的催化剂,早岁辛苦晚岁甘。`
      : '不见煞曜会照,格局平顺,惟防安逸少冲劲。',
  )
  const constitution = parts.join('')

  // ── 格局判定 ──
  const patterns: PatternItem[] = []
  const majorNamesIn = (list: Palace[]) => list.flatMap((p) => p.majorStars.map((s) => s.name))
  const trineMajors = majorNamesIn(trine)
  const has = (n: string, arr: string[] = trineMajors) => arr.includes(n)

  if (has('七杀') && has('破军') && has('贪狼')) {
    patterns.push({
      name: '杀破狼格',
      tag: '吉',
      desc: '命宫三方四正会齐七杀、破军、贪狼,主一生多变动、敢冲敢拼,宜开创性行业,人生大开大合。',
    })
  }
  const jiYueTongLiang = ['天机', '天同', '天梁', '太阴'].filter((n) => has(n))
  if (jiYueTongLiang.length >= 3) {
    patterns.push({
      name: '机月同梁格',
      tag: '吉',
      desc: `三方会${jiYueTongLiang.join('、')},主性情稳、谋略足,宜公门、大机构、文职企划,"机月同梁作吏生"。`,
    })
  }
  if (has('紫微') && has('天府')) {
    if (soul.majorStars.map((s) => s.name).join('') === '紫微天府') {
      patterns.push({
        name: '紫府同宫格',
        tag: '吉',
        desc: '紫微天府同坐命宫,尊贵与财库并得, leadership 与理财兼备,古称"同宫终身福厚"。',
      })
    } else {
      patterns.push({
        name: '紫府朝垣格',
        tag: '吉',
        desc: '紫微、天府朝拱命宫,一生多助力提携,衣食无忧,近贵之命。',
      })
    }
  }
  const brightnessMap = new Map<string, string>()
  for (const p of trine) {
    for (const s of p.majorStars) if (s.brightness) brightnessMap.set(s.name, s.brightness)
  }
  const sunB = brightnessMap.get('太阳')
  const moonB = brightnessMap.get('太阴')
  if (sunB && moonB && ['庙', '旺'].includes(sunB) && ['庙', '旺'].includes(moonB)) {
    patterns.push({
      name: '日月并明格',
      tag: '吉',
      desc: '太阳太阴皆处庙旺会照命宫,如日月同辉,主名声显达、富贵可期。',
    })
  }
  if (sunB && moonB && ['陷', '不'].includes(sunB) && ['陷', '不'].includes(moonB)) {
    patterns.push({
      name: '日月反背',
      tag: '凶',
      desc: '太阳太阴俱失辉会命,主早年辛劳、先难后成,离乡奋斗反佳。',
    })
  }
  const soulStars = allStarNames(soul)
  if (soulStars.includes('贪狼') && (soulStars.includes('火星') || soulStars.includes('铃星'))) {
    const which = soulStars.includes('火星') ? '火' : '铃'
    patterns.push({
      name: `${which}贪格`,
      tag: '吉',
      desc: `${which}星与贪狼同宫,古诀"火贪/铃贪主横发",主突发之财与意外机遇,惟暴发暴败须守得住。`,
    })
  }
  if (trineStarSet.has('禄存') && trineStarSet.has('天马')) {
    patterns.push({
      name: '禄马交驰格',
      tag: '吉',
      desc: '禄存与天马交会命垣,主奔波中进财、越动越旺,宜外地发展、跨国流通之业。',
    })
  }
  const wenStars = ['文昌', '文曲', '天魁', '天钺'].filter((s) => trineStarSet.has(s))
  if (wenStars.length >= 3) {
    patterns.push({
      name: '文星拱命格',
      tag: '吉',
      desc: `昌曲魁钺会命(【${wenStars.join('、')}】),主聪明学业佳、考试功名有路,宜文教学术之途。`,
    })
  }
  const prev = palaces[(soul.index + 11) % 12]
  const next = palaces[(soul.index + 1) % 12]
  const flankNames = [...allStarNames(prev), ...allStarNames(next)]
  if (flankNames.includes('地空') && flankNames.includes('地劫')) {
    patterns.push({
      name: '空劫夹命格',
      tag: '凶',
      desc: '命宫被地空地劫相夹,想法超前的另一面是钱财聚散无常,宜技术思想立身,忌投机。',
    })
  }
  const soulHasMutagenJi = [...soul.majorStars, ...soul.minorStars].some((s) => s.mutagen === '忌')
  if (soulHasMutagenJi && flankNames.includes('擎羊') && flankNames.includes('陀罗')) {
    patterns.push({
      name: '羊陀夹忌格',
      tag: '凶',
      desc: '化忌坐命复被擎羊陀罗相夹,主压力缠身、进退受制,宜稳扎稳打、修身养性以化解。',
    })
  }
  if (soul.majorStars.some((s) => s.name === '天相')) {
    const flankJi = [prev, next].some((p) =>
      [...p.majorStars, ...p.minorStars].some((s) => s.mutagen === '忌'),
    )
    const flankXing = flankNames.includes('天刑')
    if (flankJi && flankXing) {
      patterns.push({
        name: '刑忌夹印格',
        tag: '凶',
        desc: '天相守命被化忌与天刑相夹,主文书契约之扰与是非牵绊,凡事先小人后君子。',
      })
    }
  }

  // ── 生年四化落宫 ──
  const mutagens: MutagenItem[] = []
  for (const p of palaces) {
    for (const s of [...p.majorStars, ...p.minorStars]) {
      if (s.mutagen && MUTAGEN_PALACE[s.mutagen]?.[p.name]) {
        mutagens.push({
          star: s.name,
          mutagen: s.mutagen,
          palace: p.name,
          text: MUTAGEN_PALACE[s.mutagen][p.name],
        })
      }
    }
  }
  const order = { 禄: 0, 权: 1, 科: 2, 忌: 3 }
  mutagens.sort((a, b) => order[a.mutagen as keyof typeof order] - order[b.mutagen as keyof typeof order])

  // ── 十二宫分宫解读 ──
  const palacesReading: PalaceReading[] = palaces.map((p) => {
    const { key, borrowed: isBorrowed } = comboOf(palaces, p)
    const c = comboText(key)
    const brightness = brightnessOf(p)
    const domain = PALACE_NOTES[p.name] ?? ''
    const sentences: string[] = []
    sentences.push(
      isBorrowed
        ? `本宫无主星,借对宫【${key}】之力——${c.essence}。`
        : p.name === '命宫'
          ? `${key}坐命,${c.essence}。`
          : `${key}入${p.name}宫,${c.essence}。`,
    )
    sentences.push(`此宫主掌:${domain}`)
    if (brightness) sentences.push(BRIGHTNESS_NOTE[brightness] ?? '')
    const softHere = SOFT.filter((s) => allStarNames(p).includes(s))
    const toughHere = TOUGH.filter((s) => allStarNames(p).includes(s))
    if (softHere.length) sentences.push(`会吉星【${softHere.join('、')}】,添贵人助力。`)
    if (toughHere.length) sentences.push(`见煞星【${toughHere.join('、')}】,波折中见真章。`)
    const mut = [...p.majorStars, ...p.minorStars].find((s) => s.mutagen)
    if (mut) sentences.push(`生年${mut.mutagen}入此宫,${MUTAGEN_PALACE[mut.mutagen!]?.[p.name] ?? ''}`)
    return {
      name: p.name,
      ganzhi: `${p.heavenlyStem}${p.earthlyBranch}`,
      starText:
        (p.majorStars.length > 0 ? p.majorStars : isBorrowed ? palaces[(p.index + 6) % 12].majorStars : [])
          .map((s) => s.name + (s.brightness ?? '') + (s.mutagen ? '化' + s.mutagen : ''))
          .join(' ') || '空宫',
      borrowed: isBorrowed,
      text: sentences.join(''),
    }
  })
  // 命宫放最前
  palacesReading.sort((a, b) => (a.name === '命宫' ? -1 : b.name === '命宫' ? 1 : 0))

  // ── 当前大限 ──
  let decadal: ChartReading['decadal'] = null
  try {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const h = astrolabe.horoscope(dateStr)
    const dp = palaces[h.decadal.index]
    const { key: dKey } = comboOf(palaces, dp)
    const dc = comboText(dKey)
    decadal = {
      title: `现行大限:${dp.decadal.range[0]}~${dp.decadal.range[1]} 岁 · 走${dp.name}宫(${dp.heavenlyStem}${dp.earthlyBranch})`,
      text: `大限命宫${dKey}——${dc.essence}。${dc.traits} ${dc.advice}`,
    }
  } catch {
    decadal = null
  }

  return {
    overviewTitle,
    overviewText,
    constitution,
    patterns,
    mutagens,
    palaces: palacesReading,
    decadal,
  }
}
