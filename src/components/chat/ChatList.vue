<script setup lang="ts">
import ChatItem from './ChatItem.vue'
import type { Chat } from '@/api'

type Props = {
  chats: Chat[]
  currentUserId: number
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', chat: Chat): void
}>()

const handleSelect = (chat: Chat) => {
  emit('select', chat)
}

const handleKeyDown = (event: KeyboardEvent, chat: Chat) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleSelect(chat)
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <div v-else-if="chats.length === 0" class="text-center py-8 text-muted-foreground">
      <p>У вас пока нет чатов</p>
      <p class="text-sm mt-1">Начните общение, создав новый чат</p>
    </div>

    <div v-else class="space-y-1">
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="handleSelect(chat)"
        @keydown="handleKeyDown($event, chat)"
      >
        <ChatItem :chat="chat" :current-user-id="currentUserId" />
      </div>
    </div>
  </div>
</template>
