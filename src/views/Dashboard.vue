<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {{ userInitials }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ authStore.user?.email }}</h1>
          <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>{{ userStats.totalReviews }} reviews</span>
            <span>{{ userStats.totalLocations }} locations added</span>
            <span>{{ userStats.totalFavorites }} favorites</span>
            <span v-if="authStore.isAdmin" class="text-red-600 font-medium">Admin</span>
          </div>
        </div>
      </div>

      <!-- Invitations available -->
      <div v-if="availableInvitations > 0" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-800 font-medium">🎉 You have {{ availableInvitations }} invitations available!</p>
            <p class="text-green-700 text-sm mt-1">Share the bathroom finder with friends and family.</p>
          </div>
          <button
            @click="showInviteModal = true"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
          >
            Send Invitations
          </button>
        </div>
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
        <!-- Favorites Tab -->
        <div v-show="activeTab === 'favorites'">
          <div v-if="favorites.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">⭐</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
            <p class="text-gray-500">Favorite locations to easily find them later</p>
          </div>
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LocationCard
              v-for="location in favorites"
              :key="location.id"
              :location="location"
              @favorite="handleFavorite"
              @vote="handleVote"
            />
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-show="activeTab === 'reviews'">
          <div v-if="userReviews.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
            <p class="text-gray-500">Add your first bathroom review to get started</p>
          </div>
          <div v-else class="space-y-4">
            <ReviewCard
              v-for="review in userReviews"
              :key="review.id"
              :review="review"
            />
          </div>
        </div>

        <!-- Locations Tab -->
        <div v-show="activeTab === 'locations'">
          <div v-if="userLocations.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📍</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No locations added yet</h3>
            <p class="text-gray-500">Be the first to add a bathroom location in your area</p>
            <RouterLink
              to="/add-location"
              class="inline-block mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Add Location
            </RouterLink>
          </div>
          <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <LocationCard
              v-for="location in userLocations"
              :key="location.id"
              :location="location"
              @favorite="handleFavorite"
              @vote="handleVote"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <InviteModal
      v-if="showInviteModal"
      :available-invitations="availableInvitations"
      @close="showInviteModal = false"
      @sent="handleInvitationSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocationsStore } from '@/stores/locations'
import { supabase } from '@/lib/supabase'
import LocationCard from '@/components/LocationCard.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import InviteModal from '@/components/InviteModal.vue'

const toast = useToast()
const authStore = useAuthStore()
const locationsStore = useLocationsStore()

const activeTab = ref('favorites')
const showInviteModal = ref(false)
const loading = ref(true)

const favorites = ref<any[]>([])
const userReviews = ref<any[]>([])
const userLocations = ref<any[]>([])
const availableInvitations = ref(0)

const tabs = [
  { key: 'favorites', label: 'Favorites' },
  { key: 'reviews', label: 'My Reviews' },
  { key: 'locations', label: 'My Locations' }
]

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  return email.split('@')[0].slice(0, 2).toUpperCase()
})

const userStats = computed(() => ({
  totalReviews: userReviews.value.length,
  totalLocations: userLocations.value.length,
  totalFavorites: favorites.value.length
}))

onMounted(async () => {
  await Promise.all([
    loadFavorites(),
    loadUserReviews(),
    loadUserLocations(),
    loadInvitationStats()
  ])
  loading.value = false
})

const loadFavorites = async () => {
  if (!authStore.user) return

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      location_id,
      locations (
        *,
        city:cities(*),
        reviews:reviews(*)
      )
    `)
    .eq('user_id', authStore.user.id)

  if (error) {
    console.error('Error loading favorites:', error)
    return
  }

  favorites.value = (data || []).map(fav => ({
    ...fav.locations,
    is_favorited: true
  }))
}

const loadUserReviews = async () => {
  if (!authStore.user) return

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      location:locations(
        id,
        business_name,
        address,
        city:cities(name, state)
      )
    `)
    .eq('user_id', authStore.user.id)
    .eq('hidden', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading user reviews:', error)
    return
  }

  userReviews.value = data || []
}

const loadUserLocations = async () => {
  if (!authStore.user) return

  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      city:cities(*),
      reviews:reviews(*)
    `)
    .eq('created_by', authStore.user.id)
    .eq('hidden', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading user locations:', error)
    return
  }

  userLocations.value = data || []
}

const loadInvitationStats = async () => {
  if (!authStore.user || !authStore.profile) return

  availableInvitations.value = authStore.profile.pending_invitations
}

const handleFavorite = async (locationId: string) => {
  try {
    await locationsStore.toggleFavorite(locationId)
    await loadFavorites() // Refresh favorites
    toast.success('Favorite updated!')
  } catch (error) {
    console.error('Error toggling favorite:', error)
    toast.error('Failed to update favorite')
  }
}

const handleVote = async (locationId: string, voteType: 'up' | 'down') => {
  try {
    await locationsStore.voteLocation(locationId, voteType)
    // Refresh location data
    await Promise.all([loadFavorites(), loadUserLocations()])
    toast.success('Vote recorded!')
  } catch (error) {
    console.error('Error voting:', error)
    toast.error('Failed to record vote')
  }
}

const handleInvitationSent = () => {
  toast.success('Invitation sent!')
  loadInvitationStats()
}
</script>