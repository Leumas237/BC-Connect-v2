'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { X, ExternalLink } from 'lucide-react';

interface BannerSlotProps {
  slotKey: string;
  className?: string;
  fallback?: React.ReactNode;
}

const supabase = createClient();

export function BannerSlot({ slotKey, className, fallback }: BannerSlotProps) {
  const [banner, setBanner] = useState<{
    id: string;
    campaign_id: string;
    advertiser_name: string;
    title: string;
    description: string | null;
    image_url: string;
    destination_url: string | null;
    contact_info: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('ad_session_id');
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('ad_session_id', id);
      }
      return id;
    }
    return '';
  });

  useEffect(() => {
    let mounted = true;

    const fetchBanner = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const institutionId = user?.user_metadata?.['institution_id'];

        if (!institutionId) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('get_active_banners_for_slot', {
          p_slot_key: slotKey,
          p_institution_id: institutionId,
          p_limit: 1,
          p_exclude_campaigns: [],
        });

        if (!error && data && data.length > 0 && mounted) {
          setBanner(data[0]);
          // Track impression
          await trackImpression(data[0].campaign_id);
        } else if (mounted) {
          setBanner(null);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchBanner();

    return () => {
      mounted = false;
    };
  }, [slotKey, sessionId]);

  const trackImpression = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.rpc('track_impression_deduped', {
        p_campaign_id: campaignId,
        p_profile_id: user?.id || null,
        p_session_id: sessionId,
        p_ip_hash: '', // Would be set by edge function in production
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleClick = async (campaignId: string, destinationUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.rpc('track_click', {
        p_campaign_id: campaignId,
        p_profile_id: user?.id || null,
        p_session_id: sessionId,
        p_ip_hash: '',
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    if (destinationUrl) {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Could store in localStorage to persist dismissal
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="aspect-banner w-full rounded-xl bg-muted" />
      </div>
    );
  }

  if (isDismissed || !banner) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div
      className={cn('ad-banner relative overflow-hidden', className)}
      role="complementary"
      aria-label="Publicité"
    >
      <span className="ad-label">Publicité</span>

      <button
        onClick={() => handleClick(banner.campaign_id, banner.destination_url)}
        className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={`${banner.advertiser_name}: ${banner.title}`}
      >
        <img
          src={banner.image_url}
          alt={`${banner.advertiser_name} - ${banner.title}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="font-semibold text-lg">{banner.title}</p>
          {banner.description && (
            <p className="text-sm opacity-90 mt-1 line-clamp-2">{banner.description}</p>
          )}
          <p className="text-xs opacity-70 mt-2 flex items-center gap-1">
            <span>{banner.advertiser_name}</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </p>
        </div>
      </button>

      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
        aria-label="Masquer cette publicité"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}