import { useState, useEffect, useRef, useCallback, FormEvent, KeyboardEvent } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ChatPipelineSelector } from '@/components/chat/ChatPipelineSelector'
import { ChatModelSelector } from '@/components/chat/ChatModelSelector'
import { ThinkingModeToggle } from '@/components/chat/ThinkingModeToggle'
import { ProposalMessage, MessageBubble, WelcomeMessage } from '@/components/chat/ProposalChatMessage'
import { ProposalChatSettings } from '@/components/chat/ProposalChatSettings'
import { OllamaModel } from '@/types'
import { Send, Bot, Loader2, Package } from 'lucide-react'

export default function ProposalChatPage() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ProposalMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [knowledgeBases, setKnowledgeBases] = useState<{ id: string; name: string }[]>([])
  const [selectedKB, setSelectedKB] = useState<string>('')
  const [area, setArea] = useState<string>('')
  const [prefecture, setPrefecture] = useState<string>('')
  const [jobCategory, setJobCategory] = useState<string>('')
  const [employmentType, setEmploymentType] = useState<string>('')
  const [loadingKBs, setLoadingKBs] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<'v1' | 'v2'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('proposal-chat-pipeline') as 'v1' | 'v2') || 'v1'
    }
    return 'v1'
  })
  const [selectedModel, setSelectedModel] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('proposal-chat-model') || undefined
    }
    return undefined
  })
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [defaultModel, setDefaultModel] = useState('gemma2:9b')
  const [thinkingMode, setThinkingMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('proposal-chat-thinking') === 'true'
    }
    return false
  })
  const [isThinkingPhase, setIsThinkingPhase] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch knowledge bases and models on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchKnowledgeBases()
      fetchModels()
    }
  }, [isAuthenticated])

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/models')
      if (response.ok) {
        const data = await response.json()
        const chatModels = (data.available_models || []).filter(
          (m: OllamaModel) => m.category === 'chat'
        )
        setAvailableModels(chatModels)
        if (data.settings?.chat_model) {
          setDefaultModel(data.settings.chat_model)
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }, [])

  const handlePipelineChange = useCallback((pipeline: 'v1' | 'v2') => {
    setSelectedPipeline(pipeline)
    localStorage.setItem('proposal-chat-pipeline', pipeline)
  }, [])

  const handleModelChange = useCallback((model?: string) => {
    setSelectedModel(model)
    if (model) {
      localStorage.setItem('proposal-chat-model', model)
    } else {
      localStorage.removeItem('proposal-chat-model')
    }
    // Auto-disable thinking mode if new model doesn't support it
    const newModel = model
      ? availableModels.find((m) => m.name === model)
      : availableModels.find((m) => m.name === defaultModel)
    if (newModel && !newModel.supports_thinking) {
      setThinkingMode(false)
      localStorage.setItem('proposal-chat-thinking', 'false')
    }
  }, [availableModels, defaultModel])

  const currentModelSupportsThinking = useCallback((): boolean => {
    const modelName = selectedModel || defaultModel
    const model = availableModels.find((m) => m.name === modelName)
    return model?.supports_thinking ?? false
  }, [selectedModel, defaultModel, availableModels])

  const handleThinkingToggle = useCallback((enabled: boolean) => {
    setThinkingMode(enabled)
    localStorage.setItem('proposal-chat-thinking', String(enabled))
  }, [])

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
    const isThinkingEnabled = thinkingMode && currentModelSupportsThinking()
    if (isThinkingEnabled) {
      setIsThinkingPhase(true)
    }

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
          pipeline: selectedPipeline,
          model: selectedModel || undefined,
          think: isThinkingEnabled,
          prefecture: prefecture || undefined,
          job_category: jobCategory || undefined,
          employment_type: employmentType || undefined,
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
      let thinkingContent = ''
      const assistantMsgId = `assistant-${Date.now()}`
      let mediaNames: string[] = []
      const thinkingStartTime = isThinkingEnabled ? Date.now() : 0
      let thinkingDuration: number | undefined
      let inThinkingPhase = isThinkingEnabled

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          pipeline: selectedPipeline,
          chatModel: selectedModel || defaultModel,
        },
      ])

      let sseBuffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        sseBuffer += chunk
        const lines = sseBuffer.split('\n')
        // 最後の要素が不完全な行の可能性があるのでバッファに残す
        sseBuffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'thinking' && data.content && isThinkingEnabled) {
                // 思考トークン（SSE type: "thinking"）
                thinkingContent += data.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          thinkingContent: thinkingContent || undefined,
                          thinkingDuration,
                        }
                      : m
                  )
                )
              } else if ((data.type === 'chunk' || data.type === 'content') && data.content) {
                // 通常コンテンツトークン
                if (isThinkingEnabled && inThinkingPhase) {
                  // 思考フェーズ終了: コンテンツが到着
                  thinkingDuration = (Date.now() - thinkingStartTime) / 1000
                  inThinkingPhase = false
                  setIsThinkingPhase(false)
                }
                assistantContent += data.content
                // マークダウン補正
                assistantContent = assistantContent
                  // 見出し(##, ###)の前に空行がない場合を補正
                  .replace(/([^\n])(#{2,} )/g, '$1\n\n$2')
                  .replace(/([^\n])\n(#{2,} )/g, '$1\n\n$2')
                  // テーブル行の改行補正: "| |" (行末|と次行先頭|の間) に改行挿入
                  .replace(/\| \|/g, '|\n|')
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: assistantContent,
                          thinkingContent: thinkingContent || undefined,
                          thinkingDuration,
                        }
                      : m
                  )
                )
              } else if (data.type === 'media_start' && data.media_name) {
                // 媒体別提案の開始: 見出しを挿入
                assistantContent += `\n\n---\n\n## 【${data.media_name}】\n\n`
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: assistantContent,
                          thinkingContent: thinkingContent || undefined,
                          thinkingDuration,
                        }
                      : m
                  )
                )
              } else if (data.type === 'info' && data.message) {
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
                // 思考開始済みで未計測の場合のフォールバック
                if (isThinkingEnabled && thinkingDuration == null && thinkingContent) {
                  thinkingDuration = (Date.now() - thinkingStartTime) / 1000
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: assistantContent,
                          mediaNames: data.media_names || m.mediaNames,
                          thinkingDuration,
                        }
                      : m
                  )
                )
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
      setIsThinkingPhase(false)
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
      <div className="flex flex-col h-[calc(100vh-3rem)] gap-4">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            商材提案チャット
          </h1>
          <p className="text-gray-500 mt-1">
            顧客の要件を入力すると、最適な商材と料金プランを提案します
          </p>
        </div>

        <div className="shrink-0">
          <ProposalChatSettings
            knowledgeBases={knowledgeBases}
            selectedKB={selectedKB}
            onSelectKB={setSelectedKB}
            area={area}
            onSelectArea={setArea}
            loadingKBs={loadingKBs}
            onRefreshKBs={fetchKnowledgeBases}
            prefecture={prefecture}
            onSelectPrefecture={setPrefecture}
            jobCategory={jobCategory}
            onSelectJobCategory={setJobCategory}
            employmentType={employmentType}
            onSelectEmploymentType={setEmploymentType}
          />
        </div>

        {/* Chat Interface */}
        <Card className="flex flex-col flex-1 min-h-0">
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
              messages.map((message, idx) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isThinkingPhase={isStreaming && isThinkingPhase && idx === messages.length - 1}
                />
              ))
            )}
            {isStreaming && messages[messages.length - 1]?.content === '' && !isThinkingPhase && (
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
            <div className="flex items-center gap-3 mt-2">
              <ChatPipelineSelector
                selectedPipeline={selectedPipeline}
                onPipelineChange={handlePipelineChange}
                disabled={isStreaming}
              />
              <ChatModelSelector
                selectedModel={selectedModel}
                defaultModel={defaultModel}
                availableModels={availableModels}
                onModelChange={handleModelChange}
                disabled={isStreaming}
              />
              <ThinkingModeToggle
                enabled={thinkingMode}
                onToggle={handleThinkingToggle}
                supportsThinking={currentModelSupportsThinking()}
                disabled={isStreaming}
              />
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}

