// Tenant types
export interface UserTenant {
  id: string
  name: string
  slug: string
  is_default: boolean
}

export interface CurrentTenant {
  tenant_id: string
  name: string
  slug: string
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  roles: string[]
  tenant_id?: string
  current_tenant_id?: string
  department?: string
  current_tenant?: CurrentTenant | null
  tenants?: UserTenant[]
}

// Attendee type for meeting minutes
export interface Attendee {
  name: string
  role?: string
  company?: string
}

// Meeting Minute types
export interface MeetingMinute {
  id: string
  company_name: string
  company_id?: string
  raw_text: string
  industry?: string
  area?: string
  meeting_date?: string
  attendees?: Attendee[]
  next_action_date?: string
  parsed_json?: AnalysisResult
  status: 'draft' | 'analyzed' | 'proposed' | 'closed'
  created_by: string
  created_at: string
  updated_at: string
}

// Extracted issue from meeting analysis
export interface ExtractedIssue {
  issue: string
  category?: string
  priority?: 'high' | 'medium' | 'low'
  details?: string
}

// Extracted need from meeting analysis
export interface ExtractedNeed {
  need: string
  urgency?: 'high' | 'medium' | 'low'
  budget_hint?: string
}

export interface AnalysisResult {
  issues: ExtractedIssue[]
  needs: ExtractedNeed[]
  keywords: string[]
  summary: string
  company_size_estimate?: string
  decision_maker_present?: boolean
  next_actions?: string[]
  follow_up_date?: string
  confidence_score?: number
}

// Legacy Issue type for backward compatibility
export interface Issue {
  category: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

// Simulation types
export interface SimulationRequest {
  area: string
  industry: string
  product_ids?: string[]
  employee_count?: number
  current_cost?: number
  target_reduction_rate?: number
}

export interface SimulationResult {
  area: string
  industry: string
  product_ids: string[]
  simulation_params?: SimulationParams
  wage_data?: WageData | null
  product_simulations: ProductSimulation[]
  total_estimated_cost: string
  total_estimated_savings?: string | null
  total_roi?: number | null
  applicable_campaigns: AppliedCampaign[]
  campaign_discount: string
  final_cost: string
  confidence_level: 'low' | 'medium' | 'high'
  assumptions: string[]
}

export interface SimulationParams {
  pv_coefficient: number
  apply_rate: number
  conversion_rate?: number | null
  seasonal_factor: number
  metadata?: Record<string, unknown>
}

export interface WageData {
  prefecture?: string
  min_wage?: number
  avg_wage?: number
}

export interface ProductSimulation {
  product_id: string
  product_name: string
  category?: string
  base_cost: number
  adjusted_cost: number
  unit_price?: number
  quantity: number
}

export interface AppliedCampaign {
  campaign_id: string
  campaign_name: string
  discount_rate: number
  discount_amount: number
}

// Quick Estimate types
export interface QuickEstimateRequest {
  area?: string
  industry?: string
  product_category?: string
  budget_range?: 'low' | 'medium' | 'high'
}

export interface QuickEstimateResponse {
  area?: string | null
  industry?: string | null
  recommended_products: RecommendedProduct[]
  min_estimate: string
  max_estimate: string
  typical_estimate: string
  area_wage_avg?: string | null
  industry_benchmark?: IndustryBenchmark | null
}

export interface RecommendedProduct {
  id: string
  name: string
  category: string
  base_price: number | null
}

export interface IndustryBenchmark {
  typical_spend_per_employee: number | null
  wage_index: number
}

// Search types
export interface SearchResult<T> {
  items: T[]
  score: number
}

export interface SuccessCase {
  id: string
  title: string
  industry: string
  area: string
  description: string
  products_used: string[]
  outcomes: string[]
}

// Graph types
export interface GraphRecommendation {
  products: ProductRecommendation[]
  similar_meetings: SimilarMeeting[]
  success_cases: SuccessCase[]
}

export interface ProductRecommendation {
  product_id: string
  product_name: string
  relevance_score: number
  matched_problems: string[]
}

export interface SimilarMeeting {
  meeting_id: string
  company_name: string
  similarity_score: number
  shared_problems: string[]
  shared_needs: string[]
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Form types
export interface MeetingMinuteFormData {
  company_name: string
  raw_text: string
  industry?: string
  area?: string
  meeting_date?: string
  attendees?: Attendee[]
  next_action_date?: string
}

export interface SimulationFormData {
  area: string
  industry: string
  product_ids?: string[]
  employee_count?: number
  current_cost?: number
  target_reduction_rate?: number
}

// Chat types
export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  token_count?: number
  metadata?: Record<string, unknown>
  created_at: string
}

export interface ChatHistoryResponse {
  conversation_id: string | null
  meeting_minute_id: string
  messages: ChatMessage[]
  total_messages: number
}

export interface ChatStreamChunk {
  type: 'start' | 'chunk' | 'done' | 'error'
  content?: string
  conversation_id?: string
  message_id?: string
  error?: string
}

// Ollama model types (shared with front-admin)
export type ModelCategory = 'embedding' | 'chat' | 'vlm' | 'reranker' | 'other';

export interface OllamaModel {
  name: string;
  size: number;
  size_display: string;
  category: ModelCategory;
  is_downloaded: boolean;
  is_active: boolean;
  modified_at?: string;
  supports_thinking?: boolean;
}

// Proposal Pipeline types
export interface PipelineStageInfo {
  stage: number
  name: string
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'error'
  content?: string
  duration_ms?: number
}

export interface PipelineRun {
  id: string
  minute_id: string
  status: string
  total_duration_ms: number | null
  created_at: string
  error_stage: number | null
  error_message: string | null
  minio_object_key: string | null
}

export interface PipelineSSEEvent {
  type: 'pipeline_start' | 'stage_start' | 'stage_info' | 'stage_chunk' | 'stage_complete' | 'stage_sections' | 'pipeline_complete' | 'result' | 'error'
  stage?: number
  name?: string
  content?: string
  duration_ms?: number
  total_duration_ms?: number
  skipped?: boolean
  error?: string
  sections?: Array<{ stage: number; title: string; content: string }>
  run_id?: string
  document_id?: string
  pipeline_name?: string
}

// Stage 2: Shochikubai (松竹梅) types
export interface ShochikubaiItem {
  media_name: string
  product_name: string
  price: number
  period: string
  campaign_discount?: number | null
  final_price: number
}

export interface ShochikubaiTier {
  items: ShochikubaiItem[]
  total_price: number
  expected_effect: string
  rationale: string
}

export interface ShochikubaiProposal {
  issue_id: string
  shochikubai: {
    matsu: ShochikubaiTier
    take: ShochikubaiTier
    ume: ShochikubaiTier
  }
  recommended: string
  recommendation_reason: string
}

export interface ReverseTimelineEntry {
  date: string
  milestone: string
  action: string
}

export interface TrendImpactData {
  relevant_trends: string[]
  impact_analysis: string
  recommendations: string[]
}

export interface Stage2Output {
  proposals: ShochikubaiProposal[]
  total_budget_range?: {
    matsu_total: number
    take_total: number
    ume_total: number
  }
  over_budget_justification?: {
    exceeded_amount: number
    roi_rationale: string
    comparison_with_budget_plan: string
  }
  reverse_timeline?: ReverseTimelineEntry[]
  seasonal_context?: string
  trend_impact?: TrendImpactData
  agenda_items?: string[]
}

// Stage 3: Coaching types
export interface DeepDiveQuestion {
  topic: string
  question: string
  follow_up: string
  purpose: string
  related_issue_id: string
}

export interface ObjectionHandling {
  objection: string
  response: string
  evidence: string
  related_issue_id: string
}

export interface TalkScriptPhase {
  phase: string
  title: string
  duration_minutes: number
  key_points: string[]
}

export interface SalesCoaching {
  deep_dive_questions: DeepDiveQuestion[]
  objection_handling: ObjectionHandling[]
  talk_script_outline: TalkScriptPhase[]
}

export interface FollowUpEmail {
  subject: string
  body: string
  attachments_needed: string[]
}

export interface CalendarEvent {
  title: string
  date_offset_days: number
  duration_minutes: number
  description: string
}

export interface FollowUpTask {
  title: string
  due_offset_days: number
  assignee: string
  priority: 'high' | 'medium' | 'low'
}

export interface FollowUpActions {
  email_draft: FollowUpEmail
  calendar_events: CalendarEvent[]
  tasks: FollowUpTask[]
}

// Stage 4: Fact check types
export interface FactCheckClaim {
  claim: string
  source: string
  status: 'verified' | 'unverified' | 'contradicted'
  note: string
}

export interface FactCheckResult {
  claims: FactCheckClaim[]
  summary: string
}

// Stage 5: Reference document types
export interface ReferenceDocument {
  name: string
  url: string
  category: string
  usage: string
}
