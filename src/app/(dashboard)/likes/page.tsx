'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useLikesReceived } from '@/lib/hooks/use-discovery';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, X, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LikeProfile {
  id: string;
  created_at: string;
  swiper_id: string;
  swipe_type: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    bio: string | null;
    city: string | null;
    academic_programs: { name: string }[];
    academic_levels: { name: string }[];
    profile_photos: { url: string; is_primary: boolean }[];
    verification_status?: string;
  }[];
}

export default function LikesPage() {
  const { data: likes = [], isLoading, refetch } = useLikesReceived();
  const { user } = useAuth();

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de vos likes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Likes reçus</h1>
        <p className="text-muted-foreground text-sm">
          {likes.length} personne{likes.length > 1 ? 's' : ''} vous aiment
        </p>
      </div>

      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-6 text-center px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Aucun like pour le moment</h3>
          <p className="text-muted-foreground max-w-xs">
            Continuez à swiper ! Quand quelqu'un vous like, il apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Personnes qui vous ont liké">
          {likes.map((like: LikeProfile) => {
            const profile = like.profiles[0];
            if (!profile) return null;

            const profileDefined = profile;
            const primaryPhoto = profileDefined.profile_photos?.find(p => p.is_primary)?.url ?? profileDefined.profile_photos?.[0]?.url;
            const age = profileDefined.date_of_birth
              ? new Date().getFullYear() - new Date(profileDefined.date_of_birth).getFullYear()
              : null;
            const isSuperLike = like.swipe_type === 'super_like';

            return (
              <article
                key={like.id}
                className={cn(
                  'card-profile p-4 flex items-center gap-4',
                  isSuperLike && 'ring-1 ring-accent/50 bg-accent/5'
                )}
                role="listitem"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={primaryPhoto} alt={profileDefined.first_name} />
                    <AvatarFallback className="text-xl font-bold text-primary">
                      {profileDefined.first_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profileDefined.verification_status === 'verified' && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-verified text-verified-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  {isSuperLike && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <span className="text-xs font-bold">✨</span>
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-lg">
                        {profileDefined.first_name} {profileDefined.last_name}
                        {age && <span className="text-muted-foreground font-normal ml-2">{age}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {profileDefined.academic_programs?.[0]?.name}
                        {profileDefined.academic_levels?.[0]?.name && ` • ${profileDefined.academic_levels[0]?.name}`}
                        {profileDefined.city && ` • ${profileDefined.city}`}
                      </p>
                    </div>
                    <Badge variant={isSuperLike ? 'warning' : 'default'} className="gap-1">
                      {isSuperLike ? (
                        <>
                          <span className="text-xs">✨</span>
                          Super Like
                        </>
                      ) : (
                        <>
                          <Heart className="h-3 w-3" />
                          Like
                        </>
                      )}
                    </Badge>
                  </div>

                  {profileDefined.bio && (
                    <p className="text-sm text-foreground line-clamp-2 mt-2">{profileDefined.bio}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-24 justify-center"
                    onClick={() => {}}
                  >
                    <X className="h-4 w-4 text-red-500" />
                    Passer
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 w-24 justify-center bg-green-500 hover:bg-green-600"
                    onClick={() => {}}
                  >
                    <Check className="h-4 w-4" />
                    Liked
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}