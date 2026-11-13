-- BC Connect Functions & Triggers
-- Migration 003: Functions & Triggers
-- Created: 2026-11-12

-- ============================================
-- AGE CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INT AS $$
BEGIN
    RETURN DATE_PART('year', AGE(birth_date))::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- PROFILE COMPLETENESS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_id UUID)
RETURNS INT AS $$
DECLARE
    completeness INT := 0;
    p RECORD;
BEGIN
    SELECT * INTO p FROM profiles WHERE id = p_id;

    -- Required fields (each 10%)
    IF p.first_name IS NOT NULL THEN completeness := completeness + 10; END IF;
    IF p.last_name IS NOT NULL THEN completeness := completeness + 10; END IF;
    IF p.date_of_birth IS NOT NULL THEN completeness := completeness + 10; END IF;
    IF p.gender IS NOT NULL THEN completeness := completeness + 10; END IF;
    IF p.bio IS NOT NULL AND length(p.bio) > 20 THEN completeness := completeness + 10; END IF;

    -- Photos (20% for at least 1, up to 30% for 3+)
    IF EXISTS (SELECT 1 FROM profile_photos WHERE profile_id = p_id AND moderation_status = 'approved') THEN
        completeness := completeness + 20;
        IF (SELECT COUNT(*) FROM profile_photos WHERE profile_id = p_id AND moderation_status = 'approved') >= 3 THEN
            completeness := completeness + 10;
        END IF;
    END IF;

    -- Interests (10% for at least 3)
    IF (SELECT COUNT(*) FROM profile_interests WHERE profile_id = p_id) >= 3 THEN
        completeness := completeness + 10;
    END IF;

    -- Intentions (10% for at least 1)
    IF EXISTS (SELECT 1 FROM user_intentions WHERE profile_id = p_id) THEN
        completeness := completeness + 10;
    END IF;

    -- Verification (10%)
    IF p.verification_status = 'verified' THEN
        completeness := completeness + 10;
    END IF;

    RETURN LEAST(completeness, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MATCH CREATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
    mutual_like BOOLEAN;
    user1 UUID;
    user2 UUID;
    match_id UUID;
    conv_id UUID;
BEGIN
    -- Only on like or super_like
    IF NEW.swipe_type NOT IN ('like', 'super_like') THEN
        RETURN NEW;
    END IF;

    -- Check if the other user has liked this user
    SELECT EXISTS (
        SELECT 1 FROM swipes
        WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND swipe_type IN ('like', 'super_like')
    ) INTO mutual_like;

    IF mutual_like THEN
        -- Create match with consistent ordering
        user1 := LEAST(NEW.swiper_id, NEW.swiped_id);
        user2 := GREATEST(NEW.swiper_id, NEW.swiped_id);

        INSERT INTO matches (user1_id, user2_id)
        VALUES (user1, user2)
        ON CONFLICT (user1_id, user2_id) DO NOTHING
        RETURNING id INTO match_id;

        IF match_id IS NOT NULL THEN
            -- Create conversation
            INSERT INTO conversations (match_id)
            VALUES (match_id)
            RETURNING id INTO conv_id;

            -- Add both users as conversation members
            INSERT INTO conversation_members (conversation_id, profile_id)
            VALUES (conv_id, user1), (conv_id, user2);

            -- Create notifications for both users
            INSERT INTO notifications (profile_id, type, title, body, data)
            VALUES
                (user1, 'match', 'Nouveau Match !', 'Vous avez un nouveau match', jsonb_build_object('match_id', match_id)),
                (user2, 'match', 'Nouveau Match !', 'Vous avez un nouveau match', jsonb_build_object('match_id', match_id));

            -- Log audit
            INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
            VALUES (NEW.swiper_id, 'match_created', 'match', match_id, jsonb_build_object('matched_with', NEW.swiped_id));
        END IF;
    ELSE
        -- Notify the liked user
        INSERT INTO notifications (profile_id, type, title, body, data)
        VALUES (
            NEW.swiped_id,
            CASE WHEN NEW.swipe_type = 'super_like' THEN 'super_like' ELSE 'like' END,
            CASE WHEN NEW.swipe_type = 'super_like' THEN 'Super Like reçu !' ELSE 'Nouveau Like !' END,
            'Quelqu\'un s\'intéresse à vous',
            jsonb_build_object('from_user', NEW.swiper_id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_and_create_match
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_and_create_match();

-- ============================================
-- MESSAGE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
    other_member UUID;
BEGIN
    -- Update conversation updated_at
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;

    -- Find the other conversation member
    SELECT profile_id INTO other_member
    FROM conversation_members
    WHERE conversation_id = NEW.conversation_id
    AND profile_id != NEW.sender_id;

    -- Create notification for other member
    IF other_member IS NOT NULL THEN
        INSERT INTO notifications (profile_id, type, title, body, data)
        VALUES (
            other_member,
            'message',
            'Nouveau message',
            (SELECT first_name FROM profiles WHERE id = NEW.sender_id) || ': ' || LEFT(NEW.content, 50),
            jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_message();

-- ============================================
-- READ RECEIPTS
-- ============================================

CREATE OR REPLACE FUNCTION update_last_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_read_at IS DISTINCT FROM OLD.last_read_at THEN
        -- Mark messages as read
        UPDATE messages
        SET is_read = true, read_at = NEW.last_read_at
        WHERE conversation_id = NEW.conversation_id
        AND sender_id != NEW.profile_id
        AND is_read = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_read
    AFTER UPDATE OF last_read_at ON conversation_members
    FOR EACH ROW
    EXECUTE FUNCTION update_last_read();

-- ============================================
-- PROFILE UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profile_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

-- ============================================
-- VERIFICATION STATUS SYNC
-- ============================================

CREATE OR REPLACE FUNCTION sync_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE profiles
        SET verification_status = 'verified',
            is_verified = true,
            verification_reviewed_at = NOW(),
            verification_reviewed_by = NEW.reviewed_by
        WHERE id = NEW.profile_id;
    ELSIF NEW.status = 'rejected' THEN
        UPDATE profiles
        SET verification_status = 'rejected',
            is_verified = false,
            verification_reviewed_at = NOW(),
            verification_reviewed_by = NEW.reviewed_by,
            verification_rejection_reason = NEW.rejection_reason
        WHERE id = NEW.profile_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_verification_status
    AFTER UPDATE OF status ON verification_documents
    FOR EACH ROW
    EXECUTE FUNCTION sync_verification_status();

-- ============================================
-- AD IMPRESSION TRACKING
-- ============================================

CREATE OR REPLACE FUNCTION track_ad_impression(campaign_uuid UUID, user_id UUID DEFAULT NULL, sess_id VARCHAR DEFAULT NULL, ip_hash_val VARCHAR DEFAULT NULL, ua TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ad_impressions (campaign_id, profile_id, session_id, ip_hash, user_agent)
    VALUES (campaign_uuid, user_id, sess_id, ip_hash_val, ua);

    UPDATE ad_campaigns
    SET impressions_count = impressions_count + 1
    WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_ad_click(campaign_uuid UUID, user_id UUID DEFAULT NULL, sess_id VARCHAR DEFAULT NULL, ip_hash_val VARCHAR DEFAULT NULL, ua TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ad_clicks (campaign_id, profile_id, session_id, ip_hash, user_agent)
    VALUES (campaign_uuid, user_id, sess_id, ip_hash_val, ua);

    UPDATE ad_campaigns
    SET clicks_count = clicks_count + 1
    WHERE id = campaign_uuid;

    -- Create notification for ad click tracking (optional)
    IF user_id IS NOT NULL THEN
        INSERT INTO notifications (profile_id, type, title, body, data)
        VALUES (user_id, 'ad_click', 'Publicité cliquée', 'Vous avez cliqué sur une publicité', jsonb_build_object('campaign_id', campaign_uuid));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Delete expired verification documents (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_docs()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM verification_documents
    WHERE expires_at < NOW()
    AND status = 'pending';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Update campaign statuses based on dates (run via cron)
CREATE OR REPLACE FUNCTION update_campaign_statuses()
RETURNS VOID AS $$
BEGIN
    -- Expired campaigns
    UPDATE ad_campaigns
    SET status = 'expired'
    WHERE status IN ('active', 'scheduled')
    AND end_date < NOW();

    -- Activate scheduled campaigns
    UPDATE ad_campaigns
    SET status = 'active'
    WHERE status = 'scheduled'
    AND start_date <= NOW()
    AND end_date >= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEARCH/RECOMMENDATION HELPERS
-- ============================================

-- Get potential matches for discovery (excludes blocked, already swiped, self)
CREATE OR REPLACE FUNCTION get_discovery_profiles(
    p_user_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0,
    p_min_age INT DEFAULT 18,
    p_max_age INT DEFAULT 30,
    p_genders TEXT[] DEFAULT ARRAY['male', 'female', 'non_binary'],
    p_max_distance_km INT DEFAULT 50,
    p_institution_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    date_of_birth DATE,
    gender VARCHAR,
    bio TEXT,
    city VARCHAR,
    academic_program_name VARCHAR,
    academic_level_name VARCHAR,
    primary_photo_url TEXT,
    interests TEXT[],
    intentions TEXT[],
    verification_status VARCHAR,
    distance_km NUMERIC,
    common_interests_count INT
) AS $$
DECLARE
    user_profile RECORD;
    user_interests UUID[];
    user_lat DECIMAL;
    user_lon DECIMAL;
BEGIN
    -- Get current user profile
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;

    IF user_profile IS NULL THEN
        RETURN;
    END IF;

    user_lat := user_profile.latitude;
    user_lon := user_profile.longitude;
    p_institution_id := COALESCE(p_institution_id, user_profile.institution_id);

    -- Get user's interests
    SELECT ARRAY_AGG(interest_id) INTO user_interests
    FROM profile_interests WHERE profile_id = p_user_id;

    -- Get blocked user IDs
    RETURN QUERY
    SELECT
        p.id,
        p.first_name,
        p.last_name,
        p.date_of_birth,
        p.gender,
        p.bio,
        p.city,
        ap.name AS academic_program_name,
        al.name AS academic_level_name,
        pp.url AS primary_photo_url,
        COALESCE((
            SELECT ARRAY_AGG(i.name)
            FROM profile_interests pi
            JOIN interests i ON i.id = pi.interest_id
            WHERE pi.profile_id = p.id
        ), '{}') AS interests,
        COALESCE((
            SELECT ARRAY_AGG(ui.intention_type)
            FROM user_intentions ui
            WHERE ui.profile_id = p.id
        ), '{}') AS intentions,
        p.verification_status,
        CASE
            WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
            THEN ROUND(
                6371 * ACOS(
                    COS(RADIANS(user_lat)) * COS(RADIANS(p.latitude)) *
                    COS(RADIANS(p.longitude) - RADIANS(user_lon)) +
                    SIN(RADIANS(user_lat)) * SIN(RADIANS(p.latitude))
                )::NUMERIC, 1
            )
            ELSE NULL
        END AS distance_km,
        CASE
            WHEN user_interests IS NOT NULL
            THEN (
                SELECT COUNT(*)
                FROM profile_interests pi
                WHERE pi.profile_id = p.id
                AND pi.interest_id = ANY(user_interests)
            )
            ELSE 0
        END AS common_interests_count
    FROM profiles p
    LEFT JOIN academic_programs ap ON ap.id = p.academic_program_id
    LEFT JOIN academic_levels al ON al.id = p.academic_level_id
    LEFT JOIN LATERAL (
        SELECT url FROM profile_photos
        WHERE profile_id = p.id AND is_primary = true AND moderation_status = 'approved'
        LIMIT 1
    ) pp ON true
    WHERE p.id != p_user_id
    AND p.verification_status = 'verified'
    AND p.institution_id = p_institution_id
    AND calculate_age(p.date_of_birth) BETWEEN p_min_age AND p_max_age
    AND p.gender = ANY(p_genders)
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = p_user_id AND blocked_id = p.id)
    AND NOT EXISTS (SELECT 1 FROM blocks WHERE blocker_id = p.id AND blocked_id = p_user_id)
    AND NOT EXISTS (SELECT 1 FROM swipes WHERE swiper_id = p_user_id AND swiped_id = p.id)
    AND (p_max_distance_km IS NULL OR p.latitude IS NULL OR p.longitude IS NULL OR user_lat IS NULL OR user_lon IS NULL OR
         6371 * ACOS(
             COS(RADIANS(user_lat)) * COS(RADIANS(p.latitude)) *
             COS(RADIANS(p.longitude) - RADIANS(user_lon)) +
             SIN(RADIANS(user_lat)) * SIN(RADIANS(p.latitude))
         ) <= p_max_distance_km)
    ORDER BY
        common_interests_count DESC,
        CASE WHEN p.is_online THEN 0 ELSE 1 END,
        p.last_active_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUDIT LOG HELPER
-- ============================================

CREATE OR REPLACE FUNCTION log_audit(
    p_action VARCHAR,
    p_resource_type VARCHAR,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details, NULL, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;