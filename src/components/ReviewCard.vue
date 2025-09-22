<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <div class="flex">
            <span v-for="star in 5" :key="star" class="text-yellow-400">
              {{ star <= review.star_rating ? '⭐' : '☆' }}
            </span>
          </div>
          <span class="text-sm text-gray-800">{{ review.star_rating }}/5</span>
        </div>

        <RouterLink
          :to="`/location/${review.location.id}`"
          class="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          {{ review.location.business_name }}
        </RouterLink>
        <p class="text-sm text-gray-800 mt-1">
          {{ review.location.address }}
        </p>
      </div>

      <div class="text-sm text-gray-700">
        {{ formatDate(review.created_at) }}
      </div>
    </div>

    <!-- Review Content -->
    <div class="space-y-3">
      <div v-if="review.title" class="font-medium text-gray-800">
        "{{ review.title }}"
      </div>

      <div v-if="review.address_note" class="text-sm text-gray-800 bg-gray-50 p-3 rounded">
        <span class="font-medium">Location:</span> {{ review.address_note }}
      </div>

      <div v-if="review.review_text" class="text-gray-700">
        {{ review.review_text }}
      </div>

      <!-- Photos -->
      <div v-if="review.photos && review.photos.length > 0" class="grid grid-cols-2 gap-2">
        <img
          v-for="(photo, index) in review.photos.slice(0, 4)"
          :key="index"
          :src="photo"
          :alt="`Review photo ${index + 1}`"
          class="w-full h-24 object-cover rounded border border-gray-200"
          @error="handleImageError"
        >
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
      <div class="flex items-center space-x-4 text-sm text-gray-800">
        <span class="flex items-center space-x-1">
          <span>👍</span>
          <span>{{ review.upvotes || 0 }}</span>
        </span>
        <span class="flex items-center space-x-1">
          <span>👎</span>
          <span>{{ review.downvotes || 0 }}</span>
        </span>
      </div>

      <RouterLink
        :to="`/location/${review.location.id}`"
        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Location →
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Review {
  id: string
  title?: string | null
  address_note?: string | null
  star_rating: number
  review_text?: string | null
  photos?: string[] | null
  created_at: string
  upvotes: number
  downvotes: number
  location: {
    id: string
    business_name: string
    address: string
    city: {
      name: string
      state: string
    }
  }
}

interface Props {
  review: Review
}

defineProps<Props>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>