import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
}

interface ProposalChatSettingsProps {
  knowledgeBases: KnowledgeBase[]
  selectedKB: string
  onSelectKB: (kb: string) => void
  area: string
  onSelectArea: (area: string) => void
  loadingKBs: boolean
  onRefreshKBs: () => void
}

export function ProposalChatSettings({
  knowledgeBases,
  selectedKB,
  onSelectKB,
  area,
  onSelectArea,
  loadingKBs,
  onRefreshKBs,
}: ProposalChatSettingsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">設定</CardTitle>
        <CardDescription>検索対象のナレッジベースとエリアを選択</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ナレッジベース
            </label>
            <div className="flex gap-2">
              <select
                value={selectedKB}
                onChange={(e) => onSelectKB(e.target.value)}
                disabled={loadingKBs}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {knowledgeBases.map((kb) => (
                  <option key={kb.id} value={kb.id}>
                    {kb.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefreshKBs}
                disabled={loadingKBs}
              >
                <RefreshCw className={`h-4 w-4 ${loadingKBs ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              エリア（オプション）
            </label>
            <select
              value={area}
              onChange={(e) => onSelectArea(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全国</option>
              <option value="関東">関東</option>
              <option value="関西">関西</option>
              <option value="東海">東海</option>
              <option value="北海道">北海道</option>
              <option value="東北">東北</option>
              <option value="北陸">北陸</option>
              <option value="中国">中国</option>
              <option value="四国">四国</option>
              <option value="九州">九州</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
