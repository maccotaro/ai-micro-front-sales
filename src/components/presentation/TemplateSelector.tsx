import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { PresentationTemplate } from '@/lib/presentation'

interface TemplateSelectorProps {
  templates: PresentationTemplate[]
  loading: boolean
  selected: string
  onSelect: (name: string) => void
  onFetchTemplates: () => void
}

const fallbackTemplates: PresentationTemplate[] = [
  { name: 'general', display_name: 'General', description: '汎用的なプレゼンテンプレート' },
  { name: 'modern', display_name: 'Modern', description: 'モダンなデザイン' },
  { name: 'standard', display_name: 'Standard', description: '標準的なビジネス向け' },
  { name: 'swift', display_name: 'Swift', description: 'シンプルで軽快なデザイン' },
]

export function TemplateSelector({
  templates,
  loading,
  selected,
  onSelect,
  onFetchTemplates,
}: TemplateSelectorProps) {
  useEffect(() => {
    if (templates.length === 0 && !loading) {
      onFetchTemplates()
    }
  }, [templates.length, loading, onFetchTemplates])

  const displayTemplates = templates.length > 0 ? templates : fallbackTemplates

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">テンプレートを読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {displayTemplates.map((template) => {
        const isSelected = selected === template.name
        return (
          <Card
            key={template.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onSelect(template.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">
                  {template.display_name || template.name}
                </span>
                {isSelected && (
                  <Badge variant="default" className="text-xs">
                    選択中
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {template.description || ''}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
