import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export const useAccountBookStore = defineStore('accountBook', () => {
  const books = ref([])
  const currentBook = ref(null)
  const loading = ref(false)

  const fetchUserBooks = async (userId) => {
    loading.value = true
    try {
      // 获取用户拥有的账本
      const { data: ownedBooks, error: ownedError } = await supabase
        .from('account_books')
        .select('*')
        .eq('owner_id', userId)

      if (ownedError) throw ownedError

      // 获取用户参与的账本
      const { data: memberBooks, error: memberError } = await supabase
        .from('book_members')
        .select(`
          book_id,
          role,
          account_books (
            id,
            name,
            description,
            is_personal,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (memberError) throw memberError

      // 合并结果，避免重复
      const allBooks = [
        ...ownedBooks.map(book => ({
          ...book,
          user_role: 'admin'
        })),
        ...memberBooks
          .filter(item => !ownedBooks.some(book => book.id === item.account_books.id))
          .map(item => ({
            ...item.account_books,
            user_role: item.role
          }))
      ]

      books.value = allBooks
      return books.value
    } catch (error) {
      console.error('Fetch books error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createBook = async (bookData) => {
    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: book, error: bookError } = await supabase
        .from('account_books')
        .insert([{
          name: bookData.name,
          description: bookData.description,
          is_personal: bookData.is_personal,
          owner_id: user.id
        }])
        .select()
        .single()

      if (bookError) throw bookError

      const { error: memberError } = await supabase
        .from('book_members')
        .insert([{
          book_id: book.id,
          user_id: user.id,
          role: 'admin'
        }])

      if (memberError) throw memberError

      await fetchUserBooks(user.id)
      return book
    } catch (error) {
      console.error('Create book error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addMember = async (bookId, userEmail) => {
    try {
      if (!(await canManageBook(bookId))) {
        throw new Error('No permission to add members')
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) throw new Error('User not authenticated')

      // 使用 auth.admin.getUserByEmail 需要管理员权限
      // 这里简化处理，假设用户已经知道要添加的用户的ID
      // 在实际应用中，你可能需要一个邀请系统
      throw new Error('User invitation system not implemented. Please use the user ID directly.')
    } catch (error) {
      console.error('Add member error:', error)
      throw error
    }
  }

  const checkUserPermission = async (bookId, userId) => {
    try {
      const { data, error } = await supabase
        .from('book_members')
        .select('role')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .single()

      if (error) return false
      return !!data
    } catch (error) {
      console.error('Check permission error:', error)
      return false
    }
  }

  const canManageBook = async (bookId) => {
    const book = books.value.find(b => b.id === bookId)
    if (!book) return false
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    return book.owner_id === user.id || book.user_role === 'admin'
  }

  const canViewBook = (bookId) => {
    return books.value.some(b => b.id === bookId)
  }

  const getBookMembers = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('book_members')
        .select(`
          user_id,
          role,
          auth.users(email)
        `)
        .eq('book_id', bookId)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Get book members error:', error)
      throw error
    }
  }

  const setCurrentBook = (book) => {
    currentBook.value = book
  }

  return {
    books,
    currentBook,
    loading,
    fetchUserBooks,
    createBook,
    addMember,
    checkUserPermission,
    canManageBook,
    canViewBook,
    getBookMembers,
    setCurrentBook,
  }
})