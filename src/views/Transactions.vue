<template>
  <div class="page-content">
    <div class="header">
      <h1>交易记录</h1>
      <router-link :to="`/books/${bookId}`" class="back-btn">返回账本</router-link>
    </div>

    <div class="actions">
      <button @click="showAddForm = true" class="pill">添加交易</button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h2>添加新交易</h2>
      <form @submit.prevent="handleAddTransaction">
        <div class="form-row">
          <div class="form-group">
            <label for="amount">金额</label>
            <input
              id="amount"
              v-model.number="newTransaction.amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>
          <div class="form-group">
            <label for="type">类型</label>
            <select id="type" v-model="newTransaction.type" required>
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">描述</label>
          <input
            id="description"
            v-model="newTransaction.description"
            type="text"
            required
            placeholder="请输入交易描述"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">类别</label>
            <select id="category" v-model="newTransaction.category" required>
              <option value="">请选择类别</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="transactionDate">日期</label>
            <input
              id="transactionDate"
              v-model="newTransaction.transaction_date"
              type="date"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="notes">备注</label>
          <textarea
            id="notes"
            v-model="newTransaction.notes"
            placeholder="请输入备注（可选）"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="transactionStore.loading">
            {{ transactionStore.loading ? '添加中...' : '添加' }}
          </button>
          <button type="button" @click="resetForm" class="cancel-btn">
            取消
          </button>
        </div>
      </form>
    </div>

    <div class="transactions-section">
      <div class="section-header">
        <h2>交易记录</h2>
        <div class="filters">
          <select v-model="filterType" @change="filterTransactions">
            <option value="all">全部</option>
            <option value="expense">支出</option>
            <option value="income">收入</option>
          </select>
        </div>
      </div>

      <div v-if="filteredTransactions.length === 0" class="no-transactions">
        <p>暂无交易记录</p>
      </div>
      <div v-else class="transactions-list">
        <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-item">
          <div class="transaction-info">
            <span class="transaction-amount" :class="transaction.type">
              {{ formatAmount(transaction.amount) }}
            </span>
            <span class="transaction-description">{{ transaction.description }}</span>
            <span class="transaction-category">{{ transaction.category }}</span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-payer">{{ transaction.payer?.email }}</span>
            <span class="transaction-date">{{ formatDate(transaction.transaction_date) }}</span>
          </div>
          <div v-if="transaction.notes" class="transaction-notes">
            {{ transaction.notes }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactionStore } from '@/stores/transaction'

const route = useRoute()
const transactionStore = useTransactionStore()

const bookId = route.params.id
const showAddForm = ref(false)
const filterType = ref('all')

const categories = [
  '餐饮',
  '购物',
  '交通',
  '娱乐',
  '住房',
  '医疗',
  '教育',
  '工资',
  '投资',
  '其他'
]

const newTransaction = ref({
  amount: 0,
  type: 'expense',
  description: '',
  category: '',
  transaction_date: new Date().toISOString().split('T')[0],
  notes: '',
  book_id: bookId
})

const filteredTransactions = computed(() => {
  if (filterType.value === 'all') {
    return transactionStore.transactions
  }
  return transactionStore.transactions.filter(t => t.type === filterType.value)
})

const handleAddTransaction = async () => {
  try {
    await transactionStore.addTransaction(newTransaction.value)
    resetForm()
  } catch (error) {
    console.error('添加交易失败:', error)
  }
}

const resetForm = () => {
  newTransaction.value = {
    amount: 0,
    type: 'expense',
    description: '',
    category: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    book_id: bookId
  }
  showAddForm.value = false
}

const filterTransactions = () => {
  // 过滤逻辑已经在 computed 中处理
}

const formatAmount = (amount) => {
  const num = parseFloat(amount)
  return `${num >= 0 ? '+' : ''}¥${num.toFixed(2)}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await transactionStore.fetchTransactions(bookId)
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

.add-form {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
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

.transactions-section {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filters select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
}

.no-transactions {
  text-align: center;
  padding: var(--spacing-xl);
  color: #666;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transaction-item {
  padding: var(--spacing-lg);
  border: 1px solid #eee;
  border-radius: var(--radius-lg);
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
  font-size: var(--font-lg);
}

.transaction-amount.expense {
  color: var(--secondary-accent);
}

.transaction-amount.income {
  color: #4CAF50;
}

.transaction-description {
  flex: 1;
  margin: 0 var(--spacing-md);
  font-weight: 500;
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
  margin-bottom: var(--spacing-sm);
}

.transaction-notes {
  padding: var(--spacing-sm);
  background: #f5f5f5;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .transaction-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .transaction-description {
    margin: 0;
  }
}
</style>