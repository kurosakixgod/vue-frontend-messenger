<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const userInitials = computed(() => {
  if (!user.value) return ''
  const name = user.value.display_name || user.value.username
  return name.slice(0, 2).toUpperCase()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <header v-if="isAuthenticated" class="border-b bg-card">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-primary"
          >
            <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z" />
            <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
          </svg>
          <span class="font-semibold text-lg">Messenger</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <Avatar>
              <AvatarImage v-if="user?.avatar_url" :src="user.avatar_url" :alt="user.username" />
              <AvatarFallback class="bg-primary text-primary-foreground text-xs">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium hidden sm:inline">
              {{ user?.display_name || user?.username }}
            </span>
          </div>

          <Button variant="ghost" size="sm" aria-label="Выйти из аккаунта" @click="handleLogout">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span class="ml-2 hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-4xl mx-auto w-full">
      <RouterView />
    </main>
  </div>
</template>
