import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Send, Bot, User, Loader2, Package, DollarSign, RefreshCw } from 'lucide-react'

interface ProposalMessage {
  id: string
  role: 'user' | 'assistant' | 'info'
  content: string
  mediaNames?: string[]
  createdAt: Date
}

interface KnowledgeBase {
  id: string
  name: string
  description?: string
}

export default function ProposalChatPage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ProposalMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedKB, setSelectedKB] = useState<string>('')
  const [area, setArea] = useState<string>('')
  const [loadingKBs, setLoadingKBs] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch knowledge bases on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchKnowledgeBases()
    }
  }, [isAuthenticated])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchKnowledgeBases = async () => {
    setLoadingKBs(true)
    try {
      const response = await fetch('/api/admin/knowledge-bases?limit=100')
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBases(data.knowledge_bases || [])
        // Auto-select first KB if available
        if (data.knowledge_bases?.length > 0 && !selectedKB) {
          setSelectedKB(data.knowledge_bases[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error)
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'ナレッジベースの取得に失敗しました',
      })
    } finally {
      setLoadingKBs(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    if (!selectedKB) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'ナレッジベースを選択してください',
      })
      return
    }

    const userMessage = input.trim()
    setInput('')

    // Add user message
    const userMsgId = `user-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: userMessage,
        createdAt: new Date(),
      },
    ])

    setIsStreaming(true)

    try {
      const response = await fetch('/api/sales/proposal-chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          knowledge_base_id: selectedKB,
          area: area || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMsgId = `assistant-${Date.now()}`
      let mediaNames: string[] = []

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          createdAt: new Date(),
        },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'chunk' && data.content) {
                assistantContent += data.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                )
              } else if (data.type === 'info' && data.message) {
                // Add info message with unique ID
                const uniqueId = `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                const infoMsg: ProposalMessage = {
                    id: uniqueId,
                    role: 'info',
                    content: data.message,
                    mediaNames: data.media_names,
                    createdAt: new Date(),
                  }
                setMessages((prev) => [
                  ...prev.filter((m) => m.id !== assistantMsgId),
                  infoMsg,
                  prev.find((m) => m.id === assistantMsgId)!,
                ].filter(Boolean) as ProposalMessage[])

                if (data.media_names) {
                  mediaNames = data.media_names
                }
              } else if (data.type === 'done') {
                if (data.media_names) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, mediaNames: data.media_names }
                        : m
                    )
                  )
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error')
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Proposal chat error:', error)
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '提案生成中にエラーが発生しました',
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            商材提案チャット
          </h1>
          <p className="text-gray-500 mt-1">
            顧客の要件を入力すると、最適な商材と料金プランを提案します
          </p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
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
                    onChange={(e) => setSelectedKB(e.target.value)}
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
                    onClick={fetchKnowledgeBases}
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
                  onChange={(e) => setArea(e.target.value)}
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

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="font-medium">商材提案アシスタント</span>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                disabled={isStreaming}
              >
                履歴クリア
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">提案を生成中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="顧客の要件や議事録を入力... (Shift+Enterで改行)"
                disabled={isStreaming || !selectedKB}
                className="flex-1 resize-none"
                rows={3}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isStreaming || !selectedKB}
                className="px-4 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <Package className="h-12 w-12 mb-4 text-blue-500" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        商材提案アシスタント
      </h3>
      <p className="mb-4 max-w-md">
        顧客の要件や議事録を入力してください。
        最適な商材と料金プランを提案します。
      </p>
      <div className="text-sm space-y-2 text-left bg-gray-50 p-4 rounded-lg">
        <p className="font-medium text-gray-700">入力例:</p>
        <p className="text-gray-600">
          「飲食店で人材採用に困っている。予算は月50万円程度。関東エリアで展開している」
        </p>
        <p className="text-gray-600">
          「IT企業でエンジニア採用を強化したい。採用コストを抑えつつ質の高いミドルシニアの採用を行いたい」
        </p>
        <p className="text-gray-600">
          「スーパーのレジ打ちのアルバイトを募集しているが、最近は応募者が少ない」
        </p>
        <p className="text-gray-600">
          「飲食店でスキマ時間で働ける方を探している。」
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ProposalMessage }) {
  if (message.role === 'info') {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {message.content}
          {message.mediaNames && message.mediaNames.length > 0 && (
            <span className="font-medium">
              ({message.mediaNames.join(', ')})
            </span>
          )}
        </div>
      </div>
    )
  }

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-start space-x-2 max-w-[85%] ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600" />
          )}
        </div>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          {message.mediaNames && message.mediaNames.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                対象媒体: {message.mediaNames.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
