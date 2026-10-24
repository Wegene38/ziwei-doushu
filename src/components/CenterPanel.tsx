import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe'
import { TIME_SLOTS } from '../constants'

interface Props {
  astrolabe: IFunctionalAstrolabe
  profileName: string
}

/** 命盘中央的基本信息面板 */
export default function CenterPanel({ astrolabe, profileName }: Props) {
  const a = astrolabe
  const slot = TIME_SLOTS.find((t) => t.label === a.time)

  return (
    <div className="center-panel">
      <h3>{profileName}</h3>
      <p className="gender-line">
        {a.gender}命 · {slot ? `${a.time}(${slot.range})` : a.time}
      </p>
      <dl>
        <div>
          <dt>公历</dt>
          <dd>{a.solarDate}</dd>
        </div>
        <div>
          <dt>农历</dt>
          <dd>{a.lunarDate}</dd>
        </div>
        <div>
          <dt>干支</dt>
          <dd>{a.chineseDate}</dd>
        </div>
        <div>
          <dt>生肖</dt>
          <dd>{a.zodiac}</dd>
        </div>
        <div>
          <dt>星座</dt>
          <dd>{a.sign}</dd>
        </div>
        <div>
          <dt>五行局</dt>
          <dd>{a.fiveElementsClass}</dd>
        </div>
        <div>
          <dt>命主</dt>
          <dd>{a.soul}</dd>
        </div>
        <div>
          <dt>身主</dt>
          <dd>{a.body}</dd>
        </div>
      </dl>
      <p className="palace-summary">
        命宫在{a.earthlyBranchOfSoulPalace} · 身宫在{a.earthlyBranchOfBodyPalace}
      </p>
      <p className="credit">
        排盘内核:
        <a href="https://github.com/SylarLong/iztro" target="_blank" rel="noreferrer">
          iztro
        </a>
      </p>
    </div>
  )
}
