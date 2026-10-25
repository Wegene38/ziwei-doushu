import { useState } from 'react'
import type { ChartReading } from '../utils/reading'

interface Props {
  reading: ChartReading
  onClose: () => void
}

const MUTAGEN_CLS: Record<string, string> = { 禄: 'mut-禄', 权: 'mut-权', 科: 'mut-科', 忌: 'mut-忌' }

/** 命盘解读抽屉面板 */
export default function ReadingPanel({ reading, onClose }: Props) {
  const [openPalace, setOpenPalace] = useState<string | null>('命宫')

  return (
    <div className="reading-mask" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="reading-panel">
        <header className="reading-header">
          <h2>命盘解读</h2>
          <button className="note-close" onClick={onClose} title="关闭">
            ×
          </button>
        </header>
        <p className="reading-disclaimer">
          以下内容由传统紫微斗数规则库(星曜组合、格局、四化落宫)自动生成,仅供文化学习参考。
        </p>

        <div className="reading-body">
          <section className="r-section">
            <h3>{reading.overviewTitle}</h3>
            <p>{reading.overviewText}</p>
            <p className="r-dim">{reading.constitution}</p>
          </section>

          {reading.patterns.length > 0 && (
            <section className="r-section">
              <h3>格局判定</h3>
              <ul className="r-patterns">
                {reading.patterns.map((p) => (
                  <li key={p.name}>
                    <span className={`p-tag ${p.tag === '吉' ? 'p-good' : 'p-bad'}`}>{p.tag}</span>
                    <b>{p.name}</b>
                    <p>{p.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="r-section">
            <h3>生年四化</h3>
            <ul className="r-mutagens">
              {reading.mutagens.map((m) => (
                <li key={m.mutagen}>
                  <em className={`mut-text ${MUTAGEN_CLS[m.mutagen]}`}>
                    {m.star}化{m.mutagen}
                  </em>
                  <span>入{m.palace}宫</span>
                  <p>{m.text}</p>
                </li>
              ))}
            </ul>
          </section>

          {reading.decadal && (
            <section className="r-section">
              <h3>行运 · 当前大限</h3>
              <p>
                <b>{reading.decadal.title}</b>
              </p>
              <p>{reading.decadal.text}</p>
            </section>
          )}

          <section className="r-section">
            <h3>十二宫分宫详解</h3>
            <ul className="r-palaces">
              {reading.palaces.map((p) => (
                <li key={p.name}>
                  <button
                    className={`r-palace-head ${openPalace === p.name ? 'open' : ''}`}
                    onClick={() => setOpenPalace(openPalace === p.name ? null : p.name)}
                  >
                    <b>{p.name}</b>
                    <span className="r-stars">
                      {p.starText} <small>{p.ganzhi}</small>
                    </span>
                    <i>{openPalace === p.name ? '−' : '+'}</i>
                  </button>
                  {openPalace === p.name && <p className="r-palace-body">{p.text}</p>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}
