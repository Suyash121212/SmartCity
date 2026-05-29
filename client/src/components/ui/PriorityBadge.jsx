import { PRIORITY_CONFIG } from '../../lib/utils'

export default function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
      {priority === 'CRITICAL' && '🔴 '}
      {priority === 'HIGH' && '🟠 '}
      {cfg.label}
    </span>
  )
}
