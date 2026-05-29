export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-gray-700 border-t-blue-500`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}
