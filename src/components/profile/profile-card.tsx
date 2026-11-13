'use client';

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MapPin, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';
import { DiscoveryProfile } from '@/lib/hooks/use-discovery';

interface ProfileCardProps {
  profile: DiscoveryProfile;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onViewProfile: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ProfileCard({
  profile,
  onLike,
  onPass,
  onSuperLike,
  onViewProfile,
  isLoading = false,
  className,
}: ProfileCardProps) {
  const age = profile.date_of_birth
    ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
    : null;

  const primaryPhoto = profile.primary_photo_url;
  const hasPhotos = !!primaryPhoto;

  const intentionLabels: Record<string, { label: string; variant: 'default' | 'dating' | 'friendship' | 'networking' }> = {
    dating: { label: 'Dating', variant: 'dating' },
    friendship: { label: 'Amitié', variant: 'friendship' },
    networking: { label: 'Networking', variant: 'networking' },
  };

  return (
    <div
      className={cn(
        'relative card-swipe aspect-card overflow-hidden',
        isLoading && 'animate-pulse pointer-events-none',
        className
      )}
      role="button"
      tabIndex={0}
      onClick={onViewProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewProfile();
        }
      }}
      aria-label={`Voir le profil de ${profile.first_name}`}
    >
      {/* Photo */}
      <div className="relative w-full h-full">
        {hasPhotos ? (
          <img
            src={primaryPhoto}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl font-bold text-primary">
                {profile.first_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Verification badge */}
        {profile.verification_status === 'verified' && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="verified" className="gap-1.5">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Vérifié
            </Badge>
          </div>
        )}

        {/* Age & Location */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{profile.first_name}</span>
            {age && <span className="text-lg font-normal opacity-90">{age}</span>}
          </div>
          {profile.city && (
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{profile.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="p-4 space-y-3">
        {/* Academic info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {profile.academic_program_name && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              {profile.academic_program_name}
            </span>
          )}
          {profile.academic_level_name && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {profile.academic_level_name}
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground line-clamp-2">{profile.bio}</p>
        )}

        {/* Intentions */}
        <div className="flex flex-wrap gap-1.5">
          {profile.intentions.map((intention) => {
            const config = intentionLabels[intention] || { label: intention, variant: 'default' as const };
            return (
              <Badge
                key={intention}
                variant={config.variant as any}
                className="text-xs"
              >
                {config.label}
              </Badge>
            );
          })}
        </div>

        {/* Interests */}
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 5 && (
              <span className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground">
                +{profile.interests.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Distance */}
        {profile.distance_km !== null && profile.distance_km !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
            <span>{profile.distance_km.toFixed(1)} km</span>
            {profile.common_interests_count > 0 && (
              <>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-primary" aria-hidden="true" />
                  {profile.common_interests_count} centres communs
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action indicators (shown during swipe) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6">
        <div className="rotate-[-20deg] border-4 border-green-500 text-green-500 rounded-xl px-4 py-2 font-bold text-xl opacity-0 swipe-left-indicator">
          LIKE
        </div>
        <div className="rotate-[20deg] border-4 border-red-500 text-red-500 rounded-xl px-4 py-2 font-bold text-xl opacity-0 swipe-right-indicator">
          PASS
        </div>
      </div>
    </div>
  );
}