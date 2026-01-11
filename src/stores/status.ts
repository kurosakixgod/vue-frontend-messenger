import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useWebSocket } from '@vueuse/core'
import { getAccessToken } from '@/api'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'

type StatusInfo = {
  status: UserStatus
  lastSeen: Date | null
}

type WsMessage = {
  type: string
  [key: string]: unknown
}

type UserStatusMessage = {
  type: 'user_status'
  userId: number
  status: UserStatus
  lastSeen?: string
}

type ContactsStatusesMessage = {
  type: 'contacts_statuses'
  statuses: Array<{
    userId: number
    status: UserStatus
    lastSeen?: string
  }>
}

export const useStatusStore = defineStore('status', () => {
  const statuses = ref<Map<number, StatusInfo>>(new Map())
  const isConnected = ref(false)
  const isAuthenticated = ref(false)

  const { status, data, send, open, close } = useWebSocket(WS_URL, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.error('WebSocket reconnect failed')
      },
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping' }),
      interval: 30000,
      pongTimeout: 5000,
    },
    immediate: false,
    onConnected() {
      isConnected.value = true
      const token = getAccessToken()
      if (token) {
        send(JSON.stringify({ type: 'auth', token }))
      }
    },
    onDisconnected() {
      isConnected.value = false
      isAuthenticated.value = false
    },
  })

  watch(data, (newData) => {
    if (!newData) return

    try {
      const message = JSON.parse(newData) as WsMessage
      handleMessage(message)
    } catch {
      console.error('Failed to parse WebSocket message')
    }
  })

  const handleMessage = (message: WsMessage) => {
    switch (message.type) {
      case 'auth_success':
        isAuthenticated.value = true
        break

      case 'auth_error':
        isAuthenticated.value = false
        console.error('WebSocket auth error:', message.error)
        break

      case 'user_status': {
        const msg = message as UserStatusMessage
        statuses.value.set(msg.userId, {
          status: msg.status,
          lastSeen: msg.lastSeen ? new Date(msg.lastSeen) : null,
        })
        break
      }

      case 'contacts_statuses': {
        const msg = message as ContactsStatusesMessage
        msg.statuses.forEach((s) => {
          statuses.value.set(s.userId, {
            status: s.status,
            lastSeen: s.lastSeen ? new Date(s.lastSeen) : null,
          })
        })
        break
      }

      case 'pong':
        break

      default:
        break
    }
  }

  const connect = () => {
    if (status.value === 'CLOSED' || status.value === 'CONNECTING') {
      open()
    }
  }

  const disconnect = () => {
    close()
    statuses.value.clear()
    isAuthenticated.value = false
  }

  const getStatus = (userId: number): StatusInfo | null => {
    return statuses.value.get(userId) ?? null
  }

  const isUserOnline = (userId: number): boolean => {
    const userStatus = statuses.value.get(userId)
    return userStatus?.status === 'online'
  }

  const formatLastSeen = (userId: number): string => {
    const userStatus = statuses.value.get(userId)

    if (!userStatus) {
      return ''
    }

    if (userStatus.status === 'online') {
      return 'в сети'
    }

    if (!userStatus.lastSeen) {
      return 'был в сети'
    }

    const now = new Date()
    const diff = now.getTime() - userStatus.lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return 'был в сети только что'
    }

    if (minutes < 60) {
      return `был в сети ${minutes} мин назад`
    }

    if (hours < 24) {
      return `был в сети ${hours} ч назад`
    }

    return `был в сети ${days} дн назад`
  }

  const requestStatuses = (userIds: number[]) => {
    if (isAuthenticated.value && userIds.length > 0) {
      send(JSON.stringify({ type: 'get_statuses', userIds }))
    }
  }

  return {
    statuses,
    status,
    isConnected,
    isAuthenticated,
    connect,
    disconnect,
    getStatus,
    isUserOnline,
    formatLastSeen,
    requestStatuses,
  }
})
