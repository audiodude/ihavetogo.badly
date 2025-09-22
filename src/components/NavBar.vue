<template>
  <nav class="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <RouterLink to="/" class="text-xl font-bold text-gray-800 hover:text-gray-600">
            🚽 BathroomFinder
          </RouterLink>
        </div>

        <div class="flex items-center space-x-4">
          <RouterLink
            v-if="authStore.isLoggedIn"
            to="/dashboard"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </RouterLink>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
          >
            Admin
          </RouterLink>

          <button
            v-if="authStore.isLoggedIn"
            @click="handleSignOut"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign Out
          </button>

          <button
            v-else
            @click="handleSignIn"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const handleSignIn = async () => {
  try {
    await authStore.signInWithGoogle()
  } catch (error) {
    console.error('Sign in error:', error)
    toast.error('Failed to sign in')
  }
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
    toast.success('Signed out successfully')
  } catch (error) {
    console.error('Sign out error:', error)
    toast.error('Failed to sign out')
  }
}
</script>