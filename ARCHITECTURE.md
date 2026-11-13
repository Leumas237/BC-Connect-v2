# BC Connect — Architecture Document

## 1. Project Overview

**Product**: BC Connect — Student social discovery platform for IUT Fotso Victor, Bandjoun
**Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase (PostgreSQL, Auth, Storage, Realtime)
**Deployment**: Vercel
**PWA**: Web App Manifest + Service Worker

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP (VERCEL)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Pages     │  │  Components │  │   Hooks     │             │
│  │  (App Rtr)  │  │  (shadcn)   │  │  (Custom)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────┐               │
│  │           SERVICE LAYER (lib/)              │               │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │               │
│  │  │  Auth   │ │ Profile │ │ Discovery│       │               │
│  │  │ Service │ │ Service │ │ Service │       │               │
│  │  └────┬────┘ └────┬────┘ └────┬────┘       │               │
│  │       │           │           │             │               │
│  │  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐       │               │
│  │  │ Match   │ │ Message │ │  Admin  │       │               │
│  │  │ Service │ │ Service │ │ Service │       │               │
│  │  └────┬────┘ └────┬────┘ └────┬────┘       │               │
│  └───────┼───────────┼───────────┼────────────┘               │
│          │           │           │                             │
└──────────┼───────────┼───────────┼─────────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    ┌─────────────┐ ┌─────────┐ ┌─────────┐
    │  SUPABASE   │ │ STORAGE │ │ REALTIME│
    │  (PostgreSQL)│ │(Images) │ │(Messages)│
    └─────────────┘ └─────────┘ └─────────┘
```

## 3. Directory Structure

```
bc-connect/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── public/
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── discover/
│   │   │   │   └── page.tsx
│   │   │   ├── likes/
│   │   │   │   └── page.tsx
│   │   │   ├── matches/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── privacy/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── social/
│   │   │   │       └── page.tsx
│   │   │   ├── verification/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── verification/
│   │   │   │   └── page.tsx
│   │   │   ├── advertising/
│   │   │   │   └── page.tsx
│   │   │   ├── institutions/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── profiles/
│   │   │   │   └── route.ts
│   │   │   ├── discovery/
│   │   │   │   └── route.ts
│   │   │   ├── swipes/
│   │   │   │   └── route.ts
│   │   │   ├── matches/
│   │   │   │   └── route.ts
│   │   │   ├── messages/
│   │   │   │   └── route.ts
│   │   │   ├── social/
│   │   │   │   └── route.ts
│   │   │   ├── notifications/
│   │   │   │   └── route.ts
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── verification/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── advertising/
│   │   │   │   │   └── route.ts
│   │   │   │   └── analytics/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── admin-sidebar.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── verification-form.tsx
│   │   │   └── password-reset-form.tsx
│   │   ├── profile/
│   │   │   ├── profile-card.tsx
│   │   │   ├── profile-detail.tsx
│   │   │   ├── profile-form.tsx
│   │   │   ├── photo-uploader.tsx
│   │   │   ├── interest-tags.tsx
│   │   │   ├── intention-badges.tsx
│   │   │   └── verification-badge.tsx
│   │   ├── discovery/
│   │   │   ├── swipe-card.tsx
│   │   │   ├── swipe-stack.tsx
│   │   │   ├── filter-panel.tsx
│   │   │   ├── action-buttons.tsx
│   │   │   └── empty-state.tsx
│   │   ├── matches/
│   │   │   ├── match-list.tsx
│   │   │   ├── match-card.tsx
│   │   │   └── match-notification.tsx
│   │   ├── messaging/
│   │   │   ├── conversation-list.tsx
│   │   │   ├── conversation-item.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── message-input.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── typing-indicator.tsx
│   │   ├── social/
│   │   │   ├── social-links.tsx
│   │   │   ├── social-share-toggle.tsx
│   │   │   └── social-management.tsx
│   │   ├── advertising/
│   │   │   ├── banner-slot.tsx
│   │   │   ├── banner-card.tsx
│   │   │   └── ad-label.tsx
│   │   ├── admin/
│   │   │   ├── user-table.tsx
│   │   │   ├── verification-queue.tsx
│   │   │   ├── campaign-manager.tsx
│   │   │   ├── institution-manager.tsx
│   │   │   ├── role-manager.tsx
│   │   │   └── audit-log.tsx
│   │   └── common/
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── empty-state.tsx
│   │       ├── page-header.tsx
│   │       └── confirm-dialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   ├── utils.ts
│   │   │   └── middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── discovery.service.ts
│   │   │   ├── match.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── social.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── advertising.service.ts
│   │   │   └── admin.service.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-profile.ts
│   │   │   ├── use-discovery.ts
│   │   │   ├── use-matches.ts
│   │   │   ├── use-messages.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-realtime.ts
│   │   │   ├── use-swipe.ts
│   │   │   └── use-pwa.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   ├── image.ts
│   │   │   ├── format.ts
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   ├── database.ts
│   │   │   ├── profile.ts
│   │   │   ├── discovery.ts
│   │   │   ├── matching.ts
│   │   │   ├── messaging.ts
│   │   │   ├── social.ts
│   │   │   ├── advertising.ts
│   │   │   └── admin.ts
│   │   ├── config/
│   │   │   ├── app.ts
│   │   │   ├── supabase.ts
│   │   │   ├── pwa.ts
│   │   │   └── env.ts
│   │   └── validations/
│   │       ├── auth.schema.ts
│   │       ├── profile.schema.ts
│   │       ├── discovery.schema.ts
│   │       └── admin.schema.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions_triggers.sql
│   │   ├── 004_admin_roles.sql
│   │   ├── 005_advertising.sql
│   │   └── 006_realtime_setup.sql
│   ├── seed/
│   │   ├── institutions.sql
│   │   ├── interests.sql
│   │   └── academic_data.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validations/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── profile.test.ts
│   │   ├── discovery.test.ts
│   │   ├── matching.test.ts
│   │   ├── messaging.test.ts
│   │   └── rls.test.ts
│   ├── e2e/
│   │   ├── registration.flow.ts
│   │   ├── verification.flow.ts
│   │   ├── discovery.flow.ts
│   │   ├── matching.flow.ts
│   │   ├── messaging.flow.ts
│   │   └── social-sharing.flow.ts
│   └── setup.ts
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── components.json
├── README.md
├── TODO.md
└── CHANGELOG.md
```

## 4. Database Schema (PostgreSQL)

### Core Tables

```sql
-- Institutions (multi-campus ready, but only IUT Fotso Victor active)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculties within institutions
CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments within faculties
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic programs (filières)
CREATE TABLE academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20),
    duration_years INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic levels
CREATE TABLE academic_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    academic_program_id UUID REFERENCES academic_programs(id) ON DELETE SET NULL,
    academic_level_id UUID REFERENCES academic_levels(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
    bio TEXT,
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    max_distance_km INT DEFAULT 50,
    min_age_preference INT DEFAULT 18,
    max_age_preference INT DEFAULT 30,
    preferred_genders TEXT[] DEFAULT ARRAY['male', 'female', 'non_binary'],
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verification_document_url TEXT,
    verification_submitted_at TIMESTAMPTZ,
    verification_reviewed_at TIMESTAMPTZ,
    verification_reviewed_by UUID REFERENCES auth.users(id),
    verification_rejection_reason TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile photos
CREATE TABLE profile_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_moderated BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interests catalog
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile-Interests many-to-many
CREATE TABLE profile_interests (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, interest_id)
);

-- User intentions (dating, friendship, networking)
CREATE TABLE user_intentions (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    intention_type VARCHAR(20) NOT NULL CHECK (intention_type IN ('dating', 'friendship', 'networking')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, intention_type)
);

-- Swipes (likes, passes, super_likes)
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    swipe_type VARCHAR(20) NOT NULL CHECK (swipe_type IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (swiper_id, swiped_id)
);

-- Matches (mutual likes)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user1_id, user2_id)
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation members
CREATE TABLE conversation_members (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    PRIMARY KEY (conversation_id, profile_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'social_share')),
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social accounts (user's own social media)
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL CHECK (platform IN ('instagram', 'snapchat', 'tiktok', 'facebook', 'whatsapp', 'discord', 'x', 'other')),
    username VARCHAR(100),
    url TEXT,
    display_name VARCHAR(100),
    is_visible_by_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profile_id, platform)
);

-- Social shares (what's shared with a match)
CREATE TABLE social_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (match_id, profile_id, social_account_id)
);

-- Blocks
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (blocker_id, blocked_id)
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('profile', 'message', 'photo', 'spam', 'harassment', 'fake_profile', 'inappropriate_content', 'other')),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('match', 'message', 'like', 'super_like', 'verification_approved', 'verification_rejected', 'report_resolved', 'admin_announcement', 'ad_click')),
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertising campaigns
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    advertiser_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    destination_url TEXT,
    contact_info TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'scheduled', 'active', 'expired', 'disabled')),
    negotiated_price DECIMAL(10, 2),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    payment_reference VARCHAR(100),
    impressions_count BIGINT DEFAULT 0,
    clicks_count BIGINT DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad impressions tracking
CREATE TABLE ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad clicks tracking
CREATE TABLE ad_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin roles
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'institution_admin', 'moderator', 'advertising_manager')),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profile_id, role, institution_id)
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification documents (separate for security)
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_profiles_institution ON profiles(institution_id);
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_age ON profiles(date_of_birth);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);
CREATE INDEX idx_profile_photos_profile ON profile_photos(profile_id);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversation_members_profile ON conversation_members(profile_id);
CREATE INDEX idx_notifications_profile ON notifications(profile_id, is_read, created_at);
CREATE INDEX idx_ad_campaigns_institution ON ad_campaigns(institution_id, status, start_date, end_date);
CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id, created_at);
CREATE INDEX idx_ad_clicks_campaign ON ad_clicks(campaign_id, created_at);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);
CREATE INDEX idx_reports_reported ON reports(reported_id, status);
CREATE INDEX idx_verification_documents_profile ON verification_documents(profile_id);
```

## 5. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all verified profiles in their institution, write own
CREATE POLICY "profiles_select_verified_institution" ON profiles
    FOR SELECT USING (
        verification_status = 'verified' 
        AND institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Profile photos: users can manage own, read verified users' photos
CREATE POLICY "profile_photos_select" ON profile_photos
    FOR SELECT USING (
        profile_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = profile_photos.profile_id 
            AND p.verification_status = 'verified'
            AND p.institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "profile_photos_manage_own" ON profile_photos
    FOR ALL USING (profile_id = auth.uid());

-- Swipes: users can only insert own swipes, read own
CREATE POLICY "swipes_select_own" ON swipes
    FOR SELECT USING (swiper_id = auth.uid());

CREATE POLICY "swipes_insert_own" ON swipes
    FOR INSERT WITH CHECK (swiper_id = auth.uid());

-- Matches: users can read matches they're part of
CREATE POLICY "matches_select_participant" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Conversations: members can read
CREATE POLICY "conversations_select_member" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversations.id
            AND cm.profile_id = auth.uid()
        )
    );

-- Messages: conversation members can read, sender can insert
CREATE POLICY "messages_select_member" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = messages.conversation_id
            AND cm.profile_id = auth.uid()
        )
    );

CREATE POLICY "messages_insert_sender" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Social accounts: owner can manage, match participants can read shared
CREATE POLICY "social_accounts_manage_own" ON social_accounts
    FOR ALL USING (profile_id = auth.uid());

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

-- Social shares: users can manage their shares in matches
CREATE POLICY "social_shares_manage_own" ON social_shares
    FOR ALL USING (profile_id = auth.uid());

-- Blocks: users can manage own blocks
CREATE POLICY "blocks_manage_own" ON blocks
    FOR ALL USING (blocker_id = auth.uid());

-- Reports: users can create, admins can read all
CREATE POLICY "reports_insert_own" ON reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Notifications: users read own
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (profile_id = auth.uid());

-- Ad campaigns: public read active campaigns in institution
CREATE POLICY "ad_campaigns_select_active" ON ad_campaigns
    FOR SELECT USING (
        status = 'active' 
        AND start_date <= NOW() 
        AND end_date >= NOW()
        AND institution_id = (SELECT institution_id FROM profiles WHERE id = auth.uid())
    );

-- Admin policies (using admin_roles table)
CREATE POLICY "admin_all_access" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.profile_id = auth.uid()
            AND ar.role IN ('super_admin', 'institution_admin')
            AND (ar.role = 'super_admin' OR ar.institution_id = profiles.institution_id)
        )
    );

-- Similar admin policies for other tables...
```

## 6. Supabase Realtime Configuration

```sql
-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Set replica identity for updates
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

## 7. API Routes Structure

```
/api/auth/[...nextauth]          - NextAuth.js authentication
/api/profiles                    - GET (list), POST (create), PATCH (update)
/api/profiles/[id]               - GET (detail), DELETE
/api/profiles/[id]/photos        - POST (upload), DELETE (remove)
/api/discovery                   - GET (recommendations with filters)
/api/swipes                      - POST (create swipe)
/api/matches                     - GET (list user's matches)
/api/matches/[id]                - GET (match detail)
/api/conversations               - GET (list), POST (create)
/api/conversations/[id]          - GET (detail), PATCH (update)
/api/conversations/[id]/messages - GET (list), POST (send)
/api/messages/[id]               - PATCH (read), DELETE
/api/social                      - GET (user's accounts), POST (add), PATCH (update)
/api/social/shares               - POST (share with match), PATCH (toggle)
/api/notifications               - GET (list), PATCH (mark read)
/api/admin/users                 - GET (list), PATCH (ban/unban)
/api/admin/verification          - GET (queue), PATCH (approve/reject)
/api/admin/advertising           - CRUD for campaigns
/api/admin/institutions          - CRUD for institutions
/api/admin/analytics             - GET (dashboard stats)
/api/webhooks                    - Supabase webhooks
```

## 8. Service Layer Architecture

Each service follows the pattern:
- **Interface** (types): Input/output types
- **Implementation** (service): Business logic
- **Repository** (data access): Database queries
- **Validation** (schemas): Zod validation schemas

Example: `ProfileService`
```typescript
// lib/services/profile.service.ts
interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>
  updateProfile(userId: string, data: UpdateProfileInput): Promise<Profile>
  uploadPhoto(userId: string, file: File): Promise<ProfilePhoto>
  deletePhoto(userId: string, photoId: string): Promise<void>
  updateInterests(userId: string, interestIds: string[]): Promise<void>
  updateIntentions(userId: string, intentions: IntentionType[]): Promise<void>
  getVerificationStatus(userId: string): Promise<VerificationStatus>
  submitVerification(userId: string, document: File): Promise<void>
}
```

## 9. Custom Hooks

- `useAuth()` - Authentication state, login, logout, register
- `useProfile(userId?)` - Profile data, mutations
- `useDiscovery(filters)` - Swipe stack, recommendations
- `useSwipe()` - Swipe animations, actions
- `useMatches()` - Match list, real-time updates
- `useMessages(conversationId)` - Messages, real-time, send
- `useConversations()` - Conversation list
- `useNotifications()` - Notifications, real-time
- `useSocialShares(matchId)` - Social sharing state
- `useRealtime(channel, filter)` - Generic realtime subscription
- `usePWA()` - Install prompt, offline status

## 10. Design System (Tailwind + CSS Variables)

```css
/* src/styles/variables.css */
:root {
  /* Colors */
  --color-primary: #E91E63;        /* Rose/Coral */
  --color-primary-light: #F06292;
  --color-primary-dark: #C2185B;
  --color-secondary: #9C27B0;      /* Purple */
  --color-secondary-light: #BA68C8;
  --color-secondary-dark: #7B1FA2;
  --color-accent: #FF9800;         /* Orange */
  --color-accent-light: #FFB74D;
  --color-accent-dark: #F57C00;
  
  --color-background: #FAFAFA;     /* Off-white */
  --color-surface: #FFFFFF;
  --color-surface-hover: #F5F5F5;
  
  --color-text-primary: #212121;   /* Anthracite */
  --color-text-secondary: #757575;
  --color-text-muted: #9E9E9E;
  --color-text-on-primary: #FFFFFF;
  
  --color-border: #E0E0E0;
  --color-border-focus: #E91E63;
  
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
  
  /* Verification badge colors */
  --color-verified: #4CAF50;
  --color-pending: #FF9800;
  --color-rejected: #F44336;
  --color-unverified: #9E9E9E;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Poppins', system-ui, sans-serif;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-tooltip: 500;
  --z-toast: 600;
}
```

## 11. PWA Configuration

```json
// public/manifest.json
{
  "name": "BC Connect",
  "short_name": "BC Connect",
  "description": "Connect beyond classrooms - Student social discovery platform",
  "start_url": "/discover",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#E91E63",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["social", "lifestyle"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Discover",
      "short_name": "Discover",
      "description": "Discover new people",
      "url": "/discover",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Messages",
      "short_name": "Messages",
      "description": "View your conversations",
      "url": "/messages",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
```

## 12. Security Considerations

1. **No Service Role Key in Frontend** - All privileged operations via API routes
2. **RLS on All Tables** - Database-level security
3. **Input Validation** - Zod schemas on all API routes
4. **Rate Limiting** - On auth, swipe, message endpoints
5. **File Upload Validation** - Type, size, malware scanning
6. **CSP Headers** - Strict Content Security Policy
7. **HTTPS Only** - Enforced via Vercel
8. **Secure Cookies** - HttpOnly, Secure, SameSite
9. **Audit Logging** - All admin actions logged
10. **Data Retention** - Verification docs deleted after approval

## 13. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RLS policy gaps | Medium | High | Comprehensive testing with multiple users |
| Realtime scaling | Low | Medium | Supabase handles, monitor usage |
| Image moderation | Medium | High | Automated + manual review queue |
| Spam/fake profiles | High | High | Verification required, rate limits, reporting |
| Data privacy | Low | Critical | RLS, no PII in logs, GDPR compliance |
| PWA offline issues | Medium | Low | Graceful degradation, clear messaging |
| Multi-institution data leak | Low | Critical | RLS + admin role scoping |

## 14. Development Roadmap

### Phase 0: Analysis & Architecture ✓ (This document)
### Phase 1: Foundations (Week 1)
- Next.js 14 + TypeScript + Tailwind + shadcn/ui setup
- Supabase project creation and configuration
- Environment variables and config
- Design system implementation
- Basic routing and layouts
- PWA manifest and service worker

### Phase 2: Auth & Profiles (Week 2)
- Supabase Auth integration
- Registration with validation
- Email verification flow
- Student verification upload
- Profile creation wizard
- Photo upload with moderation queue
- Interests and intentions selection

### Phase 3: Discovery & Matching (Week 3)
- Recommendation algorithm (weighted scoring)
- Swipe stack component with animations
- Swipe actions (like, pass, super_like)
- Match creation and notification
- Filter panel
- Empty states and loading

### Phase 4: Messaging (Week 4)
- Conversation list
- Real-time messaging with Supabase Realtime
- Message bubbles, timestamps, read receipts
- Typing indicators
- Push notifications (browser)
- Social media sharing after match

### Phase 5: Admin & Advertising (Week 5)
- Admin dashboard with role-based access
- User management and moderation
- Verification review queue
- Campaign management (CRUD)
- Banner slots and impression tracking
- Analytics dashboard

### Phase 6: Finalization (Week 6)
- PWA optimization (offline, install prompt)
- Accessibility audit (WCAG 2.1 AA)
- Performance optimization
- Security audit
- E2E testing critical paths
- Documentation
- Deployment to Vercel
- Production Supabase setup

## 15. Environment Variables

```env
# .env.example
NEXT_PUBLIC_APP_URL=https://bc-connect.vercel.app
NEXT_PUBLIC_APP_NAME="BC Connect"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://bc-connect.vercel.app

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=your_storage_url

# Feature flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_MAX_PHOTOS=6
NEXT_PUBLIC_MAX_BIO_LENGTH=500

# Admin
ADMIN_EMAILS=admin@iut-fv.edu.cm
```

## 16. Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Service layer functions
- Validation schemas
- Utility functions
- Custom hooks (with mock providers)

### Integration Tests
- API route handlers
- RLS policies (with test users)
- Database functions and triggers

### E2E Tests (Playwright)
- Registration → Verification → Profile → Discovery → Match → Message
- Admin flows
- PWA install flow

### RLS Testing
- Create test users per role
- Verify each policy with direct SQL and Supabase client

## 17. Deployment Checklist

- [ ] Vercel project connected to GitHub
- [ ] Supabase production project created
- [ ] Environment variables configured in Vercel
- [ ] Custom domain configured (bc-connect.cm)
- [ ] SSL certificate active
- [ ] Supabase Auth providers configured (Email)
- [ ] Storage buckets created with policies
- [ ] Realtime enabled for required tables
- [ ] Database migrations run in production
- [ ] Seed data for interests, academic levels
- [ ] Admin user created
- [ ] Monitoring/alerting configured
- [ ] Backup strategy defined

---

*Document Version: 1.0*
*Last Updated: 2026-11-12*
*Author: BC Connect Development Team*