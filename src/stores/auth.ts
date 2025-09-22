import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.is_admin || false)

  const initialize = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      } else {
        user.value = null
        profile.value = null
      }
    })
  }

  const fetchProfile = async () => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return
    }

    profile.value = data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    user.value = null
    profile.value = null
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    profile.value = data
    return data
  }

  return {
    user,
    profile,
    loading,
    isLoggedIn,
    isAdmin,
    initialize,
    fetchProfile,
    signInWithGoogle,
    signOut,
    updateProfile
  }
})