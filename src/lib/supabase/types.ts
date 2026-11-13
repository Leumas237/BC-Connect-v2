// Database types generated from Supabase
// Run: npx supabase gen types typescript --local > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          address: string | null;
          city: string | null;
          country: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          institution_id: string | null;
          faculty_id: string | null;
          department_id: string | null;
          academic_program_id: string | null;
          academic_level_id: string | null;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
          bio: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          max_distance_km: number;
          min_age_preference: number;
          max_age_preference: number;
          preferred_genders: string[];
          is_verified: boolean;
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
          verification_document_url: string | null;
          verification_submitted_at: string | null;
          verification_reviewed_at: string | null;
          verification_reviewed_by: string | null;
          verification_rejection_reason: string | null;
          is_online: boolean;
          last_active_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          institution_id?: string | null;
          faculty_id?: string | null;
          department_id?: string | null;
          academic_program_id?: string | null;
          academic_level_id?: string | null;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
          bio?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          max_distance_km?: number;
          min_age_preference?: number;
          max_age_preference?: number;
          preferred_genders?: string[];
          is_verified?: boolean;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          verification_document_url?: string | null;
          verification_submitted_at?: string | null;
          verification_reviewed_at?: string | null;
          verification_reviewed_by?: string | null;
          verification_rejection_reason?: string | null;
          is_online?: boolean;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string | null;
          faculty_id?: string | null;
          department_id?: string | null;
          academic_program_id?: string | null;
          academic_level_id?: string | null;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
          bio?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          max_distance_km?: number;
          min_age_preference?: number;
          max_age_preference?: number;
          preferred_genders?: string[];
          is_verified?: boolean;
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          verification_document_url?: string | null;
          verification_submitted_at?: string | null;
          verification_reviewed_at?: string | null;
          verification_reviewed_by?: string | null;
          verification_rejection_reason?: string | null;
          is_online?: boolean;
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_photos: {
        Row: {
          id: string;
          profile_id: string | null;
          storage_path: string;
          url: string;
          is_primary: boolean;
          display_order: number;
          is_moderated: boolean;
          moderation_status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          storage_path: string;
          url: string;
          is_primary?: boolean;
          display_order?: number;
          is_moderated?: boolean;
          moderation_status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          storage_path?: string;
          url?: string;
          is_primary?: boolean;
          display_order?: number;
          is_moderated?: boolean;
          moderation_status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      interests: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
      };
      // ... other tables would be defined here
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_age: {
        Args: { birth_date: string };
        Returns: number;
      };
      get_discovery_profiles: {
        Args: {
          p_user_id: string;
          p_limit?: number;
          p_offset?: number;
          p_min_age?: number;
          p_max_age?: number;
          p_genders?: string[];
          p_max_distance_km?: number;
          p_institution_id?: string;
        };
        Returns: {
          id: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          bio: string | null;
          city: string | null;
          academic_program_name: string | null;
          academic_level_name: string | null;
          primary_photo_url: string | null;
          interests: string[];
          intentions: string[];
          verification_status: string;
          distance_km: number | null;
          common_interests_count: number;
        }[];
      };
      // ... other functions
    };
    Enums: {
      gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
      verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
      swipe_type: 'like' | 'pass' | 'super_like';
      intention_type: 'dating' | 'friendship' | 'networking';
      report_type: 'profile' | 'message' | 'photo' | 'spam' | 'harassment' | 'fake_profile' | 'inappropriate_content' | 'other';
      report_status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
      notification_type: 'match' | 'message' | 'like' | 'super_like' | 'verification_approved' | 'verification_rejected' | 'report_resolved' | 'admin_announcement' | 'ad_click';
      ad_campaign_status: 'draft' | 'pending_approval' | 'scheduled' | 'active' | 'expired' | 'disabled';
      payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
      admin_role: 'super_admin' | 'institution_admin' | 'moderator' | 'advertising_manager';
      social_platform: 'instagram' | 'snapchat' | 'tiktok' | 'facebook' | 'whatsapp' | 'discord' | 'x' | 'other';
      message_type: 'text' | 'image' | 'social_share';
      moderation_status: 'pending' | 'approved' | 'rejected';
      document_status: 'pending' | 'approved' | 'rejected';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
    ? PublicTableNameOrOptions
    : never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type Profile = Tables<{ schema: 'public' }, 'profiles'>;
export type Institution = Tables<{ schema: 'public' }, 'institutions'>;
export type Faculty = Record<string, never>;
export type Department = Record<string, never>;
export type AcademicProgram = Record<string, never>;
export type AcademicLevel = Record<string, never>;
export type ProfilePhoto = Tables<{ schema: 'public' }, 'profile_photos'>;
export type Interest = Tables<{ schema: 'public' }, 'interests'>;
export type Swipe = Record<string, never>;
export type Match = Record<string, never>;
export type Conversation = Record<string, never>;
export type Message = Record<string, never>;
export type SocialAccount = Record<string, never>;
export type Notification = Record<string, never>;
export type AdCampaign = Record<string, never>;
export type Block = Record<string, never>;
export type Report = Record<string, never>;