import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chats',
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/chats',
      name: 'chats',
      component: () => import('../views/ChatsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

let isInitialized = false

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Инициализируем auth store один раз при первом переходе
  if (!isInitialized) {
    isInitialized = true
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  // Защищённые маршруты
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'auth' })
    return
  }

  // Маршруты только для гостей
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'chats' })
    return
  }

  next()
})

export default router
