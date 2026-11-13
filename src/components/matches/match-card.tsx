'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { MessageSquare, Heart, Clock, CheckCircle2, MoreVertical, Instagram, Ghost, Music, Facebook, MessageCircle, Hash, Twitter, X, Link as LucideLink } from 'lucide-react';
import { MatchWithProfile } from '@/lib/hooks/use-matches';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MatchCardProps {
  match: MatchWithProfile;
  onUnmatch: () => void;
  onMessage: () => void;
}

export function MatchCard({ match, onUnmatch, onMessage }: MatchCardProps) {
  const { user } = useAuth();
  const otherProfile = match.other_profile;
  const primaryPhoto = otherProfile?.profile_photos?.find(p => p.is_primary)?.url ?? otherProfile?.profile_photos?.[0]?.url;

  const age = otherProfile?.date_of_birth
    ? new Date().getFullYear() - new Date(otherProfile.date_of_birth).getFullYear()
    : null;

  const timeAgo = match.created_at
    ? getTimeAgo(new Date(match.created_at))
    : '';

  return (
    <article
      className="card-profile p-4 flex items-center gap-4"
      role="listitem"
    >
      {/* Avatar */}
      <Link href={`/matches/${match.id}`} className="relative flex-shrink-0" aria-label={`Voir le profil de ${otherProfile?.first_name}`}>
        <Avatar className="h-16 w-16">
          <AvatarImage src={primaryPhoto} alt={otherProfile?.first_name} />
          <AvatarFallback className="text-xl font-bold text-primary">
            {otherProfile?.first_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {otherProfile?.verification_status === 'verified' && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-verified text-verified-foreground">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/matches/${match.id}`} className="font-semibold text-lg hover:text-primary transition-colors">
              {otherProfile?.first_name}
              {age && <span className="text-muted-foreground font-normal ml-2">{age}</span>}
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {otherProfile?.academic_programs?.[0]?.name}
              {otherProfile?.academic_levels?.[0]?.name && ` • ${otherProfile.academic_levels[0]?.name}`}
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
        </div>

        {/* Mutual interests preview */}
        {otherProfile?.social_accounts && otherProfile.social_accounts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {otherProfile.social_accounts.slice(0, 3).map((account) => {
              const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                instagram: Instagram,
                snapchat: Ghost,
                tiktok: Music,
                facebook: Facebook,
                whatsapp: MessageCircle,
                discord: Hash,
                x: Twitter,
                other: LucideLink,
              };
              const Icon = platformIcons[account.platform] || LucideLink;
              return (
                <Badge key={account.platform} variant="outline" className="text-xs gap-1">
                  <Icon className="h-3 w-3" />
                  {account.username}
                </Badge>
              );
            })}
            {otherProfile.social_accounts.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{otherProfile.social_accounts.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/matches/${match.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Voir le profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={onMessage}>
              <Link href={`/messages/${match.conversation_id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Envoyer un message
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onUnmatch} className="text-destructive focus:text-destructive">
              <X className="h-4 w-4 mr-2" />
              Supprimer le match
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={onMessage}
          className="hidden sm:flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>
      </div>
    </article>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mois`;
  return `${Math.floor(diffDays / 365)}an`;
}