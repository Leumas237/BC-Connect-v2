'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useRealtime } from './use-realtime';
import { toast } from 'sonner';

const supabase = createClient();

export interface MatchWithProfile {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  other_profile: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    bio: string | null;
    city: string | null;
    academic_programs: { name: string }[] | null;
    academic_levels: { name: string }[] | null;
    profile_photos: { url: string; is_primary: boolean }[];
    verification_status: string;
    social_accounts?: {
      platform: string;
      username: string;
      display_name: string | null;
      url: string | null;
    }[];
    user_intentions?: {
      intention_type: string;
    }[];
  };
  conversation_id: string | null;
}

export function useMatches() {
  const queryClient = useQueryClient();

  // Subscribe to real-time match updates
  useRealtime('matches', (payload) => {
    if (payload.eventType === 'INSERT') {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Nouveau match ! 🎉');
    }
  }, {
    filter: `user1_id=eq.${supabase.auth.getUser().then(({ data: { user } }) => user?.id)}`
  });

  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user1_id,
          user2_id,
          conversations!conversations_match_id_fkey (id)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch other user's profile for each match
      const matchesWithProfiles = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              date_of_birth,
              bio,
              city,
              academic_programs (name),
              academic_levels (name),
              profile_photos!profile_photos_profile_id_fkey (url, is_primary),
              verification_status
            `)
            .eq('id', otherId)
            .single();

          return {
            ...match,
            other_profile: profile,
            conversation_id: match.conversations?.[0]?.id ?? null,
          };
        })
      );

      return matchesWithProfiles as MatchWithProfile[];
    },
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user1_id,
          user2_id,
          conversations!conversations_match_id_fkey (id)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      const otherId = data.user1_id === user.id ? data.user2_id : data.user1_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          bio,
          city,
          academic_programs (name),
          academic_levels (name),
          profile_photos!profile_photos_profile_id_fkey (url, is_primary),
          verification_status,
          social_accounts (platform, username, display_name, url),
          user_intentions (intention_type)
        `)
        .eq('id', otherId)
        .single();

      return {
        ...data,
        other_profile: profile,
        conversation_id: data.conversations?.[0]?.id ?? null,
      };
    },
    enabled: !!matchId,
  });
}

export function useUnmatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete match (cascades to conversation, messages, social_shares)
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Match supprimé');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
}