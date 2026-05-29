import { STATUS_CONFIG } from '../../lib/utils'

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.REPORTED
  const sizes = { xs: 'text-xs px-2 py-0.5', sm: 'text-xs px-2.5 py-1', md: 'text-sm px-3 py-1.5' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cfg.bg} ${cfg.color} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
