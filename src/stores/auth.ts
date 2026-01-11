import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  logout as apiLogout,
  getCurrentUser as apiGetCurrentUser,
  refreshToken as apiRefreshToken,
  setAccessToken,
  type User,
} from '@/api'
import { useStatusStore } from '@/stores/status'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('accessToken')
    if (!storedToken) {
      return false
    }

    accessToken.value = storedToken
    setAccessToken(storedToken)

    // Пробуем получить текущего пользователя
    const response = await apiGetCurrentUser()
    if (response.data) {
      user.value = response.data
      const statusStore = useStatusStore()
      statusStore.connect()
      return true
    }

    // Если не удалось - пробуем обновить токен
    const refreshResponse = await apiRefreshToken()
    if (refreshResponse.data) {
      accessToken.value = refreshResponse.data.accessToken
      setAccessToken(refreshResponse.data.accessToken)
      localStorage.setItem('accessToken', refreshResponse.data.accessToken)

      const userResponse = await apiGetCurrentUser()
      if (userResponse.data) {
        user.value = userResponse.data
        const statusStore = useStatusStore()
        statusStore.connect()
        return true
      }
    }

    // Если ничего не помогло - очищаем
    clearAuth()
    return false
  }

  const signIn = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null

    const response = await apiSignIn(username, password)

    if (response.error) {
      error.value = response.error
      isLoading.value = false
      return false
    }

    if (response.data) {
      user.value = response.data.user
      accessToken.value = response.data.accessToken
      setAccessToken(response.data.accessToken)
      localStorage.setItem('accessToken', response.data.accessToken)

      const statusStore = useStatusStore()
      statusStore.connect()
    }

    isLoading.value = false
    return true
  }

  const signUp = async (username: string, password: string, displayName?: string) => {
    isLoading.value = true
    error.value = null

    const response = await apiSignUp(username, password, displayName)

    if (response.error) {
      error.value = response.error
      isLoading.value = false
      return false
    }

    if (response.data) {
      user.value = response.data.user
      accessToken.value = response.data.accessToken
      setAccessToken(response.data.accessToken)
      localStorage.setItem('accessToken', response.data.accessToken)

      const statusStore = useStatusStore()
      statusStore.connect()
    }

    isLoading.value = false
    return true
  }

  const logout = async () => {
    const statusStore = useStatusStore()
    statusStore.disconnect()
    await apiLogout()
    clearAuth()
  }

  const clearAuth = () => {
    user.value = null
    accessToken.value = null
    setAccessToken(null)
    localStorage.removeItem('accessToken')
  }

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    signIn,
    signUp,
    logout,
    clearAuth,
  }
})
