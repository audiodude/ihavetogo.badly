<template>
  <div class="space-y-4">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="locationsStore.searchQuery"
        type="text"
        placeholder="Search by business name, review, or location..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
        </svg>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- City Filter -->
      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">City:</label>
        <select
          v-model="selectedCity"
          @change="onCityChange"
          class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">All Cities</option>
          <option
            v-for="city in locationsStore.cities"
            :key="city.id"
            :value="city.id"
          >
            {{ city.name }}, {{ city.state }}
          </option>
        </select>
      </div>

      <!-- Distance Filter -->
      <div v-if="locationsStore.userLocation" class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">Within:</label>
        <select
          v-model="locationsStore.filterDistance"
          class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option :value="null">Any distance</option>
          <option :value="0.5">0.5 miles</option>
          <option :value="1">1 mile</option>
          <option :value="2">2 miles</option>
          <option :value="5">5 miles</option>
          <option :value="10">10 miles</option>
        </select>
      </div>

      <!-- Votes Filter -->
      <div class="flex items-center space-x-2">
        <label class="text-sm font-medium text-gray-700">Votes:</label>
        <select
          v-model="locationsStore.filterWithVotes"
          class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option :value="null">All locations</option>
          <option :value="true">Positive votes only</option>
        </select>
      </div>

      <!-- Results count -->
      <div class="flex-1 text-right">
        <span class="text-sm text-gray-500">
          {{ locationsStore.filteredLocations.length }}
          {{ locationsStore.filteredLocations.length === 1 ? 'location' : 'locations' }} found
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocationsStore } from '@/stores/locations'

const locationsStore = useLocationsStore()
const selectedCity = ref('')

const onCityChange = async () => {
  if (selectedCity.value) {
    const city = locationsStore.cities.find(c => c.id === selectedCity.value)
    if (city) {
      locationsStore.currentCity = city
      await locationsStore.fetchLocations(selectedCity.value)
    }
  } else {
    locationsStore.currentCity = null
    await locationsStore.fetchLocations()
  }
}
</script>