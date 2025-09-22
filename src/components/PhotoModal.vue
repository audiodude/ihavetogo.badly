<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
    <!-- Close button -->
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-60"
    >
      ×
    </button>

    <!-- Navigation buttons -->
    <button
      v-if="photos.length > 1"
      @click="$emit('prev')"
      class="absolute left-4 text-white hover:text-gray-300 text-3xl z-60"
    >
      ‹
    </button>

    <button
      v-if="photos.length > 1"
      @click="$emit('next')"
      class="absolute right-4 text-white hover:text-gray-300 text-3xl z-60"
    >
      ›
    </button>

    <!-- Main photo -->
    <div class="max-w-4xl max-h-full p-4">
      <img
        :src="currentPhoto"
        :alt="`Photo ${currentIndex + 1}`"
        class="max-w-full max-h-full object-contain rounded-lg"
        @error="handleImageError"
      >
    </div>

    <!-- Photo counter -->
    <div v-if="photos.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
      {{ currentIndex + 1 }} / {{ photos.length }}
    </div>

    <!-- Thumbnails -->
    <div v-if="photos.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-8">
      <div class="flex space-x-2">
        <button
          v-for="(photo, index) in photos"
          :key="index"
          @click="$emit('setIndex', index)"
          class="w-12 h-12 rounded border-2 transition-all"
          :class="index === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'"
        >
          <img
            :src="photo"
            :alt="`Thumbnail ${index + 1}`"
            class="w-full h-full object-cover rounded"
            @error="handleImageError"
          >
        </button>
      </div>
    </div>

    <!-- Click outside to close -->
    <div
      class="absolute inset-0 -z-10"
      @click="$emit('close')"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  photos: string[]
  currentIndex: number
}

const props = defineProps<Props>()
defineEmits<{
  close: []
  next: []
  prev: []
  setIndex: [index: number]
}>()

const currentPhoto = computed(() => props.photos[props.currentIndex])

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>