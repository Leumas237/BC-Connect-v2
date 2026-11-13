'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export interface DiscoveryProfile {
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
}

export interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  genders?: string[];
  maxDistanceKm?: number;
  institutionId?: string;
}

export function useDiscovery(filters: DiscoveryFilters = {}) {
  return useQuery({
    queryKey: ['discovery', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('get_discovery_profiles', {
        p_user_id: user.id,
        p_limit: 20,
        p_offset: 0,
        p_min_age: filters.minAge ?? 18,
        p_max_age: filters.maxAge ?? 30,
        p_genders: filters.genders ?? ['male', 'female', 'non_binary'],
        p_max_distance_km: filters.maxDistanceKm ?? 50,
        p_institution_id: filters.institutionId ?? null,
      });

      if (error) throw error;
      return data as DiscoveryProfile[];
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, swipeType }: { targetId: string; swipeType: 'like' | 'pass' | 'super_like' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: targetId,
          swipe_type: swipeType,
        });

      if (error) throw error;
      return { targetId, swipeType };
    },
    onSuccess: () => {
      // Invalidate discovery to get fresh profiles
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      // Invalidate matches in case a match was created
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      // Invalidate likes received
      queryClient.invalidateQueries({ queryKey: ['likes-received'] });
    },
    onError: (error) => {
      toast.error('Erreur lors du swipe');
      console.error(error);
    },
  });
}

export function useLikesReceived() {
  return useQuery({
    queryKey: ['likes-received'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('swipes')
        .select(`
          id,
          created_at,
          swiper_id,
          swipe_type,
          profiles!swipes_swiper_id_fkey (
            id,
            first_name,
            last_name,
            date_of_birth,
            bio,
            city,
            academic_programs!profiles_academic_program_id_fkey (name),
            academic_levels!profiles_academic_level_id_fkey (name),
            profile_photos!profile_photos_profile_id_fkey (url, is_primary)
          )
        `)
        .eq('swiped_id', user.id)
        .in('swipe_type', ['like', 'super_like'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useSuperLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: targetId,
          swipe_type: 'super_like',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Super Like envoyé !');
    },
    onError: (error) => {
      toast.error('Erreur lors du Super Like');
      console.error(error);
    },
  });
}