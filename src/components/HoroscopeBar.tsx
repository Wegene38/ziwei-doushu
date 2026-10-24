import type { HoroscopeMark } from '../types'

interface Marks {
  yearly: HoroscopeMark
  monthly: HoroscopeMark
  daily: HoroscopeMark
  age: HoroscopeMark & { nominalAge: number }
  decadal: { index: number; heavenlyStem: string; earthlyBranch: string }
  solarDate: string
  lunarDate: string
}

interface Props {
  date: string
  onDateChange: (d: string) => void
  marks: Marks | null
  palaceName: (index: number) => string
}

function MutagenLine({ label, mutagen }: { label: string; mutagen: string[] }) {
  if (!mutagen || mutagen.length === 0) return null
  const tags = ['禄', '权', '科', '忌']
  return (
    <span className="mutagen-line">
      {label}:
      {mutagen.map((star, i) => (
        <em key={i} className={`mut-text mut-${tags[i]}`}>
          {star}化{tags[i]}
        </em>
      ))}
    </span>
  )
}

/** 运限(流年/流月/流日)查询条 */
export default function HoroscopeBar({ date, onDateChange, marks, palaceName }: Props) {
  return (
    <div className="horoscope-bar">
      <label className="hs-date">
        <span>运限查询</span>
        <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </label>
      {marks && (
        <div className="hs-summary">
          <span className="hs-item">
            当日公历 <b>{marks.solarDate}</b> 农历 <b>{marks.lunarDate}</b>
          </span>
          <span className="hs-item">
            虚岁 <b>{marks.age.nominalAge}</b> · 小限行<b>{palaceName(marks.age.index)}</b>
          </span>
          <span className="hs-item">
            大限 <b>{marks.decadal.heavenlyStem}{marks.decadal.earthlyBranch}</b>·
            {palaceName(marks.decadal.index)}限
          </span>
          <span className="hs-item">
            流年在 <b>{palaceName(marks.yearly.index)}</b>({marks.yearly.heavenlyStem}
            {marks.yearly.earthlyBranch}) · 流月在 <b>{palaceName(marks.monthly.index)}</b> · 流日在{' '}
            <b>{palaceName(marks.daily.index)}</b>
          </span>
          <MutagenLine label="流年四化" mutagen={marks.yearly.mutagen} />
          <MutagenLine label="流月四化" mutagen={marks.monthly.mutagen} />
          <MutagenLine label="流日四化" mutagen={marks.daily.mutagen} />
        </div>
      )}
    </div>
  )
}
