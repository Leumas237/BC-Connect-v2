'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtime } from './use-realtime';
import { toast } from 'sonner';

const supabase = createClient();

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'social_share';
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photos: { url: string; is_primary: boolean }[];
  };
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  updated_at: string;
  other_profile: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photos: { url: string; is_primary: boolean }[];
    verification_status: string;
    is_online: boolean;
    academic_programs: { name: string } | null;
    academic_levels: { name: string } | null;
  };
  last_message: Message | null;
  unread_count: number;
}

export function useConversations() {
  const queryClient = useQueryClient();

  // Real-time subscription for new messages
  useRealtime('messages', (payload) => {
    if (payload.eventType === 'INSERT') {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Real-time subscription for conversation updates
  useRealtime('conversations', (payload) => {
    if (payload.eventType === 'UPDATE') {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          match_id,
          created_at,
          updated_at,
          conversation_members!inner (profile_id, last_read_at),
          matches (user1_id, user2_id)
        `)
        .eq('conversation_members.profile_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get other profile and last message for each conversation
      const conversations = await Promise.all(
        data.map(async (conv) => {
          const match = conv.matches[0] as { user1_id: string; user2_id: string };
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          // Get other profile
          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              id,
              first_name,
              last_name,
              profile_photos!profile_photos_profile_id_fkey (url, is_primary),
              verification_status
            `)
            .eq('id', otherId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              id,
              conversation_id,
              sender_id,
              content,
              message_type,
              metadata,
              is_read,
              read_at,
              created_at,
              profiles!messages_sender_id_fkey (
                id,
                first_name,
                last_name,
                profile_photos!profile_photos_profile_id_fkey (url, is_primary)
              )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const member = conv.conversation_members.find(m => m.profile_id === user.id);
          const lastReadAt = member?.last_read_at;

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .gt('created_at', lastReadAt ?? '1970-01-01');

          return {
            id: conv.id,
            match_id: conv.match_id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            other_profile: profile,
            last_message: lastMessage as Message | null,
            unread_count: unreadCount ?? 0,
          };
        })
      );

      return conversations as Conversation[];
    },
  });
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState<Message | null>(null);

  // Real-time subscription for this conversation's messages
  useRealtime('messages', (payload) => {
    if (payload.eventType === 'INSERT' && payload.new['conversation_id'] === conversationId) {
      setNewMessage(payload.new as unknown as Message);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
    if (payload.eventType === 'UPDATE' && payload.new['conversation_id'] === conversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  }, {
    filter: `conversation_id=eq.${conversationId}`
  });

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          metadata,
          is_read,
          read_at,
          created_at,
          profiles!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            profile_photos!profile_photos_profile_id_fkey (url, is_primary)
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Merge real-time message with query data
  const messages = query.data
    ? [...query.data, ...(newMessage ? [newMessage] : [])].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      setNewMessage(null);
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'envoi');
      console.error(error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('profile_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Auto mark as read when messages are viewed
  useEffect(() => {
    if (messages.length > 0) {
      // Get current user ID once
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const unreadMessages = messages.filter(m => !m.is_read && m.sender_id !== user.id);
          if (unreadMessages.length > 0) {
            markAsReadMutation.mutate();
          }
        }
      });
    }
  }, [messages.length]);

  return {
    messages,
    isLoading: query.isLoading,
    error: query.error,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutate,
    refetch: query.refetch,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text', metadata }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'social_share';
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'envoi');
      console.error(error);
    },
  });
}

export function useTypingIndicator(conversationId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useRealtime('conversation_members', (payload) => {
    if (payload.eventType === 'UPDATE' && payload.new['conversation_id'] === conversationId) {
      const isTyping = payload.new['is_typing'] as boolean;
      const profileId = payload.new['profile_id'] as string;

      setTypingUsers(prev => {
        if (isTyping && !prev.includes(profileId)) {
          return [...prev, profileId];
        } else if (!isTyping) {
          return prev.filter(id => id !== profileId);
        }
        return prev;
      });

      // Clear typing after 10 seconds if no update
      if (isTyping) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== profileId));
        }, 10000);
      }
    }
  }, {
    filter: `conversation_id=eq.${conversationId}`
  });

  const setTyping = useCallback(async (isTyping: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('set_typing_status', {
      p_conversation_id: conversationId,
      p_is_typing: isTyping,
    });
  }, [conversationId]);

  return { typingUsers, setTyping };
}
export function useConversation(conversationId: string) {
  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          match_id,
          created_at,
          updated_at,
          conversation_members!inner (profile_id, last_read_at),
          matches!inner (user1_id, user2_id)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const match = data.matches[0];
      if (!match) throw new Error('No match found for conversation');
      const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          profile_photos!profile_photos_profile_id_fkey (url, is_primary),
          verification_status,
          is_online,
          academic_programs (name),
          academic_levels (name)
        `)
        .eq('id', otherId)
        .single();

      const { data: lastMessage } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          metadata,
          is_read,
          read_at,
          created_at,
          profiles!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            profile_photos!profile_photos_profile_id_fkey (url, is_primary)
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const member = data.conversation_members.find(m => m.profile_id === user.id);
      const lastReadAt = member?.last_read_at;

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .gt('created_at', lastReadAt ?? '1970-01-01');

      return {
        id: data.id,
        match_id: data.match_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        other_profile: profile,
        last_message: lastMessage,
        unread_count: unreadCount ?? 0,
      };
    },
    enabled: !!conversationId,
  });

  return { conversation, isLoading };
}