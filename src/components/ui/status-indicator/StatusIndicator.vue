<script setup lang="ts">
import { computed } from 'vue'
import { useStatusStore } from '@/stores/status'

type Props = {
  userId: number
  size?: 'sm' | 'md'
  showTooltip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  showTooltip: true,
})

const statusStore = useStatusStore()

const isOnline = computed(() => statusStore.isUserOnline(props.userId))
const lastSeenText = computed(() => statusStore.formatLastSeen(props.userId))

const sizeClasses = computed(() => {
  return props.size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
})

const statusClasses = computed(() => {
  return isOnline.value ? 'bg-green-500' : 'bg-gray-400'
})
</script>

<template>
  <div
    class="rounded-full border-2 border-background"
    :class="[sizeClasses, statusClasses]"
    :title="showTooltip ? lastSeenText : undefined"
    role="status"
    :aria-label="isOnline ? 'В сети' : lastSeenText"
  />
</template>
