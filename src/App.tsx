import { useEffect, useMemo, useState } from 'react'
import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import type { Profile } from './types'
import { castChart, horoscopeMarks } from './utils/chart'
import { PALACE_NOTES } from './data/interpretations'
import BirthForm from './components/BirthForm'
import ChartGrid from './components/ChartGrid'
import HoroscopeBar from './components/HoroscopeBar'
import ProfileBar from './components/ProfileBar'

const STORAGE_KEY = 'ziwei-profiles-v1'

const pad = (n: number) => String(n).padStart(2, '0')
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Profile[]) : []
  } catch {
    return []
  }
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formOpen, setFormOpen] = useState(true)
  const [formInitial, setFormInitial] = useState<Profile | null>(null)
  const [astroError, setAstroError] = useState('')
  const [horoDate, setHoroDate] = useState(todayStr())
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [note, setNote] = useState<{ title: string; text: string } | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  }, [profiles])

  const astrolabe: IFunctionalAstrolabe | null = useMemo(() => {
    if (!profile) return null
    try {
      const result = castChart(profile)
      setAstroError('')
      return result
    } catch (err) {
      setAstroError(err instanceof Error ? err.message : '排盘失败,请检查输入')
      return null
    }
  }, [profile])

  const marks = useMemo(() => {
    if (!astrolabe || !horoDate) return null
    try {
      return horoscopeMarks(astrolabe, horoDate.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, (_, y, m, d) => `${y}-${Number(m)}-${Number(d)}`))
    } catch {
      return null
    }
  }, [astrolabe, horoDate])

  const palaceName = (index: number) => astrolabe?.palaces[index]?.name ?? `${index}`

  const openStarNote = (name: string, _note: string) => {
    // StarLine 传入的 note 即查表结果
    setNote({ title: name, text: _note })
  }
  const openPalaceNote = (name: string) => {
    const text = PALACE_NOTES[name]
    if (text) setNote({ title: `${name}宫`, text })
  }

  const handleCast = (p: Profile) => {
    setProfile(p)
    setFormOpen(false)
    setFormInitial(null)
    setHoroDate(todayStr())
    setNote(null)
  }

  const saveCurrent = () => {
    if (!profile) return
    setProfiles((prev) =>
      prev.some((x) => x.id === profile.id) ? prev : [...prev, profile],
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>紫微斗数 · 排盘</h1>
        <p>基于开源排盘引擎 iztro · 悬停宫位查看三方四正 · 点击星曜与宫名查看释义</p>
      </header>

      {astrolabe && profile ? (
        <main className="app-main">
          <HoroscopeBar
            date={horoDate}
            onDateChange={setHoroDate}
            marks={marks}
            palaceName={palaceName}
          />
          {astroError && <p className="astro-error">{astroError}</p>}
          <ChartGrid
            astrolabe={astrolabe}
            profileName={profile.name}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
            horoscope={marks}
            onSelectStar={openStarNote}
            onSelectPalace={openPalaceNote}
          />
          <div className="legend">
            <span>四化:</span>
            <em className="mut-text mut-禄">禄</em>
            <em className="mut-text mut-权">权</em>
            <em className="mut-text mut-科">科</em>
            <em className="mut-text mut-忌">忌</em>
            <span className="sep">|</span>
            <span className="c-major">主星</span>
            <span className="c-soft">吉星</span>
            <span className="c-tough">煞星</span>
            <span className="c-adj">杂曜</span>
            <span className="sep">|</span>
            <span>借星 = 空宫借对宫主星</span>
          </div>
          <ProfileBar
            profiles={profiles}
            activeId={profile.id}
            onLoad={handleCast}
            onDelete={(id) => setProfiles((prev) => prev.filter((x) => x.id !== id))}
            onNew={() => {
              setFormInitial(null)
              setFormOpen(true)
            }}
            onSaveCurrent={saveCurrent}
          />
        </main>
      ) : (
        <main className="app-main">
          {astroError && <p className="astro-error">{astroError}</p>}
        </main>
      )}

      {formOpen && (
        <div className="modal-mask">
          <div className="modal">
            <BirthForm
              initial={formInitial}
              onCast={handleCast}
              onClose={profile ? () => setFormOpen(false) : undefined}
            />
          </div>
        </div>
      )}

      {note && (
        <aside className="note-panel">
          <button className="note-close" onClick={() => setNote(null)}>
            ×
          </button>
          <h4>{note.title}</h4>
          <p>{note.text}</p>
        </aside>
      )}
    </div>
  )
}
