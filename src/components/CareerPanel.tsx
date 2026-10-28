import type { BaziCareerReading } from '../utils/baziCareerTypes'
import { ELEMENT_COLOR, stemColor } from '../utils/bazi'

interface Props {
  reading: BaziCareerReading
  onClose: () => void
}

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱']
const GOD_CLS: Record<string, string> = {
  正官: 'g-guan', 七杀: 'g-guan', 正印: 'g-yin', 偏印: 'g-yin',
  正财: 'g-cai', 偏财: 'g-cai', 食神: 'g-shi', 伤官: 'g-shi',
  比肩: 'g-bi', 劫财: 'g-bi',
}

/** 八字职业推荐抽屉面板 */
export default function CareerPanel({ reading, onClose }: Props) {
  const r = reading
  return (
    <div className="reading-mask" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="reading-panel">
        <header className="reading-header">
          <h2>八字 · 职业参考</h2>
          <button className="note-close" onClick={onClose} title="关闭">
            ×
          </button>
        </header>
        <p className="reading-disclaimer">
          依据传统命理规则(日主强弱→喜用神五行、十神多旺倾向、神煞加成)自动生成,行业五行归属流派间略有差异,仅供文化学习参考。
        </p>

        <div className="reading-body">
          {/* 四柱 */}
          <section className="r-section">
            <h3>四柱八字</h3>
            <div className="pillar-row">
              {r.pillars.map((p, i) => (
                <div key={i} className={`pillar ${i === 2 ? 'day-pillar' : ''}`}>
                  <small>{PILLAR_LABELS[i]}</small>
                  <b className="pillar-stem" style={{ color: stemColor(p.stem) }}>
                    {p.stem}
                  </b>
                  <b className="pillar-branch">{p.branch}</b>
                  {i === 2 && <em>日主</em>}
                </div>
              ))}
            </div>
          </section>

          {/* 日主强弱与喜用 */}
          <section className="r-section">
            <h3>日主与喜用神</h3>
            <p>
              日主 <b>{r.dayStem}{r.dayElement}</b>({r.strength === '偏弱' ? '身弱' : r.strength === '偏强' ? '身强' : '中和'}),喜用五行:
              {r.favorable.map((el) => (
                <span key={el} className="element-tag" style={{ color: ELEMENT_COLOR[el], borderColor: ELEMENT_COLOR[el] }}>
                  {el}
                </span>
              ))}
            </p>
            <p>{r.strengthText}</p>
          </section>

          {/* 十神风格 */}
          <section className="r-section">
            <h3>工作风格(十神多旺)</h3>
            <div className="god-chips">
              {r.tenGods.slice(0, 3).map((g) => (
                <span key={g.name} className={`god-chip ${GOD_CLS[g.name]}`}>
                  {g.name} <i>{g.weight}</i>
                </span>
              ))}
            </div>
            <p>{r.styleText}</p>
          </section>

          {/* 神煞 */}
          {r.shensha.length > 0 && (
            <section className="r-section">
              <h3>神煞加成</h3>
              <ul className="r-shensha">
                {r.shensha.map((s) => (
                  <li key={s.name}>
                    <b>{s.name}</b>
                    <span>{s.meaning}</span>
                    <p>{s.careers.join(' · ')}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 行业分组 */}
          <section className="r-section">
            <h3>喜用行业</h3>
            <ul className="r-industries">
              {r.industryGroups.map((g) => (
                <li key={g.element}>
                  <span className="element-tag" style={{ color: ELEMENT_COLOR[g.element], borderColor: ELEMENT_COLOR[g.element] }}>
                    {g.element}
                  </span>
                  <small>{g.reason}</small>
                  <div className="industry-chips">
                    {g.industries.map((ind) => (
                      <i key={ind} style={{ borderColor: ELEMENT_COLOR[g.element] }}>{ind}</i>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 综合推荐 */}
          <section className="r-section">
            <h3>综合推荐方向</h3>
            <div className="industry-chips final">
              {r.recommendCareers.map((c) => (
                <i key={c}>{c}</i>
              ))}
            </div>
            <p className="r-dim">综合喜用五行、十神风格与神煞加成归纳,供择业参考;兴趣与专业积累永远是第一位。</p>
          </section>
        </div>
      </aside>
    </div>
  )
}
