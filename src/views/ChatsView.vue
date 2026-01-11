<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getChats, type Chat } from '@/api'
import ChatList from '@/components/chat/ChatList.vue'
import NewChatDialog from '@/components/chat/NewChatDialog.vue'

const authStore = useAuthStore()

const chats = ref<Chat[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const currentUserId = computed(() => authStore.user?.id ?? 0)

const fetchChats = async () => {
  isLoading.value = true
  error.value = null

  const response = await getChats()

  if (response.error) {
    error.value = response.error
  } else if (response.data) {
    chats.value = response.data.data
  }

  isLoading.value = false
}

onMounted(() => {
  fetchChats()
})

const handleChatSelect = (chat: Chat) => {
  // Пока просто логируем, позже можно добавить переход к чату
  console.log('Selected chat:', chat.id)
}

const handleChatCreated = () => {
  fetchChats()
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between p-4 border-b">
      <h1 class="text-xl font-semibold">Чаты</h1>
      <NewChatDialog :current-user-id="currentUserId" @created="handleChatCreated" />
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="error" class="text-center py-4 text-destructive">
        {{ error }}
        <button class="block mx-auto mt-2 text-sm text-primary hover:underline" @click="fetchChats">
          Попробовать снова
        </button>
      </div>

      <ChatList
        v-else
        :chats="chats"
        :current-user-id="currentUserId"
        :is-loading="isLoading"
        @select="handleChatSelect"
      />
    </div>
  </div>
</template>
