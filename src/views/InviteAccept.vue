<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <!-- Loading state -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Validating Invitation</h2>
        <p class="text-gray-800">Please wait while we check your invitation...</p>
      </div>

      <!-- Invalid invitation -->
      <div v-else-if="error" class="text-center">
        <div class="text-6xl mb-4">😔</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Invalid Invitation</h2>
        <p class="text-gray-800 mb-6">{{ error }}</p>
        <RouterLink
          to="/"
          class="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
        >
          Go to Home Page
        </RouterLink>
      </div>

      <!-- Already used -->
      <div v-else-if="invitation?.used_by" class="text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Invitation Already Used</h2>
        <p class="text-gray-800 mb-2">This invitation has already been used.</p>
        <p class="text-sm text-gray-700 mb-6">
          Used on {{ formatDate(invitation.used_at!) }}
        </p>

        <div v-if="authStore.isLoggedIn" class="space-y-3">
          <p class="text-gray-700">You're already signed in! Welcome to BathroomFinder.</p>
          <RouterLink
            to="/"
            class="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Explore Bathrooms
          </RouterLink>
        </div>
        <div v-else class="space-y-3">
          <p class="text-gray-700">Please sign in with your Google account to continue.</p>
          <button
            @click="signIn"
            class="w-full flex items-center justify-center px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In with Google
          </button>
        </div>
      </div>

      <!-- Valid invitation - ready to accept -->
      <div v-else-if="invitation" class="text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">You're Invited!</h2>
        <p class="text-gray-800 mb-6">
          You've been invited to join BathroomFinder - the community app for finding and reviewing public bathrooms.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="font-medium text-blue-800 mb-2">What you can do:</h3>
          <ul class="text-sm text-blue-700 text-left space-y-1">
            <li>• Find clean, accessible bathrooms in your city</li>
            <li>• Read reviews from other community members</li>
            <li>• Add new bathroom locations you discover</li>
            <li>• Share your own experiences and photos</li>
            <li>• Vote on locations and reviews</li>
          </ul>
        </div>

        <div v-if="authStore.isLoggedIn" class="space-y-4">
          <p class="text-gray-700">Welcome! Click below to accept your invitation.</p>
          <button
            @click="acceptInvitation"
            :disabled="accepting"
            class="w-full px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium"
          >
            {{ accepting ? 'Accepting...' : 'Accept Invitation' }}
          </button>
        </div>
        <div v-else class="space-y-4">
          <p class="text-gray-700">Sign in with Google to accept your invitation.</p>
          <button
            @click="signIn"
            class="w-full flex items-center justify-center px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(true)
const accepting = ref(false)
const error = ref('')
const invitation = ref<any>(null)

onMounted(async () => {
  await loadInvitation()
})

// Watch for auth changes to auto-accept if user was already signed in
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn && invitation.value && !invitation.value.used_by && !accepting.value) {
    // Auto-accept invitation if user is signed in
    acceptInvitation()
  }
})

const loadInvitation = async () => {
  const code = route.params.code as string

  try {
    const { data, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('access_code', code)
      .single()

    if (fetchError || !data) {
      error.value = 'This invitation link is invalid or has expired.'
      return
    }

    invitation.value = data
  } catch (err) {
    console.error('Error loading invitation:', err)
    error.value = 'Failed to load invitation. Please try again.'
  } finally {
    loading.value = false
  }
}

const signIn = async () => {
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    console.error('Sign in error:', err)
    toast.error('Failed to sign in')
  }
}

const acceptInvitation = async () => {
  if (!authStore.user || !invitation.value) return

  accepting.value = true
  try {
    // Mark invitation as used
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        used_by: authStore.user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', invitation.value.id)

    if (updateError) {
      throw updateError
    }

    toast.success('Welcome to BathroomFinder! 🎉')
    router.push('/')
  } catch (err) {
    console.error('Error accepting invitation:', err)
    toast.error('Failed to accept invitation')
  } finally {
    accepting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>