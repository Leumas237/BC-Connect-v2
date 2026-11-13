'use client';

import { cn } from '@/lib/utils/cn';
import { ExternalLink } from 'lucide-react';

interface BannerCardProps {
  campaign: {
    id: string;
    advertiser_name: string;
    title: string;
    description: string | null;
    image_url: string;
    destination_url: string | null;
    contact_info: string | null;
  };
  onClick?: () => void;
  onImpression?: () => void;
}

export function BannerCard({ campaign, onClick, onImpression }: BannerCardProps) {
  const handleClick = () => {
    onClick?.();
    if (campaign.destination_url) {
      window.open(campaign.destination_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Track impression on mount
  // useEffect(() => { onImpression?.(); }, []);

  return (
    <article
      className={cn(
        'ad-banner relative overflow-hidden rounded-xl border bg-card transition-transform duration-200 hover:scale-[1.02]',
        'cursor-pointer'
      )}
      onClick={handleClick}
      role="article"
      aria-label={`Publicité: ${campaign.title} par ${campaign.advertiser_name}`}
    >
      <span className="ad-label">Publicité</span>

      <div className="aspect-banner w-full relative overflow-hidden">
        <img
          src={campaign.image_url}
          alt={`${campaign.advertiser_name} - ${campaign.title}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {campaign.advertiser_name}
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        </div>

        <h3 className="font-semibold text-lg mb-1">{campaign.title}</h3>

        {campaign.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{campaign.description}</p>
        )}

        {campaign.contact_info && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            📞 {campaign.contact_info}
          </p>
        )}
      </div>
    </article>
  );
}