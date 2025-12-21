import { useState, useCallback, useRef, useEffect } from 'react'
import { ChatMessage, ChatHistoryResponse, ChatStreamChunk } from '@/types'

/**
 * Handle 401 authentication errors by redirecting to login
 */
function handleAuthError(status: number): void {
  if (status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

interface UseChatOptions {
  meetingMinuteId: string
  onError?: (error: string) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
  conversationId: string | null
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => Promise<void>
  loadHistory: () => Promise<void>
}

export function useChat({ meetingMinuteId, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/sales/meeting-minutes/${meetingMinuteId}/chat/history`
      )

      if (!response.ok) {
        handleAuthError(response.status)
        throw new Error('Failed to load chat history')
      }

      const data: ChatHistoryResponse = await response.json()
      setMessages(data.messages)
      setConversationId(data.conversation_id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [meetingMinuteId, onError])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Prepare for streaming response
      setIsStreaming(true)
      setError(null)

      // Create placeholder for assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch(
          `/api/sales/meeting-minutes/${meetingMinuteId}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              conversation_id: conversationId,
            }),
            signal: abortControllerRef.current.signal,
          }
        )

        if (!response.ok) {
          handleAuthError(response.status)
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Failed to send message')
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response stream')
        }

        const decoder = new TextDecoder()
        let fullContent = ''
        let finalMessageId: string | null = null
        let newConversationId: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: ChatStreamChunk = JSON.parse(line.slice(6))

                if (data.type === 'start') {
                  newConversationId = data.conversation_id || null
                  finalMessageId = data.message_id || null
                  if (newConversationId) {
                    setConversationId(newConversationId)
                  }
                } else if (data.type === 'chunk' && data.content) {
                  fullContent += data.content
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...lastMsg,
                        content: fullContent,
                      }
                    }
                    return updated
                  })
                } else if (data.type === 'done') {
                  finalMessageId = data.message_id || finalMessageId
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Streaming error')
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        }

        // Finalize messages with real IDs
        setMessages((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          const secondLastIndex = updated.length - 2

          // Update assistant message ID
          if (updated[lastIndex]?.role === 'assistant' && finalMessageId) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              id: finalMessageId,
              conversation_id: newConversationId || conversationId || '',
            }
          }

          // Update user message conversation_id
          if (updated[secondLastIndex]?.role === 'user' && newConversationId) {
            updated[secondLastIndex] = {
              ...updated[secondLastIndex],
              conversation_id: newConversationId,
            }
          }

          return updated
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        onError?.(errorMessage)

        // Remove the failed assistant message
        setMessages((prev) => prev.filter((m) => m.role !== 'assistant' || m.content))
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [meetingMinuteId, conversationId, isStreaming, onError]
  )

  const clearHistory = useCallback(async () => {
    try {
      setIsLoading(true)

      const response = await fetch(
        `/api/sales/meeting-minutes/${meetingMinuteId}/chat`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        handleAuthError(response.status)
        throw new Error('Failed to clear chat history')
      }

      setMessages([])
      setConversationId(null)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [meetingMinuteId, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    conversationId,
    error,
    sendMessage,
    clearHistory,
    loadHistory,
  }
}
