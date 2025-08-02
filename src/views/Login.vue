<template>
  <div class="page-content">
    <h1>登录</h1>
    <div class="auth-form">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="请输入邮箱"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <div class="auth-links">
        <router-link to="/register">还没有账号？立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''
    await authStore.signIn(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = '登录失败，请检查邮箱和密码'
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
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

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--base-color);
}

button {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--base-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-lg);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background: var(--base-accent);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: var(--secondary-accent);
  text-align: center;
  margin-top: var(--spacing-md);
}

.auth-links {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.auth-links a {
  color: var(--base-color);
  text-decoration: underline;
}

.auth-links a:hover {
  color: var(--base-accent);
}
</style>