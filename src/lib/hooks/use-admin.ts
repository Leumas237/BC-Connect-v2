'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const supabase = createClient();

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  is_banned: boolean;
  created_at: string;
  last_active_at: string;
  academic_program: string;
  matches_count: number;
  reports_count: number;
}

export interface VerificationRequest {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  profile_completeness: number;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_id: string;
  reported_name: string;
  report_type: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface AdCampaign {
  id: string;
  advertiser_name: string;
  title: string;
  description: string | null;
  image_url: string;
  destination_url: string | null;
  contact_info: string | null;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending_approval' | 'scheduled' | 'active' | 'expired' | 'disabled';
  negotiated_price: number | null;
  payment_status: string;
  payment_reference: string | null;
  impressions_count: number;
  clicks_count: number;
  created_at: string;
  updated_at: string;
  slots: string[];
}

export interface AdminStats {
  total_users: number;
  pending_verifications: number;
  active_matches: number;
  active_campaigns: number;
  total_impressions: number;
  total_clicks: number;
  total_revenue: number;
}

// Admin Users
export function useAdminUsers(filters?: { status?: string; banned?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email:auth.users!inner(email),
          verification_status,
          is_banned,
          created_at,
          last_active_at,
          academic_programs(name),
          verification_documents!left(status)
        `, { count: 'exact' });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('verification_status', filters.status);
      }

      if (filters?.banned === 'banned') {
        query = query.eq('is_banned', true);
      } else if (filters?.banned === 'active') {
        query = query.eq('is_banned', false);
      }

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Get matches and reports count for each user
      const usersWithCounts = await Promise.all(
        (data ?? []).map(async (user: any) => {
          const [{ count: matchesCount }, { count: reportsCount }] = await Promise.all([
            supabase.from('matches').select('*', { count: 'exact', head: true }).or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('reported_id', user.id),
          ]);
          return {
            ...user,
            academic_program: user.academic_programs?.name ?? null,
            matches_count: matchesCount ?? 0,
            reports_count: reportsCount ?? 0,
            email: user.email?.[0]?.email ?? '',
          };
        })
      );

      return { users: usersWithCounts, total: count ?? 0 };
    },
  });
}

export function useAdminUserActions() {
  const queryClient = useQueryClient();

  const banUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase.rpc('admin_toggle_user_ban', {
        p_target_profile_id: userId,
        p_ban: true,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Utilisateur banni');
    },
    onError: () => toast.error('Erreur lors du bannissement'),
  });

  const unbanUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_toggle_user_ban', {
        p_target_profile_id: userId,
        p_ban: false,
        p_reason: '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Utilisateur débanni');
    },
    onError: () => toast.error('Erreur lors du débannissement'),
  });

  const deleteUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase.rpc('admin_delete_user', {
        p_target_profile_id: userId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Utilisateur supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const approveVerification = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase.rpc('admin_approve_verification', { p_document_id: docId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast.success('Vérification approuvée');
    },
    onError: () => toast.error('Erreur lors de l\'approbation'),
  });

  const rejectVerification = useMutation({
    mutationFn: async ({ docId, reason }: { docId: string; reason: string }) => {
      const { error } = await supabase.rpc('admin_reject_verification', { p_document_id: docId, p_reason: reason });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast.success('Vérification refusée');
    },
    onError: () => toast.error('Erreur lors du refus'),
  });

  return { banUser, unbanUser, deleteUser, approveVerification, rejectVerification };
}

// Admin Verifications
export function useAdminVerifications(status: string = 'pending') {
  return useQuery({
    queryKey: ['admin-verifications', status],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_verification_queue', {
        p_status: status,
        p_limit: 50,
      });
      if (error) throw error;
      return data;
    },
  });
}

// Admin Reports
export function useAdminReports(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-reports', filters],
    queryFn: async () => {
      const status = filters?.status ?? 'pending';
      const { data, error } = await supabase.rpc('get_reports_queue', {
        p_status: status,
        p_limit: filters?.limit ?? 50,
        p_offset: ((filters?.page ?? 1) - 1) * (filters?.limit ?? 50),
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminReportActions() {
  const queryClient = useQueryClient();

  const resolveReport = useMutation({
    mutationFn: async ({ reportId, resolution, action }: { reportId: string; resolution: string; action: string }) => {
      const { error } = await supabase.rpc('admin_resolve_report', {
        p_report_id: reportId,
        p_resolution: resolution,
        p_action: action,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Signalement résolu');
    },
    onError: () => toast.error('Erreur lors de la résolution'),
  });

  const dismissReport = useMutation({
    mutationFn: async ({ reportId, reason }: { reportId: string; reason: string }) => {
      const { error } = await supabase.rpc('admin_dismiss_report', {
        p_report_id: reportId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Signalement rejeté');
    },
    onError: () => toast.error('Erreur'),
  });

  return { resolveReport, dismissReport };
}

// Admin Advertising
export function useAdminCampaigns(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin-campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('ad_campaigns')
        .select(`
          *,
          ad_slots!campaign_slots(slot_key)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`advertiser_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map(c => ({
        ...c,
        slots: c.ad_slots?.map((s: any) => s.slot_key) ?? [],
      }));
    },
  });
}

export function useAdminCampaignActions() {
  const queryClient = useQueryClient();

  const createCampaign = useMutation({
    mutationFn: async (campaign: Omit<AdCampaign, 'id' | 'created_at' | 'updated_at' | 'impressions_count' | 'clicks_count' | 'slots'> & { slots: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: campaignData, error } = await supabase
        .from('ad_campaigns')
        .insert({
          ...campaign,
          created_by: user.id,
          slots: undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Link slots
      if (campaign.slots.length > 0) {
        const slotLinks = campaign.slots.map(slotKey => ({
          campaign_id: campaignData.id,
          slot_id: slotKey, // This would need to be resolved to actual slot IDs
        }));
        // Simplified - in reality you'd join with ad_slots table
      }

      return campaignData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campagne créée');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdCampaign> & { id: string; slots?: string[] }) => {
      const { slots, ...campaignUpdates } = updates;

      const { error } = await supabase
        .from('ad_campaigns')
        .update(campaignUpdates)
        .eq('id', id);

      if (error) throw error;

      if (slots) {
        // Update campaign_slots
        await supabase.from('campaign_slots').delete().eq('campaign_id', id);
        // Re-insert slots
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campagne mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ad_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campagne supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const recordPayment = useMutation({
    mutationFn: async ({ campaignId, amount, reference, status }: { campaignId: string; amount: number; reference: string; status: string }) => {
      const { error } = await supabase.rpc('record_campaign_payment', {
        p_campaign_id: campaignId,
        p_amount: amount,
        p_reference: reference,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Paiement enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  return { createCampaign, updateCampaign, deleteCampaign, recordPayment };
}

// Admin Slots
export function useAdminSlots() {
  return useQuery({
    queryKey: ['admin-slots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminSlotActions() {
  const queryClient = useQueryClient();

  const updateSlot = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<{ id: string; is_enabled: boolean; max_banners: number; display_order: number }>) => {
      const { error } = await supabase.from('ad_slots').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slots'] });
      toast.success('Slot mis à jour');
    },
    onError: () => toast.error('Erreur'),
  });

  return { updateSlot };
}

// Admin Analytics
export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [{ count: totalUsers }, { count: pendingVerifications }, { data: matches }, { data: campaigns }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('matches').select('id, created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('ad_campaigns').select('impressions_count, clicks_count, negotiated_price, payment_status, status'),
      ]);

      const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.impressions_count ?? 0), 0) ?? 0;
      const totalClicks = campaigns?.reduce((sum, c) => sum + (c.clicks_count ?? 0), 0) ?? 0;
      const totalRevenue = campaigns?.filter(c => c.payment_status === 'paid').reduce((sum, c) => sum + (c.negotiated_price ?? 0), 0) ?? 0;

      return {
        total_users: totalUsers ?? 0,
        pending_verifications: pendingVerifications ?? 0,
        active_matches: matches?.length ?? 0,
        active_campaigns: campaigns?.filter(c => c.status === 'active').length ?? 0,
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_revenue: totalRevenue,
      } as AdminStats;
    },
  });
}

// Admin Institutions
export function useAdminInstitutions() {
  return useQuery({
    queryKey: ['admin-institutions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('institutions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminInstitutionActions() {
  const queryClient = useQueryClient();

  const createInstitution = useMutation({
    mutationFn: async (institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('institutions').insert(institution).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      toast.success('Établissement créé');
    },
    onError: () => toast.error('Erreur'),
  });

  const updateInstitution = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Institution> & { id: string }) => {
      const { error } = await supabase.from('institutions').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      toast.success('Établissement mis à jour');
    },
    onError: () => toast.error('Erreur'),
  });

  return { createInstitution, updateInstitution };
}

// Types for institutions
export interface Institution {
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
}