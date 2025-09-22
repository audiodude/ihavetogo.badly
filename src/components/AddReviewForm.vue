<template>
  <div class="space-y-6">
    <!-- Star Rating -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Rating *
      </label>
      <div class="flex items-center space-x-1">
        <button
          v-for="star in 5"
          :key="star"
          @click="setRating(star)"
          class="text-2xl transition-colors"
          :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
        >
          ⭐
        </button>
        <span class="ml-2 text-sm text-gray-800">{{ rating }} / 5</span>
      </div>
    </div>

    <!-- Half-star rating slider -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Fine-tune rating (half stars allowed)
      </label>
      <input
        v-model.number="rating"
        type="range"
        min="1"
        max="5"
        step="0.5"
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      >
      <div class="flex justify-between text-xs text-gray-700 mt-1">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>

    <!-- Title -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Review Title
      </label>
      <input
        v-model="title"
        type="text"
        placeholder="e.g., Clean and well-maintained"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
    </div>

    <!-- Address Note -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Location Note
      </label>
      <input
        v-model="addressNote"
        type="text"
        placeholder="e.g., Inside the hotel lobby, across from the restaurant"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
      <p class="text-xs text-gray-700 mt-1">Help others find the exact location within the building</p>
    </div>

    <!-- Review Text -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Review
      </label>
      <textarea
        v-model="reviewText"
        rows="4"
        :maxlength="500"
        placeholder="Share your experience..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
      <div class="flex justify-between text-xs text-gray-700 mt-1">
        <span>Optional</span>
        <span>{{ reviewText.length }}/500</span>
      </div>
    </div>

    <!-- Photo Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Photos (up to 4)
      </label>
      <div class="space-y-3">
        <!-- File input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileSelect"
          class="hidden"
        >

        <button
          @click="() => fileInput?.click()"
          :disabled="photos.length >= 4"
          class="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 px-4 text-center hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="text-gray-700">
            <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="text-sm">Click to add photos</span>
            <p class="text-xs mt-1">PNG, JPG up to 5MB each</p>
          </div>
        </button>

        <!-- Preview uploaded photos -->
        <div v-if="photos.length > 0" class="grid grid-cols-2 gap-3">
          <div
            v-for="(photo, index) in photos"
            :key="index"
            class="relative group"
          >
            <img
              :src="getPhotoPreview(photo)"
              :alt="`Photo ${index + 1}`"
              class="w-full h-24 object-cover rounded-lg border border-gray-200"
            >
            <button
              @click="removePhoto(index)"
              class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ReviewData {
  title: string
  address_note: string
  star_rating: number
  review_text: string
  photos: File[]
}

interface Props {
  modelValue: ReviewData
  isRequired?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: ReviewData]
}>()

const rating = ref(props.modelValue.star_rating)
const title = ref(props.modelValue.title)
const addressNote = ref(props.modelValue.address_note)
const reviewText = ref(props.modelValue.review_text)
const photos = ref<File[]>([...props.modelValue.photos])

const fileInput = ref<HTMLInputElement>()

// Watch for changes and emit updates
watch([rating, title, addressNote, reviewText, photos], () => {
  emit('update:modelValue', {
    title: title.value,
    address_note: addressNote.value,
    star_rating: rating.value,
    review_text: reviewText.value,
    photos: [...photos.value]
  })
}, { deep: true })

const setRating = (star: number) => {
  rating.value = star
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  for (const file of Array.from(files)) {
    if (photos.value.length >= 4) break

    // Validate file type
    if (!file.type.startsWith('image/')) {
      continue
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      continue
    }

    photos.value.push(file)
  }

  // Clear the input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removePhoto = (index: number) => {
  photos.value.splice(index, 1)
}

const getPhotoPreview = (file: File): string => {
  return URL.createObjectURL(file)
}
</script>

<style>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3B82F6;
  cursor: pointer;
  border: none;
}
</style>