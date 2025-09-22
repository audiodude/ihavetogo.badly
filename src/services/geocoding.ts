const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY
const OPENCAGE_BASE_URL = 'https://api.opencagedata.com/geocode/v1/json'

export interface GeocodingResult {
  latitude: number
  longitude: number
  formatted_address: string
  confidence: number
  components: {
    country?: string
    state?: string
    city?: string
    postcode?: string
    road?: string
    house_number?: string
  }
}

export class GeocodingService {
  static async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    if (!OPENCAGE_API_KEY) {
      throw new Error('OpenCage API key not configured')
    }

    const response = await fetch(
      `${OPENCAGE_BASE_URL}?q=${encodeURIComponent(address)}&key=${OPENCAGE_API_KEY}&countrycode=us&limit=5`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.results.length === 0) {
      throw new Error('No results found for this address')
    }

    return data.results.map((result: any) => ({
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
      formatted_address: result.formatted,
      confidence: result.confidence,
      components: result.components
    }))
  }

  static async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    if (!OPENCAGE_API_KEY) {
      throw new Error('OpenCage API key not configured')
    }

    const response = await fetch(
      `${OPENCAGE_BASE_URL}?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&limit=1`
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.results.length === 0) {
      throw new Error('No address found for these coordinates')
    }

    const result = data.results[0]
    return {
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
      formatted_address: result.formatted,
      confidence: result.confidence,
      components: result.components
    }
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Radius of the Earth in miles
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in miles
  }

  static deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  static distanceToFeet(miles: number): number {
    return miles * 5280
  }

  static feetToMiles(feet: number): number {
    return feet / 5280
  }
}