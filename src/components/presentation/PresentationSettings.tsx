import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { GeneratePresentationRequest } from '@/lib/presentation'
import { toneLabels, verbosityLabels } from '@/lib/presentation'

interface PresentationSettingsProps {
  settings: Omit<GeneratePresentationRequest, 'content'>
  onChange: (settings: Omit<GeneratePresentationRequest, 'content'>) => void
}

export function PresentationSettings({ settings, onChange }: PresentationSettingsProps) {
  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Slide count */}
      <div className="space-y-1.5">
        <Label htmlFor="n_slides">スライド枚数</Label>
        <Input
          id="n_slides"
          type="number"
          min={3}
          max={30}
          value={settings.n_slides || 8}
          onChange={(e) => update('n_slides', parseInt(e.target.value) || 8)}
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <Label htmlFor="language">言語</Label>
        <select
          id="language"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={settings.language || 'Japanese'}
          onChange={(e) => update('language', e.target.value)}
        >
          <option value="Japanese">日本語</option>
          <option value="English">English</option>
        </select>
      </div>

      {/* Tone */}
      <div className="space-y-1.5">
        <Label>トーン</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(toneLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                settings.tone === value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => update('tone', value as GeneratePresentationRequest['tone'])}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Verbosity */}
      <div className="space-y-1.5">
        <Label>情報量</Label>
        <div className="flex gap-2">
          {Object.entries(verbosityLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                settings.verbosity === value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => update('verbosity', value as GeneratePresentationRequest['verbosity'])}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={settings.include_title_slide ?? true}
            onChange={(e) => update('include_title_slide', e.target.checked)}
            className="rounded"
          />
          タイトルスライド
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={settings.include_table_of_contents ?? false}
            onChange={(e) => update('include_table_of_contents', e.target.checked)}
            className="rounded"
          />
          目次
        </label>
      </div>

      {/* Export format */}
      <div className="space-y-1.5">
        <Label>出力形式</Label>
        <div className="flex gap-2">
          {(['pptx', 'pdf'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                settings.export_as === fmt
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => update('export_as', fmt)}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Additional instructions */}
      <div className="space-y-1.5">
        <Label htmlFor="instructions">追加指示（任意）</Label>
        <Textarea
          id="instructions"
          placeholder="プレゼンに含めたい特別な指示を入力..."
          value={settings.instructions || ''}
          onChange={(e) => update('instructions', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}
