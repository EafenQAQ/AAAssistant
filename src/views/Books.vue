<template>
  <div class="page-content">
    <div class="header">
      <h1>账本管理</h1>
      <router-link to="/" class="back-btn">返回首页</router-link>
    </div>

    <div class="actions">
      <button @click="showCreateForm = true" class="pill">创建新账本</button>
    </div>

    <div v-if="showCreateForm" class="create-form">
      <h2>创建新账本</h2>
      <form @submit.prevent="handleCreateBook">
        <div class="form-group">
          <label for="bookName">账本名称</label>
          <input
            id="bookName"
            v-model="newBook.name"
            type="text"
            required
            placeholder="请输入账本名称"
          />
        </div>
        <div class="form-group">
          <label for="bookDescription">账本描述</label>
          <textarea
            id="bookDescription"
            v-model="newBook.description"
            placeholder="请输入账本描述（可选）"
          ></textarea>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="newBook.is_personal" />
            个人账本（不与他人共享）
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="accountBookStore.loading">
            {{ accountBookStore.loading ? '创建中...' : '创建' }}
          </button>
          <button type="button" @click="showCreateForm = false" class="cancel-btn">
            取消
          </button>
        </div>
      </form>
    </div>

    <div class="books-list">
      <h2>我的账本</h2>
      <div v-if="accountBookStore.books.length === 0" class="no-books">
        <p>还没有账本，请先创建一个账本</p>
      </div>
      <div v-else class="books-grid">
        <div
          v-for="book in accountBookStore.books"
          :key="book.id"
          class="book-card"
          @click="selectBook(book)"
        >
          <h3>{{ book.name }}</h3>
          <p>{{ book.description || '暂无描述' }}</p>
          <div class="book-meta">
            <span class="book-type">{{ book.is_personal ? '个人账本' : '共享账本' }}</span>
            <span class="book-date">{{ formatDate(book.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAccountBookStore } from '@/stores/accountBook'

const router = useRouter()
const authStore = useAuthStore()
const accountBookStore = useAccountBookStore()

const showCreateForm = ref(false)
const newBook = ref({
  name: '',
  description: '',
  is_personal: false
})

const handleCreateBook = async () => {
  try {
    await accountBookStore.createBook(newBook.value)
    showCreateForm.value = false
    newBook.value = {
      name: '',
      description: '',
      is_personal: false
    }
  } catch (error) {
    console.error('创建账本失败:', error)
  }
}

const selectBook = (book) => {
  accountBookStore.setCurrentBook(book)
  router.push('/')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
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

.back-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--secondary-color);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background: var(--secondary-accent);
}

.actions {
  margin-bottom: var(--spacing-xl);
}

.create-form {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--base-accent-2);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--base-color);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
}

.form-actions button {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.form-actions button[type="submit"] {
  background: var(--base-color);
  color: white;
}

.form-actions button[type="submit"]:hover {
  background: var(--base-accent);
}

.cancel-btn {
  background: #ccc;
  color: #666;
}

.cancel-btn:hover {
  background: #bbb;
}

.books-list h2 {
  margin-bottom: var(--spacing-lg);
}

.no-books {
  text-align: center;
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.no-books p {
  color: #666;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.book-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.book-card h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--base-accent-2);
}

.book-card p {
  margin: 0 0 var(--spacing-md) 0;
  color: #666;
  font-size: var(--font-sm);
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-xs);
}

.book-type {
  background: var(--base-light);
  color: var(--base-accent-2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.book-date {
  color: #999;
}
</style>