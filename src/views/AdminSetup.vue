<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">Admin Setup</h1>
          <p class="text-gray-600 mt-1">
            Welcome! As the first user, you're now an admin. Please configure the initial app settings.
          </p>
        </div>

        <div class="p-6 space-y-8">
          <!-- Pin Validation Distance -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Pin Validation Distance
            </label>
            <div class="flex items-center space-x-3">
              <input
                v-model.number="settings.pin_validation_distance_feet"
                type="number"
                min="100"
                max="2000"
                step="50"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <span class="text-gray-600">feet</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              Maximum distance a custom pin can be from the geocoded address before showing a warning.
            </p>
          </div>

          <!-- Invitation System -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800">Invitation System</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                First invitation after
              </label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="settings.first_invitation_after_reviews"
                  type="number"
                  min="1"
                  max="10"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <span class="text-gray-600">reviews</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Users receive their first invitation after adding this many reviews.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Second invitation after
              </label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="settings.second_invitation_after_reviews"
                  type="number"
                  min="2"
                  max="20"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <span class="text-gray-600">total reviews</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Users receive their second invitation after reaching this total number of reviews.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Third invitation after
              </label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="settings.third_invitation_after_reviews"
                  type="number"
                  min="10"
                  max="50"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <span class="text-gray-600">total reviews</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Users receive their third invitation after reaching this total number of reviews.
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Invitation cooldown period
              </label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="settings.invitation_cooldown_days"
                  type="number"
                  min="1"
                  max="30"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <span class="text-gray-600">days</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Minimum time between receiving invitations for each user.
              </p>
            </div>
          </div>

          <!-- Default Daily Review Limit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Default daily review limit
            </label>
            <div class="flex items-center space-x-3">
              <input
                v-model.number="settings.default_daily_review_limit"
                type="number"
                min="1"
                max="10"
                class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <span class="text-gray-600">reviews per day</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              Default maximum number of reviews a user can add per day. Admins can adjust this per user.
            </p>
          </div>

          <!-- Preview -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-medium text-blue-800 mb-2">Settings Summary</h4>
            <div class="text-sm text-blue-700 space-y-1">
              <p>• Pin validation distance: <strong>{{ settings.pin_validation_distance_feet }} feet</strong></p>
              <p>• First invitation after: <strong>{{ settings.first_invitation_after_reviews }} reviews</strong></p>
              <p>• Second invitation after: <strong>{{ settings.second_invitation_after_reviews }} reviews</strong></p>
              <p>• Third invitation after: <strong>{{ settings.third_invitation_after_reviews }} reviews</strong></p>
              <p>• Invitation cooldown: <strong>{{ settings.invitation_cooldown_days }} days</strong></p>
              <p>• Daily review limit: <strong>{{ settings.default_daily_review_limit }} reviews</strong></p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between pt-6 border-t border-gray-200">
            <RouterLink
              to="/"
              class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for Now
            </RouterLink>

            <button
              @click="saveSettings"
              :disabled="saving"
              class="px-8 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium"
            >
              {{ saving ? 'Saving...' : 'Save Settings & Continue' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const saving = ref(false)

const settings = ref({
  pin_validation_distance_feet: 500,
  first_invitation_after_reviews: 1,
  second_invitation_after_reviews: 5,
  third_invitation_after_reviews: 20,
  invitation_cooldown_days: 7,
  default_daily_review_limit: 1
})

onMounted(async () => {
  // Check if user is actually an admin
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  // Load existing settings if they exist
  await loadExistingSettings()
})

const loadExistingSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')

    if (error) {
      console.error('Error loading settings:', error)
      return
    }

    // Apply existing settings
    if (data) {
      data.forEach(setting => {
        const key = setting.key
        const value = typeof setting.value === 'string' ? parseInt(setting.value) : setting.value

        switch (key) {
          case 'pin_validation_distance_feet':
            settings.value.pin_validation_distance_feet = value
            break
          case 'first_invitation_after_reviews':
            settings.value.first_invitation_after_reviews = value
            break
          case 'second_invitation_after_reviews':
            settings.value.second_invitation_after_reviews = value
            break
          case 'third_invitation_after_reviews':
            settings.value.third_invitation_after_reviews = value
            break
          case 'invitation_cooldown_days':
            settings.value.invitation_cooldown_days = value
            break
          case 'default_daily_review_limit':
            settings.value.default_daily_review_limit = value
            break
        }
      })
    }
  } catch (error) {
    console.error('Error loading existing settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Prepare settings for upsert
    const settingsToSave = [
      { key: 'pin_validation_distance_feet', value: settings.value.pin_validation_distance_feet },
      { key: 'first_invitation_after_reviews', value: settings.value.first_invitation_after_reviews },
      { key: 'second_invitation_after_reviews', value: settings.value.second_invitation_after_reviews },
      { key: 'third_invitation_after_reviews', value: settings.value.third_invitation_after_reviews },
      { key: 'invitation_cooldown_days', value: settings.value.invitation_cooldown_days },
      { key: 'default_daily_review_limit', value: settings.value.default_daily_review_limit }
    ]

    // Use upsert to insert or update settings
    const { error } = await supabase
      .from('app_settings')
      .upsert(settingsToSave, {
        onConflict: 'key'
      })

    if (error) {
      throw error
    }

    toast.success('Settings saved successfully!')
    router.push('/dashboard')
  } catch (error) {
    console.error('Error saving settings:', error)
    toast.error('Failed to save settings')
  } finally {
    saving.value = false
  }
}
</script>