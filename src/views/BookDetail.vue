<template>
  <div class="page-content">
    <div class="header">
      <h1>账本详情</h1>
      <router-link to="/" class="back-btn">返回首页</router-link>
    </div>

    <div v-if="book" class="book-info">
      <h2>{{ book.name }}</h2>
      <p>{{ book.description || '暂无描述' }}</p>
      <div class="book-meta">
        <span class="book-type">{{ book.is_personal ? '个人账本' : '共享账本' }}</span>
        <span class="book-date">创建于 {{ formatDate(book.created_at) }}</span>
      </div>
    </div>

    <div class="actions">
      <router-link :to="`/books/${bookId}/transactions`" class="pill">查看交易记录</router-link>
      <router-link :to="`/books/${bookId}/settlement`" class="pill">月度结算</router-link>
      <button v-if="!book?.is_personal" @click="showAddMember = true" class="pill">添加成员</button>
    </div>

    <div v-if="showAddMember" class="add-member-form">
      <h3>添加成员</h3>
      <form @submit.prevent="handleAddMember">
        <div class="form-group">
          <label for="memberEmail">成员邮箱</label>
          <input
            id="memberEmail"
            v-model="memberEmail"
            type="email"
            required
            placeholder="请输入成员邮箱"
          />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="!memberEmail">
            添加
          </button>
          <button type="button" @click="showAddMember = false; memberEmail = ''" class="cancel-btn">
            取消
          </button>
        </div>
      </form>
    </div>

    <div class="recent-transactions">
      <h3>最近交易</h3>
      <div v-if="recentTransactions.length === 0" class="no-transactions">
        <p>暂无交易记录</p>
      </div>
      <div v-else class="transactions-list">
        <div v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-info">
            <span class="transaction-amount">{{ formatAmount(transaction.amount) }}</span>
            <span class="transaction-description">{{ transaction.description }}</span>
            <span class="transaction-category">{{ transaction.category }}</span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-payer">{{ transaction.payer?.email }}</span>
            <span class="transaction-date">{{ formatDate(transaction.transaction_date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAccountBookStore } from '@/stores/accountBook'
import { useTransactionStore } from '@/stores/transaction'

const route = useRoute()
const accountBookStore = useAccountBookStore()
const transactionStore = useTransactionStore()

const bookId = route.params.id
const showAddMember = ref(false)
const memberEmail = ref('')

const book = computed(() => {
  return accountBookStore.books.find(b => b.id === bookId)
})

const recentTransactions = computed(() => {
  return transactionStore.transactions.slice(0, 5)
})

const handleAddMember = async () => {
  try {
    await accountBookStore.addMember(bookId, memberEmail.value)
    showAddMember.value = false
    memberEmail.value = ''
  } catch (error) {
    console.error('添加成员失败:', error)
  }
}

const formatAmount = (amount) => {
  return `¥${parseFloat(amount).toFixed(2)}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  if (bookId) {
    await transactionStore.fetchTransactions(bookId)
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

.book-info {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.add-member-form {
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

.recent-transactions {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.recent-transactions h3 {
  margin-bottom: var(--spacing-lg);
}

.no-transactions {
  text-align: center;
  padding: var(--spacing-lg);
  color: #666;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transaction-item {
  padding: var(--spacing-md);
  border: 1px solid #eee;
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.transaction-item:hover {
  background-color: #f9f9f9;
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.transaction-amount {
  font-weight: 600;
  color: var(--base-accent-2);
}

.transaction-description {
  flex: 1;
  margin: 0 var(--spacing-md);
}

.transaction-category {
  background: var(--secondary-light);
  color: var(--secondary-accent);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

.transaction-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-sm);
  color: #999;
}
</style>