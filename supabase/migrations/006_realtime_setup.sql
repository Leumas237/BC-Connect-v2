-- BC Connect Realtime Setup
-- Migration 006: Realtime Configuration
-- Created: 2026-11-12

-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================

-- Messages: real-time chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Conversations: new conversations, updates
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Matches: new matches
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Notifications: real-time notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Conversation members: typing indicators, presence
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;

-- Profiles: online status updates
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================
-- SET REPLICA IDENTITY FOR FULL ROW UPDATES
-- ============================================

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE conversation_members REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- ============================================
-- PRESENCE & TYPING INDICATORS
-- ============================================

-- Typing status is ephemeral, use broadcast instead of database
-- But we can track last_typing_at in conversation_members for UI hints

ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS last_typing_at TIMESTAMPTZ;
ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS is_typing BOOLEAN DEFAULT FALSE;

-- ============================================
-- ONLINE STATUS MANAGEMENT
-- ============================================

-- Function to update user online status
CREATE OR REPLACE FUNCTION set_user_online(p_online BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET is_online = p_online,
        last_active_at = NOW()
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Heartbeat function (called periodically from client)
CREATE OR REPLACE FUNCTION heartbeat()
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET last_active_at = NOW(),
        is_online = true
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job to mark inactive users as offline (run every 5 minutes)
CREATE OR REPLACE FUNCTION mark_inactive_users_offline()
RETURNS INT AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE profiles
    SET is_online = false
    WHERE is_online = true
    AND last_active_at < NOW() - INTERVAL '5 minutes';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TYPING INDICATOR FUNCTIONS
-- ============================================

-- Set typing status (broadcast via realtime, but also persist for reconnection)
CREATE OR REPLACE FUNCTION set_typing_status(p_conversation_id UUID, p_is_typing BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE conversation_members
    SET is_typing = p_is_typing,
        last_typing_at = CASE WHEN p_is_typing THEN NOW() ELSE last_typing_at END
    WHERE conversation_id = p_conversation_id
    AND profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get typing users in conversation
CREATE OR REPLACE FUNCTION get_typing_users(p_conversation_id UUID)
RETURNS TABLE (
    profile_id UUID,
    first_name VARCHAR,
    last_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.profile_id,
        p.first_name,
        p.last_name
    FROM conversation_members cm
    JOIN profiles p ON p.id = cm.profile_id
    WHERE cm.conversation_id = p_conversation_id
    AND cm.profile_id != auth.uid()
    AND cm.is_typing = true
    AND cm.last_typing_at > NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REALTIME SUBSCRIPTION HELPERS (Client-side usage)
-- ============================================

/*
-- CLIENT-SIDE SUBSCRIPTION EXAMPLES (for reference)

-- 1. Subscribe to new messages in a conversation
const messagesChannel = supabase
  .channel(`messages:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      // Handle new message
      addMessage(payload.new);
    }
  )
  .subscribe();

-- 2. Subscribe to message updates (read receipts)
const readReceiptsChannel = supabase
  .channel(`read_receipts:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      // Handle read status change
      updateMessageReadStatus(payload.new.id, payload.new.is_read);
    }
  )
  .subscribe();

-- 3. Subscribe to new matches
const matchesChannel = supabase
  .channel('matches')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'matches',
      filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
    },
    (payload) => {
      // Handle new match
      showMatchNotification(payload.new);
    }
  )
  .subscribe();

-- 4. Subscribe to notifications
const notificationsChannel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `profile_id=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
      addNotification(payload.new);
    }
  )
  .subscribe();

-- 5. Subscribe to conversation updates (last message preview)
const conversationsChannel = supabase
  .channel('conversations')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations'
    },
    (payload) => {
      // Update conversation list
      updateConversationList(payload.new);
    }
  )
  .subscribe();

-- 6. Presence for typing indicators
const typingChannel = supabase
  .channel(`typing:${conversationId}`, {
    config: { presence: { key: userId } }
  })
  .on('presence', { event: 'sync' }, () => {
    const state = typingChannel.presenceState();
    // Process typing users
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User started typing
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User stopped typing
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await typingChannel.track({ is_typing: true, user_id: userId });
    }
  });

-- To stop typing:
await typingChannel.track({ is_typing: false, user_id: userId });
*/

-- ============================================
-- REALTIME RLS POLICIES (Additional)
-- ============================================

-- Ensure realtime respects RLS by using the same policies
-- Supabase Realtime automatically respects RLS policies

-- For conversation_members, we need SELECT policy for realtime
CREATE POLICY "conversation_members_realtime_select" ON conversation_members
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM conversation_members cm2
            WHERE cm2.conversation_id = conversation_members.conversation_id
            AND cm2.profile_id = auth.uid()
        )
    );

-- For profiles online status
CREATE POLICY "profiles_realtime_online" ON profiles
    FOR SELECT USING (
        id = auth.uid()
        OR (
            verification_status = 'verified'
            AND institution_id = get_user_institution()
        )
    );

-- ============================================
-- BROADCAST CHANNELS (for ephemeral data)
-- ============================================

/*
Broadcast channels don't persist to database, used for:
- Typing indicators (ephemeral)
- Presence (online/offline)
- Emoji reactions (optional)
- Read receipts (can also use database)

Client creates broadcast channel:
const channel = supabase.channel(`broadcast:${conversationId}`);

channel.on('broadcast', { event: 'typing' }, (payload) => {
  // payload: { user_id, is_typing }
});

channel.on('broadcast', { event: 'read' }, (payload) => {
  // payload: { user_id, message_id }
});

channel.subscribe();

// Send typing
channel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { user_id: currentUserId, is_typing: true }
});
*/

-- ============================================
-- CLEANUP TYPING INDICATORS
-- ============================================

-- Function to clear stale typing indicators (run via cron every minute)
CREATE OR REPLACE FUNCTION cleanup_stale_typing()
RETURNS INT AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE conversation_members
    SET is_typing = false
    WHERE is_typing = true
    AND last_typing_at < NOW() - INTERVAL '15 seconds';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;