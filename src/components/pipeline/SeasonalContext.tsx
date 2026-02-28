import { CalendarDays } from 'lucide-react'

interface SeasonalContextProps {
  context: string
}

export function SeasonalContext({ context }: SeasonalContextProps) {
  if (!context) return null

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">季節コンテキスト</span>
      </div>
      <p className="text-sm text-blue-800 whitespace-pre-line">{context}</p>
    </div>
  )
}
