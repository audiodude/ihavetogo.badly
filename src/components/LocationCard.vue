<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-gray-800 mb-1">
            {{ location.business_name }}
          </h3>
          <p class="text-sm text-gray-600">{{ location.address }}</p>
        </div>
        <button
          @click="$emit('favorite', location.id)"
          class="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          :class="{ 'text-yellow-500': location.is_favorited, 'text-gray-400': !location.is_favorited }"
        >
          <span class="text-lg">{{ location.is_favorited ? '⭐' : '☆' }}</span>
        </button>
      </div>
    </div>

    <!-- Reviews Summary -->
    <div class="p-4 border-b border-gray-200">
      <div v-if="averageRating > 0" class="flex items-center space-x-2 mb-2">
        <div class="flex">
          <span v-for="star in 5" :key="star" class="text-yellow-400">
            {{ star <= Math.round(averageRating) ? '⭐' : '☆' }}
          </span>
        </div>
        <span class="text-sm text-gray-600">
          {{ averageRating.toFixed(1) }} ({{ location.reviews.length }} reviews)
        </span>
      </div>
      <div v-else class="text-sm text-gray-500 mb-2">
        No reviews yet
      </div>

      <!-- Latest Review Preview -->
      <div v-if="latestReview" class="bg-gray-50 p-3 rounded">
        <div v-if="latestReview.title" class="font-medium text-sm mb-1">
          "{{ latestReview.title }}"
        </div>
        <div v-if="latestReview.review_text" class="text-sm text-gray-600 line-clamp-2">
          {{ latestReview.review_text }}
        </div>
        <div class="text-xs text-gray-500 mt-2">
          {{ formatDate(latestReview.created_at) }}
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <!-- Vote buttons -->
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('vote', location.id, 'up')"
            class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors"
            :class="location.user_vote === 'up'
              ? 'bg-green-100 text-green-700'
              : 'hover:bg-gray-100 text-gray-600'"
          >
            <span>👍</span>
            <span class="text-sm font-medium">{{ location.upvotes }}</span>
          </button>

          <button
            @click="$emit('vote', location.id, 'down')"
            class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors"
            :class="location.user_vote === 'down'
              ? 'bg-red-100 text-red-700'
              : 'hover:bg-gray-100 text-gray-600'"
          >
            <span>👎</span>
            <span class="text-sm font-medium">{{ location.downvotes }}</span>
          </button>
        </div>

        <!-- Distance -->
        <div v-if="distance" class="text-sm text-gray-500">
          {{ distance.toFixed(1) }} mi
        </div>
      </div>

      <!-- View Details Button -->
      <RouterLink
        :to="`/location/${location.id}`"
        class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
      >
        View Details
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLocationsStore } from '@/stores/locations'
import type { Database } from '@/lib/supabase'

type Location = Database['public']['Tables']['locations']['Row'] & {
  reviews: Database['public']['Tables']['reviews']['Row'][]
  city: Database['public']['Tables']['cities']['Row']
  is_favorited?: boolean
  user_vote?: 'up' | 'down' | null
}

interface Props {
  location: Location
}

const props = defineProps<Props>()
const emit = defineEmits<{
  favorite: [locationId: string]
  vote: [locationId: string, voteType: 'up' | 'down']
}>()

const locationsStore = useLocationsStore()

const averageRating = computed(() => {
  if (props.location.reviews.length === 0) return 0
  return props.location.reviews.reduce((sum, review) => sum + review.star_rating, 0) / props.location.reviews.length
})

const latestReview = computed(() => {
  if (props.location.reviews.length === 0) return null
  return props.location.reviews
    .filter(review => !review.hidden)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
})

const distance = computed(() => {
  if (!locationsStore.userLocation) return null

  const R = 3959 // Radius of the Earth in miles
  const dLat = deg2rad(props.location.latitude - locationsStore.userLocation.lat)
  const dLon = deg2rad(props.location.longitude - locationsStore.userLocation.lng)
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(locationsStore.userLocation.lat)) * Math.cos(deg2rad(props.location.latitude)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in miles
})

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>