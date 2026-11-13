'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabase = createClient();

interface RealtimeOptions {
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export function useRealtime(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
  options: RealtimeOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const { filter, event = '*' } = options;

    // Create channel
    const channel = supabase
      .channel(`realtime:${table}:${filter ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          callbackRef.current(payload);
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.warn(`Realtime subscription status for ${table}:`, status);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, options.filter, options.event]);
}

export function useRealtimePresence(
  channelName: string,
  onSync: (state: Record<string, unknown[]>) => void,
  onJoin: (key: string, newPresences: unknown[]) => void,
  onLeave: (key: string, leftPresences: unknown[]) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(channelName, {
        config: { presence: { key: '' } },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onSync(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        onJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        onLeave(key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence after subscribing
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName, onSync, onJoin, onLeave]);

  const track = useCallback(async (data: Record<string, unknown>) => {
    if (channelRef.current) {
      await channelRef.current.track(data);
    }
  }, []);

  const untrack = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack();
    }
  }, []);

  return { track, untrack };
}

export function useOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState<string | null>(null);

  useRealtime('profiles', (payload) => {
    if (payload.eventType === 'UPDATE' && payload.new['id'] === userId) {
      setIsOnline((payload.new['is_online'] as boolean) ?? false);
      setLastActive(payload.new['last_active_at'] as string | null);
    }
  }, {
    filter: `id=eq.${userId}`,
    event: 'UPDATE',
  });

  // Initial fetch
  useEffect(() => {
    supabase
      .from('profiles')
      .select('is_online, last_active_at')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setIsOnline(data.is_online);
          setLastActive(data.last_active_at);
        }
      });
  }, [userId]);

  return { isOnline, lastActive };
}