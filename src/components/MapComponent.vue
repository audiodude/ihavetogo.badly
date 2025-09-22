<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { useLocationsStore } from '@/stores/locations'

// Fix Leaflet's default icon issue with bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

const router = useRouter()
const locationsStore = useLocationsStore()
const mapContainer = ref<HTMLElement>()
let map: L.Map | null = null
const markers: L.Marker[] = []

// Default center (San Francisco Mission District)
const DEFAULT_CENTER: [number, number] = [37.7599, -122.4148]
const DEFAULT_ZOOM = 13

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

watch(() => locationsStore.filteredLocations, () => {
  updateMarkers()
}, { deep: true })

const initializeMap = () => {
  if (!mapContainer.value) return

  // Determine initial center and zoom
  let center = DEFAULT_CENTER
  let zoom = DEFAULT_ZOOM

  if (locationsStore.userLocation) {
    center = [locationsStore.userLocation.lat, locationsStore.userLocation.lng]
  }

  map = L.map(mapContainer.value).setView(center, zoom)

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  // Add user location marker if available
  if (locationsStore.userLocation) {
    const userIcon = L.divIcon({
      html: '<div class="bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg"></div>',
      className: 'user-location-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    L.marker([locationsStore.userLocation.lat, locationsStore.userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location')
  }

  updateMarkers()
}

const updateMarkers = () => {
  if (!map) return

  // Clear existing markers
  markers.forEach(marker => map!.removeLayer(marker))
  markers.length = 0

  // Add markers for each location
  locationsStore.filteredLocations.forEach(location => {
    const isFavorited = location.is_favorited
    const netVotes = location.upvotes - location.downvotes

    // Create custom icon based on status
    let iconHtml = '🚽'
    if (isFavorited) {
      iconHtml = '⭐'
    } else if (netVotes > 5) {
      iconHtml = '🌟'
    } else if (netVotes < -2) {
      iconHtml = '⚠️'
    }

    const customIcon = L.divIcon({
      html: `<div class="text-2xl">${iconHtml}</div>`,
      className: 'bathroom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    // Use pin location if available, otherwise use geocoded location
    const lat = location.pin_latitude ?? location.latitude
    const lng = location.pin_longitude ?? location.longitude

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map!)

    // Create popup content
    const averageRating = location.reviews.length > 0
      ? location.reviews.reduce((sum, review) => sum + review.star_rating, 0) / location.reviews.length
      : 0

    const popupContent = `
      <div class="p-2 min-w-64">
        <h3 class="font-bold text-lg mb-1">${location.business_name}</h3>
        <p class="text-sm text-gray-800 mb-2">${location.address}</p>

        ${averageRating > 0 ? `
          <div class="flex items-center space-x-2 mb-2">
            <div class="flex">
              ${generateStarRating(averageRating)}
            </div>
            <span class="text-sm text-gray-700">(${location.reviews.length} reviews)</span>
          </div>
        ` : '<p class="text-sm text-gray-700 mb-2">No reviews yet</p>'}

        <div class="flex items-center space-x-4 text-sm">
          <span class="text-green-600">👍 ${location.upvotes}</span>
          <span class="text-red-600">👎 ${location.downvotes}</span>
          ${isFavorited ? '<span class="text-yellow-600">⭐ Favorited</span>' : ''}
        </div>

        <button
          onclick="window.viewLocation('${location.id}')"
          class="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium"
        >
          View Details
        </button>
      </div>
    `

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      minWidth: 250
    })

    markers.push(marker)
  })

  // Fit bounds to show all markers if there are any
  if (markers.length > 0) {
    const group = new L.FeatureGroup(markers)
    map.fitBounds(group.getBounds(), { padding: [20, 20] })
  }
}

const generateStarRating = (rating: number): string => {
  let stars = ''
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += '⭐'
    } else if (rating >= i - 0.5) {
      stars += '⭐' // Half stars aren't easily displayable with emojis
    } else {
      stars += '☆'
    }
  }
  return stars
}

// Global function to handle popup click
;(window as any).viewLocation = (locationId: string) => {
  router.push(`/location/${locationId}`)
}
</script>

<style>
.bathroom-marker {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-location-marker {
  background: transparent;
  border: none;
}
</style>