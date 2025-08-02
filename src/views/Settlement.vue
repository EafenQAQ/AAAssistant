<template>
  <div class="page-content">
    <div class="header">
      <h1>月度结算</h1>
      <router-link :to="`/books/${bookId}`" class="back-btn">返回账本</router-link>
    </div>

    <div class="date-selector">
      <div class="form-group">
        <label for="year">年份</label>
        <select id="year" v-model="selectedYear" @change="loadSummary">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="month">月份</label>
        <select id="month" v-model="selectedMonth" @change="loadSummary">
          <option v-for="month in 12" :key="month" :value="month">
            {{ month }}月
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="summary" class="summary-content">
      <div class="summary-card">
        <h2>月度总览</h2>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">总支出</span>
            <span class="stat-value">{{ formatAmount(summary.total) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成员数量</span>
            <span class="stat-value">{{ summary.memberTotals.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">人均支出</span>
            <span class="stat-value">{{ formatAmount(summary.average) }}</span>
          </div>
        </div>
      </div>

      <div class="members-summary">
        <h2>成员支出明细</h2>
        <div class="members-list">
          <div v-for="member in summary.memberTotals" :key="member.email" class="member-card">
            <div class="member-info">
              <span class="member-email">{{ member.email }}</span>
              <span class="member-total">{{ formatAmount(member.total) }}</span>
            </div>
            <div class="member-balance">
              <span class="balance-label">应付/应收：</span>
              <span class="balance-amount" :class="getBalanceClass(member.total)">
                {{ formatAmount(getBalance(member.total)) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="settlement-actions">
        <h2>结算操作</h2>
        <div class="settlement-info">
          <p>结算说明：每个成员应该支付平均金额，已经支付更多的成员应该收回差额，支付较少的成员应该补足差额。</p>
        </div>
        <button @click="generateSettlementReport" class="pill">
          生成结算报告
        </button>
      </div>
    </div>

    <div v-else class="no-data">
      <p>该月份暂无支出记录</p>
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
const loading = ref(false)
const summary = ref(null)

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const selectedYear = ref(currentYear)
const selectedMonth = ref(currentMonth)

const availableYears = computed(() => {
  const years = []
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i)
  }
  return years
})

const loadSummary = async () => {
  loading.value = true
  try {
    const data = await transactionStore.getMonthlySummary(bookId, selectedYear.value, selectedMonth.value)
    summary.value = data
  } catch (error) {
    console.error('加载结算数据失败:', error)
    summary.value = null
  } finally {
    loading.value = false
  }
}

const formatAmount = (amount) => {
  return `¥${parseFloat(amount).toFixed(2)}`
}

const getBalance = (memberTotal) => {
  if (!summary.value) return 0
  return memberTotal - summary.value.average
}

const getBalanceClass = (memberTotal) => {
  const balance = getBalance(memberTotal)
  if (balance > 0) return 'positive'
  if (balance < 0) return 'negative'
  return 'zero'
}

const generateSettlementReport = () => {
  if (!summary.value) return

  const report = `
月度结算报告
=================
账本ID: ${bookId}
结算期间: ${selectedYear.value}年${selectedMonth.value}月

总支出: ${formatAmount(summary.value.total)}
成员数量: ${summary.value.memberTotals.length}
人均支出: ${formatAmount(summary.value.average)}

成员明细:
${summary.value.memberTotals.map(member => {
  const balance = getBalance(member.total)
  const balanceText = balance > 0 ? '应收' : balance < 0 ? '应付' : '持平'
  return `${member.email}: ${formatAmount(member.total)} (${balanceText} ${formatAmount(Math.abs(balance))})`
}).join('\n')}

结算建议:
${summary.value.memberTotals.map(member => {
  const balance = getBalance(member.total)
  if (balance > 0) {
    return `${member.email} 应收回 ${formatAmount(balance)}`
  } else if (balance < 0) {
    return `${member.email} 应支付 ${formatAmount(Math.abs(balance))}`
  }
  return `${member.email} 已持平`
}).join('\n')}
  `

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `settlement_${selectedYear.value}_${selectedMonth.value}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadSummary()
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

.date-selector {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: var(--base-accent-2);
}

.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: border-color 0.3s ease;
}

.form-group select:focus {
  outline: none;
  border-color: var(--base-color);
}

.loading {
  text-align: center;
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.summary-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.summary-card h2 {
  margin-bottom: var(--spacing-lg);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--base-light);
  border-radius: var(--radius-md);
}

.stat-label {
  display: block;
  font-size: var(--font-sm);
  color: #666;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  display: block;
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--base-accent-2);
}

.members-summary {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.members-summary h2 {
  margin-bottom: var(--spacing-lg);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.member-card {
  padding: var(--spacing-lg);
  border: 1px solid #eee;
  border-radius: var(--radius-md);
  transition: background-color 0.3s ease;
}

.member-card:hover {
  background-color: #f9f9f9;
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.member-email {
  font-weight: 500;
  color: var(--base-accent-2);
}

.member-total {
  font-weight: 600;
  color: var(--secondary-accent);
}

.member-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-sm);
}

.balance-label {
  color: #666;
}

.balance-amount {
  font-weight: 600;
}

.balance-amount.positive {
  color: #4CAF50;
}

.balance-amount.negative {
  color: var(--secondary-accent);
}

.balance-amount.zero {
  color: #666;
}

.settlement-actions {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.settlement-actions h2 {
  margin-bottom: var(--spacing-lg);
}

.settlement-info {
  background: var(--base-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.settlement-info p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.no-data {
  text-align: center;
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.no-data p {
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .date-selector {
    flex-direction: column;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .member-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .member-balance {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>