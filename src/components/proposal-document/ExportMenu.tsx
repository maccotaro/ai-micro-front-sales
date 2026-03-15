import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Download, FileText, Loader2 } from 'lucide-react'

interface ExportMenuProps {
  documentId: string
}

export function ExportMenu({ documentId }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'pptx' | 'pdf' | 'html') => {
    setExporting(true)
    setShowMenu(false)

    try {
      // Step 1: Trigger export (generates file on server)
      const res = await fetch(`/api/sales/proposal-documents/${documentId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'エクスポートに失敗しました')
      }

      const result = await res.json()
      const actualFormat = result.format || format

      // Step 2: Download the generated file via fetch (with auth cookies)
      const downloadRes = await fetch(`/api/sales/proposal-documents/${documentId}/export/download`)
      if (!downloadRes.ok) throw new Error('ダウンロードに失敗しました')

      const blob = await downloadRes.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposal.${actualFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const note = result.note ? ` (${result.note})` : ''
      toast({ title: '完了', description: `${actualFormat.toUpperCase()}をダウンロードしました${note}` })
    } catch (err) {
      toast({ title: 'エラー', description: String(err), variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        エクスポート
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
          <button
            onClick={() => handleExport('html')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            HTML スライド
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-400"
            title="Chromiumが必要です"
          >
            <FileText className="h-4 w-4" />
            PDF（要Chromium）
          </button>
          <button
            onClick={() => handleExport('pptx')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-400"
            title="Chromiumが必要です"
          >
            <FileText className="h-4 w-4" />
            PPTX（要Chromium）
          </button>
        </div>
      )}
    </div>
  )
}
