import type { Palace } from 'iztro/lib/data/types/palace'
import type { Star } from 'iztro/lib/data/types/star'
import { STAR_TYPE_COLOR } from '../constants'
import { MAJOR_STAR_NOTES, MINOR_STAR_NOTES } from '../data/interpretations'

// 释义查表:主星与辅星两个字典
const NOTE_SOURCE: Record<string, string> = { ...MAJOR_STAR_NOTES, ...MINOR_STAR_NOTES }

interface Props {
  palace: Palace
  /** 空宫时借对宫的主星 */
  borrowedStars: Star[]
  /** 是否高亮(本宫) */
  isTarget: boolean
  /** 是否属于三方四正 */
  isTrine: boolean
  /** 运限标记 */
  marks: { cls: string; label: string }[]
  onSelectStar: (name: string, note: string) => void
  onSelectPalace: (name: string, note: string) => void
  onHover: (index: number | null) => void
}

function StarLine({
  star,
  borrowed,
  onSelectStar,
}: {
  star: Star
  borrowed?: boolean
  onSelectStar: (name: string, note: string) => void
}) {
  const note =
    NOTE_SOURCE[star.name] ?? ''
  return (
    <span
      className={`star-line ${borrowed ? 'borrowed' : ''}`}
      style={{ color: STAR_TYPE_COLOR[star.type] ?? 'inherit' }}
      title={note || star.name}
      onClick={() => note && onSelectStar(star.name, note)}
    >
      {star.name}
      {star.brightness && <em className="brightness">{star.brightness}</em>}
      {star.mutagen && <em className={`mutagen mut-${star.mutagen}`}>{star.mutagen}</em>}
    </span>
  )
}

export default function PalaceCell({
  palace,
  borrowedStars,
  isTarget,
  isTrine,
  marks,
  onSelectStar,
  onSelectPalace,
  onHover,
}: Props) {
  const hasMajor = palace.majorStars.length > 0
  const stars = [...palace.majorStars, ...palace.minorStars]

  return (
    <div
      className={`palace ${isTarget ? 'target' : ''} ${isTrine ? 'trine' : ''}`}
      onMouseEnter={() => onHover(palace.index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="palace-strip">
        <span className="decadal">
          {palace.decadal.range[0]}-{palace.decadal.range[1]}
        </span>
        <span className="marks">
          {marks.map((m) => (
            <i key={m.cls} className={m.cls}>
              {m.label}
            </i>
          ))}
        </span>
        <span className="ages">{palace.ages.slice(0, 4).join(' ')}</span>
      </div>

      <button
        className="palace-name"
        onClick={() => onSelectPalace(palace.name, palace.name)}
        title="查看宫位释义"
      >
        {palace.name}
        {palace.isBodyPalace && <em className="body-mark">身</em>}
        {palace.isOriginalPalace && <em className="origin-mark">来因</em>}
      </button>
      <div className="palace-ganzhi">
        {palace.heavenlyStem}
        {palace.earthlyBranch}
      </div>

      <div className="palace-stars">
        {stars.map((s) => (
          <StarLine key={`own-${s.name}`} star={s} onSelectStar={onSelectStar} />
        ))}
        {!hasMajor &&
          borrowedStars.map((s) => (
            <StarLine key={`borrow-${s.name}`} star={s} borrowed onSelectStar={onSelectStar} />
          ))}
        {palace.adjectiveStars.length > 0 && (
          <div className="adj-stars" title={palace.adjectiveStars.map((s) => s.name).join(' ')}>
            {palace.adjectiveStars.map((s) => s.name).join('·')}
          </div>
        )}
      </div>

      <div className="palace-spirits" title="长生十二神">
        {palace.changsheng12}
      </div>
    </div>
  )
}
