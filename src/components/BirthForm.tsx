import { useState } from 'react'
import type { Calendar, Gender, Profile } from '../types'
import { TIME_SLOTS } from '../constants'

interface Props {
  initial?: Profile | null
  onCast: (profile: Profile) => void
  onClose?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 出生信息表单:姓名、性别、公历/农历、日期、时辰 */
export default function BirthForm({ initial, onCast, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? '男')
  const [calendar, setCalendar] = useState<Calendar>(initial?.calendar ?? 'solar')
  const [solarDate, setSolarDate] = useState(
    initial?.calendar === 'solar' && initial ? initial.date.replace(/-/g, '-') : todayStr(),
  )
  const [lunarYear, setLunarYear] = useState(
    initial?.calendar === 'lunar' ? Number(initial.date.split('-')[0]) : 2000,
  )
  const [lunarMonth, setLunarMonth] = useState(
    initial?.calendar === 'lunar' ? Number(initial.date.split('-')[1]) : 1,
  )
  const [lunarDay, setLunarDay] = useState(
    initial?.calendar === 'lunar' ? Number(initial.date.split('-')[2]) : 1,
  )
  const [isLeap, setIsLeap] = useState(initial?.isLeapMonth ?? false)
  const [timeIndex, setTimeIndex] = useState(initial?.timeIndex ?? 6)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (calendar === 'solar') {
        const m = solarDate.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/)
        if (!m) throw new Error('请输入有效的公历日期')
        const [, y, mo, d] = m
        const date = `${Number(y)}-${Number(mo)}-${Number(d)}`
        const test = new Date(`${date.replace(/-/g, '/')} 00:00:00`)
        if (isNaN(test.getTime())) throw new Error('公历日期不存在')
        onCast({
          id: initial?.id ?? crypto.randomUUID(),
          name: name.trim() || '未命名',
          gender,
          calendar,
          date,
          timeIndex,
        })
      } else {
        if (lunarYear < 1900 || lunarYear > 2100) throw new Error('农历年份需在 1900~2100 之间')
        if (lunarDay > 30) throw new Error('农历日期有误')
        onCast({
          id: initial?.id ?? crypto.randomUUID(),
          name: name.trim() || '未命名',
          gender,
          calendar,
          date: `${lunarYear}-${lunarMonth}-${lunarDay}`,
          timeIndex,
          isLeapMonth: isLeap,
        })
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '输入有误')
    }
  }

  return (
    <form className="birth-form" onSubmit={submit}>
      <h2>{initial ? '修改出生信息' : '输入出生信息'}</h2>

      <label className="field">
        <span>姓名</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="选填"
          maxLength={20}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>性别</span>
          <div className="seg">
            {(['男', '女'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                className={gender === g ? 'on' : ''}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </label>
        <label className="field">
          <span>历法</span>
          <div className="seg">
            <button
              type="button"
              className={calendar === 'solar' ? 'on' : ''}
              onClick={() => setCalendar('solar')}
            >
              公历
            </button>
            <button
              type="button"
              className={calendar === 'lunar' ? 'on' : ''}
              onClick={() => setCalendar('lunar')}
            >
              农历
            </button>
          </div>
        </label>
      </div>

      {calendar === 'solar' ? (
        <label className="field">
          <span>公历生日</span>
          <input type="date" value={solarDate} onChange={(e) => setSolarDate(e.target.value)} />
        </label>
      ) : (
        <div className="field-row">
          <label className="field grow">
            <span>农历年</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={lunarYear}
              onChange={(e) => setLunarYear(Number(e.target.value))}
            />
          </label>
          <label className="field grow">
            <span>月</span>
            <select value={lunarMonth} onChange={(e) => setLunarMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </select>
          </label>
          <label className="field grow">
            <span>日</span>
            <select value={lunarDay} onChange={(e) => setLunarDay(Number(e.target.value))}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}日
                </option>
              ))}
            </select>
          </label>
          <label className="field checkbox">
            <input
              type="checkbox"
              checked={isLeap}
              onChange={(e) => setIsLeap(e.target.checked)}
            />
            <span>闰月</span>
          </label>
        </div>
      )}

      <label className="field">
        <span>出生时辰</span>
        <select value={timeIndex} onChange={(e) => setTimeIndex(Number(e.target.value))}>
          {TIME_SLOTS.map((t) => (
            <option key={t.index} value={t.index}>
              {t.label}({t.range})
            </option>
          ))}
        </select>
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary">
          排盘
        </button>
        {onClose && (
          <button type="button" onClick={onClose}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}
