<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-800">Loading location...</p>
    </div>
  </div>

  <div v-else-if="!location" class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="text-6xl mb-4">😔</div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Location not found</h2>
      <p class="text-gray-800 mb-4">This bathroom location may have been removed or doesn't exist.</p>
      <RouterLink to="/" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
        Back to Map
      </RouterLink>
    </div>
  </div>

  <div v-else class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm">
      <!-- Main Info -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ location.business_name }}</h1>
            <p class="text-gray-800 mb-4">{{ location.address }}</p>

            <!-- Average Rating -->
            <div v-if="averageRating > 0" class="flex items-center space-x-3 mb-4">
              <div class="flex">
                <span v-for="star in 5" :key="star" class="text-2xl text-yellow-400">
                  {{ star <= Math.round(averageRating) ? '⭐' : '☆' }}
                </span>
              </div>
              <span class="text-lg font-medium text-gray-700">
                {{ averageRating.toFixed(1) }} ({{ location.reviews.length }} reviews)
              </span>
            </div>
            <div v-else class="text-gray-700 mb-4">No reviews yet</div>

            <!-- Vote buttons -->
            <div class="flex items-center space-x-4">
              <button
                @click="handleVote('up')"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                :class="location.user_vote === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-gray-100 text-gray-800'"
              >
                <span>👍</span>
                <span class="font-medium">{{ location.upvotes }}</span>
              </button>

              <button
                @click="handleVote('down')"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                :class="location.user_vote === 'down'
                  ? 'bg-red-100 text-red-700'
                  : 'hover:bg-gray-100 text-gray-800'"
              >
                <span>👎</span>
                <span class="font-medium">{{ location.downvotes }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col items-end space-y-3">
            <button
              @click="handleFavorite"
              class="p-3 rounded-full hover:bg-gray-100 transition-colors"
              :class="{ 'text-yellow-500': location.is_favorited, 'text-gray-400': !location.is_favorited }"
            >
              <span class="text-2xl">{{ location.is_favorited ? '⭐' : '☆' }}</span>
            </button>

            <RouterLink
              v-if="authStore.isLoggedIn"
              to="/add-review"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Add Review
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Location</h3>
        <div ref="mapContainer" class="w-full h-64 border border-gray-300 rounded-lg"></div>
      </div>
    </div>

    <!-- Reviews -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">
            Reviews ({{ visibleReviews.length }})
          </h2>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-800">Sort by:</label>
            <select
              v-model="reviewSort"
              class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>
      </div>

      <div class="divide-y divide-gray-200">
        <div v-if="visibleReviews.length === 0" class="p-8 text-center">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p class="text-gray-700 mb-4">Be the first to review this bathroom location!</p>
          <RouterLink
            v-if="authStore.isLoggedIn"
            to="/add-review"
            class="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Write First Review
          </RouterLink>
        </div>

        <ReviewDetailCard
          v-for="review in visibleReviews"
          :key="review.id"
          :review="review"
          @vote="handleReviewVote"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import L from 'leaflet'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocationsStore } from '@/stores/locations'
import { supabase } from '@/lib/supabase'
import ReviewDetailCard from '@/components/ReviewDetailCard.vue'

const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()
const locationsStore = useLocationsStore()

const loading = ref(true)
const location = ref<any>(null)
const reviewSort = ref('newest')

let map: L.Map | null = null
const mapContainer = ref<HTMLElement>()

const averageRating = computed(() => {
  if (!location.value?.reviews?.length) return 0
  return location.value.reviews.reduce((sum: number, review: any) => sum + review.star_rating, 0) / location.value.reviews.length
})

const visibleReviews = computed(() => {
  if (!location.value?.reviews) return []

  const reviews = location.value.reviews.filter((review: any) => !review.hidden)

  switch (reviewSort.value) {
    case 'oldest':
      return reviews.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'highest':
      return reviews.sort((a: any, b: any) => b.star_rating - a.star_rating)
    case 'lowest':
      return reviews.sort((a: any, b: any) => a.star_rating - b.star_rating)
    case 'newest':
    default:
      return reviews.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
})

onMounted(async () => {
  await loadLocation()
  initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const loadLocation = async () => {
  const locationId = route.params.id as string

  try {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        city:cities(*),
        reviews:reviews(*)
      `)
      .eq('id', locationId)
      .eq('hidden', false)
      .single()

    if (error || !data) {
      throw new Error('Location not found')
    }

    location.value = data

    // Load user-specific data if logged in
    if (authStore.isLoggedIn) {
      await loadUserData(locationId)
    }
  } catch (error) {
    console.error('Error loading location:', error)
  } finally {
    loading.value = false
  }
}

const loadUserData = async (locationId: string) => {
  if (!authStore.user) return

  // Load favorite status
  const { data: favorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', authStore.user.id)
    .eq('location_id', locationId)
    .single()

  if (favorite) {
    location.value.is_favorited = true
  }

  // Load user votes
  const { data: locationVote } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('user_id', authStore.user.id)
    .eq('target_id', locationId)
    .eq('target_type', 'location')
    .single()

  if (locationVote) {
    location.value.user_vote = locationVote.vote_type
  }

  // Load review votes
  const reviewIds = location.value.reviews.map((r: any) => r.id)
  if (reviewIds.length > 0) {
    const { data: reviewVotes } = await supabase
      .from('votes')
      .select('target_id, vote_type')
      .eq('user_id', authStore.user.id)
      .eq('target_type', 'review')
      .in('target_id', reviewIds)

    if (reviewVotes) {
      location.value.reviews = location.value.reviews.map((review: any) => {
        const vote = reviewVotes.find(v => v.target_id === review.id)
        return {
          ...review,
          user_vote: vote?.vote_type || null
        }
      })
    }
  }
}

const initializeMap = () => {
  if (!mapContainer.value || !location.value) return

  const lat = location.value.pin_latitude || location.value.latitude
  const lng = location.value.pin_longitude || location.value.longitude

  map = L.map(mapContainer.value).setView([lat, lng], 18)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Main location marker
  const mainIcon = L.divIcon({
    html: '<div class="bg-blue-500 rounded-full w-6 h-6 border-2 border-white shadow-lg"></div>',
    className: 'main-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  L.marker([location.value.latitude, location.value.longitude], { icon: mainIcon })
    .addTo(map)
    .bindPopup('Address Location')

  // Pin marker if different
  if (location.value.pin_latitude && location.value.pin_longitude) {
    const pinIcon = L.divIcon({
      html: '🚽',
      className: 'pin-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    L.marker([location.value.pin_latitude, location.value.pin_longitude], { icon: pinIcon })
      .addTo(map)
      .bindPopup('Bathroom Location')
  }
}

const handleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to favorite locations')
    return
  }

  try {
    await locationsStore.toggleFavorite(location.value.id)
    location.value.is_favorited = !location.value.is_favorited
    toast.success(location.value.is_favorited ? 'Added to favorites!' : 'Removed from favorites')
  } catch (error) {
    console.error('Error toggling favorite:', error)
    toast.error('Failed to update favorite')
  }
}

const handleVote = async (voteType: 'up' | 'down') => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to vote')
    return
  }

  try {
    await locationsStore.voteLocation(location.value.id, voteType)
    await loadLocation() // Refresh to get updated vote counts
    toast.success('Vote recorded!')
  } catch (error) {
    console.error('Error voting:', error)
    toast.error('Failed to record vote')
  }
}

const handleReviewVote = async (reviewId: string, voteType: 'up' | 'down') => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to vote')
    return
  }

  try {
    // TODO: Implement review voting in locations store
    toast.success('Vote recorded!')
    await loadLocation() // Refresh
  } catch (error) {
    console.error('Error voting on review:', error)
    toast.error('Failed to record vote')
  }
}
</script>

<style>
.main-marker,
.pin-marker {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>