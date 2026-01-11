const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    accessToken = data.accessToken
    localStorage.setItem('accessToken', data.accessToken)
    return true
  } catch {
    return false
  }
}

const request = async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (!skipAuth && accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include',
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    // Если 401 и не skipAuth - пробуем обновить токен
    if (response.status === 401 && !skipAuth) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        requestHeaders['Authorization'] = `Bearer ${accessToken}`
        config.headers = requestHeaders
        response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.error || 'Произошла ошибка',
        status: response.status,
      }
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Ошибка сети',
      status: 0,
    }
  }
}

// === Types ===

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'

export type User = {
  id: number
  username: string
  display_name?: string
  avatar_url?: string
  status: UserStatus
  last_seen?: string
  created_at: string
  updated_at: string
}

export type ChatType = 'private' | 'group'
export type MemberRole = 'admin' | 'member'

export type ChatMember = {
  id: number
  chat_id: number
  user_id: number
  role: MemberRole
  joined_at: string
  username: string
  display_name?: string
  avatar_url?: string
}

export type LastMessage = {
  id: number
  content: string
  sender_id: number
  sender_username: string
  created_at: string
}

export type Chat = {
  id: number
  name?: string
  chat_type: ChatType
  avatar_url?: string
  created_at: string
  updated_at: string
  members: ChatMember[]
  last_message?: LastMessage
}

export type AuthResponse = {
  user: User
  accessToken: string
  message: string
}

export type ChatsResponse = {
  data: Chat[]
  pagination: {
    limit: number
    offset: number
    count: number
  }
}

// === Auth API ===

export const signIn = (username: string, password: string) => {
  return request<AuthResponse>('/users/sign-in', {
    method: 'POST',
    body: { username, password },
    skipAuth: true,
  })
}

export const signUp = (username: string, password: string, displayName?: string) => {
  return request<AuthResponse>('/users/sign-up', {
    method: 'POST',
    body: { username, password, display_name: displayName },
    skipAuth: true,
  })
}

export const logout = () => {
  return request<{ message: string }>('/users/logout', {
    method: 'POST',
    skipAuth: true,
  })
}

export const refreshToken = () => {
  return request<{ accessToken: string; message: string }>('/users/refresh', {
    method: 'POST',
    skipAuth: true,
  })
}

// === Users API ===

export const getCurrentUser = () => {
  return request<User>('/users/me')
}

export const getUsers = () => {
  return request<User[]>('/users')
}

export const getUserById = (id: number) => {
  return request<User>(`/users/${id}`)
}

// === Chats API ===

export const getChats = (limit = 50, offset = 0) => {
  return request<ChatsResponse>(`/chats?limit=${limit}&offset=${offset}`)
}

export const getChatById = (id: number) => {
  return request<Chat>(`/chats/${id}`)
}

export const createPrivateChat = (userId: number) => {
  return request<{ chat: Chat; message: string }>('/chats/private', {
    method: 'POST',
    body: { user_id: userId },
  })
}
