'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export interface SocialAccount {
  id: string;
  profile_id: string;
  platform: 'instagram' | 'snapchat' | 'tiktok' | 'facebook' | 'whatsapp' | 'discord' | 'x' | 'other';
  username: string | null;
  url: string | null;
  display_name: string | null;
  is_visible_by_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialShare {
  id: string;
  match_id: string;
  profile_id: string;
  social_account_id: string;
  is_shared: boolean;
  shared_at: string | null;
  created_at: string;
  social_account?: SocialAccount;
}

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: 'instagram', urlPattern: 'https://instagram.com/{username}' },
  { value: 'snapchat', label: 'Snapchat', icon: 'ghost', urlPattern: 'https://snapchat.com/add/{username}' },
  { value: 'tiktok', label: 'TikTok', icon: 'music', urlPattern: 'https://tiktok.com/@{username}' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook', urlPattern: 'https://facebook.com/{username}' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', urlPattern: 'https://wa.me/{username}' },
  { value: 'discord', label: 'Discord', icon: 'hash', urlPattern: 'https://discord.com/users/{username}' },
  { value: 'x', label: 'X (Twitter)', icon: 'twitter', urlPattern: 'https://x.com/{username}' },
  { value: 'other', label: 'Autre', icon: 'link', urlPattern: '' },
] as const;

export function useSocialAccounts(userId?: string) {
  return useQuery({
    queryKey: ['social-accounts', userId],
    queryFn: async () => {
      const targetId = userId;
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('profile_id', targetId)
        .order('platform');

      if (error) throw error;
      return data as SocialAccount[];
    },
    enabled: !!userId,
  });
}

export function useMySocialAccounts() {
  return useQuery({
    queryKey: ['my-social-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('profile_id', user.id)
        .order('platform');

      if (error) throw error;
      return data as SocialAccount[];
    },
  });
}

export function useAddSocialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: Omit<SocialAccount, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_accounts')
        .upsert({
          profile_id: user.id,
          ...account,
        }, { onConflict: 'profile_id,platform' })
        .select()
        .single();

      if (error) throw error;
      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-social-accounts'] });
      toast.success('Réseau social ajouté');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout');
      console.error(error);
    },
  });
}

export function useUpdateSocialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialAccount> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', id)
        .eq('profile_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-social-accounts'] });
      toast.success('Réseau social mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

export function useDeleteSocialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-social-accounts'] });
      toast.success('Réseau social supprimé');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
}

export function useSocialShares(matchId: string) {
  return useQuery({
    queryKey: ['social-shares', matchId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get shares for both users in the match
      const { data: shares, error } = await supabase
        .from('social_shares')
        .select(`
          *,
          social_accounts (
            id,
            platform,
            username,
            display_name,
            url
          )
        `)
        .eq('match_id', matchId)
        .eq('is_shared', true);

      if (error) throw error;
      return shares as SocialShare[];
    },
    enabled: !!matchId,
  });
}

export function useMySocialShares(matchId: string) {
  return useQuery({
    queryKey: ['my-social-shares', matchId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_shares')
        .select(`
          *,
          social_accounts (
            id,
            platform,
            username,
            display_name,
            url
          )
        `)
        .eq('match_id', matchId)
        .eq('profile_id', user.id);

      if (error) throw error;
      return data as SocialShare[];
    },
    enabled: !!matchId,
  });
}

export function useToggleSocialShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, socialAccountId, isShared }: { matchId: string; socialAccountId: string; isShared: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isShared) {
        // Create or update share
        const { data, error } = await supabase
          .from('social_shares')
          .upsert({
            match_id: matchId,
            profile_id: user.id,
            social_account_id: socialAccountId,
            is_shared: true,
            shared_at: new Date().toISOString(),
          }, { onConflict: 'match_id,profile_id,social_account_id' })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Remove share
        const { error } = await supabase
          .from('social_shares')
          .delete()
          .eq('match_id', matchId)
          .eq('profile_id', user.id)
          .eq('social_account_id', socialAccountId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-shares', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['my-social-shares', variables.matchId] });
      toast.success(variables.isShared ? 'Partagé avec votre match' : 'Partage retiré');
    },
    onError: (error) => {
      toast.error('Erreur lors du partage');
      console.error(error);
    },
  });
}

export function usePlatforms() {
  return PLATFORMS;
}

export function useGenerateSocialUrl(platform: string, username: string): string {
  const platformConfig = PLATFORMS.find(p => p.value === platform);
  if (!platformConfig || !platformConfig.urlPattern) return '';
  return platformConfig.urlPattern.replace('{username}', username);
}