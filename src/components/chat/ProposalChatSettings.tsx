import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

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
  prefecture: string
  onSelectPrefecture: (prefecture: string) => void
  jobCategory: string
  onSelectJobCategory: (jobCategory: string) => void
  employmentType: string
  onSelectEmploymentType: (employmentType: string) => void
}

const PREFECTURES = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県',
  '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
  '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

export function ProposalChatSettings({
  knowledgeBases,
  selectedKB,
  onSelectKB,
  area,
  onSelectArea,
  loadingKBs,
  onRefreshKBs,
  prefecture,
  onSelectPrefecture,
  jobCategory,
  onSelectJobCategory,
  employmentType,
  onSelectEmploymentType,
}: ProposalChatSettingsProps) {
  const [showDetailFilters, setShowDetailFilters] = useState(false)

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

        {/* 詳細条件（折りたたみ） */}
        <div className="mt-3 border-t pt-3">
          <button
            type="button"
            onClick={() => setShowDetailFilters(!showDetailFilters)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {showDetailFilters ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            掲載実績フィルタ（詳細条件）
          </button>

          {showDetailFilters && (
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  都道府県
                </label>
                <select
                  value={prefecture}
                  onChange={(e) => onSelectPrefecture(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">指定なし</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職種大分類
                </label>
                <input
                  type="text"
                  value={jobCategory}
                  onChange={(e) => onSelectJobCategory(e.target.value)}
                  placeholder="例: 飲食、販売"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  雇用形態
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => onSelectEmploymentType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">指定なし</option>
                  <option value="アルバイト・パート">アルバイト・パート</option>
                  <option value="正社員">正社員</option>
                  <option value="契約社員">契約社員</option>
                  <option value="派遣社員">派遣社員</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
