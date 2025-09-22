import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          is_admin: boolean
          daily_review_limit: number
          pending_invitations: number
          last_invitation_received: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          is_admin?: boolean
          daily_review_limit?: number
          pending_invitations?: number
          last_invitation_received?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          is_admin?: boolean
          daily_review_limit?: number
          pending_invitations?: number
          last_invitation_received?: string | null
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          state: string
          country: string
          bounds: any
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          country: string
          bounds: any
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          country?: string
          bounds?: any
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          pin_latitude: number | null
          pin_longitude: number | null
          city_id: string
          created_by: string
          created_at: string
          hidden: boolean
          upvotes: number
          downvotes: number
        }
        Insert: {
          id?: string
          business_name: string
          address: string
          latitude: number
          longitude: number
          pin_latitude?: number | null
          pin_longitude?: number | null
          city_id: string
          created_by: string
          created_at?: string
          hidden?: boolean
          upvotes?: number
          downvotes?: number
        }
        Update: {
          id?: string
          business_name?: string
          address?: string
          latitude?: number
          longitude?: number
          pin_latitude?: number | null
          pin_longitude?: number | null
          city_id?: string
          created_by?: string
          created_at?: string
          hidden?: boolean
          upvotes?: number
          downvotes?: number
        }
      }
      reviews: {
        Row: {
          id: string
          location_id: string
          user_id: string
          title: string | null
          address_note: string | null
          star_rating: number
          review_text: string | null
          photos: string[] | null
          created_at: string
          hidden: boolean
          upvotes: number
          downvotes: number
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          title?: string | null
          address_note?: string | null
          star_rating: number
          review_text?: string | null
          photos?: string[] | null
          created_at?: string
          hidden?: boolean
          upvotes?: number
          downvotes?: number
        }
        Update: {
          id?: string
          location_id?: string
          user_id?: string
          title?: string | null
          address_note?: string | null
          star_rating?: number
          review_text?: string | null
          photos?: string[] | null
          created_at?: string
          hidden?: boolean
          upvotes?: number
          downvotes?: number
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: 'location' | 'review'
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: 'location' | 'review'
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: 'location' | 'review'
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          location_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location_id?: string
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          access_code: string
          created_by: string
          sent_to_email: string
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          access_code: string
          created_by: string
          sent_to_email: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          access_code?: string
          created_by?: string
          sent_to_email?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_user_id: string
          action_type: string
          target_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id: string
          action_type: string
          target_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_user_id?: string
          action_type?: string
          target_id?: string
          reason?: string | null
          created_at?: string
        }
      }
      app_settings: {
        Row: {
          key: string
          value: any
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}