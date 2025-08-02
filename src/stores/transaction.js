import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAccountBookStore } from './accountBook'

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([])
  const loading = ref(false)
  const accountBookStore = useAccountBookStore()

  const checkBookAccess = async (bookId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    // 检查用户是否是账本拥有者
    const { data: ownerCheck } = await supabase
      .from('account_books')
      .select('id')
      .eq('id', bookId)
      .eq('owner_id', user.id)
      .single()
    
    if (ownerCheck) return true
    
    // 检查用户是否是账本成员
    const { data: memberCheck } = await supabase
      .from('book_members')
      .select('book_id')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .single()
    
    return !!memberCheck
  }

  const fetchTransactions = async (bookId) => {
    if (!(await checkBookAccess(bookId))) {
      throw new Error('No permission to access this book')
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false })

      if (error) throw error
      transactions.value = data
      return data
    } catch (error) {
      console.error('Fetch transactions error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addTransaction = async (transactionData) => {
    if (!(await checkBookAccess(transactionData.book_id))) {
      throw new Error('No permission to access this book')
    }

    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          book_id: transactionData.book_id,
          payer_id: user.id,
          amount: transactionData.amount,
          description: transactionData.description,
          type: transactionData.type,
          category: transactionData.category,
          transaction_date: transactionData.transaction_date,
          notes: transactionData.notes
        }])
        .select()
        .single()

      if (error) throw error
      
      await fetchTransactions(transactionData.book_id)
      return data
    } catch (error) {
      console.error('Add transaction error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('book_id, payer_id')
        .eq('id', transactionId)
        .single()

      if (!existingTransaction) throw new Error('Transaction not found')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (existingTransaction.payer_id !== user.id && !(await accountBookStore.canManageBook(existingTransaction.book_id))) {
        throw new Error('No permission to update this transaction')
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', transactionId)
        .select()
        .single()

      if (error) throw error
      
      await fetchTransactions(existingTransaction.book_id)
      return data
    } catch (error) {
      console.error('Update transaction error:', error)
      throw error
    }
  }

  const deleteTransaction = async (transactionId) => {
    try {
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('book_id, payer_id')
        .eq('id', transactionId)
        .single()

      if (!existingTransaction) throw new Error('Transaction not found')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (existingTransaction.payer_id !== user.id && !(await accountBookStore.canManageBook(existingTransaction.book_id))) {
        throw new Error('No permission to delete this transaction')
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error
      
      await fetchTransactions(existingTransaction.book_id)
      return true
    } catch (error) {
      console.error('Delete transaction error:', error)
      throw error
    }
  }

  const getMonthlySummary = async (bookId, year, month) => {
    if (!(await checkBookAccess(bookId))) {
      throw new Error('No permission to access this book')
    }

    try {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0).toISOString()

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, payer_id')
        .eq('book_id', bookId)
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)

      if (error) throw error

      const total = data.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0)
      
      const memberTotals = data.reduce((acc, transaction) => {
        const payerId = transaction.payer_id
        if (!acc[payerId]) {
          acc[payerId] = {
            email: 'User ' + payerId,
            total: 0
          }
        }
        acc[payerId].total += parseFloat(transaction.amount)
        return acc
      }, {})

      return {
        total,
        memberTotals: Object.values(memberTotals),
        average: total / Object.keys(memberTotals).length
      }
    } catch (error) {
      console.error('Get monthly summary error:', error)
      throw error
    }
  }

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlySummary,
  }
})