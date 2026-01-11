<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusIndicator } from '@/components/ui/status-indicator'
import type { Chat } from '@/api'

type Props = {
  chat: Chat
  currentUserId: number
}

const props = defineProps<Props>()

const otherMember = computed(() => {
  if (props.chat.chat_type !== 'private') return null
  return props.chat.members.find((m) => m.user_id !== props.currentUserId)
})

const chatName = computed(() => {
  if (props.chat.name) return props.chat.name
  if (otherMember.value) {
    return otherMember.value.display_name || otherMember.value.username
  }
  return 'Чат'
})

const avatarUrl = computed(() => {
  if (props.chat.avatar_url) return props.chat.avatar_url
  return otherMember.value?.avatar_url
})

const initials = computed(() => {
  const name = chatName.value
  return name.slice(0, 2).toUpperCase()
})

const lastMessagePreview = computed(() => {
  if (!props.chat.last_message) return 'Нет сообщений'
  const { content, sender_username } = props.chat.last_message
  const isMe = props.chat.last_message.sender_id === props.currentUserId
  const prefix = isMe ? 'Вы: ' : `${sender_username}: `
  const truncated = content.length > 40 ? content.slice(0, 40) + '...' : content
  return prefix + truncated
})

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

const lastMessageTime = computed(() => {
  if (!props.chat.last_message) return ''
  return formatTime(props.chat.last_message.created_at)
})
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
    tabindex="0"
    role="button"
    :aria-label="`Открыть чат с ${chatName}`"
  >
    <div class="relative">
      <Avatar class="h-12 w-12">
        <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="chatName" />
        <AvatarFallback class="bg-primary text-primary-foreground">
          {{ initials }}
        </AvatarFallback>
      </Avatar>
      <StatusIndicator
        v-if="otherMember"
        :user-id="otherMember.user_id"
        size="sm"
        class="absolute -bottom-0.5 -right-0.5"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <span class="font-medium truncate">{{ chatName }}</span>
        <span class="text-xs text-muted-foreground shrink-0">{{ lastMessageTime }}</span>
      </div>
      <p class="text-sm text-muted-foreground truncate">{{ lastMessagePreview }}</p>
    </div>
  </div>
</template>
