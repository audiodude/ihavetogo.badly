<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-800">Add New Bathroom Location</h1>
        <p class="text-gray-600 mt-1">Help others find clean, accessible bathrooms in your area</p>
      </div>

      <div class="p-6">
        <!-- Step indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-600">Step {{ currentStep }} of 3</span>
            <span class="text-sm text-gray-500">{{ stepTitles[currentStep - 1] }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                 :style="{ width: `${(currentStep / 3) * 100}%` }"></div>
          </div>
        </div>

        <!-- Step 1: Location Details -->
        <div v-show="currentStep === 1" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              v-model="formData.business_name"
              type="text"
              placeholder="e.g., Starbucks Potrero Hill"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              v-model="formData.address"
              type="text"
              placeholder="e.g., 123 Front St, San Francisco CA 94111"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              @blur="handleAddressBlur"
            >
          </div>

          <!-- Geocoding results -->
          <div v-if="geocodingResults.length > 0" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Select the correct address:
            </label>
            <div class="space-y-2">
              <button
                v-for="(result, index) in geocodingResults"
                :key="index"
                @click="selectGeocodingResult(result)"
                class="w-full text-left p-3 border rounded-lg hover:border-blue-500 transition-colors"
                :class="selectedGeocoding?.formatted_address === result.formatted_address
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'"
              >
                <div class="font-medium">{{ result.formatted_address }}</div>
                <div class="text-sm text-gray-600">
                  Confidence: {{ result.confidence }}/10
                </div>
              </button>
            </div>
          </div>

          <!-- City validation -->
          <div v-if="selectedGeocoding && !isInSupportedCity"
               class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 font-medium">⚠️ Unsupported Location</p>
            <p class="text-red-700 text-sm mt-1">
              This location is not in a supported city. Currently supported cities are:
              {{ locationsStore.cities.map(c => `${c.name}, ${c.state}`).join(', ') }}
            </p>
          </div>
        </div>

        <!-- Step 2: Pin Location -->
        <div v-show="currentStep === 2" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Precise Bathroom Location</h3>
            <p class="text-gray-600 mb-4">
              Click on the map to show exactly where the bathroom is located within the building.
              This is optional but helps users find the bathroom more easily.
            </p>
          </div>

          <div class="relative">
            <div ref="pinMapContainer" class="w-full h-96 border border-gray-300 rounded-lg"></div>

            <div v-if="pinTooFar" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-yellow-800 font-medium">⚠️ Pin Location Warning</p>
              <p class="text-yellow-700 text-sm mt-1">
                The pin you placed is {{ Math.round(pinDistance) }} feet from the address.
                Please ensure this is the correct location.
              </p>
            </div>

            <div class="mt-4 flex items-center space-x-4">
              <button
                v-if="formData.pin_latitude"
                @click="clearPin"
                class="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
              >
                Clear Pin
              </button>
              <p v-if="formData.pin_latitude" class="text-sm text-gray-600">
                Pin placed at {{ formData.pin_latitude?.toFixed(6) }}, {{ formData.pin_longitude?.toFixed(6) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-show="currentStep === 3" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Add Initial Review</h3>
            <p class="text-gray-600 mb-4">
              A review is required when adding a new location to help others know what to expect.
            </p>
          </div>

          <AddReviewForm
            v-model="reviewData"
            :is-required="true"
          />

          <!-- Location Summary -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium mb-2">Location Summary</h4>
            <p><strong>Business:</strong> {{ formData.business_name }}</p>
            <p><strong>Address:</strong> {{ formData.address }}</p>
            <p v-if="formData.pin_latitude"><strong>Custom pin:</strong> Yes</p>
            <p v-if="selectedCity"><strong>City:</strong> {{ selectedCity.name }}, {{ selectedCity.state }}</p>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex justify-between pt-6 border-t border-gray-200 mt-8">
          <button
            v-if="currentStep > 1"
            @click="currentStep--"
            class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Back
          </button>
          <div v-else></div>

          <div class="space-x-4">
            <button
              v-if="currentStep < 3"
              @click="nextStep"
              :disabled="!canProceed"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              Next
            </button>
            <button
              v-else
              @click="submitLocation"
              :disabled="submitting || !canSubmit"
              class="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              {{ submitting ? 'Adding...' : 'Add Location' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import L from 'leaflet'
import { useLocationsStore } from '@/stores/locations'
import { useAuthStore } from '@/stores/auth'
import { GeocodingService, type GeocodingResult } from '@/services/geocoding'
import AddReviewForm from '@/components/AddReviewForm.vue'

const router = useRouter()
const toast = useToast()
const locationsStore = useLocationsStore()
const authStore = useAuthStore()

const currentStep = ref(1)
const stepTitles = ['Location Details', 'Pin Location', 'Add Review']
const submitting = ref(false)

const formData = ref({
  business_name: '',
  address: '',
  latitude: 0,
  longitude: 0,
  pin_latitude: null as number | null,
  pin_longitude: null as number | null,
  city_id: ''
})

const reviewData = ref({
  title: '',
  address_note: '',
  star_rating: 5,
  review_text: '',
  photos: [] as File[]
})

const geocodingResults = ref<GeocodingResult[]>([])
const selectedGeocoding = ref<GeocodingResult | null>(null)

let pinMap: L.Map | null = null
const pinMapContainer = ref<HTMLElement>()
let pinMarker: L.Marker | null = null

const selectedCity = computed(() => {
  if (!selectedGeocoding.value) return null
  return locationsStore.cities.find(city => {
    const state = selectedGeocoding.value!.components.state
    return city.state === state || city.name.toLowerCase() === selectedGeocoding.value!.components.city?.toLowerCase()
  })
})

const isInSupportedCity = computed(() => !!selectedCity.value)

const pinDistance = computed(() => {
  if (!formData.value.pin_latitude || !selectedGeocoding.value) return 0
  return GeocodingService.distanceToFeet(
    GeocodingService.calculateDistance(
      selectedGeocoding.value.latitude,
      selectedGeocoding.value.longitude,
      formData.value.pin_latitude,
      formData.value.pin_longitude!
    )
  )
})

const pinTooFar = computed(() => {
  // TODO: Get this from app settings
  const maxDistance = 500 // feet
  return pinDistance.value > maxDistance
})

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.business_name && formData.value.address && selectedGeocoding.value && isInSupportedCity.value
  }
  return true
})

const canSubmit = computed(() => {
  return canProceed.value && reviewData.value.star_rating > 0
})

onMounted(async () => {
  await locationsStore.fetchCities()
})

onUnmounted(() => {
  if (pinMap) {
    pinMap.remove()
  }
})

const handleAddressBlur = async () => {
  if (!formData.value.address) return

  try {
    geocodingResults.value = await GeocodingService.geocodeAddress(formData.value.address)
  } catch (error) {
    console.error('Geocoding error:', error)
    toast.error('Failed to find address. Please check your input.')
  }
}

const selectGeocodingResult = (result: GeocodingResult) => {
  selectedGeocoding.value = result
  formData.value.latitude = result.latitude
  formData.value.longitude = result.longitude

  if (selectedCity.value) {
    formData.value.city_id = selectedCity.value.id
  }
}

const nextStep = () => {
  if (currentStep.value === 2 && !pinMap) {
    initializePinMap()
  }
  currentStep.value++
}

const initializePinMap = () => {
  if (!pinMapContainer.value || !selectedGeocoding.value) return

  pinMap = L.map(pinMapContainer.value).setView(
    [selectedGeocoding.value.latitude, selectedGeocoding.value.longitude],
    18
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(pinMap)

  // Add main location marker
  const mainIcon = L.divIcon({
    html: '<div class="bg-blue-500 rounded-full w-6 h-6 border-2 border-white shadow-lg"></div>',
    className: 'main-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  L.marker([selectedGeocoding.value.latitude, selectedGeocoding.value.longitude], { icon: mainIcon })
    .addTo(pinMap)
    .bindPopup('Main Address Location')

  // Click handler for adding pin
  pinMap.on('click', (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    formData.value.pin_latitude = lat
    formData.value.pin_longitude = lng

    // Remove existing pin marker
    if (pinMarker) {
      pinMap!.removeLayer(pinMarker)
    }

    // Add new pin marker
    const pinIcon = L.divIcon({
      html: '📍',
      className: 'pin-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    })

    pinMarker = L.marker([lat, lng], { icon: pinIcon })
      .addTo(pinMap!)
      .bindPopup('Bathroom Location')
  })
}

const clearPin = () => {
  formData.value.pin_latitude = null
  formData.value.pin_longitude = null
  if (pinMarker && pinMap) {
    pinMap.removeLayer(pinMarker)
    pinMarker = null
  }
}

const submitLocation = async () => {
  if (!authStore.user || !selectedCity.value) return

  submitting.value = true
  try {
    // Check for duplicates first
    await checkForDuplicates()

    // TODO: Upload photos to Supabase storage first
    const photoUrls: string[] = []

    // Create location with initial review
    const location = await locationsStore.createLocationWithReview({
      business_name: formData.value.business_name,
      address: formData.value.address,
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      pin_latitude: formData.value.pin_latitude ?? undefined,
      pin_longitude: formData.value.pin_longitude ?? undefined,
      city_id: selectedCity.value.id
    }, {
      title: reviewData.value.title,
      address_note: reviewData.value.address_note,
      star_rating: reviewData.value.star_rating,
      review_text: reviewData.value.review_text,
      photos: photoUrls
    })

    toast.success('Location added successfully!')
    router.push(`/location/${location.id}`)
  } catch (error) {
    console.error('Error adding location:', error)
    if (error instanceof Error && error.message.includes('cancelled')) {
      toast.info('Location creation cancelled')
    } else {
      toast.error('Failed to add location')
    }
  } finally {
    submitting.value = false
  }
}

const checkForDuplicates = async () => {
  const duplicates = await locationsStore.checkForDuplicates(formData.value.address)

  if (duplicates.length > 0) {
    // Show duplicate confirmation dialog
    const confirmed = confirm(
      `We found ${duplicates.length} existing locations at or near this address:\n\n` +
      duplicates.map(d => `• ${d.business_name}`).join('\n') +
      '\n\nAre you sure you want to add a new location here?'
    )

    if (!confirmed) {
      throw new Error('Location creation cancelled due to duplicates')
    }
  }
}
</script>

<style>
.main-location-marker,
.pin-marker {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>