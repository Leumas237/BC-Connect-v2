-- BC Connect Row Level Security Policies
-- Migration 002: RLS Policies
-- Created: 2026-11-12

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's profile institution
CREATE OR REPLACE FUNCTION get_user_institution()
RETURNS UUID AS $$
DECLARE
    inst_id UUID;
BEGIN
    SELECT institution_id INTO inst_id FROM profiles WHERE id = auth.uid();
    RETURN inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin for institution
CREATE OR REPLACE FUNCTION is_institution_admin(inst_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE profile_id = auth.uid()
        AND role IN ('super_admin', 'institution_admin')
        AND (role = 'super_admin' OR institution_id = inst_id)
    ) INTO is_admin;
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE profile_id = auth.uid()
        AND role = 'super_admin'
    ) INTO is_admin;
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator(inst_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_mod BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE profile_id = auth.uid()
        AND role IN ('super_admin', 'institution_admin', 'moderator')
        AND (role = 'super_admin' OR institution_id = inst_id)
    ) INTO is_mod;
    RETURN is_mod;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTITUTIONS
-- ============================================

-- Public read for active institutions
CREATE POLICY "institutions_select_active" ON institutions
    FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "institutions_admin_all" ON institutions
    FOR ALL USING (is_super_admin());

-- ============================================
-- FACULTIES, DEPARTMENTS, ACADEMIC PROGRAMS, LEVELS
-- ============================================

-- Public read for active institution's academic structure
CREATE POLICY "faculties_select" ON faculties
    FOR SELECT USING (
        institution_id = get_user_institution()
        OR is_super_admin()
    );

CREATE POLICY "departments_select" ON departments
    FOR SELECT USING (
        faculty_id IN (SELECT id FROM faculties WHERE institution_id = get_user_institution())
        OR is_super_admin()
    );

CREATE POLICY "academic_programs_select" ON academic_programs
    FOR SELECT USING (
        department_id IN (SELECT id FROM departments WHERE faculty_id IN (SELECT id FROM faculties WHERE institution_id = get_user_institution()))
        OR is_super_admin()
    );

CREATE POLICY "academic_levels_select" ON academic_levels
    FOR SELECT USING (true); -- Global reference data

-- Admin management
CREATE POLICY "academic_admin_all" ON faculties FOR ALL USING (is_super_admin());
CREATE POLICY "departments_admin_all" ON departments FOR ALL USING (is_super_admin());
CREATE POLICY "academic_programs_admin_all" ON academic_programs FOR ALL USING (is_super_admin());
CREATE POLICY "academic_levels_admin_all" ON academic_levels FOR ALL USING (is_super_admin());

-- ============================================
-- PROFILES
-- ============================================

-- Users can read verified profiles in their institution
CREATE POLICY "profiles_select_verified_institution" ON profiles
    FOR SELECT USING (
        verification_status = 'verified'
        AND institution_id = get_user_institution()
    );

-- Users can read their own profile (any status)
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Admins can read all profiles in their institution
CREATE POLICY "profiles_admin_select" ON profiles
    FOR SELECT USING (
        is_institution_admin(institution_id)
        OR is_super_admin()
    );

-- Admins can update profiles in their institution (for moderation)
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE USING (
        is_institution_admin(institution_id)
        OR is_super_admin()
    );

-- ============================================
-- PROFILE PHOTOS
-- ============================================

-- Users can read photos of verified profiles in their institution + own photos
CREATE POLICY "profile_photos_select" ON profile_photos
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = profile_photos.profile_id
            AND p.verification_status = 'verified'
            AND p.institution_id = get_user_institution()
        )
    );

-- Users can manage their own photos
CREATE POLICY "profile_photos_manage_own" ON profile_photos
    FOR ALL USING (profile_id = auth.uid());

-- Admins can moderate photos
CREATE POLICY "profile_photos_admin_moderate" ON profile_photos
    FOR UPDATE USING (
        is_moderator((SELECT institution_id FROM profiles WHERE id = profile_photos.profile_id))
        OR is_super_admin()
    );

-- ============================================
-- INTERESTS
-- ============================================

-- Public read for all interests
CREATE POLICY "interests_select" ON interests
    FOR SELECT USING (true);

-- Admin management
CREATE POLICY "interests_admin_all" ON interests
    FOR ALL USING (is_super_admin());

-- ============================================
-- PROFILE INTERESTS
-- ============================================

-- Users can read interests of verified profiles in institution + own
CREATE POLICY "profile_interests_select" ON profile_interests
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = profile_interests.profile_id
            AND p.verification_status = 'verified'
            AND p.institution_id = get_user_institution()
        )
    );

-- Users can manage their own interests
CREATE POLICY "profile_interests_manage_own" ON profile_interests
    FOR ALL USING (profile_id = auth.uid());

-- ============================================
-- USER INTENTIONS
-- ============================================

-- Users can read intentions of verified profiles in institution + own
CREATE POLICY "user_intentions_select" ON user_intentions
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = user_intentions.profile_id
            AND p.verification_status = 'verified'
            AND p.institution_id = get_user_institution()
        )
    );

-- Users can manage their own intentions
CREATE POLICY "user_intentions_manage_own" ON user_intentions
    FOR ALL USING (profile_id = auth.uid());

-- ============================================
-- SWIPES
-- ============================================

-- Users can only read their own swipes
CREATE POLICY "swipes_select_own" ON swipes
    FOR SELECT USING (swiper_id = auth.uid());

-- Users can only insert their own swipes
CREATE POLICY "swipes_insert_own" ON swipes
    FOR INSERT WITH CHECK (swiper_id = auth.uid());

-- Prevent self-swipes
CREATE POLICY "swipes_no_self" ON swipes
    FOR INSERT WITH CHECK (swiper_id != swiped_id);

-- ============================================
-- MATCHES
-- ============================================

-- Users can read matches they're part of
CREATE POLICY "matches_select_participant" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- System creates matches (via trigger/function)
CREATE POLICY "matches_insert_system" ON matches
    FOR INSERT WITH CHECK (true); -- Controlled by match creation function

-- ============================================
-- CONVERSATIONS
-- ============================================

-- Members can read conversations they're part of
CREATE POLICY "conversations_select_member" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversations.id
            AND cm.profile_id = auth.uid()
        )
    );

-- System creates conversations (via match trigger)
CREATE POLICY "conversations_insert_system" ON conversations
    FOR INSERT WITH CHECK (true);

-- Members can update conversation (e.g., updated_at)
CREATE POLICY "conversations_update_member" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversations.id
            AND cm.profile_id = auth.uid()
        )
    );

-- ============================================
-- CONVERSATION MEMBERS
-- ============================================

-- Members can read conversation members for their conversations
CREATE POLICY "conversation_members_select" ON conversation_members
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM conversation_members cm2
            WHERE cm2.conversation_id = conversation_members.conversation_id
            AND cm2.profile_id = auth.uid()
        )
    );

-- System manages members
CREATE POLICY "conversation_members_insert_system" ON conversation_members
    FOR INSERT WITH CHECK (true);

-- ============================================
-- MESSAGES
-- ============================================

-- Conversation members can read messages
CREATE POLICY "messages_select_member" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = messages.conversation_id
            AND cm.profile_id = auth.uid()
        )
    );

-- Members can insert messages in their conversations
CREATE POLICY "messages_insert_member" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = messages.conversation_id
            AND cm.profile_id = auth.uid()
        )
    );

-- Sender can update their own messages (e.g., read status)
CREATE POLICY "messages_update_sender" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- ============================================
-- SOCIAL ACCOUNTS
-- ============================================

-- Users manage their own social accounts
CREATE POLICY "social_accounts_manage_own" ON social_accounts
    FOR ALL USING (profile_id = auth.uid());

-- Match participants can read shared social accounts
CREATE POLICY "social_accounts_select_shared" ON social_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_shares ss
            JOIN matches m ON m.id = ss.match_id
            WHERE ss.social_account_id = social_accounts.id
            AND ss.is_shared = true
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
            AND ss.profile_id = social_accounts.profile_id
        )
    );

-- ============================================
-- SOCIAL SHARES
-- ============================================

-- Users manage their own shares in matches
CREATE POLICY "social_shares_manage_own" ON social_shares
    FOR ALL USING (profile_id = auth.uid());

-- Match participants can read shares
CREATE POLICY "social_shares_select_participant" ON social_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = social_shares.match_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

-- ============================================
-- BLOCKS
-- ============================================

-- Users manage their own blocks
CREATE POLICY "blocks_manage_own" ON blocks
    FOR ALL USING (blocker_id = auth.uid());

-- Users can check if they're blocked (for swipe filtering)
CREATE POLICY "blocks_select_blocked" ON blocks
    FOR SELECT USING (blocked_id = auth.uid());

-- ============================================
-- REPORTS
-- ============================================

-- Users can create reports
CREATE POLICY "reports_insert_own" ON reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Users can read their own reports
CREATE POLICY "reports_select_own" ON reports
    FOR SELECT USING (reporter_id = auth.uid());

-- Moderators/admins can read all reports in their institution
CREATE POLICY "reports_admin_select" ON reports
    FOR SELECT USING (
        is_moderator((SELECT institution_id FROM profiles WHERE id = reports.reported_id))
        OR is_super_admin()
    );

-- Moderators/admins can update reports
CREATE POLICY "reports_admin_update" ON reports
    FOR UPDATE USING (
        is_moderator((SELECT institution_id FROM profiles WHERE id = reports.reported_id))
        OR is_super_admin()
    );

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Users read their own notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (profile_id = auth.uid());

-- Users can mark their notifications as read
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (profile_id = auth.uid());

-- System creates notifications
CREATE POLICY "notifications_insert_system" ON notifications
    FOR INSERT WITH CHECK (true);

-- ============================================
-- AD CAMPAIGNS
-- ============================================

-- Public read for active campaigns in user's institution
CREATE POLICY "ad_campaigns_select_active" ON ad_campaigns
    FOR SELECT USING (
        status = 'active'
        AND start_date <= NOW()
        AND end_date >= NOW()
        AND institution_id = get_user_institution()
    );

-- Admins manage campaigns in their institution
CREATE POLICY "ad_campaigns_admin_all" ON ad_campaigns
    FOR ALL USING (
        is_institution_admin(institution_id)
        OR is_super_admin()
    );

-- Advertising managers can manage campaigns
CREATE POLICY "ad_campaigns_ad_manager_all" ON ad_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles
            WHERE profile_id = auth.uid()
            AND role = 'advertising_manager'
            AND (institution_id = ad_campaigns.institution_id OR is_super_admin())
        )
    );

-- ============================================
-- AD IMPRESSIONS & CLICKS
-- ============================================

-- System inserts impressions/clicks
CREATE POLICY "ad_impressions_insert_system" ON ad_impressions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_clicks_insert_system" ON ad_clicks
    FOR INSERT WITH CHECK (true);

-- Admins can read analytics
CREATE POLICY "ad_impressions_admin_select" ON ad_impressions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ad_campaigns ac
            WHERE ac.id = ad_impressions.campaign_id
            AND (is_institution_admin(ac.institution_id) OR is_super_admin())
        )
    );

CREATE POLICY "ad_clicks_admin_select" ON ad_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ad_campaigns ac
            WHERE ac.id = ad_clicks.campaign_id
            AND (is_institution_admin(ac.institution_id) OR is_super_admin())
        )
    );

-- ============================================
-- ADMIN ROLES
-- ============================================

-- Super admins manage all roles
CREATE POLICY "admin_roles_super_admin_all" ON admin_roles
    FOR ALL USING (is_super_admin());

-- Institution admins can read roles in their institution
CREATE POLICY "admin_roles_institution_admin_select" ON admin_roles
    FOR SELECT USING (
        is_institution_admin(institution_id)
    );

-- ============================================
-- AUDIT LOGS
-- ============================================

-- Super admins read all audit logs
CREATE POLICY "audit_logs_super_admin_select" ON audit_logs
    FOR SELECT USING (is_super_admin());

-- Institution admins read logs for their institution
CREATE POLICY "audit_logs_institution_admin_select" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.profile_id = auth.uid()
            AND ar.role IN ('super_admin', 'institution_admin')
            AND (
                ar.role = 'super_admin'
                OR ar.institution_id = (
                    SELECT institution_id FROM profiles WHERE id = audit_logs.actor_id
                )
            )
        )
    );

-- System inserts audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================
-- VERIFICATION DOCUMENTS
-- ============================================

-- Users can read their own verification documents
CREATE POLICY "verification_documents_select_own" ON verification_documents
    FOR SELECT USING (profile_id = auth.uid());

-- Users can upload their own verification documents
CREATE POLICY "verification_documents_insert_own" ON verification_documents
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Admins can read all verification documents in their institution
CREATE POLICY "verification_documents_admin_select" ON verification_documents
    FOR SELECT USING (
        is_institution_admin((SELECT institution_id FROM profiles WHERE id = verification_documents.profile_id))
        OR is_super_admin()
    );

-- Admins can update verification status
CREATE POLICY "verification_documents_admin_update" ON verification_documents
    FOR UPDATE USING (
        is_institution_admin((SELECT institution_id FROM profiles WHERE id = verification_documents.profile_id))
        OR is_super_admin()
    );