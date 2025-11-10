import axios, { AxiosError } from 'axios'
import {
  Notification,
  Webhook,
  WebhookDelivery,
  FlaggedPost,
  AdminStats,
} from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

// Axios instance with sane defaults
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

async function refreshSession(): Promise<boolean> {
  try {
    const res = await api.post('/auth/refresh')
    return res.status === 200
  } catch {
    return false
  }
}

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    const status = error.response?.status ?? 0

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/logout')

    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      const ok = await refreshSession()
      if (ok) {
        return api(originalRequest)
      }
    }

    const message =
      (error.response?.data as any)?.message ??
      error.message ??
      'Request failed'

    const apiError: ApiError = {
      status,
      message,
      details: error.response?.data,
    }

    return Promise.reject(apiError)
  }
)

// Generic API caller preserving your previous signature
export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { method = 'GET', body, headers = {} } = options

  try {
    const res = await api.request<T>({
      url: endpoint,
      method,
      data: body,
      headers,
    })
    return res.data
  } catch (e) {
    // rethrow normalized ApiError
    throw e as ApiError
  }
}

// Auth endpoints
export async function login(emailOrUsername: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: { emailOrUsername, password },
  })
  // cookies are set by backend → browser stores them → no token in JS
}
export async function register(
  username: string,
  avatarUrl: string,
  email: string,
  password: string
) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: { username, email, password, avatarUrl },
  })
  // cookies are set by backend → browser stores them → no token in JS
}

export async function getMe() {
  return apiCall('/auth/me')
}

// Thread endpoints
export async function getThreads(urlParams?: {
  search?: string
  tag?: string
  authorId?: string
}) {
  const { search, tag, authorId } = urlParams || {}
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (tag) params.append('tag', tag)
  if (authorId) params.append('authorId', authorId)

  return apiCall(`/api/threads?${params.toString()}`)
}

export async function getThread(id: string) {
  console.log('Page reload issue', id)
  return apiCall(`/api/threads/${id}`)
}

export async function generateSummary(id: string) {
  return apiCall(`/api/threads/${id}/summary`)
}

export async function createThread(data: {
  title: string
  description: string
  tags: string[]
}) {
  return apiCall('/api/threads', { method: 'POST', body: data })
}

// Post endpoints
export async function getPosts(threadId: string) {
  return apiCall(`/api/threads/${threadId}/posts`)
}

export async function createPost(
  threadId: string,
  data: { content: string; parentId?: string }
) {
  return apiCall(`/api/threads/${threadId}/posts`, {
    method: 'POST',
    body: data,
  })
}

export async function getNotifications() {
  return apiCall<{
    total: number
    limit: number
    offset: number
    items: Notification[]
  }>('/api/notifications')
}

export async function markNotificationRead(notificationId: string) {
  return apiCall<{ notification: Notification }>(
    `/api/notifications/${notificationId}/read`,
    { method: 'PATCH' }
  )
}

export async function markAllNotificationRead() {
  return apiCall<{ ok: boolean }>('/api/notifications/read-all', {
    method: 'PATCH',
  })
}

export async function deleteNotification(notificationId: string) {
  return apiCall(`/api/notifications/${notificationId}`, { method: 'DELETE' })
}

export async function logout() {
  await apiCall('/auth/logout', { method: 'POST' })
}

export async function refresh() {
  return refreshSession()
}

// GET /api/admin/webhooks
export async function getWebhooks() {
  return apiCall<{ items: Webhook[] }>('/api/admin/webhooks')
}

// POST /api/admin/webhooks
export async function createWebhook(data: {
  targetUrl: string
  events: Array<'mention' | 'reply' | 'digest'>
  secret?: string
}) {
  return apiCall<Webhook>('/api/admin/webhooks', {
    method: 'POST',
    body: data,
  })
}

// PUT /api/admin/webhooks/:id
export async function updateWebhook(id: string, data: Partial<Webhook>) {
  return apiCall<Webhook>(`/api/admin/webhooks/${id}`, {
    method: 'PUT',
    body: data,
  })
}

// PATCH /api/admin/webhooks/:id/toggle
export async function toggleWebhook(id: string, isActive: boolean) {
  return apiCall<{ id: string; isActive: boolean }>(
    `/api/admin/webhooks/${id}/toggle`,
    {
      method: 'PATCH',
      body: { isActive },
    }
  )
}

// DELETE /api/admin/webhooks/:id
export async function deleteWebhook(id: string) {
  await apiCall(`/api/admin/webhooks/${id}`, {
    method: 'DELETE',
  })
}

// GET /api/admin/webhooks/:id/deliveries
export async function getWebhookDeliveries(id: string) {
  return apiCall<{ items: WebhookDelivery[] }>(
    `/api/admin/webhooks/${id}/deliveries`
  )
}

export async function getFlaggedPosts() {
  return apiCall<{ items: FlaggedPost[] }>('/api/admin/moderation/posts')
}

export async function approvePost(postId: string) {
  return apiCall<{ ok: boolean }>(
    `/api/admin/moderation/posts/${postId}/approve`,
    { method: 'PATCH' }
  )
}

export async function removePost(postId: string) {
  return apiCall<{ ok: boolean }>(
    `/api/admin/moderation/posts/${postId}/remove`,
    { method: 'PATCH' }
  )
}

// already referenced in PostItem
export async function flagPost(postId: string, reason: string) {
  return apiCall<{ ok: boolean }>(`/api/posts/${postId}/flag`, {
    method: 'POST',
    body: { reason },
  })
}

export async function getAdminDashboard() {
  return apiCall<{ stats: AdminStats; flaggedPosts: FlaggedPost[] }>(
    '/api/admin/dashboard'
  )
}
