import {
  MeetingMinute,
  Proposal,
  SimulationResult,
  QuickEstimateResponse,
  GraphRecommendation,
  Attendee
} from '@/types'

const API_BASE = '/api/sales'

/**
 * Handle 401 authentication errors by redirecting to login
 */
function handleAuthError(response: Response): void {
  if (response.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Generic fetcher for SWR - handles 401 errors globally
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    handleAuthError(res)
    throw new Error('Failed to fetch')
  }

  return res.json()
}

/**
 * Fetch wrapper that handles 401 errors and redirects to login
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options)

  if (response.status === 401) {
    handleAuthError(response)
    throw new Error('認証エラー: ログインしてください')
  }

  return response
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    // Handle authentication errors - redirect to login
    handleAuthError(response)

    if (response.status === 401) {
      throw new Error('認証エラー: ログインしてください')
    }

    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Meeting Minutes API
export const meetingMinutesApi = {
  list: (params?: { page?: number; page_size?: number; status?: string }) =>
    fetchApi<MeetingMinute[]>('/meeting-minutes', { params }),

  get: (id: string) =>
    fetchApi<MeetingMinute>(`/meeting-minutes/${id}`),

  create: (data: {
    company_name: string
    raw_text: string
    company_id?: string
    industry?: string
    area?: string
    meeting_date?: string
    attendees?: Attendee[]
    next_action_date?: string
  }) =>
    fetchApi<MeetingMinute>('/meeting-minutes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    company_name: string
    raw_text: string
    company_id?: string
    industry?: string
    area?: string
    meeting_date?: string
    attendees?: Attendee[]
    next_action_date?: string
    status?: string
  }>) =>
    fetchApi<MeetingMinute>(`/meeting-minutes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/meeting-minutes/${id}`, {
      method: 'DELETE',
    }),

  analyze: (id: string) =>
    fetchApi<MeetingMinute>(`/meeting-minutes/${id}/analyze`, {
      method: 'POST',
    }),

  getAnalysis: (id: string) =>
    fetchApi<MeetingMinute>(`/meeting-minutes/${id}/analysis`),
}

// Proposals API
export const proposalsApi = {
  list: (params?: { page?: number; page_size?: number }) =>
    fetchApi<Proposal[]>('/proposals', { params }),

  get: (id: string) =>
    fetchApi<Proposal>(`/proposals/${id}`),

  generate: (minuteId: string) =>
    fetchApi<Proposal>(`/proposals/generate/${minuteId}`, {
      method: 'POST',
    }),

  updateFeedback: (id: string, data: { feedback: string; feedback_comment?: string }) =>
    fetchApi<Proposal>(`/proposals/${id}/feedback`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/proposals/${id}`, {
      method: 'DELETE',
    }),
}

// Simulation API
export const simulationApi = {
  simulate: (data: {
    area: string
    industry: string
    product_ids?: string[]
    employee_count?: number
    current_cost?: number
    target_reduction_rate?: number
    custom_params?: Record<string, unknown>
  }) =>
    fetchApi<SimulationResult>('/simulation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  quickEstimate: (data: {
    area: string
    industry: string
  }) =>
    fetchApi<QuickEstimateResponse>('/simulation/quick-estimate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Search result type
interface SearchResultItem {
  id: string
  title?: string
  name?: string
  description?: string
  content?: string
  score: number
  industry?: string
  area?: string
  category?: string
}

interface SearchResponse {
  items?: SearchResultItem[]
}

// Search API
export const searchApi = {
  health: () =>
    fetchApi<{ status: string }>('/search/health'),

  meetings: (data: { query: string; limit?: number; threshold?: number }) =>
    fetchApi<SearchResultItem[] | SearchResponse>('/search/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  successCases: (data: {
    query: string
    industry?: string
    area?: string
    limit?: number
    threshold?: number
  }) =>
    fetchApi<SearchResultItem[] | SearchResponse>('/search/success-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  salesTalks: (data: {
    query: string
    issue_type?: string
    industry?: string
    limit?: number
    threshold?: number
  }) =>
    fetchApi<SearchResultItem[] | SearchResponse>('/search/sales-talks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  products: (data: { query: string; category?: string; limit?: number; threshold?: number }) =>
    fetchApi<SearchResultItem[] | SearchResponse>('/search/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Graph API
export const graphApi = {
  health: () =>
    fetchApi<{ status: string }>('/graph/health'),

  recommendations: (minuteId: string) =>
    fetchApi<GraphRecommendation>(`/graph/recommendations/${minuteId}`),

  stats: () =>
    fetchApi<{
      stats: {
        Feature?: number
        Target?: number
        Product?: number
        Chunk?: number
        Problem?: number
        Industry?: number
        Situation?: number
        [key: string]: number | undefined
      }
    }>('/graph/stats'),

  deleteMeeting: (minuteId: string) =>
    fetchApi<{ message: string }>(`/graph/meetings/${minuteId}`, {
      method: 'DELETE',
    }),
}

export default {
  meetingMinutes: meetingMinutesApi,
  proposals: proposalsApi,
  simulation: simulationApi,
  search: searchApi,
  graph: graphApi,
}
