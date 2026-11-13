'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Profile, ProfilePhoto, Interest } from '@/lib/supabase/types';
import { toast } from 'sonner';

// Re-export Interest type for convenience
export type { Interest };

const supabase = createClient();

export function useProfile(userId?: string): ReturnType<typeof useQuery<Profile | null, Error, Profile | null, string[]>> {
  return useQuery<Profile | null, Error, Profile | null, string[]>({
    queryKey: ['profile', userId ?? ''],
    queryFn: async (): Promise<Profile | null> => {
      const targetId = userId;
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    initialData: null as Profile | null,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.id], data);
      toast.success('Profil mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

export function useProfilePhotos(userId?: string): ReturnType<typeof useQuery<ProfilePhoto[], Error, ProfilePhoto[], string[]>> {
  return useQuery<ProfilePhoto[], Error, ProfilePhoto[], string[]>({
    queryKey: ['profile-photos', userId ?? ''],
    queryFn: async (): Promise<ProfilePhoto[]> => {
      const targetId = userId;
      if (!targetId) return [] as ProfilePhoto[];

      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('profile_id', targetId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ProfilePhoto[];
    },
    enabled: !!userId,
    initialData: [] as ProfilePhoto[],
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Get current photo count for display_order
      const { count } = await supabase
        .from('profile_photos')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      // Insert photo record
      const { data, error } = await supabase
        .from('profile_photos')
        .insert({
          profile_id: user.id,
          storage_path: fileName,
          url: publicUrl,
          is_primary: count === 0,
          display_order: count ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProfilePhoto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile-photos', data.profile_id] });
      toast.success('Photo ajoutée');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'upload');
      console.error(error);
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get photo info first
      const { data: photo, error: fetchError } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      await supabase.storage.from('profile-photos').remove([photo.storage_path]);

      // Delete from database
      const { error } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // If deleted photo was primary, set another as primary
      if (photo.is_primary) {
        const { data: remaining } = await supabase
          .from('profile_photos')
          .select('id')
          .eq('profile_id', user.id)
          .order('display_order')
          .limit(1);

        if (remaining && remaining.length > 0 && remaining[0]) {
          await supabase
            .from('profile_photos')
            .update({ is_primary: true })
            .eq('id', remaining[0].id);
        }
      }

      return photoId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-photos'] });
      toast.success('Photo supprimée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
}

export function useSetPrimaryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Unset current primary
      await supabase
        .from('profile_photos')
        .update({ is_primary: false })
        .eq('profile_id', user.id)
        .eq('is_primary', true);

      // Set new primary
      const { error } = await supabase
        .from('profile_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-photos'] });
    },
  });
}

export function useInterests(): ReturnType<typeof useQuery<Interest[], Error, Interest[], string[]>> {
  return useQuery<Interest[], Error, Interest[], string[]>({
    queryKey: ['interests'],
    queryFn: async (): Promise<Interest[]> => {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Interest[];
    },
    initialData: [] as Interest[],
  });
}

export function useProfileInterests(userId?: string): ReturnType<typeof useQuery<string[], Error, string[], string[]>> {
  return useQuery<string[], Error, string[], string[]>({
    queryKey: ['profile-interests', userId ?? ''],
    queryFn: async (): Promise<string[]> => {
      const targetId = userId;
      if (!targetId) return [] as string[];

      const { data, error } = await supabase
        .from('profile_interests')
        .select('interest_id')
        .eq('profile_id', targetId);

      if (error) throw error;
      return data.map(d => d.interest_id);
    },
    enabled: !!userId,
    initialData: [] as string[],
  });
}

export function useUpdateInterests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interestIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing
      await supabase
        .from('profile_interests')
        .delete()
        .eq('profile_id', user.id);

      // Insert new
      if (interestIds.length > 0) {
        const { error } = await supabase
          .from('profile_interests')
          .insert(interestIds.map(id => ({ profile_id: user.id, interest_id: id })));

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-interests'] });
      toast.success('Centres d\'intérêt mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

export function useIntentions(userId?: string): ReturnType<typeof useQuery<('dating' | 'friendship' | 'networking')[], Error, ('dating' | 'friendship' | 'networking')[], string[]>> {
  return useQuery<('dating' | 'friendship' | 'networking')[], Error, ('dating' | 'friendship' | 'networking')[], string[]>({
    queryKey: ['user-intentions', userId ?? ''],
    queryFn: async (): Promise<('dating' | 'friendship' | 'networking')[]> => {
      const targetId = userId;
      if (!targetId) return [] as ('dating' | 'friendship' | 'networking')[];

      const { data, error } = await supabase
        .from('user_intentions')
        .select('intention_type')
        .eq('profile_id', targetId);

      if (error) throw error;
      return data.map(d => d.intention_type) as ('dating' | 'friendship' | 'networking')[];
    },
    enabled: !!userId,
    initialData: [] as ('dating' | 'friendship' | 'networking')[],
  });
}

export function useUpdateIntentions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intentions: ('dating' | 'friendship' | 'networking')[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete existing
      await supabase
        .from('user_intentions')
        .delete()
        .eq('profile_id', user.id);

      // Insert new
      if (intentions.length > 0) {
        const { error } = await supabase
          .from('user_intentions')
          .insert(intentions.map(type => ({ profile_id: user.id, intention_type: type })));

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-intentions'] });
      toast.success('Intentions mises à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}