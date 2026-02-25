import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, DollarSign, Package } from 'lucide-react'
import { ThinkingContent } from './ThinkingContent'

export interface ProposalMessage {
  id: string
  role: 'user' | 'assistant' | 'info'
  content: string
  thinkingContent?: string
  thinkingDuration?: number
  mediaNames?: string[]
  createdAt: Date
  pipeline?: 'v1' | 'v2'
  chatModel?: string
}

export function WelcomeMessage() {
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

export function MessageBubble({
  message,
  isThinkingPhase = false,
}: {
  message: ProposalMessage
  isThinkingPhase?: boolean
}) {
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
          {!isUser && message.thinkingContent && (
            <ThinkingContent
              content={message.thinkingContent}
              isThinking={isThinkingPhase}
              thinkingDuration={message.thinkingDuration}
            />
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-table:my-2 prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
          {message.mediaNames && message.mediaNames.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                対象媒体: {message.mediaNames.join(', ')}
              </p>
            </div>
          )}
          {!isUser && (message.pipeline || message.chatModel) && (
            <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-gray-200">
              {message.pipeline && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  message.pipeline === 'v1'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {message.pipeline}
                </span>
              )}
              {message.chatModel && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                  {message.chatModel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
