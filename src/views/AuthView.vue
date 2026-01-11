<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const router = useRouter()
const authStore = useAuthStore()

const isSignUp = ref(false)
const username = ref('')
const password = ref('')
const displayName = ref('')

const handleSubmit = async () => {
  if (isSignUp.value) {
    const success = await authStore.signUp(
      username.value,
      password.value,
      displayName.value || undefined,
    )
    if (success) {
      router.push('/chats')
    }
  } else {
    const success = await authStore.signIn(username.value, password.value)
    if (success) {
      router.push('/chats')
    }
  }
}

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  authStore.error = null
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSubmit()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl font-bold">
          {{ isSignUp ? 'Регистрация' : 'Вход' }}
        </CardTitle>
        <CardDescription>
          {{ isSignUp ? 'Создайте аккаунт для начала общения' : 'Войдите в свой аккаунт' }}
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="username">Имя пользователя</Label>
          <Input
            id="username"
            v-model="username"
            type="text"
            placeholder="username"
            autocomplete="username"
            @keydown="handleKeyDown"
          />
        </div>

        <div class="space-y-2">
          <Label for="password">Пароль</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            @keydown="handleKeyDown"
          />
        </div>

        <div v-if="isSignUp" class="space-y-2">
          <Label for="displayName">Отображаемое имя (необязательно)</Label>
          <Input
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="Как вас называть?"
            @keydown="handleKeyDown"
          />
        </div>

        <div
          v-if="authStore.error"
          class="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
          role="alert"
        >
          {{ authStore.error }}
        </div>
      </CardContent>

      <CardFooter class="flex flex-col gap-4">
        <Button
          class="w-full"
          :disabled="authStore.isLoading || !username || !password"
          @click="handleSubmit"
        >
          {{ authStore.isLoading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти' }}
        </Button>

        <button
          type="button"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          tabindex="0"
          aria-label="Переключить режим авторизации"
          @click="toggleMode"
          @keydown.enter="toggleMode"
        >
          {{ isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
        </button>
      </CardFooter>
    </Card>
  </div>
</template>
