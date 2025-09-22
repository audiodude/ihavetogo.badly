<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-800">Completing sign in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    if (data.session?.user) {
      await authStore.fetchProfile()

      // Check if this is the first user and should become admin
      if (!authStore.profile?.is_admin) {
        // Check if there are any admins in the system
        const { data: adminCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('is_admin', true)

        if (adminCount && adminCount.length === 0) {
          // Make this user an admin and redirect to setup
          await authStore.updateProfile({ is_admin: true })
          router.push('/admin/setup')
          return
        }
      }

      toast.success('Successfully signed in!')
      router.push('/dashboard')
    } else {
      throw new Error('No session found')
    }
  } catch (error) {
    console.error('Auth callback error:', error)
    toast.error('Failed to complete sign in')
    router.push('/')
  }
})
</script>