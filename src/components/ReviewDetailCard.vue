<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <div class="flex">
            <span v-for="star in 5" :key="star" class="text-yellow-400 text-lg">
              {{ star <= review.star_rating ? '⭐' : '☆' }}
            </span>
          </div>
          <span class="text-sm text-gray-600">{{ review.star_rating }}/5</span>
        </div>

        <div class="text-sm text-gray-500">
          {{ formatDate(review.created_at) }}
        </div>
      </div>

      <!-- Vote buttons -->
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('vote', review.id, 'up')"
          class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors"
          :class="review.user_vote === 'up'
            ? 'bg-green-100 text-green-700'
            : 'hover:bg-gray-100 text-gray-600'"
        >
          <span>👍</span>
          <span class="text-sm font-medium">{{ review.upvotes || 0 }}</span>
        </button>

        <button
          @click="$emit('vote', review.id, 'down')"
          class="flex items-center space-x-1 px-3 py-1 rounded-full transition-colors"
          :class="review.user_vote === 'down'
            ? 'bg-red-100 text-red-700'
            : 'hover:bg-gray-100 text-gray-600'"
        >
          <span>👎</span>
          <span class="text-sm font-medium">{{ review.downvotes || 0 }}</span>
        </button>
      </div>
    </div>

    <!-- Review Content -->
    <div class="space-y-4">
      <!-- Title -->
      <div v-if="review.title" class="font-semibold text-lg text-gray-800">
        "{{ review.title }}"
      </div>

      <!-- Address Note -->
      <div v-if="review.address_note" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-start space-x-2">
          <span class="text-blue-600 text-sm font-medium">📍 Location Note:</span>
          <span class="text-blue-800 text-sm">{{ review.address_note }}</span>
        </div>
      </div>

      <!-- Review Text -->
      <div v-if="review.review_text" class="text-gray-700 leading-relaxed">
        {{ review.review_text }}
      </div>

      <!-- Photos -->
      <div v-if="review.photos && review.photos.length > 0" class="space-y-2">
        <h4 class="font-medium text-gray-800">Photos</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="(photo, index) in review.photos"
            :key="index"
            class="relative group cursor-pointer"
            @click="openPhotoModal(photo, index)"
          >
            <img
              :src="photo"
              :alt="`Review photo ${index + 1}`"
              class="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity"
              @error="handleImageError"
            >
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <PhotoModal
      v-if="showPhotoModal"
      :photos="review.photos || []"
      :current-index="currentPhotoIndex"
      @close="showPhotoModal = false"
      @next="nextPhoto"
      @prev="prevPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PhotoModal from './PhotoModal.vue'

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
  user_vote?: 'up' | 'down' | null
}

interface Props {
  review: Review
}

const props = defineProps<Props>()
const emit = defineEmits<{
  vote: [reviewId: string, voteType: 'up' | 'down']
}>()

const showPhotoModal = ref(false)
const currentPhotoIndex = ref(0)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const openPhotoModal = (photo: string, index: number) => {
  currentPhotoIndex.value = index
  showPhotoModal.value = true
}

const nextPhoto = () => {
  if (!props.review.photos) return
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % props.review.photos.length
}

const prevPhoto = () => {
  if (!props.review.photos) return
  currentPhotoIndex.value = currentPhotoIndex.value === 0
    ? props.review.photos.length - 1
    : currentPhotoIndex.value - 1
}
</script>