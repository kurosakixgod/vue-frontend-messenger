<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getUsers, createPrivateChat, type User } from '@/api'

type Props = {
  currentUserId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'created'): void
}>()

const isOpen = ref(false)
const users = ref<User[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const error = ref<string | null>(null)

const fetchUsers = async () => {
  isLoading.value = true
  error.value = null

  const response = await getUsers()

  if (response.error) {
    error.value = response.error
  } else if (response.data) {
    // Фильтруем текущего пользователя
    users.value = response.data.filter((u) => u.id !== props.currentUserId)
  }

  isLoading.value = false
}

watch(isOpen, (open) => {
  if (open) {
    fetchUsers()
  }
})

const handleCreateChat = async (userId: number) => {
  isCreating.value = true
  error.value = null

  const response = await createPrivateChat(userId)

  if (response.error) {
    error.value = response.error
  } else {
    isOpen.value = false
    emit('created')
  }

  isCreating.value = false
}

const getInitials = (user: User) => {
  const name = user.display_name || user.username
  return name.slice(0, 2).toUpperCase()
}

const handleKeyDown = (event: KeyboardEvent, userId: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleCreateChat(userId)
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mr-2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Новый чат
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Новый чат</DialogTitle>
        <DialogDescription> Выберите пользователя для начала общения </DialogDescription>
      </DialogHeader>

      <div class="mt-4">
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>

        <div v-else-if="error" class="text-center py-4 text-destructive">
          {{ error }}
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8 text-muted-foreground">
          Нет доступных пользователей
        </div>

        <div v-else class="space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="user in users"
            :key="user.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            tabindex="0"
            role="button"
            :aria-label="`Создать чат с ${user.display_name || user.username}`"
            @click="handleCreateChat(user.id)"
            @keydown="handleKeyDown($event, user.id)"
          >
            <Avatar class="h-10 w-10">
              <AvatarImage v-if="user.avatar_url" :src="user.avatar_url" :alt="user.username" />
              <AvatarFallback class="bg-secondary">
                {{ getInitials(user) }}
              </AvatarFallback>
            </Avatar>

            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">
                {{ user.display_name || user.username }}
              </p>
              <p v-if="user.display_name" class="text-sm text-muted-foreground truncate">
                @{{ user.username }}
              </p>
            </div>

            <div
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500': user.status === 'online',
                'bg-yellow-500': user.status === 'away',
                'bg-red-500': user.status === 'busy',
                'bg-gray-400': user.status === 'offline',
              }"
              :title="user.status"
            />
          </div>
        </div>

        <div
          v-if="isCreating"
          class="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
