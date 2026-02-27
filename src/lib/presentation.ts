import type { ProposalJson, MeetingMinute, PipelineStageInfo } from '@/types'

// --- Presenton API Types ---

export interface PresentationTemplate {
  name: string
  display_name: string
  description: string
  preview_url?: string
}

export interface GeneratePresentationRequest {
  content: string
  template?: 'general' | 'modern' | 'standard' | 'swift'
  n_slides?: number
  language?: string
  tone?: 'default' | 'casual' | 'professional' | 'funny' | 'educational' | 'sales_pitch'
  verbosity?: 'concise' | 'standard' | 'text-heavy'
  instructions?: string
  include_title_slide?: boolean
  include_table_of_contents?: boolean
  export_as?: 'pptx' | 'pdf'
}

export interface AsyncTaskResponse {
  task_id?: string
  id?: string
  status: string
  message?: string
}

export interface TaskStatusResponse {
  task_id?: string
  id?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'error'
  progress?: number
  message?: string
  data?: {
    presentation_id?: string
    path?: string
    edit_path?: string
  } | null
  result?: {
    file_path?: string
    download_url?: string
    slides_count?: number
  }
  error?: string | { status_code?: number; detail?: string }
  created_at?: string
  updated_at?: string
}

// --- Default Settings ---

export const defaultPresentationSettings: Omit<GeneratePresentationRequest, 'content'> = {
  template: 'general',
  n_slides: 8,
  language: 'Japanese',
  tone: 'default',
  verbosity: 'standard',
  instructions: '',
  include_title_slide: true,
  include_table_of_contents: false,
  export_as: 'pptx',
}

// --- Tone / Verbosity Labels ---

export const toneLabels: Record<string, string> = {
  default: 'デフォルト',
  casual: 'カジュアル',
  professional: 'プロフェッショナル',
  funny: 'ユーモア',
  educational: '教育的',
  sales_pitch: '営業プレゼン',
}

export const verbosityLabels: Record<string, string> = {
  concise: '簡潔',
  standard: '標準',
  'text-heavy': '詳細',
}

// --- Markdown Conversion Utilities ---

export function proposalToMarkdown(proposalJson: ProposalJson): string {
  const lines: string[] = []

  lines.push(`# ${proposalJson.title || '提案書'}`)
  lines.push('')

  if (proposalJson.summary) {
    lines.push(`## サマリー`)
    lines.push('')
    lines.push(proposalJson.summary)
    lines.push('')
  }

  if (proposalJson.recommended_products && proposalJson.recommended_products.length > 0) {
    lines.push(`## 推奨製品`)
    lines.push('')
    lines.push('| 製品名 | カテゴリ | マッチ度 | 理由 |')
    lines.push('|--------|----------|----------|------|')
    for (const p of proposalJson.recommended_products) {
      const score = Math.round(p.match_score * 100)
      lines.push(`| ${p.product_name} | ${p.category || '-'} | ${score}% | ${p.reason} |`)
    }
    lines.push('')
  }

  if (proposalJson.talking_points && proposalJson.talking_points.length > 0) {
    lines.push(`## トーキングポイント`)
    lines.push('')
    for (const point of proposalJson.talking_points) {
      lines.push(`- ${point}`)
    }
    lines.push('')
  }

  if (proposalJson.objection_handlers && Object.keys(proposalJson.objection_handlers).length > 0) {
    lines.push(`## 反論対応`)
    lines.push('')
    for (const [objection, response] of Object.entries(proposalJson.objection_handlers)) {
      lines.push(`### ${objection}`)
      lines.push('')
      lines.push(response)
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function meetingToMarkdown(meeting: MeetingMinute): string {
  const lines: string[] = []

  lines.push(`# ${meeting.company_name} 議事録`)
  lines.push('')

  const meta: string[] = []
  if (meeting.meeting_date) meta.push(`**日時**: ${meeting.meeting_date}`)
  if (meeting.area) meta.push(`**地域**: ${meeting.area}`)
  if (meeting.industry) meta.push(`**業種**: ${meeting.industry}`)
  if (meta.length > 0) {
    lines.push(meta.join('  '))
    lines.push('')
  }

  if (meeting.attendees && meeting.attendees.length > 0) {
    lines.push(`## 参加者`)
    lines.push('')
    for (const a of meeting.attendees) {
      const parts = [a.name]
      if (a.role) parts.push(`(${a.role})`)
      if (a.company) parts.push(`- ${a.company}`)
      lines.push(`- ${parts.join(' ')}`)
    }
    lines.push('')
  }

  lines.push(`## 議事内容`)
  lines.push('')
  lines.push(meeting.raw_text)
  lines.push('')

  const analysis = meeting.parsed_json
  if (analysis) {
    lines.push(`## 分析結果`)
    lines.push('')

    if (analysis.summary) {
      lines.push(`### 要約`)
      lines.push('')
      lines.push(analysis.summary)
      lines.push('')
    }

    if (analysis.issues && analysis.issues.length > 0) {
      lines.push(`### 課題`)
      lines.push('')
      for (const issue of analysis.issues) {
        const priority = issue.priority ? ` [${issue.priority}]` : ''
        lines.push(`- ${issue.issue}${priority}`)
        if (issue.details) lines.push(`  - ${issue.details}`)
      }
      lines.push('')
    }

    if (analysis.needs && analysis.needs.length > 0) {
      lines.push(`### ニーズ`)
      lines.push('')
      for (const need of analysis.needs) {
        const urgency = need.urgency ? ` [${need.urgency}]` : ''
        lines.push(`- ${need.need}${urgency}`)
        if (need.budget_hint) lines.push(`  - 予算: ${need.budget_hint}`)
      }
      lines.push('')
    }

    if (analysis.next_actions && analysis.next_actions.length > 0) {
      lines.push(`### 次のアクション`)
      lines.push('')
      for (const action of analysis.next_actions) {
        lines.push(`- ${action}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

export interface PipelineSection {
  stage: number
  name: string
  content: string
}

export function pipelineToMarkdown(sections: PipelineSection[]): string {
  const lines: string[] = []

  lines.push(`# 提案パイプライン結果`)
  lines.push('')

  for (const section of sections) {
    lines.push(`## Stage ${section.stage}: ${section.name}`)
    lines.push('')
    lines.push(section.content)
    lines.push('')
  }

  return lines.join('\n')
}
