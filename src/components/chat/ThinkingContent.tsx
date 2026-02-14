import React, { useState, useEffect, useRef } from 'react';
import { Brain, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface ThinkingContentProps {
  content: string;
  isThinking: boolean;
  thinkingDuration?: number;
}

export function ThinkingContent({
  content,
  isThinking,
  thinkingDuration,
}: ThinkingContentProps) {
  const [isExpanded, setIsExpanded] = useState(isThinking);
  const prevIsThinkingRef = useRef(isThinking);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-expand when thinking starts, auto-collapse when thinking ends
  useEffect(() => {
    if (isThinking && !prevIsThinkingRef.current) {
      setIsExpanded(true);
    } else if (!isThinking && prevIsThinkingRef.current) {
      setIsExpanded(false);
    }
    prevIsThinkingRef.current = isThinking;
  }, [isThinking]);

  // Auto-scroll thinking content during streaming
  useEffect(() => {
    if (isThinking && isExpanded && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isThinking, isExpanded]);

  if (!content && !isThinking) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 1) return '1秒未満';
    return `${seconds.toFixed(1)}秒`;
  };

  return (
    <div className="mb-2 rounded-md border border-purple-200 bg-purple-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-100/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <Brain className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="font-medium">思考過程</span>
        {isThinking && (
          <span className="flex items-center gap-1 text-purple-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="animate-pulse">思考中...</span>
          </span>
        )}
        {!isThinking && thinkingDuration != null && (
          <span className="text-purple-400 ml-auto">
            {formatDuration(thinkingDuration)}
          </span>
        )}
      </button>
      {isExpanded && (
        <div ref={contentRef} className="px-3 pb-2 max-h-60 overflow-y-auto">
          <p className="text-xs text-gray-500 italic whitespace-pre-wrap break-words leading-relaxed">
            {content}
            {isThinking && (
              <span className="inline-block w-1.5 h-3 bg-purple-400 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </p>
        </div>
      )}
    </div>
  );
}
