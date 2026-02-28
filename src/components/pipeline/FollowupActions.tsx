import { useState } from 'react'
import { CheckSquare, Square, Mail, Calendar, ListTodo } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FollowUpActions, FollowUpTask } from '@/types'

interface FollowupActionsProps {
  actions: FollowUpActions
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

function dueLabel(offsetDays: number): { text: string; className: string } {
  if (offsetDays <= 0) return { text: '期限切れ', className: 'text-red-600 bg-red-50' }
  if (offsetDays <= 3) return { text: `あと${offsetDays}日`, className: 'text-orange-600 bg-orange-50' }
  return { text: `${offsetDays}日後`, className: 'text-gray-600' }
}

function TaskItem({ task, checked, onToggle }: {
  task: FollowUpTask
  checked: boolean
  onToggle: () => void
}) {
  const due = dueLabel(task.due_offset_days)
  const Icon = checked ? CheckSquare : Square

  return (
    <div
      className={cn('flex items-start gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50',
        checked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
      )}
      onClick={onToggle}
    >
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', checked ? 'text-green-500' : 'text-gray-400')} />
      <div className="flex-1 min-w-0">
        <span className={cn('text-sm', checked && 'line-through text-gray-400')}>{task.title}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge className={cn('text-[10px] px-1.5 py-0', PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low)}>
            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
          </Badge>
          <span className={cn('text-[10px] px-1 rounded', due.className)}>{due.text}</span>
          <span className="text-[10px] text-gray-400">{task.assignee}</span>
        </div>
      </div>
    </div>
  )
}

export function FollowupActions({ actions }: FollowupActionsProps) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())

  if (!actions) return null

  const hasEmail = actions.email_draft?.subject
  const hasCalendar = actions.calendar_events?.length > 0
  const hasTasks = actions.tasks?.length > 0
  if (!hasEmail && !hasCalendar && !hasTasks) return null

  const toggleTask = (idx: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">フォローアップアクション</h4>

      {/* Email draft */}
      {hasEmail && (
        <div className="rounded border border-gray-200 bg-white p-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Mail className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">メール草案</span>
          </div>
          <p className="text-sm font-medium text-gray-800">{actions.email_draft.subject}</p>
          <p className="text-xs text-gray-600 mt-1 whitespace-pre-line line-clamp-4">{actions.email_draft.body}</p>
          {actions.email_draft.attachments_needed?.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">
              添付: {actions.email_draft.attachments_needed.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Calendar events */}
      {hasCalendar && (
        <div className="rounded border border-gray-200 bg-white p-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">カレンダー</span>
          </div>
          <div className="space-y-1">
            {actions.calendar_events.map((ev, i) => (
              <div key={i} className="text-xs text-gray-700">
                <span className="font-medium">{ev.title}</span>
                <span className="text-gray-400 ml-1">({ev.date_offset_days}日後 / {ev.duration_minutes}分)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks checklist */}
      {hasTasks && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ListTodo className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">タスク</span>
            <span className="text-[10px] text-gray-400">
              {checkedIds.size}/{actions.tasks.length} 完了
            </span>
          </div>
          <div className="space-y-1">
            {actions.tasks.map((task, i) => (
              <TaskItem
                key={i}
                task={task}
                checked={checkedIds.has(i)}
                onToggle={() => toggleTask(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
