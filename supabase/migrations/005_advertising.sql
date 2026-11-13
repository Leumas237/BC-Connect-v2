-- BC Connect Advertising System
-- Migration 005: Advertising
-- Created: 2026-11-12

-- ============================================
-- AD SLOTS CONFIGURATION
-- ============================================

CREATE TABLE ad_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    slot_key VARCHAR(50) NOT NULL, -- e.g., 'discover_top', 'matches_sidebar', 'messages_banner'
    slot_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_banners INT DEFAULT 1,
    is_enabled BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (institution_id, slot_key)
);

-- Enable RLS
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_slots_select_active" ON ad_slots
    FOR SELECT USING (
        is_enabled = true
        AND institution_id = get_user_institution()
    );

CREATE POLICY "ad_slots_admin_all" ON ad_slots
    FOR ALL USING (
        is_institution_admin(institution_id)
        OR is_super_admin()
    );

-- ============================================
-- CAMPAIGN-SLOT ASSIGNMENTS
-- ============================================

CREATE TABLE campaign_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
    priority INT DEFAULT 0, -- Higher priority = more frequent display
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (campaign_id, slot_id)
);

ALTER TABLE campaign_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_slots_admin_all" ON campaign_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ad_campaigns ac
            WHERE ac.id = campaign_slots.campaign_id
            AND (is_institution_admin(ac.institution_id) OR is_super_admin())
        )
    );

-- ============================================
-- AD DELIVERY FUNCTION
-- ============================================

-- Get active banners for a slot
CREATE OR REPLACE FUNCTION get_active_banners_for_slot(
    p_slot_key VARCHAR,
    p_institution_id UUID,
    p_limit INT DEFAULT 1,
    p_exclude_campaigns UUID[] DEFAULT '{}'
)
RETURNS TABLE (
    id UUID,
    campaign_id UUID,
    advertiser_name VARCHAR,
    title VARCHAR,
    description TEXT,
    image_url TEXT,
    destination_url TEXT,
    contact_info TEXT,
    slot_key VARCHAR,
    priority INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.id,
        ac.id AS campaign_id,
        ac.advertiser_name,
        ac.title,
        ac.description,
        ac.image_url,
        ac.destination_url,
        ac.contact_info,
        s.slot_key,
        cs.priority
    FROM ad_campaigns ac
    JOIN campaign_slots cs ON cs.campaign_id = ac.id
    JOIN ad_slots s ON s.id = cs.slot_id
    WHERE s.slot_key = p_slot_key
    AND s.institution_id = p_institution_id
    AND s.is_enabled = true
    AND ac.status = 'active'
    AND ac.start_date <= NOW()
    AND ac.end_date >= NOW()
    AND ac.id != ALL(p_exclude_campaigns)
    ORDER BY cs.priority DESC, RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- IMPRESSION TRACKING WITH DEDUPLICATION
-- ============================================

-- Track impression with deduplication (per session per campaign per hour)
CREATE OR REPLACE FUNCTION track_impression_deduped(
    p_campaign_id UUID,
    p_profile_id UUID DEFAULT NULL,
    p_session_id VARCHAR,
    p_ip_hash VARCHAR,
    p_user_agent TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    already_tracked BOOLEAN;
BEGIN
    -- Check if this session has already seen this campaign in the last hour
    SELECT EXISTS (
        SELECT 1 FROM ad_impressions
        WHERE campaign_id = p_campaign_id
        AND session_id = p_session_id
        AND created_at > NOW() - INTERVAL '1 hour'
    ) INTO already_tracked;

    IF already_tracked THEN
        RETURN FALSE;
    END IF;

    -- Insert impression
    INSERT INTO ad_impressions (campaign_id, profile_id, session_id, ip_hash, user_agent)
    VALUES (p_campaign_id, p_profile_id, p_session_id, p_ip_hash, p_user_agent);

    -- Increment counter
    UPDATE ad_campaigns
    SET impressions_count = impressions_count + 1
    WHERE id = p_campaign_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLICK TRACKING
-- ============================================

CREATE OR REPLACE FUNCTION track_click(
    p_campaign_id UUID,
    p_profile_id UUID DEFAULT NULL,
    p_session_id VARCHAR,
    p_ip_hash VARCHAR,
    p_user_agent TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ad_clicks (campaign_id, profile_id, session_id, ip_hash, user_agent)
    VALUES (p_campaign_id, p_profile_id, p_session_id, p_ip_hash, p_user_agent);

    UPDATE ad_campaigns
    SET clicks_count = clicks_count + 1
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CAMPAIGN ANALYTICS
-- ============================================

-- Get campaign performance
CREATE OR REPLACE FUNCTION get_campaign_analytics(p_campaign_id UUID)
RETURNS TABLE (
    campaign_id UUID,
    advertiser_name VARCHAR,
    title VARCHAR,
    status VARCHAR,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    impressions BIGINT,
    clicks BIGINT,
    ctr NUMERIC,
    days_active INT,
    avg_impressions_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.id,
        ac.advertiser_name,
        ac.title,
        ac.status,
        ac.start_date,
        ac.end_date,
        ac.impressions_count,
        ac.clicks_count,
        CASE
            WHEN ac.impressions_count > 0
            THEN ROUND((ac.clicks_count::NUMERIC / ac.impressions_count::NUMERIC) * 100, 2)
            ELSE 0
        END AS ctr,
        EXTRACT(DAY FROM (LEAST(ac.end_date, NOW()) - ac.start_date)) + 1 AS days_active,
        CASE
            WHEN EXTRACT(DAY FROM (LEAST(ac.end_date, NOW()) - ac.start_date)) > 0
            THEN ROUND(ac.impressions_count::NUMERIC / EXTRACT(DAY FROM (LEAST(ac.end_date, NOW()) - ac.start_date)), 2)
            ELSE ac.impressions_count::NUMERIC
        END AS avg_impressions_per_day
    FROM ad_campaigns ac
    WHERE ac.id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get institution advertising overview
CREATE OR REPLACE FUNCTION get_institution_advertising_overview(p_institution_id UUID)
RETURNS TABLE (
    total_campaigns INT,
    active_campaigns INT,
    total_impressions BIGINT,
    total_clicks BIGINT,
    total_revenue NUMERIC,
    pending_payments NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_campaigns,
        COUNT(*) FILTER (WHERE status = 'active') AS active_campaigns,
        COALESCE(SUM(impressions_count), 0) AS total_impressions,
        COALESCE(SUM(clicks_count), 0) AS total_clicks,
        COALESCE(SUM(negotiated_price) FILTER (WHERE payment_status = 'paid'), 0) AS total_revenue,
        COALESCE(SUM(negotiated_price) FILTER (WHERE payment_status IN ('unpaid', 'partial')), 0) AS pending_payments
    FROM ad_campaigns
    WHERE institution_id = p_institution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DEFAULT AD SLOTS FOR IUT FOTSO VICTOR
-- ============================================

-- Insert default slots (will be run after institution is created)
-- These are defined here for reference, actual insertion in seed file

/*
INSERT INTO ad_slots (institution_id, slot_key, slot_name, description, max_banners, display_order) VALUES
    (iut_fv_id, 'discover_top', 'Découverte - Haut', 'Bannière en haut de la page de découverte', 1, 1),
    (iut_fv_id, 'discover_bottom', 'Découverte - Bas', 'Bannière en bas de la page de découverte', 1, 2),
    (iut_fv_id, 'matches_sidebar', 'Matchs - Sidebar', 'Bannière dans la sidebar de la page matchs', 1, 3),
    (iut_fv_id, 'messages_banner', 'Messages - Bannière', 'Bannière en haut de la liste des conversations', 1, 4),
    (iut_fv_id, 'profile_sidebar', 'Profil - Sidebar', 'Bannière dans la sidebar du profil', 1, 5);
*/

-- ============================================
-- CAMPAIGN STATUS UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_campaign_status_on_date_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If dates changed, update status accordingly
    IF NEW.start_date != OLD.start_date OR NEW.end_date != OLD.end_date THEN
        IF NEW.end_date < NOW() THEN
            NEW.status := 'expired';
        ELSIF NEW.start_date <= NOW() AND NEW.end_date >= NOW() AND NEW.status IN ('scheduled', 'draft') THEN
            NEW.status := 'active';
        ELSIF NEW.start_date > NOW() AND NEW.status = 'draft' THEN
            NEW.status := 'scheduled';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_campaign_status_dates
    BEFORE UPDATE OF start_date, end_date ON ad_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_status_on_date_change();

-- ============================================
-- PAYMENT TRACKING
-- ============================================

-- Record payment
CREATE OR REPLACE FUNCTION record_campaign_payment(
    p_campaign_id UUID,
    p_amount NUMERIC,
    p_reference VARCHAR,
    p_status VARCHAR DEFAULT 'paid'
)
RETURNS VOID AS $$
DECLARE
    camp RECORD;
BEGIN
    SELECT * INTO camp FROM ad_campaigns WHERE id = p_campaign_id;

    IF NOT has_permission('manage_campaigns', camp.institution_id) AND NOT is_super_admin() THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    UPDATE ad_campaigns
    SET payment_status = p_status,
        payment_reference = p_reference,
        updated_at = NOW()
    WHERE id = p_campaign_id;

    PERFORM log_admin_action('campaign_payment_recorded', 'ad_campaign', p_campaign_id, jsonb_build_object(
        'amount', p_amount,
        'reference', p_reference,
        'status', p_status
    ), camp.institution_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;