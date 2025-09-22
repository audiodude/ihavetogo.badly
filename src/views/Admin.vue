<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Admin Panel</h1>
      <p class="text-gray-600">Manage users, content, and application settings</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
        <p class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Locations</h3>
        <p class="text-3xl font-bold text-green-600">{{ stats.totalLocations }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Reviews</h3>
        <p class="text-3xl font-bold text-purple-600">{{ stats.totalReviews }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Pending Reports</h3>
        <p class="text-3xl font-bold text-red-600">{{ stats.pendingReports }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === tab.key
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <!-- Users Tab -->
        <div v-show="activeTab === 'users'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">User Management</h3>
            <div class="flex items-center space-x-4">
              <input
                v-model="userSearch"
                type="text"
                placeholder="Search users..."
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Limit</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
                      <div class="text-sm text-gray-500">Joined {{ formatDate(user.created_at) }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="user.is_admin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                    >
                      {{ user.is_admin ? 'Admin' : 'User' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.review_count || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      v-model.number="user.daily_review_limit"
                      @blur="updateUserLimit(user.id, user.daily_review_limit)"
                      type="number"
                      min="1"
                      max="10"
                      class="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      v-if="!user.is_admin"
                      @click="promoteToAdmin(user.id)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Make Admin
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Content Moderation Tab -->
        <div v-show="activeTab === 'moderation'" class="space-y-6">
          <h3 class="text-lg font-semibold">Content Moderation</h3>

          <div class="text-center py-8">
            <div class="text-6xl mb-4">🚧</div>
            <h4 class="text-xl font-semibold text-gray-700 mb-2">Coming Soon</h4>
            <p class="text-gray-500">Content moderation tools are being developed.</p>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-show="activeTab === 'settings'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Application Settings</h3>
            <button
              @click="refreshSettings"
              class="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>

          <div v-if="settings.length === 0" class="text-center py-8">
            <p class="text-gray-500">No settings configured yet.</p>
            <RouterLink
              to="/admin/setup"
              class="inline-block mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Configure Settings
            </RouterLink>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="setting in settings"
              :key="setting.key"
              class="bg-gray-50 p-4 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">{{ formatSettingKey(setting.key) }}</h4>
                  <p class="text-sm text-gray-600">Current value: <strong>{{ setting.value }}</strong></p>
                </div>
                <RouterLink
                  to="/admin/setup"
                  class="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'

const toast = useToast()
const activeTab = ref('users')
const userSearch = ref('')

const stats = ref({
  totalUsers: 0,
  totalLocations: 0,
  totalReviews: 0,
  pendingReports: 0
})

const users = ref<any[]>([])
const settings = ref<any[]>([])

const tabs = [
  { key: 'users', label: 'Users' },
  { key: 'moderation', label: 'Moderation' },
  { key: 'settings', label: 'Settings' }
]

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const search = userSearch.value.toLowerCase()
  return users.value.filter(user =>
    user.email.toLowerCase().includes(search)
  )
})

onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadUsers(),
    loadSettings()
  ])
})

const loadStats = async () => {
  try {
    // Load user count
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Load location count
    const { count: locationCount } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('hidden', false)

    // Load review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('hidden', false)

    stats.value = {
      totalUsers: userCount || 0,
      totalLocations: locationCount || 0,
      totalReviews: reviewCount || 0,
      pendingReports: 0 // TODO: Implement reports system
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        reviews:reviews(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    users.value = (data || []).map(user => ({
      ...user,
      review_count: user.reviews?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error('Failed to load users')
  }
}

const loadSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key')

    if (error) {
      throw error
    }

    settings.value = data || []
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

const updateUserLimit = async (userId: string, limit: number) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ daily_review_limit: limit })
      .eq('id', userId)

    if (error) {
      throw error
    }

    toast.success('User limit updated')
  } catch (error) {
    console.error('Error updating user limit:', error)
    toast.error('Failed to update user limit')
  }
}

const promoteToAdmin = async (userId: string) => {
  const confirmed = confirm('Are you sure you want to make this user an admin?')
  if (!confirmed) return

  try {
    const { error } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId)

    if (error) {
      throw error
    }

    await loadUsers()
    toast.success('User promoted to admin')
  } catch (error) {
    console.error('Error promoting user:', error)
    toast.error('Failed to promote user')
  }
}

const refreshSettings = async () => {
  await loadSettings()
  toast.success('Settings refreshed')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatSettingKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}
</script>