'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import { MessageSquare, Clock, CheckCircle2, MoreVertical, X } from 'lucide-react';
import { Conversation } from '@/lib/hooks/use-messages';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const otherProfile = conversation.other_profile;
  const primaryPhoto = otherProfile?.profile_photos?.find(p => p.is_primary)?.url ?? otherProfile?.profile_photos?.[0]?.url;
  const lastMessage = conversation.last_message;

  const timeAgo = lastMessage?.created_at
    ? getTimeAgo(new Date(lastMessage.created_at))
    : conversation.updated_at
    ? getTimeAgo(new Date(conversation.updated_at))
    : '';

  const isUnread = conversation.unread_count > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className={cn(
        'card-profile p-4 flex items-center gap-4 transition-colors',
        isUnread && 'bg-primary/5 ring-1 ring-primary/20'
      )}
      role="listitem"
      aria-label={`Conversation avec ${otherProfile?.first_name} ${conversation.unread_count > 0 ? `, ${conversation.unread_count} messages non lus` : ''}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-14 w-14">
          <AvatarImage src={primaryPhoto} alt={otherProfile?.first_name} />
          <AvatarFallback className="text-lg font-bold text-primary">
            {otherProfile?.first_name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {otherProfile?.verification_status === 'verified' && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-verified text-verified-foreground">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          </span>
        )}
        {isUnread && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('font-semibold truncate', isUnread && 'text-foreground')}>
              {otherProfile?.first_name} {otherProfile?.last_name}
            </p>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {otherProfile?.academic_programs?.name}
              {otherProfile?.academic_levels?.name && ` • ${otherProfile.academic_levels.name}`}
            </p>
          </div>
          <span className={cn('text-xs whitespace-nowrap flex-shrink-0', isUnread ? 'text-primary font-medium' : 'text-muted-foreground')}>
            {timeAgo}
          </span>
        </div>

        {/* Last message preview */}
        {lastMessage && (
          <div className="mt-2 flex items-center gap-2 min-w-0">
            {lastMessage.sender_id !== otherProfile?.id && (
              <span className="flex h-4 w-4 items-center justify-center text-muted-foreground/60">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              </span>
            )}
            <p className={cn('text-sm truncate flex-1', isUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {lastMessage.message_type === 'image' ? '📷 Photo' :
               lastMessage.message_type === 'social_share' ? '🔗 Partage de contact' :
               lastMessage.content}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Plus d'options"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/messages/${conversation.id}`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ouvrir la conversation
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <X className="h-4 w-4 mr-2" />
            Supprimer la conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
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
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}