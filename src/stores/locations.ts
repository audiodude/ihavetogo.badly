import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuthStore } from './auth'

type Location = Database['public']['Tables']['locations']['Row'] & {
  reviews: Review[]
  city: City
  is_favorited?: boolean
  user_vote?: 'up' | 'down' | null
}

type Review = Database['public']['Tables']['reviews']['Row'] & {
  user_vote?: 'up' | 'down' | null
}

type City = Database['public']['Tables']['cities']['Row']

export const useLocationsStore = defineStore('locations', () => {
  const locations = ref<Location[]>([])
  const cities = ref<City[]>([])
  const currentCity = ref<City | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const filterDistance = ref<number | null>(null)
  const filterWithVotes = ref<boolean | null>(null)
  const userLocation = ref<{ lat: number; lng: number } | null>(null)

  const authStore = useAuthStore()

  const filteredLocations = computed(() => {
    let filtered = locations.value

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(location =>
        location.reviews.some(review =>
          review.title?.toLowerCase().includes(query) ||
          review.address_note?.toLowerCase().includes(query) ||
          review.review_text?.toLowerCase().includes(query)
        ) || location.business_name.toLowerCase().includes(query) ||
          location.address.toLowerCase().includes(query)
      )
    }

    // Distance filter
    if (filterDistance.value && userLocation.value) {
      filtered = filtered.filter(location => {
        const distance = calculateDistance(
          userLocation.value!.lat,
          userLocation.value!.lng,
          location.latitude,
          location.longitude
        )
        return distance <= filterDistance.value!
      })
    }

    // Votes filter
    if (filterWithVotes.value !== null) {
      if (filterWithVotes.value) {
        filtered = filtered.filter(location =>
          (location.upvotes - location.downvotes) > 0
        )
      }
    }

    return filtered
  })

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    cities.value = data
    return data
  }

  const fetchLocations = async (cityId?: string) => {
    loading.value = true
    try {
      let query = supabase
        .from('locations')
        .select(`
          *,
          city:cities(*),
          reviews:reviews(*)
        `)
        .eq('hidden', false)

      if (cityId) {
        query = query.eq('city_id', cityId)
      } else if (currentCity.value) {
        query = query.eq('city_id', currentCity.value.id)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Fetch user votes and favorites if logged in
      if (authStore.isLoggedIn && data) {
        await Promise.all([
          fetchUserVotes(data.map(l => l.id)),
          fetchUserFavorites(data.map(l => l.id))
        ])
      }

      locations.value = data || []
      return data
    } finally {
      loading.value = false
    }
  }

  const fetchUserVotes = async (locationIds: string[]) => {
    if (!authStore.user || locationIds.length === 0) return

    const { data: locationVotes } = await supabase
      .from('votes')
      .select('target_id, vote_type')
      .eq('user_id', authStore.user.id)
      .eq('target_type', 'location')
      .in('target_id', locationIds)

    const { data: reviewIds } = await supabase
      .from('reviews')
      .select('id')
      .in('location_id', locationIds)

    if (reviewIds) {
      const { data: reviewVotes } = await supabase
        .from('votes')
        .select('target_id, vote_type')
        .eq('user_id', authStore.user.id)
        .eq('target_type', 'review')
        .in('target_id', reviewIds.map(r => r.id))

      // Apply votes to locations and reviews
      locations.value = locations.value.map(location => {
        const userVote = locationVotes?.find(v => v.target_id === location.id)
        return {
          ...location,
          user_vote: userVote?.vote_type as 'up' | 'down' | undefined || null,
          reviews: location.reviews?.map(review => {
            const reviewVote = reviewVotes?.find(v => v.target_id === review.id)
            return {
              ...review,
              user_vote: reviewVote?.vote_type as 'up' | 'down' | undefined || null
            }
          }) || []
        }
      })
    }
  }

  const fetchUserFavorites = async (locationIds: string[]) => {
    if (!authStore.user || locationIds.length === 0) return

    const { data } = await supabase
      .from('favorites')
      .select('location_id')
      .eq('user_id', authStore.user.id)
      .in('location_id', locationIds)

    const favoriteIds = new Set(data?.map(f => f.location_id) || [])

    locations.value = locations.value.map(location => ({
      ...location,
      is_favorited: favoriteIds.has(location.id)
    }))
  }

  const createLocation = async (locationData: {
    business_name: string
    address: string
    latitude: number
    longitude: number
    pin_latitude?: number
    pin_longitude?: number
    city_id: string
  }) => {
    if (!authStore.user) {
      throw new Error('User must be logged in to create location')
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...locationData,
        created_by: authStore.user.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  const toggleFavorite = async (locationId: string) => {
    if (!authStore.user) {
      throw new Error('User must be logged in to favorite locations')
    }

    const location = locations.value.find(l => l.id === locationId)
    if (!location) return

    if (location.is_favorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('location_id', locationId)

      if (error) throw error
      location.is_favorited = false
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: authStore.user.id,
          location_id: locationId
        })

      if (error) throw error
      location.is_favorited = true
    }
  }

  const voteLocation = async (locationId: string, voteType: 'up' | 'down') => {
    if (!authStore.user) {
      throw new Error('User must be logged in to vote')
    }

    const location = locations.value.find(l => l.id === locationId)
    if (!location) return

    if (location.user_vote === voteType) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', authStore.user.id)
        .eq('target_id', locationId)
        .eq('target_type', 'location')

      if (error) throw error
      location.user_vote = null
    } else {
      // Add or change vote
      const { error } = await supabase
        .from('votes')
        .upsert({
          user_id: authStore.user.id,
          target_id: locationId,
          target_type: 'location',
          vote_type: voteType
        })

      if (error) throw error
      location.user_vote = voteType
    }

    // Refresh location to get updated vote counts
    await fetchLocations()
  }

  const getUserLocation = async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          userLocation.value = coords
          resolve(coords)
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Radius of the Earth in miles
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in miles
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
  }

  const checkForDuplicates = async (address: string): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        city:cities(*),
        reviews:reviews(*)
      `)
      .eq('hidden', false)
      .ilike('address', `%${address.split(',')[0]}%`) // Match first part of address

    if (error) {
      console.error('Error checking duplicates:', error)
      return []
    }

    return data || []
  }

  const createLocationWithReview = async (locationData: {
    business_name: string
    address: string
    latitude: number
    longitude: number
    pin_latitude?: number
    pin_longitude?: number
    city_id: string
  }, reviewData: {
    title?: string
    address_note?: string
    star_rating: number
    review_text?: string
    photos?: string[]
  }) => {
    if (!authStore.user) {
      throw new Error('User must be logged in to create location')
    }

    // Start a transaction by creating location first
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert({
        ...locationData,
        created_by: authStore.user.id
      })
      .select()
      .single()

    if (locationError) {
      throw locationError
    }

    // Create the initial review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        location_id: location.id,
        user_id: authStore.user.id,
        title: reviewData.title || null,
        address_note: reviewData.address_note || null,
        star_rating: reviewData.star_rating,
        review_text: reviewData.review_text || null,
        photos: reviewData.photos || null
      })

    if (reviewError) {
      // If review creation fails, we should clean up the location
      await supabase.from('locations').delete().eq('id', location.id)
      throw reviewError
    }

    return location
  }

  return {
    locations,
    cities,
    currentCity,
    loading,
    searchQuery,
    filterDistance,
    filterWithVotes,
    userLocation,
    filteredLocations,
    fetchCities,
    fetchLocations,
    createLocation,
    createLocationWithReview,
    checkForDuplicates,
    toggleFavorite,
    voteLocation,
    getUserLocation,
    calculateDistance
  }
})