<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useLocationsStore } from '@/stores/locations'
import { useAuthStore } from '@/stores/auth'
import MapComponent from '@/components/MapComponent.vue'
import SearchFilters from '@/components/SearchFilters.vue'
import LocationsList from '@/components/LocationsList.vue'

const router = useRouter()
const toast = useToast()
const locationsStore = useLocationsStore()
const authStore = useAuthStore()

const showMap = ref(true)
const loadingLocation = ref(false)

const hasLocations = computed(() => locationsStore.locations.length > 0)

onMounted(async () => {
  try {
    await locationsStore.fetchCities()

    // Try to get user's location
    if (navigator.geolocation) {
      loadingLocation.value = true
      try {
        await locationsStore.getUserLocation()
      } catch (error) {
        console.warn('Could not get user location:', error)
      } finally {
        loadingLocation.value = false
      }
    }

    await locationsStore.fetchLocations()
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Failed to load locations')
  }
})

const toggleView = () => {
  showMap.value = !showMap.value
}

const goToAddLocation = () => {
  if (!authStore.isLoggedIn) {
    toast.info('Please sign in to add a location')
    return
  }
  router.push('/add-location')
}
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- Search and Filters -->
    <div class="bg-white shadow-sm border-b px-4 py-4">
      <SearchFilters />

      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center space-x-4">
          <button
            @click="toggleView"
            class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span v-if="showMap">📋</span>
            <span v-else>🗺️</span>
            <span>{{ showMap ? 'List View' : 'Map View' }}</span>
          </button>

          <span v-if="loadingLocation" class="text-sm text-gray-500">
            Getting your location...
          </span>
        </div>

        <button
          @click="goToAddLocation"
          class="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <span>➕</span>
          <span>Add Location</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 relative">
      <div v-if="!hasLocations && !locationsStore.loading"
           class="absolute inset-0 flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="text-6xl mb-4">🚽</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">No bathrooms found</h2>
          <p class="text-gray-600 mb-6">Be the first to add a bathroom in your area!</p>
          <button
            @click="goToAddLocation"
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Add First Location
          </button>
        </div>
      </div>

      <div v-else-if="locationsStore.loading"
           class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading locations...</p>
        </div>
      </div>

      <MapComponent v-else-if="showMap" />
      <LocationsList v-else />
    </div>
  </div>
</template>
