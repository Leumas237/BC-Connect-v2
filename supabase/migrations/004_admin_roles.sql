-- BC Connect Admin Roles & Permissions
-- Migration 004: Admin Roles
-- Created: 2026-11-12

-- ============================================
-- ADMIN ROLE MANAGEMENT FUNCTIONS
-- ============================================

-- Grant admin role
CREATE OR REPLACE FUNCTION grant_admin_role(
    p_profile_id UUID,
    p_role VARCHAR,
    p_institution_id UUID
)
RETURNS VOID AS $$
DECLARE
    granter_id UUID := auth.uid();
BEGIN
    -- Only super admins can grant super_admin
    IF p_role = 'super_admin' AND NOT is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can grant super_admin role';
    END IF;

    -- Institution admins can grant roles in their institution
    IF p_role IN ('institution_admin', 'moderator', 'advertising_manager') THEN
        IF NOT is_institution_admin(p_institution_id) AND NOT is_super_admin() THEN
            RAISE EXCEPTION 'Insufficient permissions to grant this role';
        END IF;
    END IF;

    INSERT INTO admin_roles (profile_id, role, institution_id, granted_by)
    VALUES (p_profile_id, p_role, p_institution_id, granter_id)
    ON CONFLICT (profile_id, role, institution_id) DO NOTHING;

    -- Log audit
    PERFORM log_audit('admin_role_granted', 'admin_role', NULL, jsonb_build_object(
        'target_profile', p_profile_id,
        'role', p_role,
        'institution', p_institution_id
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke admin role
CREATE OR REPLACE FUNCTION revoke_admin_role(
    p_profile_id UUID,
    p_role VARCHAR,
    p_institution_id UUID
)
RETURNS VOID AS $$
DECLARE
    revoker_id UUID := auth.uid();
BEGIN
    -- Only super admins can revoke super_admin
    IF p_role = 'super_admin' AND NOT is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can revoke super_admin role';
    END IF;

    -- Institution admins can revoke roles in their institution
    IF p_role IN ('institution_admin', 'moderator', 'advertising_manager') THEN
        IF NOT is_institution_admin(p_institution_id) AND NOT is_super_admin() THEN
            RAISE EXCEPTION 'Insufficient permissions to revoke this role';
        END IF;
    END IF;

    DELETE FROM admin_roles
    WHERE profile_id = p_profile_id
    AND role = p_role
    AND institution_id = p_institution_id;

    -- Log audit
    PERFORM log_audit('admin_role_revoked', 'admin_role', NULL, jsonb_build_object(
        'target_profile', p_profile_id,
        'role', p_role,
        'institution', p_institution_id
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's admin roles
CREATE OR REPLACE FUNCTION get_user_admin_roles(p_profile_id UUID DEFAULT NULL)
RETURNS TABLE (
    role VARCHAR,
    institution_id UUID,
    institution_name VARCHAR,
    granted_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ar.role,
        ar.institution_id,
        i.name AS institution_name,
        ar.created_at AS granted_at
    FROM admin_roles ar
    LEFT JOIN institutions i ON i.id = ar.institution_id
    WHERE ar.profile_id = COALESCE(p_profile_id, auth.uid())
    ORDER BY
        CASE ar.role
            WHEN 'super_admin' THEN 1
            WHEN 'institution_admin' THEN 2
            WHEN 'moderator' THEN 3
            WHEN 'advertising_manager' THEN 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(p_permission VARCHAR, p_institution_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles ar
        WHERE ar.profile_id = auth.uid()
        AND (
            ar.role = 'super_admin'
            OR (ar.role = 'institution_admin' AND (p_institution_id IS NULL OR ar.institution_id = p_institution_id))
            OR (ar.role = 'moderator' AND p_permission IN ('moderate_content', 'review_verifications', 'manage_reports') AND (p_institution_id IS NULL OR ar.institution_id = p_institution_id))
            OR (ar.role = 'advertising_manager' AND p_permission IN ('manage_campaigns', 'view_analytics') AND (p_institution_id IS NULL OR ar.institution_id = p_institution_id))
        )
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DEFAULT SUPER ADMIN SETUP
-- ============================================

-- Function to initialize first super admin (run once manually)
CREATE OR REPLACE FUNCTION initialize_super_admin(p_email VARCHAR)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = p_email;

    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_email;
    END IF;

    -- Get or create default institution
    INSERT INTO admin_roles (profile_id, role, institution_id, granted_by)
    VALUES (user_id, 'super_admin', NULL, user_id)
    ON CONFLICT (profile_id, role, institution_id) DO NOTHING;

    RAISE NOTICE 'Super admin role granted to %', p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN ACTIONS LOGGING
-- ============================================

-- Enhanced audit logging for admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID,
    p_details JSONB DEFAULT NULL,
    p_target_institution UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Verify admin has permission for this institution
    IF p_target_institution IS NOT NULL AND NOT has_permission('*', p_target_institution) THEN
        RAISE EXCEPTION 'Insufficient permissions for institution';
    END IF;

    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER MANAGEMENT FUNCTIONS (ADMIN)
-- ============================================

-- Ban/Unban user
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(
    p_target_profile_id UUID,
    p_ban BOOLEAN,
    p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    target_institution UUID;
BEGIN
    SELECT institution_id INTO target_institution FROM profiles WHERE id = p_target_profile_id;

    IF NOT has_permission('moderate_content', target_institution) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    -- Update profile (add is_banned column if needed, or use verification_status)
    UPDATE profiles
    SET verification_status = CASE WHEN p_ban THEN 'rejected' ELSE 'unverified' END,
        verification_rejection_reason = CASE WHEN p_ban THEN p_reason ELSE NULL END,
        verification_reviewed_at = NOW(),
        verification_reviewed_by = auth.uid()
    WHERE id = p_target_profile_id;

    PERFORM log_admin_action(
        CASE WHEN p_ban THEN 'user_banned' ELSE 'user_unbanned' END,
        'profile',
        p_target_profile_id,
        jsonb_build_object('reason', p_reason),
        target_institution
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete user (GDPR compliance)
CREATE OR REPLACE FUNCTION admin_delete_user(p_target_profile_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    target_institution UUID;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can delete users';
    END IF;

    SELECT institution_id INTO target_institution FROM profiles WHERE id = p_target_profile_id;

    -- This will cascade delete due to FK constraints
    DELETE FROM profiles WHERE id = p_target_profile_id;

    PERFORM log_admin_action('user_deleted', 'profile', p_target_profile_id, jsonb_build_object('reason', p_reason), target_institution);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION MANAGEMENT
-- ============================================

-- Approve verification
CREATE OR REPLACE FUNCTION admin_approve_verification(p_document_id UUID)
RETURNS VOID AS $$
DECLARE
    doc RECORD;
BEGIN
    SELECT * INTO doc FROM verification_documents WHERE id = p_document_id;

    IF NOT has_permission('review_verifications', (SELECT institution_id FROM profiles WHERE id = doc.profile_id)) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    UPDATE verification_documents
    SET status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = NOW()
    WHERE id = p_document_id;

    PERFORM log_admin_action('verification_approved', 'verification_document', p_document_id, jsonb_build_object('profile_id', doc.profile_id), (SELECT institution_id FROM profiles WHERE id = doc.profile_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject verification
CREATE OR REPLACE FUNCTION admin_reject_verification(p_document_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    doc RECORD;
BEGIN
    SELECT * INTO doc FROM verification_documents WHERE id = p_document_id;

    IF NOT has_permission('review_verifications', (SELECT institution_id FROM profiles WHERE id = doc.profile_id)) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    UPDATE verification_documents
    SET status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        rejection_reason = p_reason
    WHERE id = p_document_id;

    PERFORM log_admin_action('verification_rejected', 'verification_document', p_document_id, jsonb_build_object('profile_id', doc.profile_id, 'reason', p_reason), (SELECT institution_id FROM profiles WHERE id = doc.profile_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get verification queue
CREATE OR REPLACE FUNCTION get_verification_queue(p_institution_id UUID DEFAULT NULL, p_status VARCHAR DEFAULT 'pending', p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    profile_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR,
    file_name TEXT,
    file_size BIGINT,
    mime_type VARCHAR,
    created_at TIMESTAMPTZ,
    profile_completeness INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vd.id,
        vd.profile_id,
        p.first_name,
        p.last_name,
        u.email,
        vd.file_name,
        vd.file_size,
        vd.mime_type,
        vd.created_at,
        calculate_profile_completeness(p.id) AS profile_completeness
    FROM verification_documents vd
    JOIN profiles p ON p.id = vd.profile_id
    JOIN auth.users u ON u.id = p.id
    WHERE vd.status = p_status
    AND (p_institution_id IS NULL OR p.institution_id = p_institution_id)
    AND (p_institution_id IS NULL OR has_permission('review_verifications', p_institution_id))
    ORDER BY vd.created_at ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- REPORT MANAGEMENT
-- ============================================

-- Resolve report
CREATE OR REPLACE FUNCTION admin_resolve_report(p_report_id UUID, p_resolution TEXT, p_action VARCHAR)
RETURNS VOID AS $$
DECLARE
    rep RECORD;
    target_institution UUID;
BEGIN
    SELECT * INTO rep FROM reports WHERE id = p_report_id;

    SELECT institution_id INTO target_institution FROM profiles WHERE id = rep.reported_id;

    IF NOT has_permission('manage_reports', target_institution) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    UPDATE reports
    SET status = 'resolved',
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        resolution = p_resolution
    WHERE id = p_report_id;

    -- Take action based on resolution
    IF p_action = 'ban_user' THEN
        PERFORM admin_toggle_user_ban(rep.reported_id, true, p_resolution);
    ELSIF p_action = 'remove_content' THEN
        -- Content removal would be handled separately
        NULL;
    END IF;

    -- Notify reporter
    INSERT INTO notifications (profile_id, type, title, body, data)
    VALUES (rep.reporter_id, 'report_resolved', 'Signalement traité', 'Votre signalement a été examiné', jsonb_build_object('report_id', p_report_id));

    PERFORM log_admin_action('report_resolved', 'report', p_report_id, jsonb_build_object('resolution', p_resolution, 'action', p_action), target_institution);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dismiss report
CREATE OR REPLACE FUNCTION admin_dismiss_report(p_report_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    rep RECORD;
    target_institution UUID;
BEGIN
    SELECT * INTO rep FROM reports WHERE id = p_report_id;

    SELECT institution_id INTO target_institution FROM profiles WHERE id = rep.reported_id;

    IF NOT has_permission('manage_reports', target_institution) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    UPDATE reports
    SET status = 'dismissed',
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        resolution = p_reason
    WHERE id = p_report_id;

    PERFORM log_admin_action('report_dismissed', 'report', p_report_id, jsonb_build_object('reason', p_reason), target_institution);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get reports queue
CREATE OR REPLACE FUNCTION get_reports_queue(p_institution_id UUID DEFAULT NULL, p_status VARCHAR DEFAULT 'pending', p_limit INT DEFAULT 50, p_offset INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    reporter_id UUID,
    reporter_name VARCHAR,
    reported_id UUID,
    reported_name VARCHAR,
    report_type VARCHAR,
    reason TEXT,
    status VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.reporter_id,
        rp.first_name || ' ' || rp.last_name AS reporter_name,
        r.reported_id,
        rd.first_name || ' ' || rd.last_name AS reported_name,
        r.report_type,
        r.reason,
        r.status,
        r.created_at
    FROM reports r
    JOIN profiles rp ON rp.id = r.reporter_id
    JOIN profiles rd ON rd.id = r.reported_id
    WHERE r.status = p_status
    AND (p_institution_id IS NULL OR rd.institution_id = p_institution_id)
    AND (p_institution_id IS NULL OR has_permission('manage_reports', p_institution_id))
    ORDER BY r.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;