import { useMemo } from 'react'
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import { BRANCH_GRID } from '../constants'
import type { HoroscopeMark } from '../types'
import { trineIndexes } from '../utils/chart'
import PalaceCell from './PalaceCell'
import CenterPanel from './CenterPanel'

interface Props {
  astrolabe: IFunctionalAstrolabe
  profileName: string
  hoveredIndex: number | null
  onHover: (index: number | null) => void
  horoscope: {
    yearly: HoroscopeMark
    monthly: HoroscopeMark
    daily: HoroscopeMark
    age: HoroscopeMark & { nominalAge: number }
  } | null
  onSelectStar: (name: string, note: string) => void
  onSelectPalace: (name: string, note: string) => void
}

/** 经典 4x4 十二宫命盘 */
export default function ChartGrid({
  astrolabe,
  profileName,
  hoveredIndex,
  onHover,
  horoscope,
  onSelectStar,
  onSelectPalace,
}: Props) {
  const trines = useMemo(
    () => (hoveredIndex == null ? new Set<number>() : new Set(trineIndexes(hoveredIndex))),
    [hoveredIndex],
  )

  return (
    <div className="chart-grid">
      {astrolabe.palaces.map((palace) => {
        const [row, col] = BRANCH_GRID[palace.earthlyBranch]
        const marks: { cls: string; label: string }[] = []
        if (horoscope) {
          if (horoscope.yearly.index === palace.index) marks.push({ cls: 'mk-yearly', label: '流年' })
          if (horoscope.monthly.index === palace.index)
            marks.push({ cls: 'mk-monthly', label: '流月' })
          if (horoscope.daily.index === palace.index) marks.push({ cls: 'mk-daily', label: '流日' })
          if (horoscope.age.index === palace.index)
            marks.push({ cls: 'mk-age', label: `${horoscope.age.nominalAge}岁` })
        }
        // 空宫借对宫主星
        const opposite = astrolabe.palaces[(palace.index + 6) % 12]
        return (
          <div
            key={palace.earthlyBranch}
            className="cell-slot"
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
          >
            <PalaceCell
              palace={palace}
              borrowedStars={opposite.majorStars}
              isTarget={hoveredIndex === palace.index}
              isTrine={trines.has(palace.index)}
              marks={marks}
              onSelectStar={onSelectStar}
              onSelectPalace={onSelectPalace}
              onHover={onHover}
            />
          </div>
        )
      })}
      <div className="cell-slot center-slot">
        <CenterPanel astrolabe={astrolabe} profileName={profileName} />
      </div>
    </div>
  )
}
