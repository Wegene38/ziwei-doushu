/** 时辰表:index 0~12,对应 iztro 的 timeIndex */
export const TIME_SLOTS: { index: number; label: string; range: string }[] = [
  { index: 0, label: '早子时', range: '00:00~00:59' },
  { index: 1, label: '丑时', range: '01:00~02:59' },
  { index: 2, label: '寅时', range: '03:00~04:59' },
  { index: 3, label: '卯时', range: '05:00~06:59' },
  { index: 4, label: '辰时', range: '07:00~08:59' },
  { index: 5, label: '巳时', range: '09:00~10:59' },
  { index: 6, label: '午时', range: '11:00~12:59' },
  { index: 7, label: '未时', range: '13:00~14:59' },
  { index: 8, label: '申时', range: '15:00~16:59' },
  { index: 9, label: '酉时', range: '17:00~18:59' },
  { index: 10, label: '戌时', range: '19:00~20:59' },
  { index: 11, label: '亥时', range: '21:00~22:59' },
  { index: 12, label: '晚子时', range: '23:00~23:59' },
]

/** 十二地支 → 命盘 4x4 网格坐标 [row, col](中心 2x2 为基本信息区) */
export const BRANCH_GRID: Record<string, [number, number]> = {
  巳: [0, 0],
  午: [0, 1],
  未: [0, 2],
  申: [0, 3],
  辰: [1, 0],
  酉: [1, 3],
  卯: [2, 0],
  戌: [2, 3],
  寅: [3, 0],
  丑: [3, 1],
  子: [3, 2],
  亥: [3, 3],
}

/** 四化着色:禄权科忌 */
export const MUTAGEN_COLOR: Record<string, string> = {
  禄: 'var(--c-lu)',
  权: 'var(--c-quan)',
  科: 'var(--c-ke)',
  忌: 'var(--c-ji)',
}

/** 星曜类型着色 */
export const STAR_TYPE_COLOR: Record<string, string> = {
  major: 'var(--c-star-major)',
  soft: 'var(--c-star-soft)',
  tough: 'var(--c-star-tough)',
  adjective: 'var(--c-star-adj)',
  flower: 'var(--c-star-flower)',
  helper: 'var(--c-star-soft)',
  lucun: 'var(--c-star-soft)',
  tianma: 'var(--c-star-soft)',
}
