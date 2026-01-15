import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useChat } from '@/hooks/use-chat'
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react'
import { ChatMessage } from '@/types'

interface ChatTabProps {
  meetingMinuteId: string
  companyName: string
  isAnalyzed: boolean
}

export function ChatTab({ meetingMinuteId, companyName, isAnalyzed }: ChatTabProps) {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
    loadHistory,
  } = useChat({
    meetingMinuteId,
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: err,
      })
    },
  })

  // Load history on mount (only once)
  useEffect(() => {
    if (isAnalyzed) {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnalyzed, meetingMinuteId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  const handleClearHistory = async () => {
    if (window.confirm('チャット履歴を削除しますか？')) {
      await clearHistory()
      toast({
        title: '完了',
        description: 'チャット履歴を削除しました',
      })
    }
  }

  if (!isAnalyzed) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <Bot className="h-12 w-12 mb-4 text-gray-400" />
        <p className="text-center">
          AIチャットを利用するには、まず議事録を解析してください。
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span className="font-medium">AIアシスタント</span>
          <span className="text-sm text-gray-500">- {companyName}</span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={isLoading || isStreaming}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            履歴クリア
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <WelcomeMessage companyName={companyName} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isStreaming && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">回答を生成中...</span>
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
            placeholder="メッセージを入力... (Shift+Enterで改行)"
            disabled={isStreaming}
            className="flex-1 resize-none"
            rows={2}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </form>
    </div>
  )
}

function WelcomeMessage({ companyName }: { companyName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
      <Bot className="h-12 w-12 mb-4 text-blue-500" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        AIアシスタント
      </h3>
      <p className="mb-4 max-w-md">
        {companyName}の議事録について質問してください。
        課題、ニーズ、提案内容などについてお答えします。
      </p>
      <div className="text-sm space-y-1">
        <p className="font-medium text-gray-700">質問例:</p>
        <p>「この顧客の主な課題は何ですか？」</p>
        <p>「どの商品を提案すべきですか？」</p>
        <p>「次回のアクションを提案してください」</p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
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
        </div>
      </div>
    </div>
  )
}
