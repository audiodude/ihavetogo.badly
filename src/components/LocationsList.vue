<template>
  <div class="p-4 overflow-y-auto">
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <LocationCard
        v-for="location in locationsStore.filteredLocations"
        :key="location.id"
        :location="location"
        @favorite="handleFavorite"
        @vote="handleVote"
      />
    </div>

    <div v-if="locationsStore.filteredLocations.length === 0"
         class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No locations found</h3>
      <p class="text-gray-700">Try adjusting your search or filters</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useLocationsStore } from '@/stores/locations'
import { useAuthStore } from '@/stores/auth'
import LocationCard from '@/components/LocationCard.vue'

const toast = useToast()
const locationsStore = useLocationsStore()
const authStore = useAuthStore()

const handleFavorite = async (locationId: string) => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to favorite locations')
    return
  }

  try {
    await locationsStore.toggleFavorite(locationId)
    const location = locationsStore.locations.find(l => l.id === locationId)
    toast.success(
      location?.is_favorited
        ? 'Added to favorites!'
        : 'Removed from favorites'
    )
  } catch (error) {
    console.error('Error toggling favorite:', error)
    toast.error('Failed to update favorite')
  }
}

const handleVote = async (locationId: string, voteType: 'up' | 'down') => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to vote')
    return
  }

  try {
    await locationsStore.voteLocation(locationId, voteType)
    toast.success('Vote recorded!')
  } catch (error) {
    console.error('Error voting:', error)
    toast.error('Failed to record vote')
  }
}
</script>