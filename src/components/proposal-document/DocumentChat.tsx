import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { fetcher } from '@/lib/api'
import { Send, RefreshCw, MessageSquare, Globe } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessage {
  id: string
  role: string
  content: string
  action_type: string | null
  resulted_in_update: boolean
  created_at: string
}

interface DocumentChatProps {
  documentId: string
  pageId: string | null
  chatTab: 'global' | 'page'
  onTabChange: (tab: 'global' | 'page') => void
  onContentUpdated: () => void
}

export function DocumentChat({
  documentId,
  pageId,
  chatTab,
  onTabChange,
  onContentUpdated,
}: DocumentChatProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const chatPageId = chatTab === 'page' ? pageId : null
  const chatUrl = chatPageId
    ? `/api/sales/proposal-documents/${documentId}/chat?page_id=${chatPageId}`
    : `/api/sales/proposal-documents/${documentId}/chat`

  const { data, mutate: mutateChat } = useSWR<{ messages: ChatMessage[] }>(
    documentId ? chatUrl : null,
    fetcher,
  )

  const messages = data?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (actionType: 'question' | 'rewrite' | 'regenerate_all') => {
    if (!message.trim()) return
    setSending(true)

    try {
      const res = await fetch(`/api/sales/proposal-documents/${documentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: chatTab === 'page' ? pageId : null,
          content: message,
          action_type: chatTab === 'global' && actionType === 'rewrite' ? 'regenerate_all' : actionType,
        }),
      })

      if (!res.ok) throw new Error('チャット送信に失敗しました')

      const result = await res.json()
      setMessage('')
      mutateChat()

      if (result.resulted_in_update) {
        onContentUpdated()
        toast({ title: '更新完了', description: 'コンテンツが更新されました' })
      }
    } catch (err) {
      toast({ title: 'エラー', description: String(err), variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex items-center border-b px-3 py-1.5 gap-1">
        <button
          onClick={() => onTabChange('page')}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
            chatTab === 'page' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          このページ
        </button>
        <button
          onClick={() => onTabChange('global')}
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
            chatTab === 'global' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          全体
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">
            {chatTab === 'page'
              ? 'このページについて質問や書き直し指示ができます'
              : '提案書全体について質問や構成変更の指示ができます'}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
              {msg.resulted_in_update && (
                <Badge variant="outline" className="mt-1 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  更新済み
                </Badge>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-3 py-2 flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            chatTab === 'page'
              ? 'ページについて質問 or 書き直し指示...'
              : '提案書全体について質問 or 構成変更指示...'
          }
          className="min-h-[40px] max-h-[80px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend('question')
            }
          }}
        />
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            onClick={() => handleSend('question')}
            disabled={sending || !message.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSend('rewrite')}
            disabled={sending || !message.trim()}
            title={chatTab === 'page' ? '書き直し' : '構成変更'}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
