import type { Profile } from '../types'
import { TIME_SLOTS } from '../constants'

interface Props {
  profiles: Profile[]
  activeId: string | null
  onLoad: (p: Profile) => void
  onDelete: (id: string) => void
  onNew: () => void
  onSaveCurrent: () => void
}

function profileDesc(p: Profile) {
  const slot = TIME_SLOTS.find((t) => t.index === p.timeIndex)
  return `${p.calendar === 'solar' ? '公历' : '农历'} ${p.date} ${slot?.label ?? ''}`
}

/** 底部档案条:保存/加载/删除出生档案 */
export default function ProfileBar({
  profiles,
  activeId,
  onLoad,
  onDelete,
  onNew,
  onSaveCurrent,
}: Props) {
  return (
    <div className="profile-bar">
      <button className="primary" onClick={onNew}>
        新建排盘
      </button>
      <button onClick={onSaveCurrent}>保存当前档案</button>
      <div className="profile-list">
        {profiles.length === 0 && <span className="empty">暂无保存的档案</span>}
        {profiles.map((p) => (
          <span key={p.id} className={`profile-chip ${p.id === activeId ? 'active' : ''}`}>
            <button className="load" onClick={() => onLoad(p)} title={profileDesc(p)}>
              {p.name}
              <small>{profileDesc(p)}</small>
            </button>
            <button className="del" onClick={() => onDelete(p.id)} title="删除">
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
