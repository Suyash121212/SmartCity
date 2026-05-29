import { motion } from 'framer-motion'

export default function StatCard({ icon, label, value, sub, color = 'blue', delay = 0 }) {
  const colors = {
    blue:   'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    green:  'from-green-500/20 to-green-600/5 border-green-500/20 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
    red:    'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`text-3xl`}>{icon}</div>
      </div>
    </motion.div>
  )
}
