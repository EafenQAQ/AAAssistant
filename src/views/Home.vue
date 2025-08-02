<template>
  <div class="page-content">
    <div class="header">
      <h1>AA助手</h1>
      <div class="user-info">
        <span>欢迎，{{ authStore.user?.user_metadata?.display_name || authStore.user?.email }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="actions">
      <router-link to="/books" class="pill">管理账本</router-link>
      <router-link :to="currentBook ? `/books/${currentBook.id}` : '/books'" class="pill">
        {{ currentBook ? '当前账本' : '选择账本' }}
      </router-link>
    </div>

    <div v-if="currentBook" class="current-book-info">
      <h2>当前账本：{{ currentBook.name }}</h2>
      <p>{{ currentBook.description }}</p>
      <div class="book-actions">
        <router-link :to="`/books/${currentBook.id}/transactions`" class="pill">查看交易</router-link>
        <router-link :to="`/books/${currentBook.id}/settlement`" class="pill">月度结算</router-link>
      </div>
    </div>

    <div v-else class="no-book">
      <p>还没有选择账本，请先创建或选择一个账本</p>
      <router-link to="/books" class="pill">管理账本</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountBookStore } from '@/stores/accountBook'

const router = useRouter()
const authStore = useAuthStore()
const accountBookStore = useAccountBookStore()

const currentBook = accountBookStore.currentBook

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

onMounted(async () => {
  if (authStore.user) {
    await accountBookStore.fetchUserBooks(authStore.user.id)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logout-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--secondary-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: var(--secondary-color);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.current-book-info {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.book-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.no-book {
  text-align: center;
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.no-book p {
  margin-bottom: var(--spacing-lg);
  color: #666;
}
</style>
